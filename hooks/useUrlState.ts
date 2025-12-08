/**
 * useUrlState Hook
 * 
 * Manages URL-based state for node selection and locale.
 * Provides SEO-friendly URLs like /company/apple or /ko/tech/transistor
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { NodeData, Category } from '../types';

interface UrlState {
    nodeId: string | null;
    locale: string;
    view: 'map' | 'history' | 'card' | 'links';
}

// Map category to URL path segment
const categoryToPath: Record<Category, string> = {
    [Category.COMPANY]: 'company',
    [Category.PERSON]: 'person',
    [Category.TECHNOLOGY]: 'tech',
};

// Reverse mapping
const pathToCategory: Record<string, Category> = {
    'company': Category.COMPANY,
    'person': Category.PERSON,
    'tech': Category.TECHNOLOGY,
};

export const useUrlState = (nodes: NodeData[]) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<{ lang?: string; category?: string; nodeId?: string }>();

    // Parse current URL state
    const urlState = useMemo((): UrlState => {
        const pathParts = location.pathname.split('/').filter(Boolean);

        let locale = 'en';
        let nodeId: string | null = null;
        let view: 'map' | 'history' | 'card' | 'links' = 'map';

        // Check if first part is a language code
        if (pathParts[0] && ['ko', 'ja'].includes(pathParts[0])) {
            locale = pathParts[0];
            pathParts.shift();
        }

        // Check for view (history, card, links)
        if (pathParts[0] && ['history', 'card', 'links'].includes(pathParts[0])) {
            view = pathParts[0] as any;
            pathParts.shift();
        }

        // Check for category and node ID
        if (pathParts.length >= 2) {
            const category = pathParts[0];
            const id = pathParts[1];
            if (pathToCategory[category]) {
                nodeId = id;
            }
        }

        return { nodeId, locale, view };
    }, [location.pathname]);

    // Navigate to a specific node
    const navigateToNode = useCallback((node: NodeData | null, locale?: string) => {
        const lang = locale || urlState.locale;

        if (!node) {
            // Navigate to home
            navigate(lang === 'en' ? '/' : `/${lang}`);
            return;
        }

        const categoryPath = categoryToPath[node.category];
        const langPrefix = lang === 'en' ? '' : `/${lang}`;

        navigate(`${langPrefix}/${categoryPath}/${node.id}`);
    }, [navigate, urlState.locale]);

    // Change locale
    const navigateToLocale = useCallback((newLocale: string) => {
        const node = urlState.nodeId
            ? nodes.find(n => n.id === urlState.nodeId)
            : null;

        navigateToNode(node, newLocale);
    }, [navigateToNode, urlState.nodeId, nodes]);

    // Change view
    const navigateToView = useCallback((view: 'map' | 'history' | 'card' | 'links') => {
        const lang = urlState.locale;
        const langPrefix = lang === 'en' ? '' : `/${lang}`;

        if (view === 'map') {
            navigate(langPrefix || '/');
        } else {
            navigate(`${langPrefix}/${view}`);
        }
    }, [navigate, urlState.locale]);

    // Find current node from URL
    const currentNode = useMemo(() => {
        if (!urlState.nodeId) return null;
        return nodes.find(n => n.id === urlState.nodeId) || null;
    }, [urlState.nodeId, nodes]);

    return {
        ...urlState,
        currentNode,
        navigateToNode,
        navigateToLocale,
        navigateToView,
    };
};

export default useUrlState;
