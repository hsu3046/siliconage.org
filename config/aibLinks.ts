/**
 * aib vote cross-links — "history → present" bridge.
 *
 * The Silicon Age explains *why* the AI era happened; aib vote (aib.vote)
 * tracks *what is happening now*: model rankings, prices, news. For AI-era
 * nodes the DetailPanel shows a "Now on aib vote" block built from this file.
 *
 * Lab slugs are `pricing_services.slug` on aib vote (verified 2026-11-05 against
 * active models). Only add a slug that has an /labs/<slug> page — a wrong slug
 * is a 404 on a partner site. Korean is aib vote's default locale (no prefix);
 * ja/en are path-prefixed. Always use the www host (non-www 308s).
 */

import { Category, CompanyCategory, NodeData } from '../types';
import type { SupportedLocale } from './externalLinks';

export const AIB_BASE_URL = 'https://www.aib.vote';

interface AibTarget {
    /** pricing_services.slug → /labs/<slug> */
    lab?: string;
    /** news keyword (stored lowercase on aib vote) */
    keyword?: string;
}

/** Silicon Age node id → aib vote target. */
export const AIB_NODE_MAP: Record<string, AibTarget> = {
    // Companies
    openai: { lab: 'openai', keyword: 'openai' },
    anthropic: { lab: 'anthropic', keyword: 'anthropic' },
    google: { lab: 'google', keyword: 'google' },
    deepmind: { lab: 'google', keyword: 'deepmind' },
    meta: { lab: 'meta', keyword: 'meta' },
    microsoft: { lab: 'microsoft', keyword: 'microsoft' },
    nvidia: { lab: 'nvidia', keyword: 'nvidia' },
    alibaba: { lab: 'alibaba', keyword: 'alibaba' },
    bytedance: { lab: 'bytedance', keyword: 'bytedance' },
    tencent: { lab: 'tencent', keyword: 'tencent' },
    amazon: { lab: 'amazon', keyword: 'amazon' },
    ibm: { lab: 'ibm', keyword: 'ibm' },
    huggingface: { keyword: 'hugging face' },
    // AI products → the lab that ships them today
    chatgpt: { lab: 'openai', keyword: 'chatgpt' },
    sora: { lab: 'openai', keyword: 'sora' },
    gemini: { lab: 'google', keyword: 'gemini' },
    nano_banana: { lab: 'google', keyword: 'nano banana' },
    claude: { lab: 'anthropic', keyword: 'claude' },
    perplexity: { lab: 'perplexity', keyword: 'perplexity' },
    midjourney: { lab: 'midjourney', keyword: 'midjourney' },
    copilot: { lab: 'microsoft', keyword: 'copilot' },
    cursor: { keyword: 'cursor' },
    stable_diffusion: { keyword: 'stable diffusion' },
    transformer: { keyword: 'transformer' },
    nvidia_h100: { lab: 'nvidia', keyword: 'nvidia' },
};

function isAiEra(node: NodeData): boolean {
    if (AIB_NODE_MAP[node.id] || aibModelSlug(node)) return true;
    if (node.category === Category.COMPANY) {
        return (node.companyCategories ?? []).includes(CompanyCategory.AI_INNOVATION);
    }
    if (node.category === Category.TECHNOLOGY) {
        return node.techCategoryL2 === 'Artificial Intelligence' && node.year >= 2012;
    }
    return false;
}

function withUtm(path: string, locale: SupportedLocale, content: string): string {
    const prefix = locale === 'ko' ? '' : `/${locale}`;
    const url = new URL(`${AIB_BASE_URL}${prefix}${path}`);
    url.searchParams.set('utm_source', 'siliconage');
    url.searchParams.set('utm_medium', 'referral');
    url.searchParams.set('utm_campaign', 'detail_panel');
    url.searchParams.set('utm_content', content);
    return url.toString();
}

export type AibLinkKind = 'model' | 'lab' | 'news' | 'ranking';

/** Model slug for nodes imported from aib vote (scripts/importFromAib.ts stores the model URL). */
function aibModelSlug(node: NodeData): string | null {
    for (const l of node.externalLinks ?? []) {
        const m = /^https:\/\/www\.aib\.vote\/(?:(?:en|ja|ko)\/)?models\/([a-z0-9._-]+)\/?$/i.exec(l.url);
        if (m) return m[1];
    }
    return null;
}

export interface AibLink {
    kind: AibLinkKind;
    url: string;
}

/** Links for the "Now on aib vote" block. Empty for pre-AI-era nodes. */
export function getAibLinks(node: NodeData, locale: SupportedLocale): AibLink[] {
    if (!isAiEra(node)) return [];
    const target = AIB_NODE_MAP[node.id] ?? {};
    const links: AibLink[] = [];
    const modelSlug = aibModelSlug(node);
    if (modelSlug) {
        links.push({ kind: 'model', url: withUtm(`/models/${modelSlug}`, locale, node.id) });
    } else if (target.lab) {
        links.push({ kind: 'lab', url: withUtm(`/labs/${target.lab}`, locale, node.id) });
    } else {
        links.push({ kind: 'ranking', url: withUtm('/models', locale, node.id) });
    }
    // Only explicit keywords: the panel receives translated labels, and a
    // Korean label rarely matches aib vote's (English, lowercase) keywords.
    if (target.keyword) {
        const keyword = target.keyword.toLowerCase();
        links.push({ kind: 'news', url: withUtm(`/news?keyword=${encodeURIComponent(keyword)}`, locale, node.id) });
    }
    return links;
}

/**
 * Rewrite an absolute aib vote URL to the viewer's locale and add UTM tags
 * (ko = unprefixed, ja/en = path prefix). Non-aib URLs are returned untouched.
 */
export function localizeAibUrl(url: string, locale: SupportedLocale, campaign: string): string {
    const m = /^https:\/\/www\.aib\.vote(?:\/(?:en|ja|ko))?(\/[^?#]*)?(\?[^#]*)?$/.exec(url);
    if (!m) return url;
    const out = new URL(`${AIB_BASE_URL}${locale === 'ko' ? '' : `/${locale}`}${m[1] ?? '/'}${m[2] ?? ''}`);
    out.searchParams.set('utm_source', 'siliconage');
    out.searchParams.set('utm_medium', 'referral');
    out.searchParams.set('utm_campaign', campaign);
    return out.toString();
}
