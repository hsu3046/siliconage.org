/**
 * seedSupabase.ts
 *
 * One-shot seed: constants.ts INITIAL_DATA + locales/{en,ko,ja}/*.json → Supabase tables.
 * Idempotent — re-running upserts on (id) or (source_id, target_id, type).
 *
 * Usage:
 *   npm run seed
 *   # or
 *   npx tsx scripts/seedSupabase.ts
 *
 * Requires env vars:
 *   VITE_SUPABASE_URL                (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY        (NEVER commit; .env.local only)
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_DATA } from '../constants';
import type { NodeData, LinkData, EventData } from '../types';
import { getServiceClient } from '../services/supabaseClient';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const LOCALES = ['en', 'ko', 'ja'] as const;
type Locale = (typeof LOCALES)[number];

interface NodesJson { [id: string]: { label: string; description: string; primary_role?: string; secondary_role?: string } }
interface LinksJson { [key: string]: { story: string } }  // key = `${src}__${tgt}`
interface EventsJson { [id: string]: { story: string } }

const readJson = <T>(p: string): T => {
    if (!fs.existsSync(p)) return {} as T;
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
};

const localeFile = (locale: Locale, name: 'nodes' | 'links' | 'events') =>
    path.join(ROOT, 'locales', locale, `${name}.json`);

// ---------------------------------------------------------------------------
// Row builders
// ---------------------------------------------------------------------------

const NOW = new Date().toISOString();

function nodeRow(n: NodeData) {
    return {
        id: n.id,
        label: n.label,
        category: n.category,
        year: n.year,
        description: n.description ?? null,
        impact_role: n.impactRole ?? null,
        tech_l1: n.techCategoryL1 ?? null,
        tech_l2: n.techCategoryL2 ?? null,
        company_categories: n.companyCategories ?? null,
        primary_role: n.primaryRole ?? null,
        secondary_role: n.secondaryRole ?? null,
        birth_year: n.birthYear ?? null,
        death_year: n.deathYear ?? null,
        end_year: n.endYear ?? null,
        market_cap: n.marketCap ?? null,
        external_links: n.externalLinks ?? null,
        keywords: n.keywords ?? null,
        provenance: 'curated' as const,
        approved_at: NOW,
    };
}

function linkRow(l: LinkData) {
    const src = typeof l.source === 'string' ? l.source : l.source.id;
    const tgt = typeof l.target === 'string' ? l.target : l.target.id;
    return {
        source_id: src,
        target_id: tgt,
        type: l.type,
        arrow: l.arrow,
        icon: l.icon ?? null,
        strength: l.strength,
        start_year: l.startYear ?? null,
        end_year: l.endYear ?? null,
        provenance: 'curated' as const,
        approved_at: NOW,
    };
}

function eventRow(e: EventData) {
    return {
        id: e.id,
        year: e.year,
        end_year: e.endYear ?? null,
        related_nodes: e.relatedNodes ?? null,
    };
}

// ---------------------------------------------------------------------------
// Chunked upsert helper
// ---------------------------------------------------------------------------

async function chunkedUpsert(
    sb: ReturnType<typeof getServiceClient>,
    table: string,
    rows: Array<Record<string, unknown>>,
    onConflict: string,
    chunkSize = 200,
) {
    for (let i = 0; i < rows.length; i += chunkSize) {
        const slice = rows.slice(i, i + chunkSize);
        // Without generated DB types, supabase-js infers `never` for row payloads — cast is required.
        const { error } = await sb.from(table).upsert(slice as never, { onConflict });
        if (error) {
            console.error(`[seed] ${table} chunk ${i}-${i + slice.length} failed:`, error);
            throw error;
        }
        process.stdout.write(`  ${table}: ${Math.min(i + chunkSize, rows.length)}/${rows.length}\r`);
    }
    process.stdout.write('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const sb = getServiceClient();
    const { nodes, links, events = [] } = INITIAL_DATA;

    console.log(`[seed] constants.ts: ${nodes.length} nodes, ${links.length} links, ${events.length} events`);

    // 1. Nodes ----------------------------------------------------------------
    console.log('[seed] upserting nodes ...');
    await chunkedUpsert(sb, 'nodes', nodes.map(nodeRow) as Array<Record<string, unknown>>, 'id');

    // 2. Events ---------------------------------------------------------------
    if (events.length > 0) {
        console.log('[seed] upserting events ...');
        await chunkedUpsert(sb, 'events', events.map(eventRow) as Array<Record<string, unknown>>, 'id');
    }

    // 3. Links ----------------------------------------------------------------
    // links has no natural surrogate id in constants.ts; uniqueness = (source, target, type).
    // First nuke curated rows to avoid duplicates from legacy seeds, then bulk insert.
    console.log('[seed] resetting curated links ...');
    {
        const { error } = await sb.from('links').delete().eq('provenance', 'curated');
        if (error) throw error;
    }
    console.log('[seed] inserting links ...');
    // Dedupe (source_id, target_id, type) — constants.ts has known duplicates that the
    // DB unique constraint rejects. Last occurrence wins; first occurrence is reported.
    const rawRows = links.map(linkRow);
    const dedupedRows: typeof rawRows = [];
    const seen = new Map<string, number>();  // key -> index in dedupedRows
    const duplicates: string[] = [];
    for (const row of rawRows) {
        const k = `${row.source_id}__${row.target_id}__${row.type}`;
        if (seen.has(k)) {
            duplicates.push(k);
            dedupedRows[seen.get(k)!] = row;  // overwrite with later occurrence
        } else {
            seen.set(k, dedupedRows.length);
            dedupedRows.push(row);
        }
    }
    if (duplicates.length > 0) {
        console.warn(`[seed] WARN: ${duplicates.length} duplicate link triples in constants.ts (kept last occurrence):`);
        for (const d of duplicates.slice(0, 10)) console.warn(`  - ${d}`);
        if (duplicates.length > 10) console.warn(`  ... +${duplicates.length - 10} more`);
    }
    for (let i = 0; i < dedupedRows.length; i += 200) {
        const slice = dedupedRows.slice(i, i + 200);
        const { error } = await sb.from('links').insert(slice as never);
        if (error) {
            console.error(`[seed] links chunk ${i} failed:`, error);
            throw error;
        }
        process.stdout.write(`  links: ${Math.min(i + 200, dedupedRows.length)}/${dedupedRows.length}\r`);
    }
    process.stdout.write('\n');

    // 4. Translations ---------------------------------------------------------
    // Load locale JSONs once, then build per-locale rows.
    const localeData: Record<Locale, { nodes: NodesJson; links: LinksJson; events: EventsJson }> = {
        en: {
            nodes: readJson<NodesJson>(localeFile('en', 'nodes')),
            links: readJson<LinksJson>(localeFile('en', 'links')),
            events: readJson<EventsJson>(localeFile('en', 'events')),
        },
        ko: {
            nodes: readJson<NodesJson>(localeFile('ko', 'nodes')),
            links: readJson<LinksJson>(localeFile('ko', 'links')),
            events: readJson<EventsJson>(localeFile('ko', 'events')),
        },
        ja: {
            nodes: readJson<NodesJson>(localeFile('ja', 'nodes')),
            links: readJson<LinksJson>(localeFile('ja', 'links')),
            events: readJson<EventsJson>(localeFile('ja', 'events')),
        },
    };

    // 4a. node_translations: 3 locale × N nodes. English is sourced from constants.ts directly
    //     (en/nodes.json is a mirror; canonical is in NodeData.label/description).
    console.log('[seed] upserting node_translations ...');
    const nodeTransRows: Array<Record<string, unknown>> = [];
    for (const n of nodes) {
        for (const locale of LOCALES) {
            const j = localeData[locale].nodes[n.id];
            const label = locale === 'en' ? n.label : (j?.label ?? n.label);
            const description = locale === 'en' ? (n.description ?? '') : (j?.description ?? n.description ?? '');
            nodeTransRows.push({
                node_id: n.id,
                locale,
                label,
                description,
                primary_role: locale === 'en' ? (n.primaryRole ?? null) : (j?.primary_role ?? n.primaryRole ?? null),
                secondary_role: locale === 'en' ? (n.secondaryRole ?? null) : (j?.secondary_role ?? n.secondaryRole ?? null),
            });
        }
    }
    await chunkedUpsert(sb, 'node_translations', nodeTransRows, 'node_id,locale');

    // 4b. link_translations: need DB ids. Fetch the just-inserted links and build a lookup.
    console.log('[seed] fetching link ids for translation join ...');
    const linkIdMap = new Map<string, number>();  // key = `${src}__${tgt}__${type}`
    {
        let from = 0;
        const PAGE = 1000;
        while (true) {
            const { data, error } = await sb
                .from('links')
                .select('id, source_id, target_id, type')
                .eq('provenance', 'curated')
                .range(from, from + PAGE - 1);
            if (error) throw error;
            if (!data || data.length === 0) break;
            for (const row of data) {
                linkIdMap.set(`${row.source_id}__${row.target_id}__${row.type}`, row.id as number);
            }
            if (data.length < PAGE) break;
            from += PAGE;
        }
    }
    console.log(`[seed] indexed ${linkIdMap.size} links`);

    console.log('[seed] upserting link_translations ...');
    // Dedupe by (link_id, locale). When two LinkData entries map to the same DB link_id
    // (because of the source/target/type unique constraint), later story wins.
    const linkTransMap = new Map<string, Record<string, unknown>>();
    for (const l of links) {
        const src = typeof l.source === 'string' ? l.source : l.source.id;
        const tgt = typeof l.target === 'string' ? l.target : l.target.id;
        const dbId = linkIdMap.get(`${src}__${tgt}__${l.type}`);
        if (!dbId) continue;
        for (const locale of LOCALES) {
            const j = localeData[locale].links[`${src}__${tgt}`];
            const story = locale === 'en' ? (l.story ?? j?.story ?? null) : (j?.story ?? l.story ?? null);
            if (!story) continue;
            linkTransMap.set(`${dbId}__${locale}`, { link_id: dbId, locale, story });
        }
    }
    await chunkedUpsert(sb, 'link_translations', [...linkTransMap.values()], 'link_id,locale');

    // 4c. event_translations
    if (events.length > 0) {
        console.log('[seed] upserting event_translations ...');
        const evtTransRows: Array<Record<string, unknown>> = [];
        for (const e of events) {
            for (const locale of LOCALES) {
                const j = localeData[locale].events[e.id];
                const story = locale === 'en' ? (e.story ?? j?.story ?? '') : (j?.story ?? e.story ?? '');
                if (!story) continue;
                evtTransRows.push({ event_id: e.id, locale, story });
            }
        }
        await chunkedUpsert(sb, 'event_translations', evtTransRows, 'event_id,locale');
    }

    // 5. Sanity check --------------------------------------------------------
    const counts = await Promise.all([
        sb.from('nodes').select('id', { count: 'exact', head: true }),
        sb.from('links').select('id', { count: 'exact', head: true }),
        sb.from('events').select('id', { count: 'exact', head: true }),
        sb.from('node_translations').select('node_id', { count: 'exact', head: true }),
        sb.from('link_translations').select('link_id', { count: 'exact', head: true }),
        sb.from('event_translations').select('event_id', { count: 'exact', head: true }),
    ]);
    console.log('[seed] final counts:');
    console.log(`  nodes:              ${counts[0].count}`);
    console.log(`  links:              ${counts[1].count}`);
    console.log(`  events:             ${counts[2].count}`);
    console.log(`  node_translations:  ${counts[3].count}`);
    console.log(`  link_translations:  ${counts[4].count}`);
    console.log(`  event_translations: ${counts[5].count}`);
    console.log('[seed] done.');
}

main().catch((err) => {
    console.error('[seed] FAILED:', err);
    process.exit(1);
});
