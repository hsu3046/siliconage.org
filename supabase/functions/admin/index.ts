// Phase 5 admin actions — service_role-backed Edge Function.
//
// Why this exists: the previous client-side AdminDashboard read
// VITE_SUPABASE_SERVICE_ROLE_KEY directly, which inlined the secret into
// the dev client bundle. That is unsafe even in dev (dev server may be
// exposed, browser extensions can fetch /admin). All RLS-bypassing work
// must happen here, behind a password check.
//
// Auth: caller sends `x-admin-password: <pw>`. Compared (constant-time)
// against Deno.env.get('ADMIN_PASSWORD'). Configure via:
//   supabase secrets set ADMIN_PASSWORD="<strong random>"
//
// Deploy:
//   Studio → Edge Functions → Deploy new function `admin`
//   IMPORTANT: turn OFF "Verify JWT with legacy secret" in Settings tab
//   (we authenticate with the password header, not Supabase JWT).
//
// Actions (POST body):
//   { action: 'list_pending' }
//     → { rows: NodeRow[] }
//   { action: 'stats' }
//     → { pending, approved, excluded, qa_cache, embedded, missing_embed }
//   { action: 'approve', ids: string[] }
//     → { approved_nodes, approved_links }
//   { action: 'reject', ids: string[] }
//     → { deleted_nodes, excluded_qids }

// @ts-ignore — Deno-only import
import { createClient } from 'jsr:@supabase/supabase-js@2';

// @ts-ignore — Deno global
declare const Deno: { env: { get(name: string): string | undefined } };

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-password',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(body), {
        ...init,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
}

/**
 * Constant-time string compare. The length difference is folded into the
 * accumulator instead of `return false`, so the call takes the same time
 * regardless of where the inputs diverge — a timing oracle cannot recover
 * the password length.
 */
function safeEqual(a: string, b: string): boolean {
    const max = Math.max(a.length, b.length);
    let r = a.length ^ b.length;
    for (let i = 0; i < max; i++) {
        r |= (a.charCodeAt(i) | 0) ^ (b.charCodeAt(i) | 0);
    }
    return r === 0;
}

const ID_RE = /^[a-z0-9_]{1,128}$/;
function validIds(input: unknown): string[] | null {
    if (!Array.isArray(input)) return null;
    if (input.length === 0 || input.length > 2000) return null;
    const out: string[] = [];
    for (const id of input) {
        if (typeof id !== 'string' || !ID_RE.test(id)) return null;
        out.push(id);
    }
    return out;
}

// @ts-ignore — Deno runtime entrypoint
Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'POST only' }, { status: 405 });

    // 1. Password gate
    const expected = Deno.env.get('ADMIN_PASSWORD') ?? '';
    if (!expected) {
        return json({ error: 'ADMIN_PASSWORD not configured on the server' }, { status: 500 });
    }
    const provided = req.headers.get('x-admin-password') ?? '';
    if (!safeEqual(provided, expected)) {
        return json({ error: 'unauthorized' }, { status: 401 });
    }

    // 2. Body parse
    let body: { action?: string; ids?: unknown };
    try { body = await req.json(); }
    catch { return json({ error: 'bad JSON body' }, { status: 400 }); }
    const action = body.action ?? '';

    // 3. Supabase service-role client (key never leaves this runtime)
    const url = Deno.env.get('SUPABASE_URL')!;
    const srk = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supa = createClient(url, srk, { auth: { persistSession: false } });

    try {
        switch (action) {
            case 'list_pending': {
                const { data, error } = await supa
                    .from('nodes')
                    .select('id, label, category, year, description, impact_role, tech_l1, tech_l2, company_categories, relevance_score, sitelinks_count, wikidata_qid, discovered_from, discovery_depth, wikipedia_urls')
                    .eq('provenance', 'ai_discovered')
                    .is('approved_at', null)
                    .order('relevance_score', { ascending: false, nullsFirst: false })
                    .limit(2000);
                if (error) throw error;
                return json({ rows: data ?? [] });
            }

            case 'stats': {
                const [pendingRes, approvedRes, excludedRes, cacheRes, embeddedRes, missingRes] = await Promise.all([
                    supa.from('nodes').select('id', { count: 'exact', head: true }).eq('provenance', 'ai_discovered').is('approved_at', null),
                    supa.from('nodes').select('id', { count: 'exact', head: true }).not('approved_at', 'is', null),
                    supa.from('wikidata_excluded').select('qid', { count: 'exact', head: true }),
                    supa.from('qa_cache').select('query_hash', { count: 'exact', head: true }),
                    supa.from('node_translations').select('node_id', { count: 'exact', head: true }).not('embedding', 'is', null),
                    supa.from('node_translations').select('node_id', { count: 'exact', head: true }).is('embedding', null),
                ]);
                return json({
                    pending: pendingRes.count ?? 0,
                    approved: approvedRes.count ?? 0,
                    excluded: excludedRes.count ?? 0,
                    qa_cache: cacheRes.count ?? 0,
                    embedded: embeddedRes.count ?? 0,
                    missing_embed: missingRes.count ?? 0,
                });
            }

            case 'approve': {
                const ids = validIds(body.ids);
                if (!ids) return json({ error: 'invalid ids' }, { status: 400 });
                const NOW = new Date().toISOString();
                const { error: e1, count: approvedNodes } = await supa
                    .from('nodes')
                    .update({ approved_at: NOW }, { count: 'exact' })
                    .in('id', ids)
                    .eq('provenance', 'ai_discovered')
                    .is('approved_at', null);
                if (e1) throw e1;

                // Approve any ai_discovered link that touches the just-approved
                // set on either side, so the graph stays connected.
                const idList = ids.map(i => `"${i}"`).join(',');
                const { error: e2, count: approvedLinks } = await supa
                    .from('links')
                    .update({ approved_at: NOW }, { count: 'exact' })
                    .eq('provenance', 'ai_discovered')
                    .is('approved_at', null)
                    .or(`source_id.in.(${idList}),target_id.in.(${idList})`);
                if (e2) throw e2;

                return json({ approved_nodes: approvedNodes ?? 0, approved_links: approvedLinks ?? 0 });
            }

            case 'reject': {
                const ids = validIds(body.ids);
                if (!ids) return json({ error: 'invalid ids' }, { status: 400 });
                // Pull Q-ids first so we can negative-cache them in BFS.
                const { data: q, error: e0 } = await supa
                    .from('nodes')
                    .select('wikidata_qid')
                    .in('id', ids)
                    .not('wikidata_qid', 'is', null);
                if (e0) throw e0;
                const qids = ((q as Array<{ wikidata_qid: string }>) ?? [])
                    .map(r => r.wikidata_qid)
                    .filter(Boolean);
                if (qids.length > 0) {
                    const rows = qids.map(qid => ({ qid, reason: 'admin reject' }));
                    const { error: e1 } = await supa
                        .from('wikidata_excluded')
                        .upsert(rows as never, { onConflict: 'qid' });
                    if (e1) throw e1;
                }
                // Hard delete; ON DELETE CASCADE removes translations + links.
                const { error: e2, count: deletedNodes } = await supa
                    .from('nodes')
                    .delete({ count: 'exact' })
                    .in('id', ids)
                    .eq('provenance', 'ai_discovered');
                if (e2) throw e2;

                return json({ deleted_nodes: deletedNodes ?? 0, excluded_qids: qids.length });
            }

            default:
                return json({ error: `unknown action: ${action}` }, { status: 400 });
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[admin]', action, msg);
        return json({ error: msg }, { status: 500 });
    }
});
