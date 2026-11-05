/**
 * jevClient.ts — minimal client for TypeSafe Jev (decision-only model) via
 * OpenRouter's decisions endpoint. Node-side only (scripts/*): the key is a
 * server secret and must never reach the browser bundle.
 *
 * Ported from aib.vote (knowai-space src/lib/jev/decisions.ts). Lessons that
 * carry over verbatim:
 *   - Endpoint is POST https://openrouter.ai/api/alpha/decisions — NOT
 *     chat/completions, and adding /v1 returns 404.
 *   - Pin the version id. `jev-latest` silently moves under calibrated
 *     thresholds. The response echoes a dated id — log it.
 *   - Choice questions have strong position bias (first option wins far more
 *     often). Shuffle options every call; keep catch-all options last.
 *   - Jev cannot count, compare dates or do arithmetic — do that in code.
 *   - It never abstains. Thresholds must be calibrated on our own labels.
 *   - Items in the same batch sway each other a little; keep batches small and
 *     homogeneous (same category) when the verdict matters.
 */

export const JEV_MODEL = process.env.JEV_MODEL ?? 'typesafe/jev-1.13';
const ENDPOINT = 'https://openrouter.ai/api/alpha/decisions';

export type JevQuestion =
    | { type: 'noul'; instructions: string }
    | { type: 'choice'; instructions: string; criteria: Record<string, string> }
    | { type: 'score'; instructions: string; criteria: string[] };

export type JevAnswer =
    | { type: 'noul'; noul: number }
    | { type: 'choice'; choice: string; probabilities: Record<string, number>; confidence: number }
    | { type: 'score'; score: number; legend: Record<string, string>; probabilities: Record<string, number>; confidence: number };

export interface JevResponse {
    model: string;
    answers: Record<string, JevAnswer>;
    usage?: { input_tokens?: number; output_tokens?: number; cost?: number };
}

export class JevError extends Error {
    constructor(message: string, readonly status?: number) {
        super(message);
        this.name = 'JevError';
    }
}

/** Fisher–Yates shuffle that keeps `pinLast` keys at the end (position-bias guard). */
export function shuffledCriteria(
    criteria: Record<string, string>,
    pinLast: string[] = [],
): Record<string, string> {
    const keys = Object.keys(criteria).filter(k => !pinLast.includes(k));
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    const out: Record<string, string> = {};
    for (const k of keys) out[k] = criteria[k];
    for (const k of pinLast) if (k in criteria) out[k] = criteria[k];
    return out;
}

export async function jevDecide(
    state: unknown,
    questions: Record<string, JevQuestion>,
    opts: { apiKey?: string; model?: string; timeoutMs?: number; retries?: number } = {},
): Promise<JevResponse> {
    const apiKey = opts.apiKey ?? process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new JevError('OPENROUTER_API_KEY is not set');
    const body = JSON.stringify({ model: opts.model ?? JEV_MODEL, state, questions });
    const retries = opts.retries ?? 3;

    for (let attempt = 1; attempt <= retries; attempt++) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 30_000);
        try {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'X-Title': 'The Silicon Age',
                    'HTTP-Referer': 'https://siliconage.org',
                },
                body,
                signal: ctrl.signal,
            });
            if (res.ok) return (await res.json()) as JevResponse;
            const text = await res.text();
            const transient = res.status === 429 || res.status >= 500;
            if (!transient || attempt === retries) {
                throw new JevError(`jev ${res.status}: ${text.slice(0, 300)}`, res.status);
            }
        } catch (err) {
            if (err instanceof JevError) throw err;
            if (attempt === retries) throw new JevError(`jev request failed: ${String(err)}`);
        } finally {
            clearTimeout(timer);
        }
        await new Promise(r => setTimeout(r, 1500 * 2 ** (attempt - 1)));
    }
    throw new JevError('jev: exhausted retries');
}

export function noulOf(res: JevResponse, key: string): number | null {
    const a = res.answers[key];
    return a && a.type === 'noul' && Number.isFinite(a.noul) ? a.noul : null;
}

export function choiceOf(res: JevResponse, key: string): { choice: string; confidence: number; probabilities: Record<string, number> } | null {
    const a = res.answers[key];
    if (!a || a.type !== 'choice') return null;
    return { choice: a.choice, confidence: a.confidence, probabilities: a.probabilities };
}
