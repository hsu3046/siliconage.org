import React from 'react';
import { X, MousePointer, Sparkles } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';
import type { Locale } from '../utils/i18n';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartTutorial: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onStartTutorial }) => {
    // i18n hook (must be before any returns)
    const { t, locale, setLocale, availableLocales } = useLocale();

    const handleLocaleChange = async (newLocale: Locale) => {
        await setLocale(newLocale);
    };

    if (!isOpen) return null;

    const handleDontShowAgain = () => {
        localStorage.setItem('siliconage-welcome-seen', 'true');
        onClose();
    };

    const handleStartTutorial = () => {
        localStorage.setItem('siliconage-welcome-seen', 'true');
        onStartTutorial();
    };

    // Detect touch device
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="relative px-6 pt-8 pb-4 text-center bg-gradient-to-b from-primary/20 to-transparent">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700/50 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        {t('welcome.title')}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {t('about.subtitle')}
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4">
                    {/* Language Selector */}
                    <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-700">
                        <label className="text-xs text-slate-500 uppercase tracking-wider">
                            {t('tutorial.selectLanguage')}
                        </label>
                        <select
                            value={locale}
                            onChange={(e) => handleLocaleChange(e.target.value as Locale)}
                            className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer"
                        >
                            {availableLocales.map((loc) => (
                                <option key={loc.code} value={loc.code}>
                                    {loc.nativeLabel}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Click & Explore Section */}
                    <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <MousePointer className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">
                                {isTouchDevice ? 'Tap & Explore' : 'Click & Explore'}
                            </h3>
                            <p className="text-sm text-slate-400">
                                Explore through <strong className="text-emerald-400">Map</strong>, <strong className="text-amber-400">History</strong>, <strong className="text-cyan-400">Card</strong>, and <strong className="text-purple-400">Links</strong> views. {isTouchDevice ? 'Tap' : 'Click'} any node for details, {isTouchDevice ? 'double-tap' : 'double-click'} to focus.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 space-y-3">
                    <button
                        onClick={handleStartTutorial}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors"
                    >
                        {t('welcome.startTutorial')}
                    </button>

                    <button
                        onClick={handleDontShowAgain}
                        className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
                    >
                        {t('welcome.skip')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
