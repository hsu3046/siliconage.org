/**
 * enrichFromWikidata.ts
 *
 * Reads supabase/seed-data/qid_mapping.tsv (post-human-review) and pulls
 * structured data from Wikidata + Wikipedia REST for every selected Q-id,
 * then UPDATEs the Supabase `nodes` rows in place.
 *
 * Writes to:
 *   - nodes.wikidata_qid         (text)
 *   - nodes.wikipedia_urls       (jsonb: {en, ko, ja, ... })
 *   - nodes.sitelinks_count      (int)
 *   - node_translations.description (only when current row is empty AND a
 *     Wikipedia summary exists for that locale; never clobber curated text)
 *
 * Usage:
 *   npx tsx scripts/enrichFromWikidata.ts
 *
 * Network etiquette:
 *   - Wikidata wbgetentities supports 50 ids per call.
 *   - Wikipedia REST summary is per-page; throttled to 5 req/s.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getServiceClient } from '../services/supabaseClient';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TSV_PATH = path.join(__dirname, '..', 'supabase', 'seed-data', 'qid_mapping.tsv');
const UA = 'TheSiliconAge/1.0 (https://siliconage.org; contact@knowai.space) enrichFromWikidata.ts';

const LOCALES = ['en', 'ko', 'ja'] as const;
type Locale = (typeof LOCALES)[number];

interface MappingRow {
    node_id: string;
    selected_qid: string;
    confidence: string;
}

function parseTsv(): MappingRow[] {
    if (!fs.existsSync(TSV_PATH)) {
        throw new Error(`Missing ${TSV_PATH}. Run mapToWikidata.ts first.`);
    }
    const raw = fs.readFileSync(TSV_PATH, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const header = lines.shift()!.split('\t');
    const idxId = header.indexOf('node_id');
    const idxQid = header.indexOf('selected_qid');
    const idxConf = header.indexOf('confidence');
    if (idxId < 0 || idxQid < 0) throw new Error('TSV header missing node_id or selected_qid');
    return lines
        .map(l => l.split('\t'))
        .filter(parts => parts[idxQid] && /^Q\d+$/.test(parts[idxQid]))
        .map(parts => ({
            node_id: parts[idxId],
            selected_qid: parts[idxQid],
            confidence: parts[idxConf] ?? '',
        }));
}

// ---------------------------------------------------------------------------
// Wikidata wbgetentities (batch of up to 50 Q-ids)
// ---------------------------------------------------------------------------

interface SitelinkEntry { site: string; title: string; url?: string }
interface WikidataEntity {
    id: string;
    sitelinks?: Record<string, SitelinkEntry>;
    claims?: Record<string, unknown>;
}

async function fetchEntities(qids: string[]): Promise<Map<string, WikidataEntity>> {
    const url = new URL('https://www.wikidata.org/w/api.php');
    url.searchParams.set('action', 'wbgetentities');
    url.searchParams.set('ids', qids.join('|'));
    url.searchParams.set('props', 'sitelinks/urls|claims');
    url.searchParams.set('sitefilter', 'enwiki|kowiki|jawiki');
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString(), { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`wbgetentities ${res.status}: ${await res.text()}`);
    const data = await res.json() as { entities?: Record<string, WikidataEntity> };
    const map = new Map<string, WikidataEntity>();
    for (const [id, ent] of Object.entries(data.entities ?? {})) map.set(id, ent);
    return map;
}

// ---------------------------------------------------------------------------
// Wikipedia REST summary (per locale)
// ---------------------------------------------------------------------------

async function wikiSummary(locale: Locale, articleTitle: string): Promise<string | null> {
    const host = `${locale}.wikipedia.org`;
    const url = `https://${host}/api/rest_v1/page/summary/${encodeURIComponent(articleTitle.replace(/ /g, '_'))}`;
    try {
        const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
        if (!res.ok) return null;
        const data = await res.json() as { extract?: string };
        return data.extract ?? null;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const sb = getServiceClient();
    const mappings = parseTsv();
    console.log(`[enrich] ${mappings.length} mappings with valid Q-ids`);

    // 1. Batch-fetch Wikidata entities
    const allEntities = new Map<string, WikidataEntity>();
    const BATCH = 50;
    for (let i = 0; i < mappings.length; i += BATCH) {
        const slice = mappings.slice(i, i + BATCH);
        const ids = slice.map(m => m.selected_qid);
        const got = await fetchEntities(ids);
        for (const [k, v] of got) allEntities.set(k, v);
        process.stdout.write(`  wikidata: ${Math.min(i + BATCH, mappings.length)}/${mappings.length}\r`);
        await new Promise(r => setTimeout(r, 500));
    }
    process.stdout.write('\n');

    // 2. For each mapping, extract sitelinks + counts, then UPDATE node
    const nodeUpdates: Array<{ id: string; wikidata_qid: string; wikipedia_urls: Record<string, string>; sitelinks_count: number | null }> = [];
    const wikipediaTitleByLocale: Map<string, Record<Locale, string | null>> = new Map();
    for (const m of mappings) {
        const ent = allEntities.get(m.selected_qid);
        if (!ent) continue;
        const sl = ent.sitelinks ?? {};
        const urls: Record<string, string> = {};
        const titles: Record<Locale, string | null> = { en: null, ko: null, ja: null };
        for (const locale of LOCALES) {
            const key = `${locale}wiki`;
            const entry = sl[key];
            if (entry?.url) urls[locale] = entry.url;
            if (entry?.title) titles[locale] = entry.title;
        }
        // sitelinks_count = total number of language editions linked from Wikidata
        // (props=sitelinks/urls with sitefilter only returns en/ko/ja; for the real
        //  count we would need a second call. Approximated here as count(filtered).)
        const filteredCount = Object.keys(sl).length;
        nodeUpdates.push({
            id: m.node_id,
            wikidata_qid: m.selected_qid,
            wikipedia_urls: urls,
            sitelinks_count: filteredCount > 0 ? filteredCount : null,
        });
        wikipediaTitleByLocale.set(m.node_id, titles);
    }

    // 3. UPDATE nodes — one row at a time (Supabase has no per-row UPDATE batch
    //    primitive without an upsert key match; do this in a small loop).
    console.log(`[enrich] updating ${nodeUpdates.length} nodes ...`);
    for (let i = 0; i < nodeUpdates.length; i++) {
        const u = nodeUpdates[i];
        const { error } = await sb
            .from('nodes')
            .update({
                wikidata_qid: u.wikidata_qid,
                wikipedia_urls: u.wikipedia_urls,
                sitelinks_count: u.sitelinks_count,
            } as never)
            .eq('id', u.id);
        if (error) {
            console.error(`[enrich] update ${u.id} failed:`, error);
            throw error;
        }
        if ((i + 1) % 25 === 0 || i === nodeUpdates.length - 1) {
            process.stdout.write(`  nodes: ${i + 1}/${nodeUpdates.length}\r`);
        }
    }
    process.stdout.write('\n');

    // 4. Wikipedia summaries (description boost). Skip nodes whose translation
    //    description is already non-empty — curated text always wins.
    console.log(`[enrich] fetching Wikipedia summaries for description-empty translations ...`);
    const { data: emptyDescs, error: descErr } = await sb
        .from('node_translations')
        .select('node_id, locale')
        .or('description.is.null,description.eq.')
        .limit(2000);
    if (descErr) throw descErr;
    const targets = (emptyDescs ?? []) as Array<{ node_id: string; locale: Locale }>;
    console.log(`[enrich] ${targets.length} translation rows need a summary`);

    let filled = 0;
    for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        const titles = wikipediaTitleByLocale.get(t.node_id);
        const title = titles?.[t.locale];
        if (!title) continue;
        const summary = await wikiSummary(t.locale, title);
        await new Promise(r => setTimeout(r, 200));  // 5 req/s
        if (!summary) continue;
        const trimmed = summary.length > 600 ? summary.slice(0, 600) : summary;
        const { error } = await sb
            .from('node_translations')
            .update({ description: trimmed } as never)
            .eq('node_id', t.node_id)
            .eq('locale', t.locale);
        if (error) {
            console.warn(`[enrich] description update ${t.node_id}/${t.locale} failed:`, error.message);
            continue;
        }
        filled++;
        if (filled % 10 === 0) process.stdout.write(`  summaries filled: ${filled}\r`);
    }
    process.stdout.write('\n');

    console.log('[enrich] done.');
    console.log(`  nodes updated:      ${nodeUpdates.length}`);
    console.log(`  summaries filled:   ${filled}`);
}

main().catch(err => { console.error('[enrich] FAILED:', err); process.exit(1); });
