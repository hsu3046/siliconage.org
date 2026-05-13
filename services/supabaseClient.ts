/// <reference types="vite/client" />
/**
 * Supabase client wrappers.
 *
 * - `supabase`           : browser/anon client. RLS-enforced. SELECT approved rows + qa_cache/rate_limits writes only.
 * - `getServiceClient()` : Node-side scripts only. service_role bypasses RLS. Never imported from src/components/.
 *
 * Phase 0 keeps both lazy so the bundle does not import @supabase/supabase-js when env vars are absent
 * (so the site keeps working as a static SPA against constants.ts until Phase 6 transition).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// `import.meta.env` is defined by Vite at build time. Accessing it at module
// top level breaks Node-side scripts (tsx), so wrap the read in a function.
function readPublicEnv(): { url?: string; anonKey?: string } {
    try {
        const env = (import.meta as { env?: Record<string, string | undefined> }).env;
        if (env) return { url: env.VITE_SUPABASE_URL, anonKey: env.VITE_SUPABASE_ANON_KEY };
    } catch {
        // import.meta not available — fall through to process.env
    }
    return { url: process.env.VITE_SUPABASE_URL, anonKey: process.env.VITE_SUPABASE_ANON_KEY };
}

// Dev-only admin key. The leading `if (!import.meta.env.DEV) return undefined;`
// lets Vite's esbuild constant-fold the whole function to a no-op in prod
// builds, so the service-role key string is never inlined into the prod bundle
// even if VITE_SUPABASE_SERVICE_ROLE_KEY is set in the deploy environment.
function readDevAdminKey(): string | undefined {
    if (!import.meta.env.DEV) return undefined;
    try {
        const env = (import.meta as { env?: Record<string, string | undefined> }).env;
        if (env?.VITE_SUPABASE_SERVICE_ROLE_KEY) return env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    } catch { /* ignore */ }
    return undefined;
}

let browserClient: SupabaseClient | null = null;
let devAdminClient: SupabaseClient | null = null;

/**
 * Admin client for the local /admin dashboard. Returns null in production
 * builds and whenever VITE_SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.
 * The service-role key bypasses RLS so this MUST never reach the prod bundle.
 */
export function getDevAdminClient(): SupabaseClient | null {
    const { url } = readPublicEnv();
    const key = readDevAdminKey();
    if (!url || !key) return null;
    if (devAdminClient) return devAdminClient;
    devAdminClient = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return devAdminClient;
}

export function isAdminAvailable(): boolean {
    return getDevAdminClient() !== null;
}

export function getSupabase(): SupabaseClient | null {
    const { url, anonKey } = readPublicEnv();
    if (!url || !anonKey) return null;
    if (browserClient) return browserClient;
    browserClient = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return browserClient;
}

export function isSupabaseConfigured(): boolean {
    const { url, anonKey } = readPublicEnv();
    return Boolean(url && anonKey);
}

/**
 * Node-only service-role client. Reads SUPABASE_SERVICE_ROLE_KEY from process.env.
 * Import path remains the same module so types stay consistent; the function throws
 * if accidentally called in the browser.
 */
export function getServiceClient(): SupabaseClient {
    if (typeof window !== 'undefined') {
        throw new Error('[supabaseClient] getServiceClient() must not be called from the browser');
    }
    const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('[supabaseClient] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for scripts');
    }
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        db: { schema: 'public' },
    });
}
