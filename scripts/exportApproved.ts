/**
 * exportApproved.ts — approved review-queue rows → data/approved.json
 *
 * Nodes approved in /admin (Wikidata BFS candidates, aib vote imports …) lived
 * only in Supabase, so they fed AskAI retrieval but never appeared on the map,
 * timeline or cards. This script exports them into a committed JSON file that
 * data/graphData.ts merges with the curated constants.ts graph.
 *
 * Reads with the PUBLIC anon key on purpose: RLS (0002) only returns approved
 * rows to anon, so a pending or rejected candidate cannot leak into the site
 * even if a filter here were wrong.
 *
 * Every value is validated against types.ts enums; invalid taxonomy values are
 * dropped (logged), and nodes without a usable year are skipped because the
 * timeline and ranking need one.
 *
 * Usage:
 *   npm run export-approved            # writes data/approved.json
 *   npm run export-approved -- --dry   # print counts only
 * Then: npm run build (prerender + sitemap pick the new nodes up), and
 *       npm run deepdive to generate their Deep Dives.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_DATA } from '../constants';
import {
    ArrowHead, Category, CompanyCategory, LinkIcon, LinkType, PersonRole, TechRole,
    type EventData, type LinkData, type NodeData, type TechCategoryL1, type TechCategoryL2,
} from '../types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'data', 'approved.json');
const DRY = process.argv.includes('--dry');

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
    console.error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
    process.exit(1);
}
const sb = createClient(url, anon, { auth: { persistSession: false } });

// ---------------------------------------------------------------------------
// Validation tables (mirrors types.ts)
// ---------------------------------------------------------------------------
const PERSON_ROLES = new Set<string>(Object.values(PersonRole));
const TECH_ROLES = new Set<string>(Object.values(TechRole));
const COMPANY_CATS = new Set<string>(Object.values(CompanyCategory));
const LINK_TYPES = new Set<string>(Object.values(LinkType));
const ARROWS = new Set<string>(Object.values(ArrowHead));
const ICONS = new Set<string>(Object.values(LinkIcon));
const TECH_L1 = new Set<string>([
    'Hardware & Infrastructure', 'System Software', 'Network & Connectivity',
    'Digital Services & Platforms', 'AI & Physical Systems', 'Fundamental Concepts',
]);
const TECH_L2 = new Set<string>([
    'Processors & Compute', 'Devices & Form Factors', 'Memory & Storage', 'Components & Manufacturing',
    'Operating Systems (OS)', 'Development & Languages', 'Telecommunications', 'Network Architecture',
    'Search & Information', 'Social & Media', 'Digital Platforms', 'Artificial Intelligence',
    'Autonomous Mobility', 'Robotics', 'Fintech & Crypto', 'Spatial Computing',
    'Theories & Architectures', 'Laws & Principles', 'Standards & Protocols',
]);
const MIN_YEAR = 1800;
const MAX_YEAR = new Date().getFullYear() + 1;

interface NodeRow {
    id: string; label: string; category: string; year: number | null; description: string | null;
    impact_role: string | null; tech_l1: string | null; tech_l2: string | null; company_categories: string[] | null;
    primary_role: string | null; secondary_role: string | null; birth_year: number | null; death_year: number | null;
    end_year: number | null; market_cap: { current?: string; peak?: string } | null; keywords: string[] | null;
    wikipedia_urls: Record<string, string> | null; provenance: string; external_links: unknown;
}
interface LinkRow {
    id: number; source_id: string; target_id: string; type: string; arrow: string; icon: string | null;
    strength: number; start_year: number | null; end_year: number | null;
}
interface EventRow { id: string; year: number; end_year: number | null; related_nodes: string[] | null; source_url: string | null }

async function selectAll<T>(table: string, columns: string, apply: (q: any) => any): Promise<T[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const out: T[] = [];
    for (let from = 0; ; from += 1000) {
        const { data, error } = await apply(sb.from(table).select(columns)).range(from, from + 999);
        if (error) throw new Error(`${table}: ${error.message}`);
        out.push(...((data as T[]) ?? []));
        if (!data || data.length < 1000) break;
    }
    return out;
}

async function inChunks<T>(ids: string[] | number[], fetch: (chunk: (string | number)[]) => Promise<T[]>): Promise<T[]> {
    const out: T[] = [];
    for (let i = 0; i < ids.length; i += 200) out.push(...await fetch(ids.slice(i, i + 200) as (string | number)[]));
    return out;
}

const warnings: string[] = [];
const warn = (m: string) => { warnings.push(m); };

function toNode(r: NodeRow): NodeData | null {
    if (!Object.values(Category).includes(r.category as Category)) { warn(`skip ${r.id}: bad category ${r.category}`); return null; }
    if (!r.year || r.year < MIN_YEAR || r.year > MAX_YEAR) { warn(`skip ${r.id}: no usable year (${r.year})`); return null; }
    const cat = r.category as Category;
    const n: NodeData = {
        id: r.id,
        label: r.label,
        category: cat,
        year: r.year,
        description: (r.description ?? '').trim(),
        provenance: r.provenance === 'ai_enriched' ? 'ai_enriched' : 'ai_discovered',
    };
    if (r.impact_role) {
        const ok = cat === Category.PERSON ? PERSON_ROLES.has(r.impact_role)
            : cat === Category.TECHNOLOGY ? TECH_ROLES.has(r.impact_role) : false;
        if (ok) n.impactRole = r.impact_role as NodeData['impactRole'];
        else if (cat !== Category.COMPANY) warn(`${r.id}: dropped impact_role ${r.impact_role}`);
    }
    if (cat === Category.COMPANY) {
        const cats = (r.company_categories ?? []).filter(c => COMPANY_CATS.has(c)) as CompanyCategory[];
        n.companyCategories = cats.length ? cats : [CompanyCategory.PLATFORM_INTERNET];
        if (r.market_cap && (r.market_cap.current || r.market_cap.peak)) n.marketCap = r.market_cap;
    }
    if (cat === Category.TECHNOLOGY) {
        if (r.tech_l1 && TECH_L1.has(r.tech_l1)) n.techCategoryL1 = r.tech_l1 as TechCategoryL1;
        if (r.tech_l2 && TECH_L2.has(r.tech_l2)) n.techCategoryL2 = r.tech_l2 as TechCategoryL2;
        if (r.end_year) n.endYear = r.end_year;
    }
    if (cat === Category.PERSON) {
        if (r.primary_role) n.primaryRole = r.primary_role;
        if (r.secondary_role) n.secondaryRole = r.secondary_role;
        if (r.birth_year) n.birthYear = r.birth_year;
        if (r.death_year) n.deathYear = r.death_year;
    }
    if (r.keywords?.length) n.keywords = r.keywords;
    const ext: NonNullable<NodeData['externalLinks']> = [];
    if (r.wikipedia_urls?.en) ext.push({ type: 'WIKIPEDIA', url: r.wikipedia_urls.en, label: 'Wikipedia' });
    if (Array.isArray(r.external_links)) {
        for (const e of r.external_links as Array<Record<string, unknown>>) {
            const type = String(e?.type ?? 'OTHER');
            const href = String(e?.url ?? '');
            if (!/^https:\/\//.test(href) || !['YOUTUBE', 'WIKIPEDIA', 'BLOG', 'BOOK', 'OTHER'].includes(type)) continue;
            if (!ext.some(x => x.url === href)) ext.push({ type: type as 'OTHER', url: href, label: String(e?.label ?? '') });
        }
    }
    if (ext.length) n.externalLinks = ext;
    return n;
}

async function main() {
    const curatedIds = new Set(INITIAL_DATA.nodes.map(n => n.id));

    // RLS already limits anon to approved rows; the filters make intent explicit.
    const nodeRows = await selectAll<NodeRow>(
        'nodes',
        'id, label, category, year, description, impact_role, tech_l1, tech_l2, company_categories, primary_role, secondary_role, birth_year, death_year, end_year, market_cap, keywords, wikipedia_urls, provenance, external_links',
        q => q.neq('provenance', 'curated').not('approved_at', 'is', null).order('id'),
    );
    const nodes = nodeRows.filter(r => !curatedIds.has(r.id)).map(toNode).filter((n): n is NodeData => !!n);
    const nodeIds = new Set(nodes.map(n => n.id));
    const allIds = new Set([...curatedIds, ...nodeIds]);

    // ko/ja labels + descriptions
    const trRows = await inChunks([...nodeIds], chunk => selectAll<{ node_id: string; locale: string; label: string; description: string | null; primary_role: string | null }>(
        'node_translations', 'node_id, locale, label, description, primary_role',
        q => q.in('node_id', chunk).in('locale', ['ko', 'ja']),
    ));
    const byNode = new Map(nodes.map(n => [n.id, n]));
    for (const t of trRows) {
        const n = byNode.get(t.node_id);
        if (!n || (t.locale !== 'ko' && t.locale !== 'ja')) continue;
        n.i18n = { ...(n.i18n ?? {}), [t.locale]: { label: t.label || undefined, description: t.description || undefined } };
    }

    // Links: approved, not curated, both ends visible
    const linkRows = await selectAll<LinkRow>(
        'links', 'id, source_id, target_id, type, arrow, icon, strength, start_year, end_year',
        q => q.neq('provenance', 'curated').not('approved_at', 'is', null).order('id'),
    );
    const usable = linkRows.filter(l => allIds.has(l.source_id) && allIds.has(l.target_id)
        && (nodeIds.has(l.source_id) || nodeIds.has(l.target_id)) && LINK_TYPES.has(l.type));
    const storyRows = await inChunks(usable.map(l => l.id), chunk => selectAll<{ link_id: number; locale: string; story: string | null }>(
        'link_translations', 'link_id, locale, story', q => q.in('link_id', chunk),
    ));
    const stories = new Map<number, Record<string, string>>();
    for (const s of storyRows) if (s.story) stories.set(s.link_id, { ...(stories.get(s.link_id) ?? {}), [s.locale]: s.story });

    const links: LinkData[] = usable.map(l => {
        const st = stories.get(l.id) ?? {};
        const link: LinkData = {
            source: l.source_id,
            target: l.target_id,
            type: l.type as LinkType,
            arrow: (ARROWS.has(l.arrow) ? l.arrow : ArrowHead.SINGLE) as ArrowHead,
            strength: Number.isFinite(l.strength) ? l.strength : 0.5,
        };
        if (l.icon && ICONS.has(l.icon) && l.icon !== LinkIcon.NONE) link.icon = l.icon as LinkIcon;
        if (l.start_year) link.startYear = l.start_year;
        if (l.end_year) link.endYear = l.end_year;
        if (st.en) link.story = st.en;
        if (st.ko || st.ja) link.i18n = { ...(st.ko ? { ko: { story: st.ko } } : {}), ...(st.ja ? { ja: { story: st.ja } } : {}) };
        return link;
    });

    // Nodes with no link at all would float alone on the map — keep them out
    // until an editor connects them.
    const linked = new Set(links.flatMap(l => [l.source as string, l.target as string]));
    const finalNodes = nodes.filter(n => {
        if (linked.has(n.id)) return true;
        warn(`skip ${n.id}: approved but has no approved link to the graph`);
        return false;
    });

    // Approved timeline events (event_candidates, migration 0009) — optional table.
    let events: EventData[] = [];
    const evRes = await sb.from('events').select('id, year, end_year, related_nodes, source_url').like('id', 'ev_%').order('year');
    if (!evRes.error && evRes.data) {
        const rows = evRes.data as EventRow[];
        const evTr = await inChunks(rows.map(r => r.id), chunk => selectAll<{ event_id: string; locale: string; story: string }>(
            'event_translations', 'event_id, locale, story', q => q.in('event_id', chunk),
        ));
        const st = new Map<string, Record<string, string>>();
        for (const t of evTr) st.set(t.event_id, { ...(st.get(t.event_id) ?? {}), [t.locale]: t.story });
        events = rows.filter(r => st.get(r.id)?.en).map(r => ({
            id: r.id,
            year: r.year,
            ...(r.end_year ? { endYear: r.end_year } : {}),
            story: st.get(r.id)!.en,
            relatedNodes: (r.related_nodes ?? []).filter(id => allIds.has(id)),
            ...(r.source_url && /^https:\/\//.test(r.source_url) ? { sourceUrl: r.source_url } : {}),
            ...((st.get(r.id)!.ko || st.get(r.id)!.ja) ? {
                i18n: {
                    ...(st.get(r.id)!.ko ? { ko: { story: st.get(r.id)!.ko } } : {}),
                    ...(st.get(r.id)!.ja ? { ja: { story: st.get(r.id)!.ja } } : {}),
                },
            } : {}),
        }));
    }

    const out = {
        generated_at: new Date().toISOString(),
        nodes: finalNodes.sort((a, b) => a.id.localeCompare(b.id)),
        links,
        events,
    };
    for (const w of warnings.slice(0, 40)) console.warn(`  · ${w}`);
    if (warnings.length > 40) console.warn(`  · … ${warnings.length - 40} more`);
    console.log(`[export-approved] nodes=${out.nodes.length} links=${out.links.length} events=${out.events.length} (skipped/warnings=${warnings.length})`);
    if (DRY) return;
    fs.writeFileSync(OUT, `${JSON.stringify(out, null, 1)}\n`);
    console.log(`[export-approved] wrote ${path.relative(process.cwd(), OUT)}`);
}

main().catch(err => { console.error('[export-approved] FAILED:', err); process.exit(1); });
