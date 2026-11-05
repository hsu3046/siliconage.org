-- Phase 6: timeline event candidates scouted from aib vote news
--
-- scripts/scoutEvents.ts reads aib vote's public RSS (en/ko/ja), asks TypeSafe
-- Jev whether each story is a lasting milestone, matches related graph nodes
-- in code, and queues candidates here. /admin approves → a row in `events`
-- (+ event_translations) with id prefix 'ev_', which export-approved picks up.
--
-- Service role only. `source_url` keeps the link back to the aib vote article.

create table if not exists public.event_candidates (
    id              text primary key,                -- 'ev_' + stable hash of the article URL
    year            integer not null,
    story_en        text not null,
    story_ko        text,
    story_ja        text,
    related_nodes   text[] not null default '{}',
    source_url      text not null,
    published_at    timestamptz,
    jev_milestone   real,
    jev_model       text,
    status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at      timestamptz not null default now(),
    decided_at      timestamptz
);

create index if not exists event_candidates_pending_idx
    on public.event_candidates (jev_milestone desc nulls last)
    where status = 'pending';

alter table public.event_candidates enable row level security;
-- No policies: service_role (admin Edge Function, scripts) only.

-- Approved events keep their aib vote article link for the timeline.
alter table public.events add column if not exists source_url text;
