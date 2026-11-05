-- Phase 6: remember rejected candidates regardless of their source
--
-- wikidata_excluded (0001) negative-caches by Wikidata Q-id, which aib vote
-- imports (scripts/importFromAib.ts) do not have. The admin `reject` action
-- now also records every rejected node id here, and every importer skips ids
-- found in this table, so a rejected candidate never comes back on the next run.
--
-- Service role only (Edge Function + scripts); no anon access.

create table if not exists public.rejected_node_ids (
    id          text primary key,
    source      text,
    reason      text,
    created_at  timestamptz not null default now()
);

alter table public.rejected_node_ids enable row level security;
-- No policies: anon/authenticated cannot read or write. service_role bypasses RLS.
