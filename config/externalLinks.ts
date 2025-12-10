/**
 * External Links Configuration
 * 
 * 이 파일에서 언어별 외부 링크 URL 템플릿을 관리합니다.
 * {name} 플레이스홀더는 노드 라벨로 대체됩니다.
 * 
 * === 수정 방법 ===
 * 1. 새 언어 추가: 각 링크 설정의 urlByLocale에 언어 코드(ko, ja, en) 추가
 * 2. 검색어 키워드 변경: suffixByLocale 또는 urlByLocale 수정
 * 3. 새 링크 추가: EXTERNAL_LINKS 배열에 새 항목 추가
 */

import { Category } from '../types';

export type SupportedLocale = 'en' | 'ko' | 'ja';

export interface ExternalLinkConfig {
    id: string;
    label: string;
    /** Show for which categories? If empty, show for all */
    showForCategories?: Category[];
    /** URL template by locale. Use {name} as placeholder */
    urlByLocale: Record<SupportedLocale, string>;
    /** Category-specific URL overrides (optional) */
    urlByCategoryAndLocale?: Partial<Record<Category, Record<SupportedLocale, string>>>;
    /** SVG icon as React element (will be injected in DetailPanel) */
    iconId: 'wikipedia' | 'youtube' | 'google' | 'arxiv' | 'amazon';
}

/**
 * External Links Configuration
 * 
 * 각 링크의 URL을 언어별로 설정할 수 있습니다.
 * {name} → 노드 라벨 (예: "Apple", "Steve Jobs")
 */
export const EXTERNAL_LINKS: ExternalLinkConfig[] = [
    // ============================================================
    // 1. Wikipedia - 언어별 도메인
    // ============================================================
    {
        id: 'wikipedia',
        label: 'Wikipedia',
        iconId: 'wikipedia',
        urlByLocale: {
            en: 'https://en.wikipedia.org/wiki/Special:Search?search={name}',
            ko: 'https://namu.wiki/Search?target=title&q={name}', // NamuWiki
            ja: 'https://ja.wikipedia.org/wiki/Special:Search?search={name}',
        },
    },

    // ============================================================
    // 2. YouTube - 언어별 검색 키워드
    // ============================================================
    {
        id: 'youtube',
        label: 'YouTube',
        iconId: 'youtube',
        // Default (Company)
        urlByLocale: {
            en: 'https://www.youtube.com/results?search_query="{name}" overview documentary',
            ko: 'https://www.youtube.com/results?search_query="{name}" 다큐멘터리 역사',
            ja: 'https://www.youtube.com/results?search_query="{name}" ドキュメンタリー 歴史',
        },
        // Category-specific overrides
        urlByCategoryAndLocale: {
            [Category.PERSON]: {
                en: 'https://www.youtube.com/results?search_query="{name}" documentary biography interview',
                ko: 'https://www.youtube.com/results?search_query="{name}" 다큐멘터리 인터뷰 전기',
                ja: 'https://www.youtube.com/results?search_query="{name}" ドキュメンタリー インタビュー 伝記',
            },
            [Category.TECHNOLOGY]: {
                en: 'https://www.youtube.com/results?search_query=How "{name}" works explained',
                ko: 'https://www.youtube.com/results?search_query="{name}" 작동 원리 설명',
                ja: 'https://www.youtube.com/results?search_query="{name}" 仕組み 解説',
            },
        },
    },

    // ============================================================
    // 3. Web Search (Google) - 언어별 검색어
    // ============================================================
    {
        id: 'google',
        label: 'Web Search',
        iconId: 'google',
        urlByLocale: {
            en: 'https://www.google.com/search?q="{name}" overview',
            ko: 'https://www.google.com/search?q="{name}" 소개 개요',
            ja: 'https://www.google.com/search?q="{name}" 概要 紹介',
        },
    },

    // ============================================================
    // 4. arXiv (Research Papers) - Tech & Person only
    // ============================================================
    {
        id: 'arxiv',
        label: 'Paper',
        iconId: 'arxiv',
        showForCategories: [Category.TECHNOLOGY, Category.PERSON],
        urlByLocale: {
            // arXiv는 영어 기반이라 언어별 차이 없음
            en: 'https://arxiv.org/search/?query={name}&searchtype=all',
            ko: 'https://arxiv.org/search/?query={name}&searchtype=all',
            ja: 'https://arxiv.org/search/?query={name}&searchtype=all',
        },
    },

    // ============================================================
    // 5. Books (Amazon) - 언어별 도메인
    // ============================================================
    {
        id: 'amazon',
        label: 'Books',
        iconId: 'amazon',
        urlByLocale: {
            en: 'https://www.amazon.com/s?k="{name}" book',
            ko: 'https://search.kyobobook.co.kr/web/search?vPstrKeyWord="{name}"',  // 교보문고
            ja: 'https://www.amazon.co.jp/s?k="{name}" 本',
        },
        urlByCategoryAndLocale: {
            [Category.PERSON]: {
                en: 'https://www.amazon.com/s?k=Books by "{name}"',
                ko: 'https://search.kyobobook.co.kr/web/search?vPstrKeyWord="{name}"', // 교보문고
                ja: 'https://www.amazon.co.jp/s?k="{name}" 著書',
            },
        },
    },
];

/**
 * Get URL for a specific link, node, and locale
 */
export function getExternalLinkUrl(
    config: ExternalLinkConfig,
    nodeName: string,
    nodeCategory: Category,
    locale: SupportedLocale
): string {
    // Check for category-specific URL first
    const categoryUrl = config.urlByCategoryAndLocale?.[nodeCategory]?.[locale];
    const baseUrl = categoryUrl || config.urlByLocale[locale] || config.urlByLocale.en;

    // Replace {name} placeholder with encoded node name
    return baseUrl.replace('{name}', encodeURIComponent(nodeName));
}

/**
 * Filter links based on node category
 */
export function getApplicableLinks(nodeCategory: Category): ExternalLinkConfig[] {
    return EXTERNAL_LINKS.filter(link => {
        if (!link.showForCategories || link.showForCategories.length === 0) {
            return true; // Show for all categories
        }
        return link.showForCategories.includes(nodeCategory);
    });
}
