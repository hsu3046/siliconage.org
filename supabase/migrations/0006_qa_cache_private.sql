-- Codex review P1: lock qa_cache against anon enumeration
--
-- The earlier policies (0002) granted anon SELECT/INSERT on qa_cache with
-- `using (true)` / `with check (true)`. That let any visitor with the public
-- anon key call PostgREST directly and dump every cached question/answer
-- pair — a privacy leak because the table stores raw user prompts.
--
-- The Edge Function always uses the service-role key (RLS bypass), so it
-- keeps working unchanged. Direct anon access is now closed.
--
-- match_qa_cache and increment_qa_cache_hits are flipped to SECURITY DEFINER
-- so they still resolve under the function owner even if a future caller
-- talks to them with the anon role.

drop policy if exists "qa_cache_anon_select" on public.qa_cache;
drop policy if exists "qa_cache_anon_insert" on public.qa_cache;

-- match_qa_cache: previously SQL-language SECURITY INVOKER. Replace with the
-- same body but DEFINER so RLS no longer blocks the read.
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
security definer
set search_path = public
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

-- increment_qa_cache_hits was already SECURITY DEFINER (added in 0005). No
-- change needed.

-- Authenticated (Studio) keeps full access via the qa_cache_authenticated_all
-- policy defined in 0002. The Edge Function uses service_role which bypasses
-- RLS anyway.
