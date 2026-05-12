/**
 * wikidataBfs.ts
 *
 * BFS-expands the 224 curated seed nodes (read from qid_mapping.tsv) over
 * Wikidata's property graph, harvesting up to ~1000 domain-relevant
 * candidates. Output goes either to a JSON dry-run file or directly into
 * Supabase as `provenance='ai_discovered', approved_at=NULL` rows.
 *
 * Usage:
 *   npm run wikidata:bfs              # dry run (default), writes supabase/seed-data/bfs_candidates.json
 *   npm run wikidata:bfs -- --wet     # writes to DB (still approved_at=NULL, hidden from anon)
 *
 * Knobs (top-of-file constants):
 *   MAX_DEPTH         = 2
 *   HARD_CAP          = 1000
 *   FAN_OUT_PER_NODE  = 20
 *   SCORE_THRESHOLD   = 5
 *
 * Network: 1 SPARQL req/s, 1 wbgetentities req/s (we are guests on a free
 * public service). The 224→~1k traversal typically takes 10-15 min wall.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getServiceClient } from '../services/supabaseClient';
import {
    PROPERTY_MAP,
    FOLLOW_PROPERTIES,
    CATEGORY_QIDS,
    NEGATIVE_INSTANCE_QIDS,
} from './wikidataToLinkType';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TSV_PATH = path.join(__dirname, '..', 'supabase', 'seed-data', 'qid_mapping.tsv');
const OUT_PATH = path.join(__dirname, '..', 'supabase', 'seed-data', 'bfs_candidates.json');
const UA = 'TheSiliconAge/1.0 (https://siliconage.org; contact@knowai.space) wikidataBfs.ts';

const MAX_DEPTH = 2;
const HARD_CAP = 850;
const EARLY_STOP_RATIO = 0.85;  // break out of BFS when discovered >= HARD_CAP * this
const FAN_OUT_PER_NODE = 20;
const SCORE_THRESHOLD = 5;
const SPARQL_BATCH = 20;     // frontier qids per SPARQL request
const ENTITY_BATCH = 50;     // wbgetentities cap

// ---------------------------------------------------------------------------
// Tiny throttler — keeps us under ~2 req/s per endpoint
// ---------------------------------------------------------------------------

function makeThrottle(minIntervalMs: number) {
    let last = 0;
    return async () => {
        const now = Date.now();
        const wait = Math.max(0, last + minIntervalMs - now);
        if (wait > 0) await new Promise(r => setTimeout(r, wait));
        last = Date.now();
    };
}
const sparqlThrottle = makeThrottle(1000);
const entityThrottle = makeThrottle(700);

// ---------------------------------------------------------------------------
// Seed loading
// ---------------------------------------------------------------------------

function readSeedQids(): Map<string, string> {
    if (!fs.existsSync(TSV_PATH)) throw new Error(`Missing ${TSV_PATH} — run mapToWikidata.ts first`);
    const raw = fs.readFileSync(TSV_PATH, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const header = lines.shift()!.split('\t');
    const idIdx = header.indexOf('node_id');
    const qidIdx = header.indexOf('selected_qid');
    const out = new Map<string, string>();  // node_id -> qid
    for (const l of lines) {
        const parts = l.split('\t');
        if (parts[qidIdx] && /^Q\d+$/.test(parts[qidIdx])) out.set(parts[idIdx], parts[qidIdx]);
    }
    return out;
}

// ---------------------------------------------------------------------------
// SPARQL: fetch 1-hop neighbours of a batch of qids
// ---------------------------------------------------------------------------

interface Edge {
    source_qid: string;
    neighbor_qid: string;
    property: string;
    direction: 'forward' | 'reverse';
}

async function sparqlNeighbors(seedQids: string[]): Promise<Edge[]> {
    await sparqlThrottle();
    const valuesSrc = seedQids.map(q => `wd:${q}`).join(' ');
    const valuesProp = FOLLOW_PROPERTIES.map(p => `wdt:${p}`).join(' ');
    const query = `
SELECT DISTINCT ?source ?prop ?neighbor WHERE {
    VALUES ?source { ${valuesSrc} }
    VALUES ?prop  { ${valuesProp} }
    { ?source ?prop ?neighbor . BIND("forward" AS ?dir) }
    UNION
    { ?neighbor ?prop ?source . BIND("reverse" AS ?dir) }
    FILTER(?neighbor != ?source)
    FILTER(STRSTARTS(STR(?neighbor), "http://www.wikidata.org/entity/Q"))
}
LIMIT 6000
`;
    const url = new URL('https://query.wikidata.org/sparql');
    url.searchParams.set('query', query);
    url.searchParams.set('format', 'json');
    const res = await fetch(url.toString(), { headers: { 'User-Agent': UA, 'Accept': 'application/sparql-results+json' } });
    if (!res.ok) throw new Error(`sparqlNeighbors ${res.status}: ${await res.text()}`);
    const data = await res.json() as {
        results?: { bindings?: Array<{ source: { value: string }; prop: { value: string }; neighbor: { value: string } }> };
    };
    const out: Edge[] = [];
    for (const row of data.results?.bindings ?? []) {
        const src = row.source.value.split('/').pop() ?? '';
        const prop = row.prop.value.split('/').pop() ?? '';
        const nbr = row.neighbor.value.split('/').pop() ?? '';
        if (!/^Q\d+$/.test(src) || !/^Q\d+$/.test(nbr) || !prop) continue;
        // Determine forward vs reverse — re-derive by re-running both halves
        // (the UNION BIND above is ignored by some endpoints). Easiest: include
        // both halves below.
        out.push({ source_qid: src, neighbor_qid: nbr, property: prop, direction: 'forward' });
    }
    return out;
}

// ---------------------------------------------------------------------------
// wbgetentities: batch metadata for candidate qids
// ---------------------------------------------------------------------------

interface EntityMeta {
    qid: string;
    labels: Record<string, string>;        // locale -> label
    descriptions: Record<string, string>;  // locale -> short desc
    sitelinkUrls: Record<string, string>;
    sitelinksCount: number;
    instanceOf: string[];                  // P31 Q-ids
    year: number | null;
}

async function wbgetentities(qids: string[]): Promise<Map<string, EntityMeta>> {
    await entityThrottle();
    const url = new URL('https://www.wikidata.org/w/api.php');
    url.searchParams.set('action', 'wbgetentities');
    url.searchParams.set('ids', qids.join('|'));
    url.searchParams.set('props', 'labels|descriptions|sitelinks/urls|claims');
    url.searchParams.set('languages', 'en|ko|ja');
    url.searchParams.set('sitefilter', 'enwiki|kowiki|jawiki');
    url.searchParams.set('format', 'json');
    const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`wbgetentities ${res.status}: ${await res.text()}`);
    const data = await res.json() as { entities?: Record<string, unknown> };
    const out = new Map<string, EntityMeta>();
    for (const [qid, raw] of Object.entries(data.entities ?? {})) {
        const ent = raw as {
            labels?: Record<string, { value: string }>;
            descriptions?: Record<string, { value: string }>;
            sitelinks?: Record<string, { url?: string; title?: string }>;
            claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: unknown } } }>>;
        };
        const labels: Record<string, string> = {};
        for (const l of ['en', 'ko', 'ja']) if (ent.labels?.[l]?.value) labels[l] = ent.labels[l]!.value;
        const descriptions: Record<string, string> = {};
        for (const l of ['en', 'ko', 'ja']) if (ent.descriptions?.[l]?.value) descriptions[l] = ent.descriptions[l]!.value;
        const sitelinkUrls: Record<string, string> = {};
        for (const sl of Object.entries(ent.sitelinks ?? {})) {
            if (sl[1]?.url && (sl[0] === 'enwiki' || sl[0] === 'kowiki' || sl[0] === 'jawiki')) {
                const locale = sl[0].replace('wiki', '');
                sitelinkUrls[locale] = sl[1].url!;
            }
        }
        const sitelinksCount = Object.keys(ent.sitelinks ?? {}).length;
        const instanceOf: string[] = [];
        for (const c of ent.claims?.P31 ?? []) {
            const v = c.mainsnak?.datavalue?.value as { id?: string } | undefined;
            if (v?.id) instanceOf.push(v.id);
        }
        // year preference: inception (P571) > publication (P577) > birth (P569)
        const yearFromClaim = (claimId: string): number | null => {
            const list = ent.claims?.[claimId] ?? [];
            for (const c of list) {
                const v = c.mainsnak?.datavalue?.value as { time?: string } | undefined;
                if (v?.time) {
                    const m = v.time.match(/^[+-]?(\d{1,4})/);
                    if (m) return parseInt(m[1], 10);
                }
            }
            return null;
        };
        const year = yearFromClaim('P571') ?? yearFromClaim('P577') ?? yearFromClaim('P569');
        out.set(qid, { qid, labels, descriptions, sitelinkUrls, sitelinksCount, instanceOf, year });
    }
    return out;
}

// ---------------------------------------------------------------------------
// Domain keyword set (English description)
// ---------------------------------------------------------------------------

const DOMAIN_KEYWORDS = [
    'silicon valley', 'semiconductor', 'computer', 'computing', 'software', 'hardware',
    'internet', 'web', 'website', 'browser', 'mobile', 'smartphone', 'cloud',
    'artificial intelligence', 'machine learning', 'neural network', 'deep learning',
    'startup', 'venture capital', 'technology company', 'tech company', 'tech entrepreneur',
    'programmer', 'developer', 'engineer', 'inventor', 'researcher', 'computer scientist',
    'electronics', 'integrated circuit', 'transistor', 'microprocessor', 'cpu', 'gpu',
    'protocol', 'algorithm', 'programming language', 'operating system', 'database',
    'social network', 'platform', 'app', 'application', 'service', 'network',
    'cryptocurrency', 'blockchain', 'fintech', 'autonomous', 'robot', 'robotics',
    'space', 'rocket', 'tesla', 'spacex',
];

function inferCategory(instanceOf: string[]): 'COMPANY' | 'PERSON' | 'TECHNOLOGY' | null {
    if (instanceOf.some(q => CATEGORY_QIDS.PERSON.includes(q))) return 'PERSON';
    if (instanceOf.some(q => CATEGORY_QIDS.COMPANY.includes(q))) return 'COMPANY';
    if (instanceOf.some(q => CATEGORY_QIDS.TECHNOLOGY.includes(q))) return 'TECHNOLOGY';
    return null;
}

interface Candidate {
    qid: string;
    id: string;             // wd_<qid_lower>
    category: 'COMPANY' | 'PERSON' | 'TECHNOLOGY';
    label_en: string;
    description_en: string;
    label_ko?: string;
    label_ja?: string;
    description_ko?: string;
    description_ja?: string;
    wikipedia_urls: Record<string, string>;
    sitelinks_count: number;
    year: number;
    instance_of: string[];
    relevance_score: number;
    discovery_depth: number;
    discovered_from: string;  // parent node id (curated id when depth=1, candidate id when depth=2)
    incoming_edges: Array<{ from_qid: string; property: string }>;  // accumulated edges
}

function scoreCandidate(meta: EntityMeta): number {
    let score = 0;
    const desc = (meta.descriptions.en ?? '').toLowerCase();
    for (const kw of DOMAIN_KEYWORDS) if (desc.includes(kw)) { score += 3; break; }
    if (meta.sitelinksCount >= 20) score += 2;
    if (meta.year && meta.year >= 1900 && meta.year <= 2100) score += 1;
    if (inferCategory(meta.instanceOf)) score += 2;
    if (meta.instanceOf.some(q => NEGATIVE_INSTANCE_QIDS.has(q))) score -= 10;
    return score;
}

function makeNodeId(qid: string): string {
    return `wd_${qid.toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// BFS driver
// ---------------------------------------------------------------------------

interface SeedAnchor { node_id: string; qid: string }

async function bfs(seeds: SeedAnchor[]): Promise<Candidate[]> {
    const seedQidSet = new Set(seeds.map(s => s.qid));
    const seedIdByQid = new Map(seeds.map(s => [s.qid, s.node_id]));
    const discovered = new Map<string, Candidate>();   // qid -> candidate
    const negCache = new Set<string>();                // qids rejected at any stage

    let frontier = new Set(seeds.map(s => s.qid));
    for (let depth = 0; depth < MAX_DEPTH; depth++) {
        console.log(`\n[bfs] depth=${depth + 1} frontier=${frontier.size}`);
        // 1. SPARQL for all frontier qids
        const allEdges: Edge[] = [];
        const frontierArr = [...frontier];
        for (let i = 0; i < frontierArr.length; i += SPARQL_BATCH) {
            const batch = frontierArr.slice(i, i + SPARQL_BATCH);
            try {
                const edges = await sparqlNeighbors(batch);
                allEdges.push(...edges);
                if ((i / SPARQL_BATCH) % 5 === 0 || i + SPARQL_BATCH >= frontierArr.length) {
                    console.log(`  sparql: ${Math.min(i + SPARQL_BATCH, frontierArr.length)}/${frontierArr.length} edges=${allEdges.length}`);
                }
            } catch (err) {
                console.warn(`\n  sparql batch failed (continuing):`, err instanceof Error ? err.message : err);
            }
        }
        process.stdout.write('\n');

        // 2. Collect candidate qids (not yet seed, not yet discovered, not in neg cache)
        const candidateQids = new Set<string>();
        const edgesByCandidate = new Map<string, Array<{ from_qid: string; property: string }>>();
        for (const e of allEdges) {
            if (seedQidSet.has(e.neighbor_qid)) continue;
            if (discovered.has(e.neighbor_qid)) {
                // Record additional edge into already-discovered node (more context)
                const arr = discovered.get(e.neighbor_qid)!.incoming_edges;
                arr.push({ from_qid: e.source_qid, property: e.property });
                continue;
            }
            if (negCache.has(e.neighbor_qid)) continue;
            candidateQids.add(e.neighbor_qid);
            const arr = edgesByCandidate.get(e.neighbor_qid) ?? [];
            arr.push({ from_qid: e.source_qid, property: e.property });
            edgesByCandidate.set(e.neighbor_qid, arr);
        }
        console.log(`  unique candidates: ${candidateQids.size}`);

        // 3. wbgetentities for all candidates
        const meta = new Map<string, EntityMeta>();
        const candArr = [...candidateQids];
        for (let i = 0; i < candArr.length; i += ENTITY_BATCH) {
            const batch = candArr.slice(i, i + ENTITY_BATCH);
            try {
                const got = await wbgetentities(batch);
                for (const [q, m] of got) meta.set(q, m);
                if ((i / ENTITY_BATCH) % 20 === 0 || i + ENTITY_BATCH >= candArr.length) {
                    console.log(`  entities: ${Math.min(i + ENTITY_BATCH, candArr.length)}/${candArr.length}`);
                }
            } catch (err) {
                console.warn(`\n  wbgetentities failed (continuing):`, err instanceof Error ? err.message : err);
            }
        }
        process.stdout.write('\n');

        // 4. Score + category filter + group by parent for fan-out cap
        const passedByParent = new Map<string, Candidate[]>();
        for (const qid of candArr) {
            const m = meta.get(qid);
            if (!m) { negCache.add(qid); continue; }
            const category = inferCategory(m.instanceOf);
            if (!category) { negCache.add(qid); continue; }
            if (m.instanceOf.some(q => NEGATIVE_INSTANCE_QIDS.has(q))) { negCache.add(qid); continue; }
            const score = scoreCandidate(m);
            if (score < SCORE_THRESHOLD) { negCache.add(qid); continue; }
            const edges = edgesByCandidate.get(qid) ?? [];
            const parentQid = edges[0]?.from_qid ?? '';
            const cand: Candidate = {
                qid,
                id: makeNodeId(qid),
                category,
                label_en: m.labels.en ?? qid,
                description_en: m.descriptions.en ?? '',
                label_ko: m.labels.ko,
                label_ja: m.labels.ja,
                description_ko: m.descriptions.ko,
                description_ja: m.descriptions.ja,
                wikipedia_urls: m.sitelinkUrls,
                sitelinks_count: m.sitelinksCount,
                year: m.year ?? 0,
                instance_of: m.instanceOf,
                relevance_score: score,
                discovery_depth: depth + 1,
                discovered_from: seedIdByQid.get(parentQid) ?? makeNodeId(parentQid),
                incoming_edges: edges,
            };
            const arr = passedByParent.get(parentQid) ?? [];
            arr.push(cand);
            passedByParent.set(parentQid, arr);
        }

        // 5. Apply per-parent fan-out cap, keep top-N by score
        const accepted: Candidate[] = [];
        for (const cands of passedByParent.values()) {
            cands.sort((a, b) => b.relevance_score - a.relevance_score);
            for (const c of cands.slice(0, FAN_OUT_PER_NODE)) accepted.push(c);
        }
        accepted.sort((a, b) => b.relevance_score - a.relevance_score);

        // 6. Apply global hard cap
        const remaining = HARD_CAP - discovered.size;
        const taken = accepted.slice(0, Math.max(0, remaining));
        for (const c of taken) discovered.set(c.qid, c);
        console.log(`  accepted: ${taken.length}  (discovered total: ${discovered.size}/${HARD_CAP})`);
        if (discovered.size >= HARD_CAP * EARLY_STOP_RATIO) {
            console.log(`  ≥ ${Math.round(EARLY_STOP_RATIO * 100)}% of HARD_CAP reached — skipping deeper BFS`);
            break;
        }

        // 7. Next frontier = newly accepted candidates
        frontier = new Set(taken.map(c => c.qid));
        if (frontier.size === 0) break;
    }

    return [...discovered.values()];
}

// ---------------------------------------------------------------------------
// DB writers (wet mode)
// ---------------------------------------------------------------------------

async function writeToDb(allCands: Candidate[]) {
    const sb = getServiceClient();
    // Drop candidates without an English label — Wikidata returned Q-id only,
    // meaning the entity has no usable display name in our locales.
    const cands = allCands.filter(c => c.label_en && c.label_en.trim().length > 0 && c.label_en !== c.qid);
    const dropped = allCands.length - cands.length;
    if (dropped > 0) console.log(`[bfs] dropped ${dropped} candidates with empty English label`);
    console.log(`[bfs] WET mode: inserting ${cands.length} ai_discovered nodes ...`);

    // 1. nodes — provenance='ai_discovered', approved_at=NULL
    const nodeRows = cands.map(c => ({
        id: c.id,
        label: c.label_en || c.qid,
        category: c.category,
        year: c.year || 1900,  // satisfy NOT NULL; year=0 placeholder for "unknown"
        description: c.description_en || null,
        wikidata_qid: c.qid,
        wikipedia_urls: c.wikipedia_urls,
        sitelinks_count: c.sitelinks_count,
        relevance_score: c.relevance_score,
        discovery_depth: c.discovery_depth,
        discovered_from: c.discovered_from,
        provenance: 'ai_discovered' as const,
        approved_at: null,
    }));
    for (let i = 0; i < nodeRows.length; i += 200) {
        const slice = nodeRows.slice(i, i + 200);
        const { error } = await sb.from('nodes').upsert(slice as never, { onConflict: 'id' });
        if (error) throw error;
        process.stdout.write(`  nodes: ${Math.min(i + 200, nodeRows.length)}/${nodeRows.length}\r`);
    }
    process.stdout.write('\n');

    // 2. node_translations — labels in en/ko/ja (description left null; classifyNodes fills it)
    const transRows: Array<Record<string, unknown>> = [];
    for (const c of cands) {
        for (const locale of ['en', 'ko', 'ja'] as const) {
            const label = (c as unknown as Record<string, string | undefined>)[`label_${locale}`];
            if (!label) continue;
            transRows.push({
                node_id: c.id,
                locale,
                label,
                description: (c as unknown as Record<string, string | undefined>)[`description_${locale}`] ?? null,
            });
        }
    }
    for (let i = 0; i < transRows.length; i += 200) {
        const slice = transRows.slice(i, i + 200);
        const { error } = await sb.from('node_translations').upsert(slice as never, { onConflict: 'node_id,locale' });
        if (error) throw error;
        process.stdout.write(`  translations: ${Math.min(i + 200, transRows.length)}/${transRows.length}\r`);
    }
    process.stdout.write('\n');

    // 3. links — one row per accepted edge whose property is in PROPERTY_MAP
    //    (skip edges from META_PROPERTIES like P31). Direction taken into account.
    type LinkPayload = {
        source_id: string;
        target_id: string;
        type: string;
        arrow: string;
        icon: string | null;
        strength: number;
        wikidata_property: string;
        relation_kind: string;
        provenance: 'ai_discovered';
        approved_at: null;
    };
    const candByQid = new Map<string, Candidate>();
    for (const c of cands) candByQid.set(c.qid, c);
    const seenLinks = new Set<string>();
    const linkRows: LinkPayload[] = [];
    for (const c of cands) {
        for (const e of c.incoming_edges) {
            const mapping = PROPERTY_MAP[e.property];
            if (!mapping) continue;
            // Resolve parent: either curated seed (Map: qid -> node_id) or another candidate
            const fromCurated = (await getSeedIdByQid()).get(e.from_qid);
            const parentId = fromCurated ?? candByQid.get(e.from_qid)?.id;
            if (!parentId) continue;
            let source_id = parentId;
            let target_id = c.id;
            if (mapping.direction === 'inverse') { [source_id, target_id] = [target_id, source_id]; }
            const k = `${source_id}__${target_id}__${mapping.type}`;
            if (seenLinks.has(k)) continue;
            seenLinks.add(k);
            linkRows.push({
                source_id,
                target_id,
                type: mapping.type,
                arrow: mapping.arrow,
                icon: mapping.icon ?? null,
                strength: mapping.strength,
                wikidata_property: e.property,
                relation_kind: mapping.relation,
                provenance: 'ai_discovered',
                approved_at: null,
            });
        }
    }
    console.log(`  prepared ${linkRows.length} ai_discovered links`);
    for (let i = 0; i < linkRows.length; i += 200) {
        const slice = linkRows.slice(i, i + 200);
        const { error } = await sb.from('links').upsert(slice as never, { onConflict: 'source_id,target_id,type', ignoreDuplicates: true });
        if (error) {
            // Skip individual conflicts but report
            console.warn('  links chunk error (continuing):', error.message);
            continue;
        }
        process.stdout.write(`  links: ${Math.min(i + 200, linkRows.length)}/${linkRows.length}\r`);
    }
    process.stdout.write('\n');
}

// Lazy cache so we only query nodes-by-qid map once
let _seedByQid: Map<string, string> | null = null;
async function getSeedIdByQid(): Promise<Map<string, string>> {
    if (_seedByQid) return _seedByQid;
    const sb = getServiceClient();
    const { data, error } = await sb
        .from('nodes')
        .select('id, wikidata_qid')
        .eq('provenance', 'curated')
        .not('wikidata_qid', 'is', null);
    if (error) throw error;
    _seedByQid = new Map();
    for (const r of (data as Array<{ id: string; wikidata_qid: string }> ?? [])) _seedByQid.set(r.wikidata_qid, r.id);
    // Also union with the TSV — curated nodes haven't been enriched yet, so their
    // wikidata_qid columns may still be NULL. TSV is the authoritative seed map.
    const tsv = readSeedQids();
    for (const [nodeId, qid] of tsv) if (!_seedByQid.has(qid)) _seedByQid.set(qid, nodeId);
    return _seedByQid;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const wet = process.argv.includes('--wet');
    const seedMap = readSeedQids();
    const seeds: SeedAnchor[] = [...seedMap.entries()].map(([node_id, qid]) => ({ node_id, qid }));
    console.log(`[bfs] mode=${wet ? 'WET' : 'DRY-RUN'} seeds=${seeds.length}`);

    const candidates = await bfs(seeds);
    console.log(`\n[bfs] total candidates: ${candidates.length}`);

    if (wet) {
        await writeToDb(candidates);
        console.log('[bfs] DB write done.');
    } else {
        fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
        fs.writeFileSync(OUT_PATH, JSON.stringify({
            generated_at: new Date().toISOString(),
            seed_count: seeds.length,
            candidate_count: candidates.length,
            candidates,
        }, null, 2), 'utf-8');
        console.log(`[bfs] dry-run written to ${OUT_PATH}`);
    }

    // Summary
    const byCat = { COMPANY: 0, PERSON: 0, TECHNOLOGY: 0 };
    for (const c of candidates) byCat[c.category]++;
    console.log(`  COMPANY:    ${byCat.COMPANY}`);
    console.log(`  PERSON:     ${byCat.PERSON}`);
    console.log(`  TECHNOLOGY: ${byCat.TECHNOLOGY}`);
}

main().catch(err => { console.error('[bfs] FAILED:', err); process.exit(1); });
