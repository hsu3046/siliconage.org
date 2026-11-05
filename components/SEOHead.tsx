/**
 * SEOHead Component
 *
 * The single owner of runtime document meta (title, description, og/twitter,
 * canonical). It mirrors scripts/prerender.ts through config/seoStrings.ts, so
 * the JS-rendered DOM (what Googlebot indexes) never contradicts the static
 * page: same localized title, same curated description, same canonical.
 *
 * Pass the TRANSLATED node so ko/ja pages keep their localized text.
 */

import React, { useEffect } from 'react';
import { NodeData } from '../types';
import {
    SEO_STRINGS, SITE_URL, homeUrl, nodePath, nodeTitle, truncateDescription, type SeoLocale,
} from '../config/seoStrings';

interface SEOHeadProps {
    /** Currently selected node (already translated to `locale`) */
    node: NodeData | null;
    locale: SeoLocale;
}

const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const SEOHead: React.FC<SEOHeadProps> = ({ node, locale }) => {
    useEffect(() => {
        const s = SEO_STRINGS[locale] ?? SEO_STRINGS.en;
        const title = node ? nodeTitle(node, locale) : s.siteTitle;
        const description = node
            ? truncateDescription((node.description ?? '').trim() || s.siteDescription)
            : s.siteDescription;
        const url = node ? `${SITE_URL}${nodePath(node, locale)}` : homeUrl(locale);

        document.title = title;

        const setMeta = (selector: string, content: string) => {
            const el = document.querySelector(selector);
            if (el) el.setAttribute('content', content);
        };
        setMeta('meta[name="title"]', title);
        setMeta('meta[name="description"]', description);
        setMeta('meta[property="og:title"]', title);
        setMeta('meta[property="og:description"]', description);
        setMeta('meta[property="og:url"]', url);
        setMeta('meta[property="og:image"]', OG_IMAGE);
        setMeta('meta[property="twitter:title"]', title);
        setMeta('meta[property="twitter:description"]', description);
        setMeta('meta[property="twitter:url"]', url);
        setMeta('meta[property="twitter:image"]', OG_IMAGE);

        // The SPA shell (index.html) ships without a canonical because it is
        // served for many routes — create it here.
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = url;
    }, [node, locale]);

    return null;
};

export default SEOHead;
