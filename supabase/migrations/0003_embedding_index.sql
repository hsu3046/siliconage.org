-- Phase 1: vector similarity index on node_translations.embedding.
-- Apply *after* generateEmbeddings.ts has populated the column (Postgres builds
-- the index much faster — and chooses better tuning — when data already exists).
--
-- HNSW preferred over IVFFlat at our scale (<10k rows per locale): better recall
-- at the same probe budget, no need to tune `lists`. Cosine distance matches
-- how Gemini text-embedding-004 was trained.

create index if not exists node_translations_embedding_hnsw
    on public.node_translations
    using hnsw (embedding vector_cosine_ops);

-- Optional: trigram already in 0001, but make sure label search keeps working
-- with the new translation rows.
create index if not exists node_translations_label_trgm
    on public.node_translations using gin (label gin_trgm_ops);

-- ANALYZE so the planner picks the index.
analyze public.node_translations;
