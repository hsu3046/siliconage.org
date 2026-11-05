/**
 * triageCandidates.ts — Jev pass over the ai_discovered review queue.
 *
 * Replaces the "75–80% regex" quality ceiling of classifyNodes.ts with a
 * calibrated decision model (TypeSafe Jev via OpenRouter). For every pending
 * candidate it asks, in one batched call per ~10 same-category items:
 *
 *   rel   noul    — does this entity deserve a node in The Silicon Age?
 *   role  choice  — PersonRole / TechRole (people & technologies)
 *   cc    choice  — CompanyCategory (companies)
 *   tax   choice  — TechCategoryL2 (technologies; L1 is derived in code)
 *
 * Results land in nodes.jev_* (migration 0007). With --apply, suggestions
 * whose confidence ≥ --min-confidence overwrite the regex taxonomy columns.
 * approved_at is never touched — /admin stays the human gate, but now sorts
 * by jev_relevance and can bulk-select "Jev ≥ x".
 *
 * Cost: ~$0.0002 per 10-item call → the whole 850-candidate queue ≈ $0.02.
 *
 * Usage:
 *   OPENROUTER_API_KEY=... npm run triage -- --dry-run --limit 20
 *   npm run triage                      # score unscored pending rows
 *   npm run triage -- --recheck --apply # rescore all + write taxonomy
 */

import 'dotenv/config';
import { getServiceClient } from '../services/supabaseClient';
import { jevDecide, shuffledCriteria, noulOf, choiceOf, JEV_MODEL, type JevQuestion } from '../services/jevClient';

type Cat = 'COMPANY' | 'PERSON' | 'TECHNOLOGY';

interface Row {
    id: string;
    label: string;
    category: Cat;
    year: number | null;
    description: string | null;
    impact_role: string | null;
    company_categories: string[] | null;
    tech_l1: string | null;
    tech_l2: string | null;
    sitelinks_count: number | null;
    discovered_from: string | null;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string, def: number) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : def;
};
const DRY = flag('dry-run');
const APPLY = flag('apply');
const RECHECK = flag('recheck');
const LIMIT = opt('limit', 5000);
const BATCH = Math.max(1, Math.min(opt('batch', 10), 20));
const MIN_CONF = opt('min-confidence', 0.6);

// ---------------------------------------------------------------------------
// Taxonomy (keys must match types.ts enum values)
// ---------------------------------------------------------------------------
const PERSON_ROLES: Record<string, string> = {
    VISIONARY: 'Founder or CEO who set the direction of a company or movement (e.g. Steve Jobs, Bill Gates).',
    THEORIST: 'Scientist, mathematician or inventor whose ideas or research underpin the technology (e.g. Alan Turing, Geoffrey Hinton).',
    BUILDER: 'Engineer, programmer or architect who built a key system or product (e.g. Steve Wozniak, Dennis Ritchie).',
    LEADER: 'Executive who ran or scaled an existing company rather than founding it (e.g. Tim Cook, Satya Nadella).',
    INVESTOR: 'Venture capitalist or investor known mainly for funding companies.',
};

const TECH_ROLES: Record<string, string> = {
    FOUNDATION: 'Underlying theory, algorithm or scientific principle (e.g. Transformer, PageRank, information theory).',
    CORE: 'Core hardware, component, protocol or standard (e.g. x86, DRAM, TCP/IP, HTTP).',
    PLATFORM: 'Runtime platform, operating system, language or developer ecosystem others build on (e.g. Android, CUDA, Linux).',
    APPLICATION: 'Consumer- or business-facing product or service people use directly (e.g. iPhone, ChatGPT, Google Search).',
};

const COMPANY_CATS: Record<string, string> = {
    PLATFORM_INTERNET: 'Internet platform with network effects (search, social, marketplace, payments).',
    ENTERPRISE_SAAS: 'Enterprise or productivity software vendor.',
    AI_INNOVATION: 'Company whose main business is AI models or AI research.',
    HARDWARE_ROBOTICS: 'Robots, vehicles, drones or other physical machines.',
    SEMICONDUCTOR: 'Chip designer or chip manufacturer.',
    MEDIA_CONTENT: 'Media, streaming, games or entertainment.',
    INFRA_TELECOM: 'Telecom carrier, networking equipment or internet backbone.',
    VENTURE_CAPITAL: 'Venture capital firm, accelerator or investment fund.',
    ACADEMY_LAB: 'University lab, research institute or government research agency.',
    MANUFACTURING_SUPPLY: 'Contract manufacturer, equipment maker or supply-chain company.',
    CONSUMER_DEVICE: 'Consumer electronics maker (PCs, phones, game consoles, wearables).',
};

const TECH_L2_TO_L1: Record<string, string> = {
    'Processors & Compute': 'Hardware & Infrastructure',
    'Devices & Form Factors': 'Hardware & Infrastructure',
    'Memory & Storage': 'Hardware & Infrastructure',
    'Components & Manufacturing': 'Hardware & Infrastructure',
    'Operating Systems (OS)': 'System Software',
    'Development & Languages': 'System Software',
    'Telecommunications': 'Network & Connectivity',
    'Network Architecture': 'Network & Connectivity',
    'Search & Information': 'Digital Services & Platforms',
    'Social & Media': 'Digital Services & Platforms',
    'Digital Platforms': 'Digital Services & Platforms',
    'Artificial Intelligence': 'AI & Physical Systems',
    'Autonomous Mobility': 'AI & Physical Systems',
    'Robotics': 'AI & Physical Systems',
    'Fintech & Crypto': 'AI & Physical Systems',
    'Spatial Computing': 'AI & Physical Systems',
    'Theories & Architectures': 'Fundamental Concepts',
    'Laws & Principles': 'Fundamental Concepts',
    'Standards & Protocols': 'Fundamental Concepts',
};
// Choice keys must be identifier-like; map short keys ↔ L2 labels.
const TAX_KEYS = Object.keys(TECH_L2_TO_L1).map((l2, i) => ({ key: `t${i}`, l2 }));
const TAX_CRITERIA: Record<string, string> = Object.fromEntries(
    TAX_KEYS.map(({ key, l2 }) => [key, `${TECH_L2_TO_L1[l2]} → ${l2}`]),
);

const RELEVANCE_PROMPT = (k: string) =>
    `Item ${k}: should this entity get its own node in "The Silicon Age", a curated knowledge graph of the ` +
    `most influential companies, people and technologies in 100 years of digital history (computing, ` +
    `semiconductors, networking, internet, mobile, AI)? True only if a well-read tech historian would ` +
    `expect to find it there. False for minor products, regional subsidiaries, obscure researchers, ` +
    `generic concepts outside computing, or people notable mainly for non-technology reasons.`;

function questionsFor(row: Row, k: string): Record<string, JevQuestion> {
    const q: Record<string, JevQuestion> = {
        [`${k}_rel`]: { type: 'noul', instructions: RELEVANCE_PROMPT(k) },
    };
    if (row.category === 'PERSON') {
        q[`${k}_role`] = { type: 'choice', instructions: `Item ${k}: which role best describes this person's impact on technology history?`, criteria: shuffledCriteria(PERSON_ROLES) };
    } else if (row.category === 'TECHNOLOGY') {
        q[`${k}_role`] = { type: 'choice', instructions: `Item ${k}: which layer of the technology stack is this?`, criteria: shuffledCriteria(TECH_ROLES) };
        q[`${k}_tax`] = { type: 'choice', instructions: `Item ${k}: which category fits this technology best?`, criteria: shuffledCriteria(TAX_CRITERIA) };
    } else {
        q[`${k}_cc`] = { type: 'choice', instructions: `Item ${k}: what is this company's primary business?`, criteria: shuffledCriteria(COMPANY_CATS) };
    }
    return q;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    const sb = getServiceClient();

    let query = sb
        .from('nodes')
        .select('id, label, category, year, description, impact_role, company_categories, tech_l1, tech_l2, sitelinks_count, discovered_from')
        .eq('provenance', 'ai_discovered')
        .is('approved_at', null)
        .order('relevance_score', { ascending: false, nullsFirst: false })
        .limit(LIMIT);
    if (!RECHECK) query = query.is('jev_checked_at', null);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data as Row[]) ?? [];
    console.log(`[triage] ${rows.length} pending candidates (model=${JEV_MODEL}, batch=${BATCH}, apply=${APPLY}, dry=${DRY})`);
    if (rows.length === 0) return;

    // Seed labels give Jev context ("discovered from Arm architecture").
    const seedIds = [...new Set(rows.map(r => r.discovered_from).filter((x): x is string => !!x))];
    const seedLabel = new Map<string, string>();
    for (let i = 0; i < seedIds.length; i += 200) {
        const { data: seeds } = await sb.from('nodes').select('id, label').in('id', seedIds.slice(i, i + 200));
        for (const s of (seeds as Array<{ id: string; label: string }>) ?? []) seedLabel.set(s.id, s.label);
    }

    // Homogeneous batches: Jev verdicts drift slightly with batch neighbours.
    const byCat: Record<Cat, Row[]> = { COMPANY: [], PERSON: [], TECHNOLOGY: [] };
    for (const r of rows) byCat[r.category].push(r);

    let done = 0, cost = 0, failed = 0;
    const histogram = [0, 0, 0, 0, 0]; // relevance buckets of 0.2

    for (const cat of Object.keys(byCat) as Cat[]) {
        const list = byCat[cat];
        for (let i = 0; i < list.length; i += BATCH) {
            const batch = list.slice(i, i + BATCH);
            const items = batch.map((r, j) => ({
                key: `n${j}`,
                name: r.label,
                kind: cat.toLowerCase(),
                year: r.year ?? undefined,
                wikidata_description: r.description ?? undefined,
                wikipedia_languages: r.sitelinks_count ?? undefined,
                connected_to: r.discovered_from ? seedLabel.get(r.discovered_from) ?? r.discovered_from : undefined,
            }));
            const questions: Record<string, JevQuestion> = {};
            batch.forEach((r, j) => Object.assign(questions, questionsFor(r, `n${j}`)));

            let res;
            try {
                res = await jevDecide({ task: 'Triage Wikidata candidates for The Silicon Age knowledge graph', items }, questions);
            } catch (err) {
                failed += batch.length;
                console.warn(`[triage] batch ${cat}#${i} failed: ${(err as Error).message}`);
                continue;
            }
            cost += res.usage?.cost ?? 0;

            for (let j = 0; j < batch.length; j++) {
                const r = batch[j];
                const k = `n${j}`;
                const rel = noulOf(res, `${k}_rel`);
                const role = choiceOf(res, `${k}_role`);
                const cc = choiceOf(res, `${k}_cc`);
                const tax = choiceOf(res, `${k}_tax`);
                const l2 = tax ? TAX_KEYS.find(t => t.key === tax.choice)?.l2 ?? null : null;

                const suggestion = {
                    role: role ? { value: role.choice, confidence: role.confidence } : null,
                    company_category: cc ? { value: cc.choice, confidence: cc.confidence } : null,
                    tech: l2 && tax ? { l1: TECH_L2_TO_L1[l2], l2, confidence: tax.confidence } : null,
                    previous: { impact_role: r.impact_role, company_categories: r.company_categories, tech_l1: r.tech_l1, tech_l2: r.tech_l2 },
                };
                const update: Record<string, unknown> = {
                    jev_relevance: rel,
                    jev_suggestion: suggestion,
                    jev_model: res.model,
                    jev_checked_at: new Date().toISOString(),
                };
                if (APPLY) {
                    if (role && role.confidence >= MIN_CONF) update.impact_role = role.choice;
                    if (cc && cc.confidence >= MIN_CONF) update.company_categories = [cc.choice];
                    if (l2 && tax && tax.confidence >= MIN_CONF) { update.tech_l1 = TECH_L2_TO_L1[l2]; update.tech_l2 = l2; }
                }
                if (rel !== null) histogram[Math.min(4, Math.floor(rel * 5))]++;

                if (DRY) {
                    console.log(`  ${r.id.padEnd(16)} ${r.label.slice(0, 32).padEnd(32)} rel=${rel?.toFixed(2) ?? '—'} ` +
                        `${role ? `role=${role.choice}(${role.confidence.toFixed(2)})` : ''} ` +
                        `${cc ? `cc=${cc.choice}(${cc.confidence.toFixed(2)})` : ''} ${l2 ? `tax=${l2}` : ''}`);
                } else {
                    const { error: uErr } = await sb.from('nodes').update(update as never).eq('id', r.id);
                    if (uErr) { failed++; console.warn(`  update ${r.id} failed: ${uErr.message}`); continue; }
                }
                done++;
            }
            console.log(`[triage] ${cat} ${Math.min(i + BATCH, list.length)}/${list.length}`);
        }
    }

    console.log(`[triage] done=${done} failed=${failed} cost≈$${cost.toFixed(4)}`);
    console.log(`[triage] relevance histogram  0-.2:${histogram[0]}  .2-.4:${histogram[1]}  .4-.6:${histogram[2]}  .6-.8:${histogram[3]}  .8-1:${histogram[4]}`);
    console.log('[triage] Calibrate before trusting thresholds: label ~50 rows by hand in /admin and compare.');
}

main().catch(err => { console.error('[triage] FAILED:', err); process.exit(1); });
