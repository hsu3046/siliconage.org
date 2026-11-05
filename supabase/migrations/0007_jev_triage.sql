-- Phase 6: Jev triage for the ai_discovered review queue
--
-- scripts/triageCandidates.ts asks TypeSafe Jev (calibrated decision model) to
-- judge every pending Wikidata candidate:
--   jev_relevance  P(belongs in The Silicon Age graph), 0–1
--   jev_suggestion role / company categories / tech taxonomy with confidence,
--                  plus the dated model id and the regex values it replaced
--   jev_model      dated model id echoed by the API (thresholds are model-bound)
--   jev_checked_at when the verdict was produced
--
-- These are review aids. Nothing here changes approved_at — a human still
-- approves in /admin. Anon never sees pending rows (0002 RLS), so no new
-- grants are needed.

alter table public.nodes
    add column if not exists jev_relevance  real,
    add column if not exists jev_suggestion jsonb,
    add column if not exists jev_model      text,
    add column if not exists jev_checked_at timestamptz;

create index if not exists nodes_jev_pending_idx
    on public.nodes (jev_relevance desc nulls last)
    where provenance = 'ai_discovered' and approved_at is null;
