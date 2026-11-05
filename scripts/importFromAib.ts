/**
 * importFromAib.ts — AI-era candidates from aib vote's model catalog.
 *
 * The Silicon Age stops in 2025; aib vote (sister site) tracks every model
 * release with dates, labs and ko/ja/en descriptions. This script turns the
 * historically significant ones into review-queue candidates:
 *
 *   aib model catalog ──► TypeSafe Jev ──► siliconage Supabase (ai_discovered)
 *                          · milestone?        ──► /admin review ──► export-approved
 *                          · tech role
 *                          · which product line it powers
 *
 * aib vote is the main service — this script never writes to it and never
 * needs aib code changes. Two input modes:
 *   --file <models.json>  no aib access at all: a JSON array you exported
 *                         yourself (columns listed in AibModelRow below)
 *   (default)             reads aib's PUBLIC catalog with its publishable key
 *                         (rows RLS already exposes to every visitor:
 *                         pricing_models_public_active / pricing_services
 *                         public policy). One manual run = 2–3 small requests.
 *
 * Writes to siliconage only: nodes (+ node_translations, links) with
 * provenance='ai_discovered', discovered_from='aib.vote' and jev_* columns,
 * so the existing /admin queue, Jev sorting and bulk select just work.
 * Skips ids already in the graph or previously rejected (0008).
 *
 * Usage:
 *   npm run import-aib -- --dry-run                 # print verdicts, write nothing
 *   npm run import-aib -- --since 2023-01-01 --min 0.5
 *   npm run import-aib -- --file ./aib-models.json --dry-run
 *   npm run import-aib -- --rescore                  # re-judge models previously below --min
 *
 * Env: AIB_SUPABASE_URL + AIB_SUPABASE_PUBLISHABLE_KEY (default mode),
 *      OPENROUTER_API_KEY (Jev), SUPABASE_SERVICE_ROLE_KEY + VITE_SUPABASE_URL (siliconage writes).
 */

import 'dotenv/config';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { getServiceClient } from '../services/supabaseClient';
import { jevDecide, shuffledCriteria, noulOf, choiceOf, JEV_MODEL, type JevQuestion } from '../services/jevClient';
import { GRAPH_DATA } from '../data/graphData';
import { AIB_BASE_URL, AIB_NODE_MAP } from '../config/aibLinks';
import { Category } from '../types';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(`--${n}`);
const opt = (n: string): string | undefined => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : undefined; };
const DRY = flag('dry-run');
const FILE = opt('file');
const SINCE = opt('since') ?? '2023-01-01';
const MIN = Number(opt('min') ?? 0.5);
// Models scored below --min are remembered (rejected_node_ids, reason
// 'jev_below:<p>') so the next run does not pay Jev for them again.
// --rescore re-evaluates them (e.g. after recalibrating --min).
const RESCORE = flag('rescore');
const BATCH = 8;

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
interface AibModelRow {
    id: string;
    name: string;
    slug: string | null;
    release_date: string | null;           // YYYY-MM-DD
    description: { ko?: string; en?: string; ja?: string } | null;
    service_id: string;
    is_open_source?: boolean | null;
    lab_slug?: string | null;              // pricing_services.slug
    lab_name?: string | null;              // pricing_services.name
}

async function loadModels(): Promise<AibModelRow[]> {
    if (FILE) {
        const rows = JSON.parse(fs.readFileSync(FILE, 'utf-8')) as AibModelRow[];
        console.log(`[import-aib] ${rows.length} rows from ${FILE} (no aib access)`);
        return rows;
    }
    const url = process.env.AIB_SUPABASE_URL;
    const key = process.env.AIB_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('Set AIB_SUPABASE_URL + AIB_SUPABASE_PUBLISHABLE_KEY, or pass --file');
    const aib = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { 'x-client-info': 'siliconage-import/1.0' } },
    });
    const { data: services, error: sErr } = await aib.from('pricing_services').select('id, slug, name');
    if (sErr) throw new Error(`aib pricing_services: ${sErr.message}`);
    const svc = new Map(((services as Array<{ id: string; slug: string; name: string }>) ?? []).map(s => [s.id, s]));
    const rows: AibModelRow[] = [];
    for (let from = 0; ; from += 1000) {
        const { data, error } = await aib.from('pricing_models')
            .select('id, name, slug, release_date, description, service_id, is_open_source')
            .eq('status', 'active')
            .gte('release_date', SINCE)
            .order('release_date')
            .range(from, from + 999);
        if (error) throw new Error(`aib pricing_models: ${error.message}`);
        for (const r of (data as AibModelRow[]) ?? []) {
            const s = svc.get(r.service_id);
            rows.push({ ...r, lab_slug: s?.slug ?? null, lab_name: s?.name ?? null });
        }
        if (!data || data.length < 1000) break;
    }
    console.log(`[import-aib] ${rows.length} active aib models released since ${SINCE}`);
    return rows;
}

// ---------------------------------------------------------------------------
// Graph context
// ---------------------------------------------------------------------------
const nodeById = new Map(GRAPH_DATA.nodes.map(n => [n.id, n]));
const toId = (slug: string) => `aib_${slug.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`.slice(0, 128);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const existingLabels = new Set(GRAPH_DATA.nodes.map(n => norm(n.label)));

/** aib lab slug → our company node / AI product nodes (reverse of config/aibLinks.ts) */
function labContext(labSlug: string | null | undefined) {
    if (!labSlug) return { company: null as string | null, products: [] as string[] };
    const entries = Object.entries(AIB_NODE_MAP).filter(([id, t]) => t.lab === labSlug && nodeById.has(id));
    const companies = entries.filter(([id]) => nodeById.get(id)!.category === Category.COMPANY).map(([id]) => id);
    const company = companies.includes(labSlug) ? labSlug : companies[0] ?? null;
    const products = entries.filter(([id]) => nodeById.get(id)!.category === Category.TECHNOLOGY).map(([id]) => id);
    return { company, products };
}

const TECH_ROLES: Record<string, string> = {
    FOUNDATION: 'A foundation model or research breakthrough other systems are built on.',
    PLATFORM: 'A model family or platform developers build products on (API, open weights ecosystem).',
    APPLICATION: 'A consumer- or business-facing product people use directly.',
    CORE: 'Core hardware or infrastructure.',
};

const MILESTONE = (k: string) =>
    `Item ${k}: is this model a historically significant milestone that a history of AI written ten years from now would mention ` +
    `(a flagship generation that moved the frontier, a new paradigm such as the first reasoning or first frontier-class open-weights model, ` +
    `or a release with very wide adoption)? False for size/speed variants (mini, flash, lite, turbo), previews, dated snapshots, ` +
    `regional or fine-tuned versions and incremental point releases.`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    const rows = (await loadModels()).filter(r => r.slug && r.release_date && r.release_date >= SINCE);
    const sb = DRY ? null : getServiceClient();

    // Skip what we already have, rejected before, or is queued.
    let rejected = new Set<string>();
    let queued = new Set<string>();
    if (sb) {
        // Paged: PostgREST caps a response at 1000 rows. Errors abort — a
        // silently empty list would re-import rejected candidates.
        const all = async <T,>(make: () => any): Promise<T[]> => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const out: T[] = [];
            for (let from = 0; ; from += 1000) {
                const { data, error } = await make().range(from, from + 999);
                if (error) throw new Error(`siliconage read failed: ${error.message} (are migrations 0007/0008 applied?)`);
                out.push(...((data as T[]) ?? []));
                if (!data || data.length < 1000) break;
            }
            return out;
        };
        const rej = await all<{ id: string; reason: string | null }>(() => sb.from('rejected_node_ids').select('id, reason').order('id'));
        rejected = new Set(rej.filter(r => !(RESCORE && (r.reason ?? '').startsWith('jev_below'))).map(r => r.id));
        const q = await all<{ id: string }>(() => sb.from('nodes').select('id').like('id', 'aib_%').order('id'));
        queued = new Set(q.map(r => r.id));
    }
    const candidates = rows.filter(r => {
        const id = toId(r.slug!);
        return !nodeById.has(id) && !rejected.has(id) && !queued.has(id) && !existingLabels.has(norm(r.name));
    });
    console.log(`[import-aib] ${candidates.length} new candidates (model=${JEV_MODEL}, min=${MIN}, dry=${DRY})`);

    let inserted = 0, below = 0, cost = 0;
    for (let i = 0; i < candidates.length; i += BATCH) {
        const batch = candidates.slice(i, i + BATCH);
        const items = batch.map((r, j) => ({
            key: `m${j}`,
            name: r.name,
            lab: r.lab_name ?? r.service_id,
            released: r.release_date,
            open_weights: !!r.is_open_source,
            description: (r.description?.en ?? '').slice(0, 600),
            other_models_from_same_lab: rows.filter(o => o.service_id === r.service_id && o.id !== r.id).map(o => o.name).slice(0, 25),
        }));
        const questions: Record<string, JevQuestion> = {};
        batch.forEach((r, j) => {
            const k = `m${j}`;
            questions[`${k}_ms`] = { type: 'noul', instructions: MILESTONE(k) };
            questions[`${k}_role`] = { type: 'choice', instructions: `Item ${k}: which describes this model best?`, criteria: shuffledCriteria(TECH_ROLES) };
            const { products } = labContext(r.lab_slug);
            if (products.length > 0) {
                const crit: Record<string, string> = {};
                for (const p of products) crit[p] = `${nodeById.get(p)!.label} — ${nodeById.get(p)!.description.slice(0, 120)}`;
                crit.none = 'None of these — it is not part of these product lines.';
                questions[`${k}_line`] = { type: 'choice', instructions: `Item ${k}: which existing product line does this model belong to or power?`, criteria: shuffledCriteria(crit, ['none']) };
            }
        });

        let res;
        try {
            res = await jevDecide({ task: 'Decide which new AI models deserve a place in a history-of-computing knowledge graph', items }, questions);
        } catch (err) {
            console.warn(`[import-aib] batch ${i} failed: ${(err as Error).message}`);
            continue;
        }
        cost += res.usage?.cost ?? 0;

        for (let j = 0; j < batch.length; j++) {
            const r = batch[j];
            const k = `m${j}`;
            const ms = noulOf(res, `${k}_ms`) ?? 0;
            const role = choiceOf(res, `${k}_role`);
            const line = choiceOf(res, `${k}_line`);
            const id = toId(r.slug!);
            const year = Number(r.release_date!.slice(0, 4));
            const { company } = labContext(r.lab_slug);
            const product = line && line.choice !== 'none' && line.confidence >= 0.5 ? line.choice : null;
            console.log(`  ${ms >= MIN ? '✓' : '·'} ${r.release_date} ${r.name.padEnd(28).slice(0, 28)} milestone=${ms.toFixed(2)} ${role ? `role=${role.choice}` : ''}${product ? ` → ${product}` : ''}${company ? ` ← ${company}` : ''}`);
            if (ms < MIN) {
                below++;
                if (sb) {
                    await sb.from('rejected_node_ids').upsert(
                        { id, source: 'aib.vote', reason: `jev_below:${ms.toFixed(3)}` } as never, { onConflict: 'id' });
                }
                continue;
            }
            if (!sb) continue;

            const aibUrl = `${AIB_BASE_URL}/en/models/${r.slug}`;
            const { error: nErr } = await sb.from('nodes').upsert({
                id,
                label: r.name,
                category: 'TECHNOLOGY',
                year,
                description: r.description?.en ?? null,
                impact_role: role && role.confidence >= 0.5 ? role.choice : 'FOUNDATION',
                tech_l1: 'AI & Physical Systems',
                tech_l2: 'Artificial Intelligence',
                external_links: [{ type: 'OTHER', url: aibUrl, label: 'aib vote' }],
                keywords: [r.name.toLowerCase()],
                provenance: 'ai_discovered',
                discovered_from: 'aib.vote',
                discovery_depth: 0,
                relevance_score: Math.round(ms * 10),
                jev_relevance: ms,
                jev_suggestion: { milestone: ms, role: role ? { value: role.choice, confidence: role.confidence } : null, product_line: line ? { value: line.choice, confidence: line.confidence } : null, source: { aib_model_id: r.id, lab: r.lab_slug } },
                jev_model: res.model,
                jev_checked_at: new Date().toISOString(),
            } as never, { onConflict: 'id', ignoreDuplicates: true });
            if (nErr) { console.warn(`    node ${id} failed: ${nErr.message}`); continue; }

            const trRows = (['en', 'ko', 'ja'] as const).map(locale => ({
                node_id: id, locale, label: r.name, description: r.description?.[locale] ?? null,
            }));
            await sb.from('node_translations').upsert(trRows as never, { onConflict: 'node_id,locale', ignoreDuplicates: true });

            const linkRows: Array<Record<string, unknown>> = [];
            if (company) linkRows.push({ source_id: company, target_id: id, type: 'CREATES', arrow: 'SINGLE', icon: 'SPARK', strength: 0.9, start_year: year, relation_kind: 'released', provenance: 'ai_discovered' });
            if (product) linkRows.push({ source_id: id, target_id: product, type: 'POWERS', arrow: 'SINGLE', icon: 'POWERS', strength: 0.7, start_year: year, relation_kind: 'powers product', provenance: 'ai_discovered' });
            for (const l of linkRows) {
                const { data: ins, error: lErr } = await sb.from('links').upsert(l as never, { onConflict: 'source_id,target_id,type', ignoreDuplicates: true }).select('id');
                if (lErr) { console.warn(`    link ${l.source_id}→${l.target_id} failed: ${lErr.message}`); continue; }
                const linkId = (ins as Array<{ id: number }> | null)?.[0]?.id;
                if (linkId) {
                    const story = l.type === 'CREATES' ? `${nodeById.get(company!)?.label ?? company} released ${r.name}` : `${r.name} powers ${nodeById.get(product!)?.label ?? product}`;
                    await sb.from('link_translations').upsert({ link_id: linkId, locale: 'en', story } as never, { onConflict: 'link_id,locale', ignoreDuplicates: true });
                }
            }
            inserted++;
        }
    }
    console.log(`[import-aib] queued=${inserted} below-threshold=${below} cost≈$${cost.toFixed(4)}${DRY ? ' (dry run — nothing written)' : ''}`);
    if (!DRY && inserted > 0) console.log('[import-aib] Next: review in /admin → approve → npm run export-approved → npm run deepdive → build.');
}

main().catch(err => { console.error('[import-aib] FAILED:', err); process.exit(1); });
