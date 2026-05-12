-- Phase 3: Graph RAG retrieval + qa_cache helpers.
-- Constants are duplicated from utils/ranking.ts (LINK_TYPE_WEIGHTS,
-- CATEGORY_MULTIPLIERS, TECH_ROLE_BONUS); keep them in sync — see CLAUDE.md.

-- ============================================================================
-- 1. match_nodes_with_graph
-- ============================================================================
-- Given a 768-dim query embedding and a locale, return up to `max_total` node
-- rows that combine top-K vector seeds + their 1-hop graph neighbours, scored
-- by a blend of cosine similarity, link-type weight, target category, and tech
-- role. Only `approved_at IS NOT NULL` rows are visible.

drop function if exists public.match_nodes_with_graph(vector(768), text, int, int);
create or replace function public.match_nodes_with_graph(
    query_emb     vector(768),
    q_locale      text,
    k             int default 12,
    max_total     int default 40
)
returns table (
    node_id        text,
    label          text,
    category       text,
    year           int,
    description    text,
    similarity     real,
    score          real,
    hop            int
)
language plpgsql
stable
as $$
begin
    return query
    with
    -- vector top-K seeds, locale-aware, RLS-shape (approved-only) enforced
    seeds as (
        select nt.node_id,
               (1 - (nt.embedding <=> query_emb))::real as similarity
        from public.node_translations nt
        join public.nodes n
          on n.id = nt.node_id and n.approved_at is not null
        where nt.locale = q_locale
          and nt.embedding is not null
        order by nt.embedding <=> query_emb
        limit k
    ),
    seed_ids as (select node_id from seeds),
    -- 1-hop neighbours of seeds (both directions). Excludes seeds themselves.
    -- We carry along the link metadata needed to score the bonus.
    hop1 as (
        select l.target_id as node_id, l.type, l.strength
        from public.links l
        where l.source_id in (select node_id from seed_ids)
          and l.target_id not in (select node_id from seed_ids)
          and l.approved_at is not null
        union all
        select l.source_id as node_id, l.type, l.strength
        from public.links l
        where l.target_id in (select node_id from seed_ids)
          and l.source_id not in (select node_id from seed_ids)
          and l.approved_at is not null
    ),
    -- Hop bonus: link-type weight × target category multiplier × strength
    hop_bonus as (
        select h.node_id,
               sum(
                   (case h.type
                       when 'CREATES'     then 10.0
                       when 'POWERS'      then  8.0
                       when 'CONTRIBUTES' then  3.0
                       when 'ENGAGES'     then  1.0
                       else 0.0
                    end)
                 * (case n.category
                       when 'TECHNOLOGY' then 1.0
                       when 'COMPANY'    then 0.3
                       when 'PERSON'     then 0.1
                       else 0.0
                    end)
                 * coalesce(h.strength, 0.5)
               )::real as bonus
        from hop1 h
        join public.nodes n on n.id = h.node_id and n.approved_at is not null
        group by h.node_id
    ),
    -- TechRole add-on for the seeds + hop nodes that are technology-tier
    role_bonus as (
        select n.id as node_id,
               (case n.impact_role
                   when 'FOUNDATION' then 5.0
                   when 'CORE'       then 3.0
                   when 'PLATFORM'   then 1.0
                   else 0.0
                end)::real as bonus
        from public.nodes n
        where n.approved_at is not null
    ),
    -- Merge seeds and hop nodes into one keyed set
    combined as (
        select s.node_id,
               s.similarity,
               0::int as hop
        from seeds s
        union all
        select h.node_id,
               0::real as similarity,
               1::int as hop
        from hop_bonus h
        where h.node_id not in (select node_id from seeds)
    ),
    scored as (
        select c.node_id,
               c.similarity,
               c.hop,
               -- weight: similarity contributes ~0..1, bonuses contribute up to ~10
               (c.similarity
                  + coalesce(hb.bonus, 0) * 0.05
                  + coalesce(rb.bonus, 0) * 0.02)::real as score
        from combined c
        left join hop_bonus hb on hb.node_id = c.node_id
        left join role_bonus rb on rb.node_id = c.node_id
    )
    select s.node_id,
           nt.label,
           n.category,
           n.year,
           nt.description,
           s.similarity,
           s.score,
           s.hop
    from scored s
    join public.nodes n              on n.id = s.node_id and n.approved_at is not null
    join public.node_translations nt on nt.node_id = s.node_id and nt.locale = q_locale
    order by s.score desc
    limit max_total;
end;
$$;

comment on function public.match_nodes_with_graph(vector(768), text, int, int) is
    'Graph-RAG retrieval: top-K cosine seeds + 1-hop expand, scored with the same '
    'weights as utils/ranking.ts. Returns approved rows in the requested locale.';

-- Expose to anon (Edge Function calls with anon key; service_role bypasses RLS).
grant execute on function public.match_nodes_with_graph(vector(768), text, int, int) to anon, authenticated, service_role;


-- ============================================================================
-- 2. match_qa_cache
-- ============================================================================
-- Semantic cache lookup: returns the highest-similarity qa_cache row whose
-- cosine similarity to `query_emb` is >= sim_threshold and whose locale matches.
-- Also increments hits on a hit (handled in caller — RLS would block UPDATE
-- from anon otherwise; Edge Function uses service_role for hits++).

drop function if exists public.match_qa_cache(vector(768), text, real);
create or replace function public.match_qa_cache(
    query_emb     vector(768),
    q_locale      text,
    sim_threshold real default 0.92
)
returns table (
    query_hash       text,
    answer           jsonb,
    source_node_ids  text[],
    similarity       real
)
language sql
stable
as $$
    select c.query_hash,
           c.answer,
           c.source_node_ids,
           (1 - (c.query_embedding <=> query_emb))::real as similarity
    from public.qa_cache c
    where c.locale = q_locale
      and c.expires_at > now()
      and (1 - (c.query_embedding <=> query_emb)) >= sim_threshold
    order by c.query_embedding <=> query_emb
    limit 1;
$$;

grant execute on function public.match_qa_cache(vector(768), text, real) to anon, authenticated, service_role;


-- ============================================================================
-- 3. increment_rate_limit
-- ============================================================================
-- Idempotent per-day counter: returns the new count after incrementing. Used by
-- the Edge Function to enforce 20 queries/day per anon UUID.

drop function if exists public.increment_rate_limit(text, date);
create or replace function public.increment_rate_limit(p_anon_id text, p_day date default current_date)
returns integer
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
    new_count integer;
begin
    insert into public.rate_limits (anon_id, day, count)
    values (p_anon_id, p_day, 1)
    on conflict (anon_id, day)
    do update set count = public.rate_limits.count + 1, updated_at = now()
    returning count into new_count;
    return new_count;
end;
$$;

grant execute on function public.increment_rate_limit(text, date) to anon, authenticated, service_role;
