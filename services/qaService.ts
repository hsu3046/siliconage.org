/// <reference types="vite/client" />
/**
 * qaService.ts — client wrapper around the Phase 3 Graph-RAG QA Edge Function.
 *
 * Behavior:
 *   - Generates a stable anonymous UUID and stores it in localStorage.
 *   - POSTs to /functions/v1/qa with { query, locale, anon_id }.
 *   - If the user has a BYOK Gemini key (getApiKey() in geminiService),
 *     it is sent in the `x-byok-gemini-key` header and the Edge Function
 *     bypasses the daily quota.
 *   - Returns { status: 'ok' | 'quota_exceeded' | 'error', answer, source_node_ids, cached }
 */

import { getApiKey } from './geminiService';

const ANON_ID_KEY = 'silicon_age_anon_id';

export type Locale = 'en' | 'ko' | 'ja';

export interface QAResult {
    status: 'ok' | 'quota_exceeded' | 'error';
    answer?: string;
    source_node_ids?: string[];
    cached?: boolean;
    daily_used?: number;
    daily_limit?: number;
    message?: string;
    error?: string;
}

function uuid(): string {
    // Browser crypto.randomUUID is widely available since 2022.
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback: timestamp + random
    return `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnonId(): string {
    try {
        let id = localStorage.getItem(ANON_ID_KEY);
        if (!id) {
            id = uuid();
            localStorage.setItem(ANON_ID_KEY, id);
        }
        return id;
    } catch {
        return 'anonymous';
    }
}

function getQaEndpoint(): string | null {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!url) return null;
    return `${url.replace(/\/$/, '')}/functions/v1/qa`;
}

function getAnonKey(): string | null {
    return (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? null;
}

export async function askGraphRag(query: string, locale: Locale = 'en'): Promise<QAResult> {
    const endpoint = getQaEndpoint();
    const anonKey = getAnonKey();
    if (!endpoint || !anonKey) {
        return { status: 'error', error: 'Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)' };
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
    };
    const byok = getApiKey();
    if (byok && byok.trim().length > 10) {
        headers['x-byok-gemini-key'] = byok.trim();
    }

    let res: Response;
    try {
        res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, locale, anon_id: getAnonId() }),
        });
    } catch (err) {
        return { status: 'error', error: err instanceof Error ? err.message : 'network error' };
    }

    let body: Record<string, unknown> = {};
    try {
        body = await res.json();
    } catch {
        return { status: 'error', error: `bad JSON response (HTTP ${res.status})` };
    }

    if (res.status === 429 && body.status === 'quota_exceeded') {
        return {
            status: 'quota_exceeded',
            daily_used: typeof body.daily_used === 'number' ? body.daily_used : undefined,
            daily_limit: typeof body.daily_limit === 'number' ? body.daily_limit : undefined,
            message: typeof body.message === 'string' ? body.message : undefined,
        };
    }
    if (!res.ok) {
        return { status: 'error', error: String(body.error ?? `HTTP ${res.status}`) };
    }

    return {
        status: 'ok',
        answer: typeof body.answer === 'string' ? body.answer : undefined,
        source_node_ids: Array.isArray(body.source_node_ids) ? (body.source_node_ids as string[]) : [],
        cached: Boolean(body.cached),
    };
}

/** Convenience helper for the UI: clears the anon id (e.g. "reset my daily quota") */
export function resetAnonId(): void {
    try {
        localStorage.removeItem(ANON_ID_KEY);
    } catch {
        /* ignore */
    }
}
