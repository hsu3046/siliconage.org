/**
 * i18n (Internationalization) Utility
 * 
 * Simple i18n system for The Silicon Age project.
 * Supports: English (en), Korean (ko), Japanese (ja)
 */

export type Locale = 'en' | 'ko' | 'ja';

// Default locale
const DEFAULT_LOCALE: Locale = 'en';

// Store for current locale and translations
let currentLocale: Locale = DEFAULT_LOCALE;
let translations: Record<string, any> = {};
let nodeTranslations: Record<string, { label: string; description: string; primaryRole?: string; secondaryRole?: string }> = {};
let linkTranslations: Record<string, { story: string }> = {};
let eventTranslations: Record<string, { story: string }> = {};
let isLoaded = false;

/**
 * Load translations for a specific locale
 */
export const loadLocale = async (locale: Locale): Promise<void> => {
    try {
        const uiModule = await import(`../locales/${locale}/ui.json`);
        translations = uiModule.default || uiModule;

        // Load node translations
        try {
            const nodesModule = await import(`../locales/${locale}/nodes.json`);
            nodeTranslations = nodesModule.default || nodesModule;
        } catch (nodeError) {
            console.warn(`Node translations not found for locale: ${locale}`);
            nodeTranslations = {};
        }

        // Load link translations
        try {
            const linksModule = await import(`../locales/${locale}/links.json`);
            linkTranslations = linksModule.default || linksModule;
        } catch (linkError) {
            console.warn(`Link translations not found for locale: ${locale}`);
            linkTranslations = {};
        }

        // Load event translations
        try {
            const eventsModule = await import(`../locales/${locale}/events.json`);
            eventTranslations = eventsModule.default || eventsModule;
        } catch (eventError) {
            console.warn(`Event translations not found for locale: ${locale}`);
            eventTranslations = {};
        }

        currentLocale = locale;
        isLoaded = true;

        // Store preference in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('locale', locale);
        }
    } catch (error) {
        console.error(`Failed to load locale: ${locale}`, error);
        // Fallback to English
        if (locale !== 'en') {
            await loadLocale('en');
        }
    }
};

/**
 * Get current locale
 */
export const getLocale = (): Locale => currentLocale;

/**
 * Check if translations are loaded
 */
export const isLocaleLoaded = (): boolean => isLoaded;

/**
 * Get translated text by key path
 * 
 * @param key - Dot-separated key path (e.g., 'nav.links', 'search.placeholder')
 * @param params - Optional parameters to replace {placeholders}
 * @returns Translated string or key if not found
 * 
 * @example
 * t('nav.links') // "Links" or "연결" or "つながり"
 * t('welcome.greeting', { name: 'John' }) // "Hello, John!"
 */
export const t = (key: string, params?: Record<string, string | number>): string => {
    if (!isLoaded) {
        return key; // Return key if translations not loaded yet
    }

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key; // Key not found
        }
    }

    if (typeof value !== 'string') {
        return key; // Value is not a string (might be an object)
    }

    // Replace {param} placeholders
    if (params) {
        return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
            return params[paramKey]?.toString() ?? `{${paramKey}}`;
        });
    }

    return value;
};

/**
 * Translate node data (label, description, and optional roles)
 * 
 * @param nodeId - Node ID from constants.ts
 * @param fallbackLabel - Original label (fallback if translation not found)
 * @param fallbackDescription - Original description (fallback if translation not found)
 * @param fallbackPrimaryRole - Original primaryRole (fallback if translation not found)
 * @param fallbackSecondaryRole - Original secondaryRole (fallback if translation not found)
 * @returns Object with translated label, description, and optional roles
 */
export const translateNode = (
    nodeId: string,
    fallbackLabel?: string,
    fallbackDescription?: string,
    fallbackPrimaryRole?: string,
    fallbackSecondaryRole?: string
): { label: string; description: string; primaryRole?: string; secondaryRole?: string } => {
    if (!isLoaded || currentLocale === 'en') {
        return {
            label: fallbackLabel || nodeId,
            description: fallbackDescription || '',
            primaryRole: fallbackPrimaryRole,
            secondaryRole: fallbackSecondaryRole
        };
    }

    const translation = nodeTranslations[nodeId];

    if (translation) {
        return {
            label: translation.label || fallbackLabel || nodeId,
            description: translation.description || fallbackDescription || '',
            primaryRole: translation.primaryRole || fallbackPrimaryRole,
            secondaryRole: translation.secondaryRole || fallbackSecondaryRole
        };
    }

    return {
        label: fallbackLabel || nodeId,
        description: fallbackDescription || '',
        primaryRole: fallbackPrimaryRole,
        secondaryRole: fallbackSecondaryRole
    };
};

/**
 * Translate link story
 * 
 * @param source - Source node ID
 * @param target - Target node ID
 * @param fallbackStory - Original story (fallback if translation not found)
 * @returns Translated story string
 */
export const translateLink = (
    source: string,
    target: string,
    fallbackStory?: string
): string => {
    if (!isLoaded || currentLocale === 'en') {
        return fallbackStory || '';
    }

    const key = `${source}__${target}`;
    const translation = linkTranslations[key];

    if (translation?.story) {
        return translation.story;
    }

    return fallbackStory || '';
};

/**
 * Translate event story
 * 
 * @param eventId - Event ID (e.g., "event_0")
 * @param fallbackStory - Original story (fallback if translation not found)
 * @returns Translated story string
 */
export const translateEvent = (
    eventId: string,
    fallbackStory?: string
): string => {
    if (!isLoaded || currentLocale === 'en') {
        return fallbackStory || '';
    }

    const translation = eventTranslations[eventId];

    if (translation?.story) {
        return translation.story;
    }

    return fallbackStory || '';
};

/**
 * Get saved locale preference from localStorage
 */
export const getSavedLocale = (): Locale | null => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('locale');
    if (saved === 'en' || saved === 'ko' || saved === 'ja') {
        return saved;
    }
    return null;
};

/**
 * Detect browser locale and return closest supported locale
 */
export const detectBrowserLocale = (): Locale => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;

    const browserLang = navigator.language.toLowerCase();

    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('ja')) return 'ja';

    return 'en';
};

/**
 * Initialize i18n with saved or detected locale
 */
export const initLocale = async (): Promise<Locale> => {
    const saved = getSavedLocale();
    const locale = saved || detectBrowserLocale();
    await loadLocale(locale);
    return locale;
};

// Export available locales for UI
export const AVAILABLE_LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
    { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
];
