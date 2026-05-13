-- The Silicon Age — Graph RAG initial schema
-- Phase 0: nodes, links, events, translations, qa_cache, rate_limits, wikidata_excluded, node_audit
-- pgvector(768d, Gemini text-embedding-004) + pg_trgm(fuzzy label search)

create extension if not exists "vector";
create extension if not exists "pg_trgm";

-- ============================================================================
-- 1. nodes
-- ============================================================================
create table public.nodes (
    id                  text primary key,
    label               text not null,
    category            text not null check (category in ('COMPANY', 'PERSON', 'TECHNOLOGY')),
    year                integer not null,
    description         text,
    impact_role         text,
    tech_l1             text,
    tech_l2             text,
    company_categories  text[],
    primary_role        text,
    secondary_role      text,
    birth_year          integer,
    death_year          integer,
    end_year            integer,
    market_cap          jsonb,
    external_links      jsonb,
    keywords            text[],
    -- Wikidata integration
    wikidata_qid        text unique,
    wikipedia_urls      jsonb,
    sitelinks_count     integer,
    relevance_score     real,
    -- Provenance / approval workflow
    provenance          text not null default 'curated' check (provenance in ('curated', 'ai_discovered', 'ai_enriched')),
    approved_at         timestamptz,
    discovered_from     text,
    discovery_depth     integer,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index nodes_category_idx        on public.nodes(category);
create index nodes_year_idx            on public.nodes(year);
create index nodes_approved_idx        on public.nodes(approved_at) where approved_at is not null;
create index nodes_provenance_idx      on public.nodes(provenance);
create index nodes_label_trgm_idx      on public.nodes using gin (label gin_trgm_ops);
create index nodes_keywords_idx        on public.nodes using gin (keywords);

-- ============================================================================
-- 2. links
-- ============================================================================
create table public.links (
    id                  bigserial primary key,
    source_id           text not null references public.nodes(id) on delete cascade,
    target_id           text not null references public.nodes(id) on delete cascade,
    type                text not null check (type in ('POWERS', 'CREATES', 'CONTRIBUTES', 'ENGAGES')),
    arrow               text not null check (arrow in ('SINGLE', 'DOUBLE', 'NONE')),
    icon                text,
    strength            real not null default 0.5,
    start_year          integer,
    end_year            integer,
    -- Wikidata / AI provenance
    wikidata_property   text,
    relation_kind       text,
    provenance          text not null default 'curated' check (provenance in ('curated', 'ai_discovered', 'ai_enriched')),
    approved_at         timestamptz,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index links_source_idx           on public.links(source_id);
create index links_target_idx           on public.links(target_id);
create index links_type_idx             on public.links(type);
create index links_approved_idx         on public.links(approved_at) where approved_at is not null;
create unique index links_unique_triple on public.links(source_id, target_id, type);

-- ============================================================================
-- 3. events
-- ============================================================================
create table public.events (
    id                  text primary key,
    year                integer not null,
    end_year            integer,
    related_nodes       text[],
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index events_year_idx on public.events(year);

-- ============================================================================
-- 4. node_translations  (locale-aware label/description + embedding)
-- ============================================================================
create table public.node_translations (
    node_id             text not null references public.nodes(id) on delete cascade,
    locale              text not null check (locale in ('en', 'ko', 'ja')),
    label               text not null,
    description         text,
    primary_role        text,
    secondary_role      text,
    embedding           vector(768),
    embedding_model     text,
    embedding_updated_at timestamptz,
    updated_at          timestamptz not null default now(),
    primary key (node_id, locale)
);

create index node_translations_locale_idx on public.node_translations(locale);
-- NOTE: ivfflat index on embedding deferred to migration 0003 (after Phase 1 data exists)

-- ============================================================================
-- 5. link_translations  (locale-aware story)
-- ============================================================================
create table public.link_translations (
    link_id             bigint not null references public.links(id) on delete cascade,
    locale              text not null check (locale in ('en', 'ko', 'ja')),
    story               text,
    updated_at          timestamptz not null default now(),
    primary key (link_id, locale)
);

create index link_translations_locale_idx on public.link_translations(locale);

-- ============================================================================
-- 6. event_translations  (locale-aware story)
-- ============================================================================
create table public.event_translations (
    event_id            text not null references public.events(id) on delete cascade,
    locale              text not null check (locale in ('en', 'ko', 'ja')),
    story               text not null,
    updated_at          timestamptz not null default now(),
    primary key (event_id, locale)
);

create index event_translations_locale_idx on public.event_translations(locale);

-- ============================================================================
-- 7. qa_cache  (semantic answer cache, TTL 30 days)
-- ============================================================================
create table public.qa_cache (
    query_hash          text primary key,
    query_text          text not null,
    query_embedding     vector(768) not null,
    locale              text not null check (locale in ('en', 'ko', 'ja')),
    answer              jsonb not null,
    source_node_ids     text[] not null default '{}',
    hits                integer not null default 0,
    created_at          timestamptz not null default now(),
    expires_at          timestamptz not null default (now() + interval '30 days')
);

create index qa_cache_locale_idx  on public.qa_cache(locale);
create index qa_cache_expires_idx on public.qa_cache(expires_at);

-- ============================================================================
-- 8. rate_limits  (anon UUID daily counter)
-- ============================================================================
create table public.rate_limits (
    anon_id             text not null,
    day                 date not null,
    count               integer not null default 0,
    updated_at          timestamptz not null default now(),
    primary key (anon_id, day)
);

create index rate_limits_day_idx on public.rate_limits(day);

-- ============================================================================
-- 9. wikidata_excluded  (negative cache for BFS)
-- ============================================================================
create table public.wikidata_excluded (
    qid                 text primary key,
    reason              text,
    excluded_at         timestamptz not null default now()
);

-- ============================================================================
-- 10. node_audit  (change log)
-- ============================================================================
create table public.node_audit (
    id                  bigserial primary key,
    node_id             text,
    action              text not null,
    actor               text,
    diff                jsonb,
    ts                  timestamptz not null default now()
);

create index node_audit_node_idx on public.node_audit(node_id);
create index node_audit_ts_idx   on public.node_audit(ts desc);

-- ============================================================================
-- updated_at trigger
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger nodes_set_updated_at               before update on public.nodes               for each row execute function public.set_updated_at();
create trigger links_set_updated_at               before update on public.links               for each row execute function public.set_updated_at();
create trigger events_set_updated_at              before update on public.events              for each row execute function public.set_updated_at();
create trigger node_translations_set_updated_at   before update on public.node_translations   for each row execute function public.set_updated_at();
create trigger link_translations_set_updated_at   before update on public.link_translations   for each row execute function public.set_updated_at();
create trigger event_translations_set_updated_at  before update on public.event_translations  for each row execute function public.set_updated_at();
create trigger rate_limits_set_updated_at         before update on public.rate_limits         for each row execute function public.set_updated_at();
