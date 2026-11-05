// Phase 3 Graph-RAG QA Edge Function (BYOK-only, parity with Deep Dive)
//
// Flow:
//   1. CORS + body parse
//   2. Require x-byok-gemini-key header — otherwise return status='no_key'.
//      The graph-RAG retrieval + cache infrastructure runs server-side, but
//      every Gemini call uses the user's own key. No system key, no quota.
//   3. Embed query via gemini-embedding-001 (768d)
//   4. Try qa_cache: cosine >= 0.92 hit → return cached answer
//   5. Miss → match_nodes_with_graph RPC → assemble context
//   6. Call gemini-3.1-flash-lite with JSON response + citations
//   5b. (optional) Jev relevance gate on retrieved nodes, Jev groundedness on the answer
//   7. Persist into qa_cache (best-effort)
//   8. Return { answer, source_node_ids, cached, grounded, no_context }
//
// Deploy:
//   supabase functions deploy qa
//
// Secrets required (auto-injected by Supabase):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// GEMINI_API_KEY is no longer used — clients bring their own key.

// @ts-ignore — Deno-only import; not resolved by Node tsc but runs in Edge runtime.
import { createClient } from 'jsr:@supabase/supabase-js@2';

// @ts-ignore — Deno global; available at runtime, not in Node typings.
declare const Deno: { env: { get(name: string): string | undefined } };

const EMBED_MODEL = 'gemini-embedding-001';
// gemini-3.1-flash-lite is the current GA fast model (2026-05). Plenty smart
// for the 2-4 sentence cited-context answers we generate and the cheapest
// generate-tier we can use without losing JSON-mode reliability.
const ANSWER_MODEL = 'gemini-3.1-flash-lite';
const EMBED_DIM = 768;
const CACHE_SIM_THRESHOLD = 0.92;

// ── TypeSafe Jev quality gates (optional) ───────────────────────────────────
// Enabled only when the OPENROUTER_API_KEY secret is set:
//   supabase secrets set OPENROUTER_API_KEY=...
// Cost is ours, not the visitor's (~$0.0004 per uncached question), and it
// only runs after the visitor's own key already embedded the query.
//  1. relevance gate — vector search cannot say "nothing relevant", it always
//     returns top-k. Jev scores every retrieved node; when none clears the
//     bar we answer "not in the graph" WITHOUT spending the visitor's Gemini
//     generate quota. (Same lesson as aib vote's rerank gate.)
//  2. groundedness — P(every claim in the answer is supported by the cited
//     context). Returned to the client, which flags weakly grounded answers.
// Any Jev failure fails open (previous behaviour).
const JEV_MODEL = Deno.env.get('JEV_MODEL') ?? 'typesafe/jev-1.13';
const RELEVANCE_MIN = Number(Deno.env.get('QA_RELEVANCE_MIN') ?? '0.3');
const RELEVANCE_KEEP_MAX = 20;

async function jev(questions: Record<string, unknown>, state: unknown): Promise<Record<string, { noul?: number }> | null> {
    const key = Deno.env.get('OPENROUTER_API_KEY');
    if (!key) return null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
        const res = await fetch('https://openrouter.ai/api/alpha/decisions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'The Silicon Age' },
            body: JSON.stringify({ model: JEV_MODEL, state, questions }),
            signal: ctrl.signal,
        });
        if (!res.ok) { console.warn(`[qa] jev ${res.status}: ${(await res.text()).slice(0, 200)}`); return null; }
        const data = await res.json();
        return (data?.answers ?? null) as Record<string, { noul?: number }> | null;
    } catch (err) {
        console.warn('[qa] jev failed (fail-open):', err instanceof Error ? err.message : String(err));
        return null;
    } finally {
        clearTimeout(timer);
    }
}

/** Keep retrieved nodes Jev judges useful. null = gate unavailable (keep all). */
async function relevanceGate(query: string, nodes: RetrievedNode[]): Promise<RetrievedNode[] | null> {
    const pool = nodes.slice(0, 40);
    const questions: Record<string, unknown> = {};
    pool.forEach((_, i) => {
        questions[`n${i}`] = { type: 'noul', instructions: `Would node n${i} help answer the question (directly relevant facts, people, companies or technologies the question is about)?` };
    });
    const answers = await jev(questions, {
        question: query,
        nodes: pool.map((n, i) => ({ key: `n${i}`, name: n.label, category: n.category, year: n.year, description: (n.description ?? '').slice(0, 240) })),
    });
    if (!answers) return null;
    return pool
        .map((n, i) => ({ n, p: answers[`n${i}`]?.noul ?? 0 }))
        .filter(x => x.p >= RELEVANCE_MIN)
        .sort((a, b) => b.p - a.p)
        .slice(0, RELEVANCE_KEEP_MAX)
        .map(x => x.n);
}

async function groundedness(answer: string, context: string): Promise<number | null> {
    const answers = await jev({
        grounded: { type: 'noul', instructions: 'Is every factual claim in the answer supported by the context (names, dates, relationships)? False if the answer adds facts the context does not contain or contradicts it.' },
    }, { context, answer });
    const p = answers?.grounded?.noul;
    return typeof p === 'number' ? p : null;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-byok-gemini-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface QABody {
    query: string;
    locale?: 'en' | 'ko' | 'ja';
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey}`;
    const body = JSON.stringify({ content: { parts: [{ text }] }, outputDimensionality: EMBED_DIM });
    for (let attempt = 1; attempt <= 3; attempt++) {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        if (res.ok) {
            const data = await res.json();
            const values = data.embedding?.values as number[] | undefined;
            if (!values || values.length !== EMBED_DIM) {
                throw new Error(`embed: bad shape (got ${values?.length})`);
            }
            return values;
        }
        const errText = await res.text();
        const transient5xx = res.status >= 500 && res.status < 600;
        if (res.status === 429 || transient5xx) {
            const m = errText.match(/"retryDelay":\s*"(\d+)s"/);
            const waitSec = res.status === 429
                ? (m ? Math.min(Number(m[1]) + 2, 25) : 12)
                : Math.min(2 * Math.pow(2, attempt - 1), 12);
            console.warn(`[qa] ${res.status} from embedContent, retrying in ${waitSec}s (attempt ${attempt}/3)`);
            await new Promise(r => setTimeout(r, waitSec * 1000));
            continue;
        }
        throw new Error(`embed ${res.status}: ${errText.slice(0, 400)}`);
    }
    throw new Error('embed: exhausted retries');
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
        // 429 = quota; 500/502/503/504 = transient model overload. Retry both,
        // with exponential-ish backoff (3s → 6s → 12s) on 5xx and the
        // server-supplied retryDelay on 429.
        const transient5xx = res.status >= 500 && res.status < 600;
        if (res.status === 429 || transient5xx) {
            const m = errText.match(/"retryDelay":\s*"(\d+)s"/);
            const waitSec = res.status === 429
                ? (m ? Math.min(Number(m[1]) + 2, 25) : 12)
                : Math.min(3 * Math.pow(2, attempt - 1), 20);
            console.warn(`[qa] ${res.status} from generateContent, retrying in ${waitSec}s (attempt ${attempt}/3)`);
            await new Promise(r => setTimeout(r, waitSec * 1000));
            continue;
        }
        throw new Error(`generate ${res.status}: ${errText.slice(0, 400)}`);
    }
    throw new Error('generate: exhausted retries');
}

function buildContext(nodes: RetrievedNode[]): string {
    const lines = nodes.slice(0, 40).map(n =>
        `[${n.node_id}] ${n.label} (${n.category}, ${n.year}). ${n.description ?? ''}`.trim()
    );
    return lines.join('\n');
}

/** Lowercase, trim, collapse internal whitespace so equivalent questions hit
 *  the same cache row regardless of typing artefacts. */
function normalizeQuery(s: string): string {
    return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** SHA-1 hex of `${locale}::${normalized query}`. SHA-1 (not collision-safe
 *  but plenty unique for a cache key) keeps the key short and stable. */
async function hashQuery(locale: string, normalized: string): Promise<string> {
    const buf = new TextEncoder().encode(`${locale}::${normalized}`);
    const digest = await crypto.subtle.digest('SHA-1', buf);
    const hex = Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0')).join('');
    return `q_${hex}`;
}

// @ts-ignore — Deno.serve is the Edge runtime entry point
Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

    try {
        const body = await req.json() as QABody;
        const query = (body.query ?? '').trim();
        const locale = (body.locale ?? 'en') as 'en' | 'ko' | 'ja';
        if (!query) {
            return new Response(JSON.stringify({ error: 'query required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // BYOK only — same model as the existing Deep Dive flow. The client
        // pastes a Gemini key in About → API Key Settings, stores it in
        // localStorage, and forwards it on each call via x-byok-gemini-key.
        // No system key fallback and no daily quota: the user pays their own
        // Gemini quota directly.
        const geminiKey = (req.headers.get('x-byok-gemini-key') ?? '').trim();
        if (geminiKey.length < 10) {
            return new Response(JSON.stringify({
                status: 'no_key',
                message: 'Gemini API key required. Add one in About → API Key Settings.',
            }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Service-role Supabase client for RPCs (RLS still applies to functions
        // marked SECURITY INVOKER, which is the default; functions explicitly
        // marked SECURITY DEFINER bypass it).
        const supaUrl = Deno.env.get('SUPABASE_URL')!;
        const supaKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supa = createClient(supaUrl, supaKey, { auth: { persistSession: false } });

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
            // hits++ AND bump expires_at — popular questions stay warm.
            void supa.rpc('increment_qa_cache_hits', { p_query_hash: hit.query_hash });
            return new Response(JSON.stringify({
                status: 'ok',
                cached: true,
                answer: hit.answer?.answer ?? hit.answer,
                grounded: typeof hit.answer?.grounded === 'number' ? hit.answer.grounded : null,
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
        let retrievals = (nodes as RetrievedNode[]) ?? [];
        // 3b. Jev relevance gate (fail-open when unavailable)
        let gated = false;
        if (retrievals.length > 0) {
            const kept = await relevanceGate(query, retrievals);
            if (kept !== null) { retrievals = kept; gated = true; }
        }
        if (retrievals.length === 0) {
            // no_context lets the client show a localized message.
            return new Response(JSON.stringify({
                status: 'ok',
                cached: false,
                no_context: true,
                answer: 'No relevant nodes found in the graph for that query.',
                source_node_ids: [],
                gated,
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

        // 4b. Jev groundedness (null when unavailable)
        const grounded = await groundedness(answer, context);

        // 5. Persist into qa_cache (best-effort; ignore errors). Normalize the
        // query (trim + lowercase + collapse whitespace) and SHA-1 it so
        // equivalent questions land on the same cache row.
        const normalized = normalizeQuery(query);
        const query_hash = await hashQuery(locale, normalized);
        await supa.from('qa_cache').upsert({
            query_hash,
            query_text: query,
            query_embedding: queryEmb as unknown as string,
            locale,
            answer: { answer, grounded },
            source_node_ids,
        } as never, { onConflict: 'query_hash' });

        return new Response(JSON.stringify({
            status: 'ok',
            cached: false,
            answer,
            source_node_ids,
            grounded,
            gated,
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
