-- The Silicon Age — RLS policies
-- Phase 0: anon can SELECT only approved rows; INSERT/UPDATE limited to qa_cache + rate_limits.
-- Authenticated (Studio / admin) has full access. service_role bypasses RLS entirely.

-- ============================================================================
-- Enable RLS on every public table
-- ============================================================================
alter table public.nodes               enable row level security;
alter table public.links               enable row level security;
alter table public.events              enable row level security;
alter table public.node_translations   enable row level security;
alter table public.link_translations   enable row level security;
alter table public.event_translations  enable row level security;
alter table public.qa_cache            enable row level security;
alter table public.rate_limits         enable row level security;
alter table public.wikidata_excluded   enable row level security;
alter table public.node_audit          enable row level security;

-- ============================================================================
-- nodes — anon: SELECT only approved
-- ============================================================================
create policy "nodes_anon_select_approved"
    on public.nodes for select
    to anon
    using (approved_at is not null);

create policy "nodes_authenticated_all"
    on public.nodes for all
    to authenticated
    using (true) with check (true);

-- ============================================================================
-- links — anon: SELECT only approved
-- ============================================================================
create policy "links_anon_select_approved"
    on public.links for select
    to anon
    using (approved_at is not null);

create policy "links_authenticated_all"
    on public.links for all
    to authenticated
    using (true) with check (true);

-- ============================================================================
-- events — anon: SELECT (no approval gate; events are curated only)
-- ============================================================================
create policy "events_anon_select"
    on public.events for select
    to anon
    using (true);

create policy "events_authenticated_all"
    on public.events for all
    to authenticated
    using (true) with check (true);

-- ============================================================================
-- node_translations — anon: SELECT only if parent node approved
-- ============================================================================
create policy "node_translations_anon_select"
    on public.node_translations for select
    to anon
    using (
        exists (
            select 1 from public.nodes n
            where n.id = node_translations.node_id
              and n.approved_at is not null
        )
    );

create policy "node_translations_authenticated_all"
    on public.node_translations for all
    to authenticated
    using (true) with check (true);

-- ============================================================================
-- link_translations — anon: SELECT only if parent link approved
-- ============================================================================
create policy "link_translations_anon_select"
    on public.link_translations for select
    to anon
    using (
        exists (
            select 1 from public.links l
            where l.id = link_translations.link_id
              and l.approved_at is not null
        )
    );

create policy "link_translations_authenticated_all"
    on public.link_translations for all
    to authenticated
    using (true) with check (true);

-- ============================================================================
-- event_translations — anon: SELECT
-- ============================================================================
create policy "event_translations_anon_select"
    on public.event_translations for select
    to anon
    using (true);

create policy "event_translations_authenticated_all"
    on public.event_translations for all
    to authenticated
    using (true) with check (true);

-- ============================================================================
-- qa_cache — anon: SELECT + INSERT (Edge Function impersonates anon by design)
-- UPDATE limited to hits++ via dedicated RPC (Phase 3 will add).
-- ============================================================================
create policy "qa_cache_anon_select"
    on public.qa_cache for select
    to anon
    using (true);

create policy "qa_cache_anon_insert"
    on public.qa_cache for insert
    to anon
    with check (true);

create policy "qa_cache_authenticated_all"
    on public.qa_cache for all
    to authenticated
    using (true) with check (true);

-- ============================================================================
-- rate_limits — anon: SELECT/INSERT/UPDATE
-- (Counter integrity is enforced by Edge Function logic, not RLS.
--  RLS only ensures anon role can write its own counters.)
-- ============================================================================
create policy "rate_limits_anon_select"
    on public.rate_limits for select
    to anon
    using (true);

create policy "rate_limits_anon_insert"
    on public.rate_limits for insert
    to anon
    with check (true);

create policy "rate_limits_anon_update"
    on public.rate_limits for update
    to anon
    using (true) with check (true);

create policy "rate_limits_authenticated_all"
    on public.rate_limits for all
    to authenticated
    using (true) with check (true);

-- ============================================================================
-- wikidata_excluded — admin only (no anon access)
-- ============================================================================
create policy "wikidata_excluded_authenticated_all"
    on public.wikidata_excluded for all
    to authenticated
    using (true) with check (true);

-- ============================================================================
-- node_audit — admin only
-- ============================================================================
create policy "node_audit_authenticated_all"
    on public.node_audit for all
    to authenticated
    using (true) with check (true);
