/**
 * generateEmbeddings.ts
 *
 * Builds embedding text per (node_id, locale) and writes 768-dim vectors into
 * node_translations.embedding via Gemini text-embedding-004 batch API.
 *
 * Embedding text shape:
 *   "{label} ({category}, {year}). {description}
 *    Role: {primary_role|impact_role}. Categories: {tech_l1}/{tech_l2}.
 *    Related: {up to 3 outgoing link stories}."
 *
 * Usage:
 *   npx tsx scripts/generateEmbeddings.ts
 *
 * Env required:
 *   VITE_GOOGLE_API_KEY              (Gemini key — same one used by the app)
 *   SUPABASE_SERVICE_ROLE_KEY        (DB write)
 *   VITE_SUPABASE_URL (or SUPABASE_URL)
 *
 * Batch size: 100 contents per Gemini call (the documented cap); we throttle
 * with a 400 ms gap between batches to stay well under any per-minute limit.
 */

import 'dotenv/config';
import { getServiceClient } from '../services/supabaseClient';

// Gemini's current text embedding model (2026-05). text-embedding-004 is retired;
// gemini-embedding-001 is the GA successor with native multilingual support.
const MODEL = 'gemini-embedding-001';
const OUTPUT_DIM = 768;  // must match supabase nodes_translations.embedding vector(768)
// Free tier limit: 100 EmbedContent RPM per project. batchEmbedContents counts each
// content as a separate quota call, so we cap one batch at the per-minute budget
// and wait a full minute between batches. 672 rows / 100 ≈ 7 batches ≈ 7 min total.
const BATCH_SIZE = 100;
const INTER_BATCH_MS = 65_000;

interface NodeRow {
    id: string;
    category: string;
    year: number;
    impact_role: string | null;
    tech_l1: string | null;
    tech_l2: string | null;
    primary_role: string | null;
}
interface NodeTransRow {
    node_id: string;
    locale: 'en' | 'ko' | 'ja';
    label: string;
    description: string | null;
    primary_role: string | null;
}
interface LinkRow {
    source_id: string;
    target_id: string;
}
interface LinkTransRow {
    link_id: number;
    locale: 'en' | 'ko' | 'ja';
    story: string | null;
}

interface EmbedTask {
    node_id: string;
    locale: 'en' | 'ko' | 'ja';
    text: string;
}

function buildText(
    node: NodeRow,
    trans: NodeTransRow,
    relatedStories: string[],
): string {
    const role = trans.primary_role ?? node.primary_role ?? node.impact_role ?? '';
    const cats = [node.tech_l1, node.tech_l2].filter(Boolean).join(' / ');
    const desc = (trans.description ?? '').trim();
    const head = `${trans.label} (${node.category}, ${node.year}).`;
    const body = [
        desc,
        role ? `Role: ${role}.` : '',
        cats ? `Categories: ${cats}.` : '',
        relatedStories.length > 0 ? `Related: ${relatedStories.slice(0, 3).join(' / ')}.` : '',
    ].filter(Boolean).join(' ');
    return `${head} ${body}`.trim();
}

interface RetryHint { retryDelay?: string }
function parseRetryDelaySeconds(errBody: string): number | null {
    try {
        const j = JSON.parse(errBody) as { error?: { details?: RetryHint[] } };
        for (const d of j.error?.details ?? []) {
            const m = d.retryDelay?.match(/(\d+)s/);
            if (m) return Number(m[1]);
        }
    } catch { /* not JSON */ }
    return null;
}

async function batchEmbed(apiKey: string, texts: string[]): Promise<number[][]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:batchEmbedContents?key=${apiKey}`;
    const body = {
        requests: texts.map(text => ({
            model: `models/${MODEL}`,
            content: { parts: [{ text }] },
            outputDimensionality: OUTPUT_DIM,
        })),
    };

    for (let attempt = 1; attempt <= 4; attempt++) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            const data = await res.json() as { embeddings?: Array<{ values: number[] }> };
            if (!data.embeddings || data.embeddings.length !== texts.length) {
                throw new Error(`unexpected embeddings response: ${JSON.stringify(data).slice(0, 300)}`);
            }
            for (const e of data.embeddings) {
                if (e.values.length !== OUTPUT_DIM) {
                    throw new Error(`expected ${OUTPUT_DIM}-dim vectors, got ${e.values.length}`);
                }
            }
            return data.embeddings.map(e => e.values);
        }
        const txt = await res.text();
        if (res.status === 429) {
            const hint = parseRetryDelaySeconds(txt) ?? 60;
            const wait = (hint + 3) * 1000;
            console.warn(`  [429] quota exceeded, retrying in ${wait / 1000}s (attempt ${attempt}/4)`);
            await new Promise(r => setTimeout(r, wait));
            continue;
        }
        throw new Error(`batchEmbedContents ${res.status}: ${txt}`);
    }
    throw new Error('batchEmbedContents: exhausted retries');
}

async function main() {
    const apiKey = process.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) throw new Error('VITE_GOOGLE_API_KEY missing — set it in .env or .env.local');

    const sb = getServiceClient();

    // 1. Pull every node + every translation in one shot
    console.log('[embed] loading nodes and translations ...');
    const { data: nodes, error: e1 } = await sb
        .from('nodes')
        .select('id, category, year, impact_role, tech_l1, tech_l2, primary_role');
    if (e1) throw e1;
    const nodeById = new Map<string, NodeRow>();
    for (const n of (nodes as NodeRow[] ?? [])) nodeById.set(n.id, n);
    console.log(`  nodes: ${nodeById.size}`);

    // By default only target rows whose embedding is still NULL — this lets the
    // script run incrementally as new ai_discovered nodes arrive. Pass --force
    // to regenerate every row.
    const force = process.argv.includes('--force');
    let q = sb
        .from('node_translations')
        .select('node_id, locale, label, description, primary_role');
    if (!force) q = q.is('embedding', null);
    const { data: trans, error: e2 } = await q;
    if (e2) throw e2;
    const transRows = (trans as NodeTransRow[] ?? []);
    console.log(`  translations needing embedding: ${transRows.length}${force ? ' (force)' : ''}`);
    if (transRows.length === 0) { console.log('[embed] nothing to do.'); return; }

    // 2. Build "related link stories" lookup, per (source_id, locale)
    console.log('[embed] indexing related link stories ...');
    const { data: links, error: e3 } = await sb
        .from('links')
        .select('id, source_id, target_id, strength')
        .order('strength', { ascending: false })
        .limit(5000);
    if (e3) throw e3;
    const linksByNode = new Map<string, Array<{ id: number; target: string }>>();
    for (const l of (links as Array<LinkRow & { id: number; strength: number }> ?? [])) {
        const arr = linksByNode.get(l.source_id) ?? [];
        arr.push({ id: l.id, target: l.target_id });
        linksByNode.set(l.source_id, arr);
    }

    const { data: linkTrans, error: e4 } = await sb
        .from('link_translations')
        .select('link_id, locale, story');
    if (e4) throw e4;
    const storyByLinkLocale = new Map<string, string>();  // `${link_id}__${locale}` -> story
    for (const lt of (linkTrans as LinkTransRow[] ?? [])) {
        if (lt.story) storyByLinkLocale.set(`${lt.link_id}__${lt.locale}`, lt.story);
    }

    // 3. Build embedding tasks
    console.log('[embed] building embedding tasks ...');
    const tasks: EmbedTask[] = [];
    for (const t of transRows) {
        const node = nodeById.get(t.node_id);
        if (!node) continue;
        const related = linksByNode.get(t.node_id) ?? [];
        const stories: string[] = [];
        for (const l of related) {
            const s = storyByLinkLocale.get(`${l.id}__${t.locale}`);
            if (s) stories.push(s);
            if (stories.length >= 3) break;
        }
        tasks.push({
            node_id: t.node_id,
            locale: t.locale,
            text: buildText(node, t, stories),
        });
    }
    console.log(`  total tasks: ${tasks.length}`);

    // 4. Call Gemini and persist each batch immediately. This way a 429 in the
    //    middle of the run does not throw away embeddings we already paid for.
    console.log('[embed] requesting embeddings + writing per batch ...');
    let written = 0;
    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
        const slice = tasks.slice(i, i + BATCH_SIZE);
        let vectors: number[][];
        try {
            vectors = await batchEmbed(apiKey, slice.map(s => s.text));
        } catch (err) {
            console.error(`[embed] batch ${i} failed:`, err instanceof Error ? err.message : err);
            console.error(`[embed] partial result: ${written} translations embedded so far`);
            throw err;
        }
        const NOW = new Date().toISOString();
        for (let j = 0; j < slice.length; j++) {
            const { error } = await sb
                .from('node_translations')
                .update({ embedding: vectors[j], embedding_model: MODEL, embedding_updated_at: NOW } as never)
                .eq('node_id', slice[j].node_id)
                .eq('locale', slice[j].locale);
            if (error) {
                console.warn(`  update ${slice[j].node_id}/${slice[j].locale} failed: ${error.message}`);
                continue;
            }
            written++;
        }
        console.log(`  embeddings written: ${written}/${tasks.length}`);
        if (i + BATCH_SIZE < tasks.length) {
            console.log(`  sleeping ${INTER_BATCH_MS / 1000}s before next batch (free tier RPM)`);
            await new Promise(r => setTimeout(r, INTER_BATCH_MS));
        }
    }

    console.log(`[embed] done. total rows updated: ${written}`);
}

main().catch(err => { console.error('[embed] FAILED:', err); process.exit(1); });
