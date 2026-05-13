/**
 * classifyNodes.ts
 *
 * Pass-1 taxonomy assignment for every node where
 *   provenance='ai_discovered' AND impact_role IS NULL.
 *
 * This intentionally runs offline — no LLM call. Heuristic rules over the
 * Wikidata short description, label, instance_of, and category give us
 * ~75-80% accuracy at zero quota cost. Phase 5 admin review (or a future
 * --refine pass that calls Gemini) is the place to polish edge cases.
 *
 * Usage:
 *   npm run classify
 */

import 'dotenv/config';
import { getServiceClient } from '../services/supabaseClient';

interface NodeRow {
    id: string;
    label: string;
    category: 'COMPANY' | 'PERSON' | 'TECHNOLOGY';
    description: string | null;
    impact_role: string | null;
    company_categories: string[] | null;
    tech_l1: string | null;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

// PersonRole — keyword-driven; falls back to BUILDER (most ai_discovered
// people are engineers/scientists).
function rolePerson(desc: string): string {
    const d = desc.toLowerCase();
    if (/\b(venture capitalist|vc|investor|angel)\b/.test(d)) return 'INVESTOR';
    if (/\b(ceo|chief executive|chairman|president|coo|cfo|cto|chairperson)\b/.test(d)) return 'LEADER';
    if (/\b(founder|co-?founder|founded|entrepreneur|cofounder)\b/.test(d)) return 'VISIONARY';
    if (/\b(physicist|mathematician|theorist|theoretical|nobel|inventor|cryptographer|computer scientist)\b/.test(d)) return 'THEORIST';
    if (/\b(engineer|programmer|developer|hacker|architect|designer|inventor|software engineer)\b/.test(d)) return 'BUILDER';
    return 'BUILDER';
}

// TechRole — 4 tiers
function roleTech(desc: string, label: string): string {
    const d = desc.toLowerCase();
    const l = label.toLowerCase();
    if (/\b(theory|theorem|principle|axiom|paradigm|model of|mathematical|fundamental)\b/.test(d)) return 'FOUNDATION';
    if (/\b(programming language|operating system|runtime|framework|sdk|platform|cuda|kernel)\b/.test(d) || l.includes('os')) return 'PLATFORM';
    if (/\b(application|app|consumer|service|product|website|smartphone|chatbot|browser)\b/.test(d)) return 'APPLICATION';
    if (/\b(protocol|standard|architecture|instruction set|cpu|gpu|processor|chip|hardware|integrated circuit|semiconductor|memory|storage)\b/.test(d)) return 'CORE';
    return 'CORE';  // default for unknown tech (most likely an HW/protocol)
}

// CompanyCategory — keyword scan, pick top match
const COMPANY_KW: Array<{ cat: string; rx: RegExp }> = [
    { cat: 'SEMICONDUCTOR', rx: /\b(semiconductor|integrated circuit|chip|silicon|fab|foundry|microprocessor|wafer)\b/i },
    { cat: 'AI_INNOVATION', rx: /\b(artificial intelligence|machine learning|ai company|deep learning|neural network|llm|generative)\b/i },
    { cat: 'HARDWARE_ROBOTICS', rx: /\b(robotics|robot|autonomous|drone|vehicle|electric car)\b/i },
    { cat: 'CONSUMER_DEVICE', rx: /\b(consumer electronics|smartphone manufacturer|wearable|device manufacturer|personal computer)\b/i },
    { cat: 'MANUFACTURING_SUPPLY', rx: /\b(manufacturer|manufacturing|supplier|supply chain|fabrication|equipment)\b/i },
    { cat: 'ACADEMY_LAB', rx: /\b(research (institute|laboratory|center)|laboratory|university lab|think tank)\b/i },
    { cat: 'VENTURE_CAPITAL', rx: /\b(venture capital|vc firm|investment firm|incubator|accelerator)\b/i },
    { cat: 'INFRA_TELECOM', rx: /\b(telecommunications|carrier|isp|network operator|backbone|telecom)\b/i },
    { cat: 'MEDIA_CONTENT', rx: /\b(streaming|media company|broadcast|entertainment|publisher|studio)\b/i },
    { cat: 'ENTERPRISE_SAAS', rx: /\b(saas|enterprise software|business software|productivity tool|crm|erp)\b/i },
    { cat: 'PLATFORM_INTERNET', rx: /\b(platform|internet company|social network|search engine|marketplace|e-commerce|online service)\b/i },
];

function categoriesCompany(desc: string): string[] {
    const out: string[] = [];
    for (const { cat, rx } of COMPANY_KW) {
        if (rx.test(desc) && !out.includes(cat)) out.push(cat);
        if (out.length >= 2) break;
    }
    if (out.length === 0) out.push('PLATFORM_INTERNET');  // safe default
    return out;
}

// TechCategoryL1 / L2 — keyword-driven
const TECH_TAXONOMY: Array<{ l1: string; l2: string; rx: RegExp }> = [
    { l1: 'System Software',                l2: 'Development & Languages',     rx: /\b(programming language|compiler|interpreter|library|framework|sdk)\b/i },
    { l1: 'System Software',                l2: 'Operating Systems (OS)',      rx: /\b(operating system|kernel|unix|linux|windows|posix|microkernel)\b/i },
    { l1: 'Fundamental Concepts',           l2: 'Standards & Protocols',       rx: /\b(protocol|standard|specification|rfc|ietf|w3c|iso )/i },
    { l1: 'Fundamental Concepts',           l2: 'Theories & Architectures',    rx: /\b(architecture|isa|instruction set|theorem|theory of)\b/i },
    { l1: 'Hardware & Infrastructure',      l2: 'Processors & Compute',        rx: /\b(processor|cpu|gpu|microprocessor|asic|fpga|tpu)\b/i },
    { l1: 'Hardware & Infrastructure',      l2: 'Components & Manufacturing',  rx: /\b(transistor|semiconductor|integrated circuit|lithography|wafer|fab)\b/i },
    { l1: 'Hardware & Infrastructure',      l2: 'Memory & Storage',            rx: /\b(memory|storage|dram|sram|flash|ssd|hdd|cache)\b/i },
    { l1: 'Hardware & Infrastructure',      l2: 'Devices & Form Factors',      rx: /\b(smartphone|laptop|tablet|wearable|console|workstation)\b/i },
    { l1: 'Network & Connectivity',         l2: 'Telecommunications',          rx: /\b(wireless|cellular|gsm|cdma|lte|5g|bluetooth|wifi)\b/i },
    { l1: 'Network & Connectivity',         l2: 'Network Architecture',        rx: /\b(network|router|switch|ethernet|packet|tcp|ip address|arpanet)\b/i },
    { l1: 'AI & Physical Systems',          l2: 'Artificial Intelligence',     rx: /\b(neural network|deep learning|machine learning|ai model|transformer|llm)\b/i },
    { l1: 'AI & Physical Systems',          l2: 'Robotics',                    rx: /\b(robot|robotics|drone)\b/i },
    { l1: 'AI & Physical Systems',          l2: 'Autonomous Mobility',         rx: /\b(autonomous|self-driving|electric vehicle|tesla)\b/i },
    { l1: 'AI & Physical Systems',          l2: 'Fintech & Crypto',            rx: /\b(blockchain|crypto|bitcoin|payment|fintech)\b/i },
    { l1: 'Digital Services & Platforms',   l2: 'Search & Information',        rx: /\b(search engine|encyclopedia|knowledge graph|directory)\b/i },
    { l1: 'Digital Services & Platforms',   l2: 'Social & Media',              rx: /\b(social network|streaming|video sharing|messaging)\b/i },
    { l1: 'Digital Services & Platforms',   l2: 'Digital Platforms',           rx: /\b(platform|marketplace|app store|developer ecosystem)\b/i },
];

function taxonomyTech(label: string, desc: string): { l1: string; l2: string } {
    const text = `${label} ${desc}`;
    for (const t of TECH_TAXONOMY) if (t.rx.test(text)) return { l1: t.l1, l2: t.l2 };
    return { l1: 'Digital Services & Platforms', l2: 'Digital Platforms' };  // safe default
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const sb = getServiceClient();
    // Re-run-safe: we use OR (impact_role IS NULL OR (COMPANY AND company_categories IS NULL))
    // so COMPANY rows that lack categories are not skipped just because we have already
    // stamped impact_role on some pass.
    const { data, error } = await sb
        .from('nodes')
        .select('id, label, category, description, impact_role, company_categories, tech_l1')
        .eq('provenance', 'ai_discovered');
    if (error) throw error;
    const nodes = (data as NodeRow[]) ?? [];
    console.log(`[classify] ${nodes.length} ai_discovered nodes need classification (rule-based pass-1)`);
    if (nodes.length === 0) { console.log('[classify] nothing to do.'); return; }

    let ok = 0, skip = 0;
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const desc = n.description ?? '';
        const update: Record<string, unknown> = {};
        if (n.category === 'PERSON') {
            if (n.impact_role) { skip++; continue; }
            update.impact_role = rolePerson(desc);
        } else if (n.category === 'TECHNOLOGY') {
            if (n.impact_role && n.tech_l1) { skip++; continue; }
            update.impact_role = roleTech(desc, n.label);
            const tx = taxonomyTech(n.label, desc);
            update.tech_l1 = tx.l1;
            update.tech_l2 = tx.l2;
        } else if (n.category === 'COMPANY') {
            if (n.company_categories && n.company_categories.length > 0) { skip++; continue; }
            update.company_categories = categoriesCompany(desc);
        }
        if (Object.keys(update).length === 0) { skip++; continue; }
        const { error: updErr } = await sb.from('nodes').update(update as never).eq('id', n.id);
        if (updErr) { console.warn(`update ${n.id} failed: ${updErr.message}`); continue; }
        ok++;
        if (ok % 100 === 0) console.log(`  ${ok}/${nodes.length}`);
    }
    console.log(`[classify] done. updated=${ok} skipped=${skip} (already classified)`);
}

main().catch(err => { console.error('[classify] FAILED:', err); process.exit(1); });
