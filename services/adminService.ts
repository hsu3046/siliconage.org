/// <reference types="vite/client" />
/**
 * adminService.ts — thin client for the password-protected /admin Edge Function.
 *
 * The service-role key is NEVER in the client bundle. We only send a password
 * header to the Edge Function, which holds the key as a Supabase secret. The
 * password itself is kept in sessionStorage so a page refresh remembers it,
 * but a closed tab forgets — explicit logout is also available.
 */

const PW_KEY = 'silicon_age_admin_pw';

function getEndpoint(action: string): string | null {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!url) return null;
    return `${url.replace(/\/$/, '')}/functions/v1/admin`;
}

function getAnonKey(): string | null {
    return (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? null;
}

export function getAdminPassword(): string | null {
    try { return sessionStorage.getItem(PW_KEY); } catch { return null; }
}
export function setAdminPassword(pw: string): void {
    try { sessionStorage.setItem(PW_KEY, pw); } catch { /* ignore */ }
}
export function clearAdminPassword(): void {
    try { sessionStorage.removeItem(PW_KEY); } catch { /* ignore */ }
}

export interface AdminResult<T = unknown> {
    status: 'ok' | 'unauthorized' | 'error';
    data?: T;
    error?: string;
}

async function call<T>(action: string, payload?: Record<string, unknown>): Promise<AdminResult<T>> {
    const endpoint = getEndpoint(action);
    const anon = getAnonKey();
    const pw = getAdminPassword();
    if (!endpoint || !anon) return { status: 'error', error: 'Supabase env vars missing' };
    if (!pw) return { status: 'unauthorized', error: 'no admin password set' };

    let res: Response;
    try {
        res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': anon,
                'Authorization': `Bearer ${anon}`,
                'x-admin-password': pw,
            },
            body: JSON.stringify({ action, ...(payload ?? {}) }),
        });
    } catch (err) {
        return { status: 'error', error: err instanceof Error ? err.message : 'network error' };
    }

    let body: Record<string, unknown> = {};
    try { body = await res.json(); } catch { return { status: 'error', error: `bad JSON (HTTP ${res.status})` }; }

    if (res.status === 401) return { status: 'unauthorized', error: String(body.error ?? 'unauthorized') };
    if (!res.ok) return { status: 'error', error: String(body.error ?? `HTTP ${res.status}`) };
    return { status: 'ok', data: body as T };
}

// ─── Typed helpers per action ─────────────────────────────────────────────

export interface PendingNode {
    id: string;
    label: string;
    category: 'COMPANY' | 'PERSON' | 'TECHNOLOGY';
    year: number;
    description: string | null;
    impact_role: string | null;
    tech_l1: string | null;
    tech_l2: string | null;
    company_categories: string[] | null;
    relevance_score: number | null;
    sitelinks_count: number | null;
    wikidata_qid: string | null;
    discovered_from: string | null;
    discovery_depth: number | null;
    wikipedia_urls: Record<string, string> | null;
}

export interface AdminStats {
    pending: number;
    approved: number;
    excluded: number;
    qa_cache: number;
    embedded: number;
    missing_embed: number;
}

export const listPending = () => call<{ rows: PendingNode[] }>('list_pending');
export const adminStats = () => call<AdminStats>('stats');
export const approveNodes = (ids: string[]) => call<{ approved_nodes: number; approved_links: number }>('approve', { ids });
export const rejectNodes = (ids: string[]) => call<{ deleted_nodes: number; excluded_qids: number }>('reject', { ids });
