-- Phase 5 review fix #4: actually increment qa_cache.hits on a cache hit
-- and bump expires_at so popular queries do not silently age out.
--
-- The previous code used a no-op `update { hits: undefined }` from the Edge
-- Function. We expose a proper SECURITY DEFINER RPC so anon can call it,
-- and add an LRU-style TTL refresh in the same statement.

create or replace function public.increment_qa_cache_hits(p_query_hash text)
returns integer
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
    new_hits integer;
begin
    update public.qa_cache
       set hits = hits + 1,
           expires_at = now() + interval '30 days'
     where query_hash = p_query_hash
    returning hits into new_hits;
    return coalesce(new_hits, 0);
end;
$$;

grant execute on function public.increment_qa_cache_hits(text) to anon, authenticated, service_role;
