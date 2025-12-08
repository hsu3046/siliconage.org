/**
 * useLocale Hook
 * 
 * React hook for managing locale state and providing translation functions.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Locale,
    loadLocale,
    getLocale,
    initLocale,
    t as translate,
    AVAILABLE_LOCALES,
    isLocaleLoaded
} from '../utils/i18n';

interface UseLocaleReturn {
    /** Current locale code */
    locale: Locale;
    /** Translation function */
    t: typeof translate;
    /** Change locale */
    setLocale: (locale: Locale) => Promise<void>;
    /** Available locales for UI selector */
    availableLocales: typeof AVAILABLE_LOCALES;
    /** Whether translations are loaded */
    isLoaded: boolean;
}

/**
 * Hook for internationalization
 * 
 * @example
 * const { locale, t, setLocale, availableLocales } = useLocale();
 * 
 * return (
 *   <div>
 *     <h1>{t('about.title')}</h1>
 *     <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
 *       {availableLocales.map(l => (
 *         <option key={l.code} value={l.code}>{l.nativeLabel}</option>
 *       ))}
 *     </select>
 *   </div>
 * );
 */
export const useLocale = (): UseLocaleReturn => {
    const [locale, setLocaleState] = useState<Locale>(getLocale());
    const [isLoaded, setIsLoaded] = useState(isLocaleLoaded());

    // Initialize locale on mount
    useEffect(() => {
        const init = async () => {
            if (!isLocaleLoaded()) {
                const initialLocale = await initLocale();
                setLocaleState(initialLocale);
                setIsLoaded(true);
                // Set HTML lang for CSS :lang() font rules
                document.documentElement.lang = initialLocale;
            } else {
                // Already loaded, ensure html lang is set
                document.documentElement.lang = getLocale();
            }
        };
        init();
    }, []);

    // Change locale function
    const setLocale = useCallback(async (newLocale: Locale) => {
        await loadLocale(newLocale);
        setLocaleState(newLocale);
        // Update HTML lang attribute for CSS :lang() font rules
        document.documentElement.lang = newLocale;
    }, []);

    return {
        locale,
        t: translate,
        setLocale,
        availableLocales: AVAILABLE_LOCALES,
        isLoaded,
    };
};

export default useLocale;
