/**
 * mapToWikidata.ts
 *
 * Probes Wikidata `wbsearchentities` for every node in constants.ts and emits
 * supabase/seed-data/qid_mapping.tsv — a one-row-per-node file with a recommended
 * Q-id and up to 4 alternatives. A human should scan the TSV and fix the
 * `selected_qid` column where the recommendation is wrong; that file is then
 * consumed by enrichFromWikidata.ts.
 *
 * Usage:
 *   npx tsx scripts/mapToWikidata.ts
 *
 * Output: supabase/seed-data/qid_mapping.tsv (overwrites existing file).
 *
 * Network: Wikidata API is free and unmetered, but be polite — we cap at
 * 3 concurrent requests and 200 ms gap between batches.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_DATA } from '../constants';
import type { NodeData, Category } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.join(__dirname, '..', 'supabase', 'seed-data');
const OUT_PATH = path.join(OUT_DIR, 'qid_mapping.tsv');
const UA = 'TheSiliconAge/1.0 (https://siliconage.org; contact@knowai.space) mapToWikidata.ts';

// ---------------------------------------------------------------------------
// Heuristics: per-category description keywords used to score candidates
// ---------------------------------------------------------------------------

const KEYWORDS: Record<Category, string[]> = {
    // Filled below; needs Category enum values, which are 'COMPANY' | 'PERSON' | 'TECHNOLOGY'
    COMPANY: [
        'company', 'corporation', 'business', 'enterprise', 'firm', 'multinational',
        'technology company', 'manufacturer', 'producer', 'startup', 'subsidiary',
        'venture capital', 'foundation', 'research lab', 'laboratory', 'organization',
    ],
    PERSON: [
        'engineer', 'scientist', 'inventor', 'entrepreneur', 'businessman', 'businesswoman',
        'computer scientist', 'physicist', 'mathematician', 'investor', 'founder',
        'CEO', 'chairman', 'professor', 'researcher', 'programmer', 'developer',
        'born', 'american', 'british', 'japanese', 'korean',
    ],
    TECHNOLOGY: [
        'programming language', 'protocol', 'standard', 'algorithm', 'architecture',
        'operating system', 'software', 'hardware', 'integrated circuit',
        'microprocessor', 'semiconductor', 'transistor', 'database', 'computer',
        'network', 'wireless', 'communication', 'specification', 'platform',
        'framework', 'model', 'system', 'device', 'chip', 'processor', 'memory',
    ],
} as Record<Category, string[]>;

// Generic negative signal — pages we never want as a match
const NEGATIVE_KEYWORDS = [
    'film', 'movie', 'novel', 'song', 'album', 'band', 'character',
    'video game', 'television series', 'tv series', 'episode',
    'city', 'town', 'village', 'river', 'mountain', 'genus', 'species',
];

// ---------------------------------------------------------------------------
// Wikidata client
// ---------------------------------------------------------------------------

interface WikidataSearchHit {
    id: string;
    label?: string;
    description?: string;
    aliases?: string[];
    match?: { type?: string; language?: string; text?: string };
}

async function wbsearchentities(query: string, limit = 8): Promise<WikidataSearchHit[]> {
    const url = new URL('https://www.wikidata.org/w/api.php');
    url.searchParams.set('action', 'wbsearchentities');
    url.searchParams.set('search', query);
    url.searchParams.set('language', 'en');
    url.searchParams.set('uselang', 'en');
    url.searchParams.set('format', 'json');
    url.searchParams.set('type', 'item');
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } });
    if (!res.ok) {
        throw new Error(`wbsearchentities ${res.status}: ${await res.text()}`);
    }
    const data = await res.json() as { search?: WikidataSearchHit[] };
    return data.search ?? [];
}

/**
 * Generate fallback queries for cases where the primary label fails.
 * Examples: "GPU (GeForce)" -> ["GeForce", "GPU"], "MIT CSAIL" -> ["MIT Computer Science"]
 * Empties out duplicates.
 */
function fallbackQueries(label: string): string[] {
    const out = new Set<string>();
    // Strip parenthesized suffix: "GPU (GeForce)" -> "GPU"
    const stripped = label.replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (stripped && stripped !== label) out.add(stripped);
    // Just the parenthesized content: "GPU (GeForce)" -> "GeForce"
    const inside = label.match(/\(([^)]+)\)/)?.[1];
    if (inside) out.add(inside.trim());
    // Drop common product-suffix words
    const SUFFIXES = ['Architecture', 'Browser', 'App', 'CRM', 'Database', 'Engine', 'Studio', 'Pro'];
    for (const s of SUFFIXES) {
        const re = new RegExp(`\\s+${s}$`, 'i');
        if (re.test(label)) out.add(label.replace(re, '').trim());
    }
    // First word only (last-ditch)
    const first = label.split(/\s+/)[0];
    if (first && first.length >= 3 && first !== label) out.add(first);
    out.delete(label);  // never repeat the primary query
    return [...out];
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreCandidate(node: NodeData, hit: WikidataSearchHit): number {
    let score = 0;
    const label = (hit.label ?? '').toLowerCase();
    const desc = (hit.description ?? '').toLowerCase();
    const nodeLabel = node.label.toLowerCase();

    // Label match
    if (label === nodeLabel) score += 6;
    else if (label.startsWith(nodeLabel)) score += 4;
    else if (label.includes(nodeLabel)) score += 2;

    // Match type from API (exact alias/label > token)
    if (hit.match?.type === 'label') score += 2;
    else if (hit.match?.type === 'alias') score += 1;

    // Category-aligned keywords in description
    const kw = KEYWORDS[node.category] ?? [];
    for (const w of kw) if (desc.includes(w)) { score += 1; break; }

    // Year hint in description (some entries say "founded YYYY" or "(YYYY–...)")
    const yearStr = String(node.year);
    if (desc.includes(yearStr)) score += 2;
    else {
        // tolerate ±2 yrs
        for (const y of [node.year - 1, node.year + 1, node.year - 2, node.year + 2]) {
            if (desc.includes(String(y))) { score += 1; break; }
        }
    }

    // Negative signals
    for (const neg of NEGATIVE_KEYWORDS) if (desc.includes(neg)) { score -= 3; break; }

    return score;
}

interface RecRow {
    node_id: string;
    node_label: string;
    node_year: number;
    node_category: Category;
    selected_qid: string;
    selected_label: string;
    selected_description: string;
    alternatives: string;  // "Q123:Label:desc | Q456:Label:desc"
    confidence: 'auto' | 'review' | 'none';
}

function buildRow(node: NodeData, hits: WikidataSearchHit[]): RecRow {
    if (hits.length === 0) {
        return {
            node_id: node.id,
            node_label: node.label,
            node_year: node.year,
            node_category: node.category,
            selected_qid: '',
            selected_label: '',
            selected_description: '',
            alternatives: '',
            confidence: 'none',
        };
    }
    const scored = hits.map(h => ({ hit: h, score: scoreCandidate(node, h) }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored[0];
    const rest = scored.slice(1, 5).filter(s => s.score > 0);

    // Confidence: auto if top is much better, else review
    const margin = top.score - (scored[1]?.score ?? 0);
    const confidence: RecRow['confidence'] =
        top.score >= 7 && margin >= 2 ? 'auto' :
        top.score >= 3 ? 'review' : 'none';

    return {
        node_id: node.id,
        node_label: node.label,
        node_year: node.year,
        node_category: node.category,
        selected_qid: top.hit.id,
        selected_label: top.hit.label ?? '',
        selected_description: top.hit.description ?? '',
        alternatives: rest.map(s => `${s.hit.id}:${s.hit.label ?? ''}:${s.hit.description ?? ''}`).join(' | '),
        confidence,
    };
}

// ---------------------------------------------------------------------------
// Concurrency control
// ---------------------------------------------------------------------------

async function pMap<T, R>(items: T[], worker: (t: T, i: number) => Promise<R>, concurrency = 3): Promise<R[]> {
    const results = new Array<R>(items.length);
    let idx = 0;
    async function run() {
        while (idx < items.length) {
            const i = idx++;
            results[i] = await worker(items[i], i);
        }
    }
    await Promise.all(Array.from({ length: concurrency }, run));
    return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function tsvEscape(s: string | number): string {
    return String(s ?? '').replace(/[\t\r\n]/g, ' ');
}

async function main() {
    const nodes = INITIAL_DATA.nodes;
    console.log(`[mapToWikidata] resolving Q-ids for ${nodes.length} nodes ...`);

    const rows: RecRow[] = [];
    let done = 0;
    await pMap(nodes, async (node) => {
        try {
            const allHits = new Map<string, WikidataSearchHit>();
            const primary = await wbsearchentities(node.label, 8);
            for (const h of primary) allHits.set(h.id, h);
            // Compute initial row to see if confidence is high enough to skip fallbacks.
            let row = buildRow(node, [...allHits.values()]);
            if (row.confidence !== 'auto') {
                for (const q of fallbackQueries(node.label)) {
                    await new Promise(r => setTimeout(r, 200));
                    try {
                        const more = await wbsearchentities(q, 5);
                        for (const h of more) if (!allHits.has(h.id)) allHits.set(h.id, h);
                    } catch { /* swallow fallback errors */ }
                }
                row = buildRow(node, [...allHits.values()]);
            }
            await new Promise(r => setTimeout(r, 200));
            rows[nodes.indexOf(node)] = row;
        } catch (err) {
            console.warn(`[mapToWikidata] ${node.id} failed:`, err instanceof Error ? err.message : err);
            rows[nodes.indexOf(node)] = {
                node_id: node.id, node_label: node.label, node_year: node.year, node_category: node.category,
                selected_qid: '', selected_label: '', selected_description: '', alternatives: '', confidence: 'none',
            };
        } finally {
            done++;
            if (done % 10 === 0 || done === nodes.length) process.stdout.write(`  ${done}/${nodes.length}\r`);
        }
    }, 3);
    process.stdout.write('\n');

    // Write TSV
    const header = [
        'node_id', 'node_label', 'node_year', 'node_category',
        'selected_qid', 'selected_label', 'selected_description',
        'alternatives', 'confidence',
    ].join('\t');
    const body = rows.map(r => [
        r.node_id, r.node_label, r.node_year, r.node_category,
        r.selected_qid, r.selected_label, r.selected_description,
        r.alternatives, r.confidence,
    ].map(tsvEscape).join('\t')).join('\n');
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(OUT_PATH, header + '\n' + body + '\n', 'utf-8');

    // Summary
    const tally = { auto: 0, review: 0, none: 0 };
    for (const r of rows) tally[r.confidence]++;
    console.log(`[mapToWikidata] wrote ${OUT_PATH}`);
    console.log(`  auto:   ${tally.auto}  (recommendation accepted as-is)`);
    console.log(`  review: ${tally.review} (please inspect 'selected_qid' in TSV)`);
    console.log(`  none:   ${tally.none}   (no plausible candidate; needs manual entry)`);
}

main().catch(err => { console.error('[mapToWikidata] FAILED:', err); process.exit(1); });
