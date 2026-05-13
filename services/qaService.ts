/// <reference types="vite/client" />
/**
 * qaService.ts — client wrapper around the Graph-RAG QA Edge Function.
 *
 * BYOK-only, same key as the Deep Dive flow. The user pastes a Gemini key in
 * About → API Key Settings (stored in localStorage as silicon_age_api_key),
 * and every QA call forwards that key in the x-byok-gemini-key header. With
 * no key the call short-circuits to status='no_key' so the UI can prompt.
 */

import { getApiKey } from './geminiService';

export type Locale = 'en' | 'ko' | 'ja';

export interface QAResult {
    status: 'ok' | 'no_key' | 'error';
    answer?: string;
    source_node_ids?: string[];
    cached?: boolean;
    message?: string;
    error?: string;
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

    // Short-circuit: no key at all → tell the UI to prompt without bothering
    // the Edge Function.
    const byok = getApiKey()?.trim() ?? '';
    if (byok.length < 10) {
        return {
            status: 'no_key',
            message: 'Gemini API key required. Add one in About → API Key Settings.',
        };
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'x-byok-gemini-key': byok,
    };

    let res: Response;
    try {
        res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, locale }),
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

    // Server may also say "no_key" (e.g. header was stripped en route).
    if (res.status === 401 && body.status === 'no_key') {
        return {
            status: 'no_key',
            message: typeof body.message === 'string' ? body.message : 'Gemini API key required.',
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
