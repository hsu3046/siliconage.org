/**
 * verifyEmbeddings.ts
 *
 * Smoke-tests the freshly-generated embeddings by pulling a handful of seed
 * nodes and printing their top-10 nearest neighbours by cosine similarity.
 * If the seeds are well-placed in vector space, the neighbours should be
 * topically related (e.g. apple → steve_jobs / iphone / mac_book, not random).
 *
 * Usage:
 *   npx tsx scripts/verifyEmbeddings.ts [locale=en]
 */

import 'dotenv/config';
import { getServiceClient } from '../services/supabaseClient';

const SEEDS = ['apple', 'transformer', 'steve_jobs', 'bell_labs', 'bitcoin'];
const TOPK = 10;

interface Row { node_id: string; label: string; embedding: number[] | string }

function parseVector(v: number[] | string): number[] {
    if (Array.isArray(v)) return v;
    // pgvector returns text like "[0.1,0.2,...]" through PostgREST
    return JSON.parse(v) as number[];
}

function cosine(a: number[], b: number[]): number {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function main() {
    const locale = (process.argv[2] ?? 'en') as 'en' | 'ko' | 'ja';
    const sb = getServiceClient();

    const { data, error } = await sb
        .from('node_translations')
        .select('node_id, label, embedding')
        .eq('locale', locale)
        .not('embedding', 'is', null);
    if (error) throw error;
    const rows = (data as Row[]).map(r => ({ ...r, embedding: parseVector(r.embedding) }));
    console.log(`[verify] ${rows.length} embeddings loaded for locale=${locale}\n`);

    for (const seedId of SEEDS) {
        const seed = rows.find(r => r.node_id === seedId);
        if (!seed) { console.log(`SKIP: no embedding for ${seedId}\n`); continue; }
        const scored = rows
            .filter(r => r.node_id !== seedId)
            .map(r => ({ id: r.node_id, label: r.label, sim: cosine(seed.embedding, r.embedding) }))
            .sort((a, b) => b.sim - a.sim)
            .slice(0, TOPK);
        console.log(`==== ${seedId} (${seed.label}) — top ${TOPK} ====`);
        for (const s of scored) {
            console.log(`  ${s.sim.toFixed(3)}  ${s.id.padEnd(28)} ${s.label}`);
        }
        console.log();
    }
}

main().catch(err => { console.error('[verify] FAILED:', err); process.exit(1); });
