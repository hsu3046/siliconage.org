/**
 * SEOHead Component
 * 
 * Dynamically updates document meta tags based on the currently selected node.
 * This helps search engines index node-specific content when users share or bookmark URLs.
 */

import React, { useEffect } from 'react';
import { NodeData, Category } from '../types';
import { staticCache } from '../services/staticCache';

interface SEOHeadProps {
    /** Currently selected node for meta tag updates */
    node: NodeData | null;
    /** Base URL of the site */
    baseUrl?: string;
}

// Default meta values
const DEFAULT_META = {
    title: 'The Silicon Age | Interactive Map of AI History',
    description: 'Explore the evolution of Artificial Intelligence through an interactive map connecting legendary Companies, Visionary People, and Breakthrough Technologies.',
    image: '/og-image.jpg',
};

/**
 * Get category label for SEO
 */
const getCategoryLabel = (category: Category): string => {
    switch (category) {
        case Category.COMPANY: return 'Company';
        case Category.PERSON: return 'Person';
        case Category.TECHNOLOGY: return 'Technology';
        default: return 'Topic';
    }
};

/**
 * Generate meta description from node data and static cache
 */
const generateDescription = (node: NodeData): string => {
    // Try to get cached summary first
    const cached = staticCache[node.id];
    if (cached?.summary) {
        // Truncate to ~160 chars for meta description
        const summary = cached.summary;
        return summary.length > 160 ? summary.substring(0, 157) + '...' : summary;
    }

    // Fallback: generate from node properties
    const categoryLabel = getCategoryLabel(node.category);
    const yearInfo = node.year ? ` (${node.year})` : '';
    return `${node.label}${yearInfo} - Explore the ${categoryLabel.toLowerCase()} and its connections in the Silicon Age interactive map.`;
};

/**
 * SEOHead Component
 * Updates document meta tags dynamically
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
    node,
    baseUrl = 'https://siliconage.org'
}) => {
    // Map category to URL path segment
    const categoryToPath: Record<Category, string> = {
        [Category.COMPANY]: 'company',
        [Category.PERSON]: 'person',
        [Category.TECHNOLOGY]: 'tech',
    };

    useEffect(() => {
        // Determine values based on node
        const title = node
            ? `${node.label} | The Silicon Age`
            : DEFAULT_META.title;

        const description = node
            ? generateDescription(node)
            : DEFAULT_META.description;

        // SEO-friendly path-based URL
        const url = node
            ? `${baseUrl}/${categoryToPath[node.category]}/${node.id}`
            : baseUrl;

        const image = `${baseUrl}${DEFAULT_META.image}`;

        // Update document title
        document.title = title;

        // Helper to update or create meta tag
        const updateMeta = (selector: string, content: string, attr: string = 'content') => {
            let element = document.querySelector(selector) as HTMLMetaElement | null;
            if (element) {
                element.setAttribute(attr, content);
            }
        };

        // Update primary meta tags
        updateMeta('meta[name="title"]', title);
        updateMeta('meta[name="description"]', description);

        // Update Open Graph tags
        updateMeta('meta[property="og:title"]', title);
        updateMeta('meta[property="og:description"]', description);
        updateMeta('meta[property="og:url"]', url);
        updateMeta('meta[property="og:image"]', image);

        // Update Twitter tags
        updateMeta('meta[property="twitter:title"]', title);
        updateMeta('meta[property="twitter:description"]', description);
        updateMeta('meta[property="twitter:url"]', url);
        updateMeta('meta[property="twitter:image"]', image);

        // Update canonical URL if present
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (canonical) {
            canonical.href = url;
        }

    }, [node, baseUrl]);

    // This component doesn't render anything visible
    return null;
};

export default SEOHead;
