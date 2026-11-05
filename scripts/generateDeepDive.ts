/**
 * generateDeepDive.ts — pre-generated AI Deep Dives for every node × locale.
 *
 * Why: the Deep Dive used to need the visitor's own Gemini key (BYOK). Most
 * visitors never paste one, so they saw "API key not configured". This script
 * generates the Deep Dive once, offline, for every node in en/ko/ja and writes
 *   public/deepdive/<locale>/<id>.json
 * which the app fetches lazily (one small file per opened node — nothing is
 * added to the JS bundle) and the prerender step embeds in static pages.
 *
 * Quality gate (TypeSafe Jev, optional but recommended):
 *   Gemini writes from the node's curated description + its graph connections.
 *   Jev then judges, as calibrated probabilities:
 *     - summary / significance consistent with the curated reference?
 *     - each key fact: contradicted by the reference, or a vague non-fact?
 *   Contradicted / vague facts are dropped; an inconsistent summary triggers
 *   one rewrite with a hint, and a second failure skips the file (the live
 *   BYOK path still works for that node). Jev cannot see the open web — this
 *   is a consistency check against our curated graph, not a full fact-check,
 *   so the prompt also tells Gemini to avoid precise figures it is unsure of.
 *
 * Incremental: each file stores a hash of its source context; unchanged nodes
 * are skipped, edited nodes regenerate. --force regenerates everything.
 *
 * Usage:
 *   npm run deepdive -- --only openai,transistor --locale ko   # try a few
 *   npm run deepdive                                         # all missing/stale
 *   npm run deepdive -- --no-check                           # skip Jev (not recommended)
 *
 * Env: GEMINI_API_KEY (or VITE_GOOGLE_API_KEY), OPENROUTER_API_KEY (Jev).
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { GRAPH_DATA as INITIAL_DATA } from '../data/graphData';
import type { NodeData, LinkData } from '../types';
import { jevDecide, noulOf, type JevQuestion } from '../services/jevClient';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'deepdive');

type Locale = 'en' | 'ko' | 'ja';
const LANG: Record<Locale, string> = { en: 'English', ko: 'Korean', ja: 'Japanese' };

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(`--${n}`);
const opt = (n: string): string | undefined => {
    const i = argv.indexOf(`--${n}`);
    return i >= 0 ? argv[i + 1] : undefined;
};
const FORCE = flag('force');
const CHECK = !flag('no-check');
const ONLY = opt('only')?.split(',').map(s => s.trim()).filter(Boolean);
const LOCALES: Locale[] = (opt('locale')?.split(',') as Locale[] | undefined) ?? ['en', 'ko', 'ja'];
const CONCURRENCY = Math.max(1, Number(opt('concurrency') ?? 4));
const MODEL = process.env.DEEPDIVE_MODEL ?? 'gemini-3.1-flash-lite';
// Calibrate on a sample before tightening/loosening (Jev never abstains).
const SUMMARY_MIN = Number(opt('summary-min') ?? 0.5);
const FACT_MIN = Number(opt('fact-min') ?? 0.5);

const GEMINI_KEY = process.env.GEMINI_API_KEY ?? process.env.VITE_GOOGLE_API_KEY;
if (!GEMINI_KEY) {
    console.error('GEMINI_API_KEY (or VITE_GOOGLE_API_KEY) is required.');
    process.exit(1);
}
if (CHECK && !process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is required for the Jev check (or pass --no-check).');
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
type NodeTr = Record<string, { label?: string; description?: string }>;
const tr: Record<Locale, NodeTr> = { en: {}, ko: {}, ja: {} };
for (const l of ['ko', 'ja'] as const) {
    try { tr[l] = JSON.parse(fs.readFileSync(path.join(ROOT, 'locales', l, 'nodes.json'), 'utf-8')); } catch { /* none */ }
}
const byId = new Map(INITIAL_DATA.nodes.map(n => [n.id, n]));
const endId = (e: LinkData['source']) => (typeof e === 'string' ? e : e.id);

function referenceFor(n: NodeData): string {
    const conns = INITIAL_DATA.links
        .filter(l => endId(l.source) === n.id || endId(l.target) === n.id)
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 14)
        .map(l => {
            const s = byId.get(endId(l.source))?.label ?? endId(l.source);
            const t = byId.get(endId(l.target))?.label ?? endId(l.target);
            const yrs = l.startYear ? ` (${l.startYear}${l.endYear ? `–${l.endYear}` : ''})` : '';
            return `- ${s} —${l.type}→ ${t}${yrs}${l.story ? `: ${l.story}` : ''}`;
        });
    return [
        `Entity: ${n.label}`,
        `Category: ${n.category}`,
        `Year: ${n.year}${n.endYear ? `–${n.endYear}` : ''}`,
        n.birthYear ? `Born: ${n.birthYear}${n.deathYear ? `, died ${n.deathYear}` : ''}` : '',
        n.primaryRole ? `Role: ${n.primaryRole}` : '',
        n.impactRole ? `Impact role: ${n.impactRole}` : '',
        n.techCategoryL2 ? `Field: ${n.techCategoryL1} / ${n.techCategoryL2}` : '',
        `Curated description: ${n.description}`,
        conns.length ? `Curated connections in the graph:\n${conns.join('\n')}` : '',
    ].filter(Boolean).join('\n');
}

interface DeepDive { summary: string; significance: string; keyFacts: string[] }

async function generate(n: NodeData, loc: Locale, reference: string, hint?: string): Promise<DeepDive> {
    const localName = tr[loc][n.id]?.label;
    const prompt = `You are an expert technology historian writing for "The Silicon Age", an interactive map of 100 years of digital history.
Write entirely in ${LANG[loc]}.${localName ? ` Refer to the entity as "${localName}".` : ''}

REFERENCE (curated by our editors — treat as ground truth, never contradict it):
${reference}

Write:
- summary: 2 sentences on what it is.
- significance: one paragraph on why it matters in the chain of cause and effect from transistors to AI. Mention the connected entities above where relevant.
- keyFacts: 3-5 specific, well-established facts. Prefer facts you are certain of; avoid precise numbers, dates or quotes unless they are widely documented. No speculation about events after your knowledge.
${hint ? `\nA reviewer flagged the previous draft: ${hint}. Fix that.` : ''}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await ai.models.generateContent({
                model: MODEL,
                contents: prompt,
                config: {
                    temperature: 0.4,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            significance: { type: Type.STRING },
                            keyFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['summary', 'significance', 'keyFacts'],
                    },
                },
            });
            const parsed = JSON.parse(res.text ?? '') as DeepDive;
            if (!parsed.summary || !parsed.significance || !Array.isArray(parsed.keyFacts)) throw new Error('incomplete JSON');
            return { summary: parsed.summary.trim(), significance: parsed.significance.trim(), keyFacts: parsed.keyFacts.map(f => String(f).trim()).filter(Boolean).slice(0, 5) };
        } catch (err) {
            if (attempt === 3) throw err;
            await new Promise(r => setTimeout(r, 2000 * attempt));
        }
    }
    throw new Error('unreachable');
}

interface CheckResult { summaryOk: number; significanceOk: number; facts: Array<{ text: string; ok: number }> }

async function check(reference: string, d: DeepDive): Promise<CheckResult> {
    const questions: Record<string, JevQuestion> = {
        summary_ok: { type: 'noul', instructions: 'Is draft.summary consistent with the reference (no contradiction of names, dates, roles or relationships in the reference)?' },
        significance_ok: { type: 'noul', instructions: 'Is draft.significance consistent with the reference and free of claims the reference contradicts?' },
    };
    d.keyFacts.forEach((_, i) => {
        questions[`fact${i}_ok`] = {
            type: 'noul',
            instructions: `Is draft.keyFacts[${i}] a concrete, specific historical fact that does NOT contradict the reference? False if it contradicts the reference, is vague filler, is opinion, or is speculation.`,
        };
    });
    const res = await jevDecide({ reference, draft: d }, questions);
    return {
        summaryOk: noulOf(res, 'summary_ok') ?? 0,
        significanceOk: noulOf(res, 'significance_ok') ?? 0,
        facts: d.keyFacts.map((text, i) => ({ text, ok: noulOf(res, `fact${i}_ok`) ?? 0 })),
    };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const stats = { written: 0, skipped: 0, rejected: 0, failed: 0, factsDropped: 0 };

async function processOne(n: NodeData, loc: Locale) {
    const reference = referenceFor(n);
    const sourceHash = crypto.createHash('sha1').update(`${MODEL}|${loc}|${reference}`).digest('hex').slice(0, 16);
    const file = path.join(OUT, loc, `${n.id}.json`);
    if (!FORCE && fs.existsSync(file)) {
        try {
            if (JSON.parse(fs.readFileSync(file, 'utf-8')).sourceHash === sourceHash) { stats.skipped++; return; }
        } catch { /* regenerate */ }
    }

    let draft = await generate(n, loc, reference);
    let verdict: CheckResult | null = null;
    if (CHECK) {
        verdict = await check(reference, draft);
        if (verdict.summaryOk < SUMMARY_MIN || verdict.significanceOk < SUMMARY_MIN) {
            const which = verdict.summaryOk < SUMMARY_MIN ? 'summary' : 'significance';
            draft = await generate(n, loc, reference, `the ${which} contradicts or drifts from the reference`);
            verdict = await check(reference, draft);
            if (verdict.summaryOk < SUMMARY_MIN || verdict.significanceOk < SUMMARY_MIN) {
                stats.rejected++;
                console.warn(`  ✗ ${loc}/${n.id}: rejected after rewrite (summary=${verdict.summaryOk.toFixed(2)}, significance=${verdict.significanceOk.toFixed(2)})`);
                // The node changed (or --force) and the new text failed the
                // check: do not keep serving the outdated file.
                if (fs.existsSync(file)) { fs.unlinkSync(file); console.warn(`    removed stale ${loc}/${n.id}.json`); }
                return;
            }
        }
        const kept = verdict.facts.filter(f => f.ok >= FACT_MIN).map(f => f.text);
        stats.factsDropped += draft.keyFacts.length - kept.length;
        draft = { ...draft, keyFacts: kept };
    }

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify({
        ...draft,
        entity: n.id,
        locale: loc,
        model: MODEL,
        generatedAt: new Date().toISOString(),
        sourceHash,
        ...(verdict ? {
            check: {
                by: process.env.JEV_MODEL ?? 'typesafe/jev-1.13',
                summary: Number(verdict.summaryOk.toFixed(3)),
                significance: Number(verdict.significanceOk.toFixed(3)),
                factsKept: draft.keyFacts.length,
                factsTotal: verdict.facts.length,
            },
        } : {}),
    }, null, 1)}\n`);
    stats.written++;
}

async function main() {
    const nodes = INITIAL_DATA.nodes.filter(n => !ONLY || ONLY.includes(n.id));
    const jobs = nodes.flatMap(n => LOCALES.map(loc => ({ n, loc })));
    console.log(`[deepdive] ${jobs.length} jobs (${nodes.length} nodes × ${LOCALES.join('/')}) model=${MODEL} check=${CHECK}`);

    let next = 0;
    const worker = async () => {
        while (next < jobs.length) {
            const { n, loc } = jobs[next++];
            try {
                await processOne(n, loc);
            } catch (err) {
                stats.failed++;
                console.warn(`  ! ${loc}/${n.id}: ${(err as Error).message.slice(0, 200)}`);
            }
            const done = stats.written + stats.skipped + stats.rejected + stats.failed;
            if (done % 25 === 0) console.log(`[deepdive] ${done}/${jobs.length}`);
        }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    console.log(`[deepdive] written=${stats.written} skipped(unchanged)=${stats.skipped} rejected=${stats.rejected} failed=${stats.failed} factsDropped=${stats.factsDropped}`);
}

main().catch(err => { console.error('[deepdive] FAILED:', err); process.exit(1); });
