/**
 * Shared SEO strings — used by scripts/prerender.ts (static HTML) and
 * components/SEOHead.tsx (runtime). Keeping one source guarantees the rendered
 * DOM never contradicts the prerendered page (title, description, canonical).
 */

import { Category, type NodeData } from '../types';

export type SeoLocale = 'en' | 'ko' | 'ja';

export const SITE_URL = 'https://siliconage.org';

export const SEO_STRINGS: Record<SeoLocale, {
    siteTitle: string;
    siteDescription: string;
    cat: Record<Category, string>;
}> = {
    en: {
        siteTitle: 'The Silicon Age | Interactive Map of AI History',
        siteDescription: 'Explore 100 years of digital history as a web of cause and effect — the companies, people and technologies that led to the AI era.',
        cat: { [Category.COMPANY]: 'Company', [Category.PERSON]: 'Person', [Category.TECHNOLOGY]: 'Technology' },
    },
    ko: {
        siteTitle: 'The Silicon Age | 인터랙티브 AI 역사 지도',
        siteDescription: '100년 디지털 역사를 인과관계의 네트워크로 — AI 시대를 만든 기업·인물·기술을 한눈에 탐구하세요.',
        cat: { [Category.COMPANY]: '기업', [Category.PERSON]: '인물', [Category.TECHNOLOGY]: '기술' },
    },
    ja: {
        siteTitle: 'The Silicon Age | インタラクティブAI史マップ',
        siteDescription: '100年のデジタル史を因果関係のネットワークで — AI時代を生んだ企業・人物・技術を探求しよう。',
        cat: { [Category.COMPANY]: '企業', [Category.PERSON]: '人物', [Category.TECHNOLOGY]: '技術' },
    },
};

const CATEGORY_PATH: Record<Category, string> = {
    [Category.COMPANY]: 'company',
    [Category.PERSON]: 'person',
    [Category.TECHNOLOGY]: 'tech',
};

export const localePrefix = (loc: SeoLocale) => (loc === 'en' ? '' : `/${loc}`);

/** Canonical node path: /company/apple, /ko/company/apple */
export const nodePath = (n: Pick<NodeData, 'id' | 'category'>, loc: SeoLocale) =>
    `${localePrefix(loc)}/${CATEGORY_PATH[n.category]}/${n.id}`;

/** Locale home URL — slashless for ko/ja to match the `/ko` and `/ja` files. */
export const homeUrl = (loc: SeoLocale) => (loc === 'en' ? `${SITE_URL}/` : `${SITE_URL}/${loc}`);

/** `Apple (1976) — Company | The Silicon Age` (label/description already localized). */
export const nodeTitle = (n: Pick<NodeData, 'label' | 'year' | 'category' | 'birthYear'>, loc: SeoLocale) =>
    `${n.label} (${n.category === Category.PERSON && n.birthYear ? n.birthYear : n.year}) — ${SEO_STRINGS[loc].cat[n.category]} | The Silicon Age`;

export const truncateDescription = (s: string, max = 158) =>
    (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);
