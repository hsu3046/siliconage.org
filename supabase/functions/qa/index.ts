// Phase 3 Graph-RAG QA Edge Function
//
// Flow:
//   1. CORS + body parse
//   2. If BYOK key present → skip rate limit, use BYOK for Gemini calls
//      else → increment rate_limits, refuse with status=quota_exceeded if >20/day
//   3. Embed query via gemini-embedding-001 (768d)
//   4. Try qa_cache: cosine >= 0.92 hit → return cached answer
//   5. Miss → match_nodes_with_graph RPC → assemble context
//   6. Call gemini-2.5-flash with JSON response + citations
//   7. Persist into qa_cache (best-effort)
//   8. Return { answer, source_node_ids, cached: boolean }
//
// Deploy:
//   supabase functions deploy qa
//
// Secrets required (supabase secrets set):
//   GEMINI_API_KEY          (system key — server side only)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY are injected automatically.

// @ts-ignore — Deno-only import; not resolved by Node tsc but runs in Edge runtime.
import { createClient } from 'jsr:@supabase/supabase-js@2';

// @ts-ignore — Deno global; available at runtime, not in Node typings.
declare const Deno: { env: { get(name: string): string | undefined } };

const EMBED_MODEL = 'gemini-embedding-001';
// gemini-2.5-flash-lite has a more generous free-tier RPD than full flash and
// is plenty smart enough for the 2-4 sentence cited-context answers we need.
const ANSWER_MODEL = 'gemini-2.5-flash-lite';
const EMBED_DIM = 768;
const DAILY_LIMIT = 20;
const CACHE_SIM_THRESHOLD = 0.92;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-byok-gemini-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface QABody {
    query: string;
    locale?: 'en' | 'ko' | 'ja';
    anon_id?: string;
}

interface RetrievedNode {
    node_id: string;
    label: string;
    category: string;
    year: number;
    description: string;
    similarity: number;
    score: number;
    hop: number;
}

async function embed(apiKey: string, text: string): Promise<number[]> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: { parts: [{ text }] },
                outputDimensionality: EMBED_DIM,
            }),
        },
    );
    if (!res.ok) throw new Error(`embed ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const values = data.embedding?.values as number[] | undefined;
    if (!values || values.length !== EMBED_DIM) {
        throw new Error(`embed: bad shape (got ${values?.length})`);
    }
    return values;
}

async function generate(apiKey: string, system: string, user: string): Promise<{ answer: string; source_node_ids: string[] }> {
    const body = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 2048,
        },
    };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${ANSWER_MODEL}:generateContent?key=${apiKey}`;
    for (let attempt = 1; attempt <= 3; attempt++) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            const parsed = JSON.parse(text);
            return {
                answer: String(parsed.answer ?? ''),
                source_node_ids: Array.isArray(parsed.source_node_ids) ? parsed.source_node_ids.map(String) : [],
            };
        }
        const errText = await res.text();
        if (res.status === 429) {
            const m = errText.match(/"retryDelay":\s*"(\d+)s"/);
            const waitSec = m ? Math.min(Number(m[1]) + 2, 25) : 12;
            console.warn(`[qa] 429 from generateContent, retrying in ${waitSec}s (attempt ${attempt}/3)`);
            await new Promise(r => setTimeout(r, waitSec * 1000));
            continue;
        }
        throw new Error(`generate ${res.status}: ${errText.slice(0, 400)}`);
    }
    throw new Error('generate: exhausted retries on 429');
}

function buildContext(nodes: RetrievedNode[]): string {
    const lines = nodes.slice(0, 40).map(n =>
        `[${n.node_id}] ${n.label} (${n.category}, ${n.year}). ${n.description ?? ''}`.trim()
    );
    return lines.join('\n');
}

function hash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return `q_${(h >>> 0).toString(16)}_${s.length}`;
}

// @ts-ignore — Deno.serve is the Edge runtime entry point
Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

    try {
        const body = await req.json() as QABody;
        const query = (body.query ?? '').trim();
        const locale = (body.locale ?? 'en') as 'en' | 'ko' | 'ja';
        const anon_id = body.anon_id ?? 'anonymous';
        if (!query) {
            return new Response(JSON.stringify({ error: 'query required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // BYOK header: when present, the user's own Gemini key is used and no
        // rate limit is enforced (they're paying their own quota).
        const byokKey = req.headers.get('x-byok-gemini-key') ?? '';
        const systemKey = Deno.env.get('GEMINI_API_KEY') ?? '';
        const useByok = byokKey.length > 10;
        const geminiKey = useByok ? byokKey : systemKey;
        if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'no Gemini key configured' }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Service-role Supabase client for RPCs (RLS still applies to functions
        // marked SECURITY INVOKER, which is the default; functions explicitly
        // marked SECURITY DEFINER bypass it).
        const supaUrl = Deno.env.get('SUPABASE_URL')!;
        const supaKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supa = createClient(supaUrl, supaKey, { auth: { persistSession: false } });

        // Rate limit (system-key flow only)
        if (!useByok) {
            const { data: newCount, error: rlErr } = await supa.rpc('increment_rate_limit', { p_anon_id: anon_id });
            if (rlErr) {
                return new Response(JSON.stringify({ error: 'rate_limit RPC failed', detail: rlErr.message }), {
                    status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
            const used = typeof newCount === 'number' ? newCount : 0;
            if (used > DAILY_LIMIT) {
                return new Response(JSON.stringify({
                    status: 'quota_exceeded',
                    daily_used: used,
                    daily_limit: DAILY_LIMIT,
                    message: 'Free daily quota reached. Add your own Gemini key for unlimited queries.',
                }), {
                    status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        // 1. Embed the query
        const queryEmb = await embed(geminiKey, query);

        // 2. qa_cache lookup
        const { data: cacheRows } = await supa.rpc('match_qa_cache', {
            query_emb: queryEmb as unknown as string,  // pgvector accepts JSON array
            q_locale: locale,
            sim_threshold: CACHE_SIM_THRESHOLD,
        });
        if (Array.isArray(cacheRows) && cacheRows.length > 0) {
            const hit = cacheRows[0];
            // Best-effort hits++
            await supa.from('qa_cache').update({ hits: undefined } as never).eq('query_hash', hit.query_hash); // no-op; left as future tweak
            return new Response(JSON.stringify({
                status: 'ok',
                cached: true,
                answer: hit.answer?.answer ?? hit.answer,
                source_node_ids: hit.source_node_ids ?? [],
                similarity: hit.similarity,
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. Retrieve via graph RAG
        const { data: nodes, error: matchErr } = await supa.rpc('match_nodes_with_graph', {
            query_emb: queryEmb as unknown as string,
            q_locale: locale,
            k: 12,
            max_total: 40,
        });
        if (matchErr) {
            return new Response(JSON.stringify({ error: 'retrieval RPC failed', detail: matchErr.message }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        const retrievals = (nodes as RetrievedNode[]) ?? [];
        if (retrievals.length === 0) {
            return new Response(JSON.stringify({
                status: 'ok',
                cached: false,
                answer: 'No relevant nodes found in the graph for that query.',
                source_node_ids: [],
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 4. Compose context + system prompt
        const context = buildContext(retrievals);
        const system = `You are the Silicon Age — an interactive knowledge graph of 100 years of digital history.
Answer the user's question STRICTLY from the context below. Cite the node IDs in square brackets you draw on, e.g. [apple], [transformer].
If the context does not contain the answer, say so plainly.
Output strict JSON: { "answer": "<2-4 sentences, ${locale === 'ko' ? 'Korean' : locale === 'ja' ? 'Japanese' : 'English'}>", "source_node_ids": ["id1","id2",...] }.
Use 2-5 source_node_ids drawn ONLY from the context. No markdown, no extra keys.

CONTEXT (one node per line, prefixed by [node_id]):
${context}`;

        const { answer, source_node_ids } = await generate(geminiKey, system, query);

        // 5. Persist into qa_cache (best-effort; ignore errors)
        const query_hash = hash(`${locale}::${query.toLowerCase()}`);
        await supa.from('qa_cache').upsert({
            query_hash,
            query_text: query,
            query_embedding: queryEmb as unknown as string,
            locale,
            answer: { answer },
            source_node_ids,
        } as never, { onConflict: 'query_hash' });

        return new Response(JSON.stringify({
            status: 'ok',
            cached: false,
            answer,
            source_node_ids,
            retrieval_count: retrievals.length,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[qa] error:', msg);
        return new Response(JSON.stringify({ error: msg }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
