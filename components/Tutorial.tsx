import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, MapPin, Clock, LayoutGrid, Link, MousePointerClick, Search, CheckCircle, Globe } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';
import type { Locale } from '../utils/i18n';

interface TutorialStep {
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface TutorialProps {
    isOpen: boolean;
    onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
    const { t, locale, setLocale, availableLocales } = useLocale();
    // Start at -1 for language selection screen
    const [currentStep, setCurrentStep] = useState(-1);

    // Detect touch device
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    const TUTORIAL_STEPS: TutorialStep[] = [
        {
            title: t('tutorial.steps.mapView.title'),
            description: t('tutorial.steps.mapView.description'),
            icon: <MapPin className="w-6 h-6" />,
        },
        {
            title: t('tutorial.steps.historyView.title'),
            description: t('tutorial.steps.historyView.description'),
            icon: <Clock className="w-6 h-6" />,
        },
        {
            title: t('tutorial.steps.cardView.title'),
            description: t('tutorial.steps.cardView.description'),
            icon: <LayoutGrid className="w-6 h-6" />,
        },
        {
            title: t('tutorial.steps.linksView.title'),
            description: t('tutorial.steps.linksView.description'),
            icon: <Link className="w-6 h-6" />,
        },
        {
            title: isTouchDevice ? t('tutorial.steps.interaction.titleTouch') : t('tutorial.steps.interaction.title'),
            description: isTouchDevice
                ? t('tutorial.steps.interaction.descriptionTouch')
                : t('tutorial.steps.interaction.description'),
            icon: <MousePointerClick className="w-6 h-6" />,
        },
        {
            title: t('tutorial.steps.search.title'),
            description: t('tutorial.steps.search.description'),
            icon: <Search className="w-6 h-6" />,
        },
        {
            title: t('tutorial.steps.ready.title'),
            description: t('tutorial.steps.ready.description'),
            icon: <CheckCircle className="w-6 h-6" />,
        },
    ];

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(-1); // Start at language selection
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isLanguageSelection = currentStep === -1;
    const step = isLanguageSelection ? null : TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = () => {
        if (isLastStep) {
            localStorage.setItem('siliconage-tutorial-done', 'true');
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > -1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('siliconage-tutorial-done', 'true');
        onClose();
    };

    const handleLocaleChange = async (newLocale: Locale) => {
        await setLocale(newLocale);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                {/* Progress - Hide on language selection screen */}
                {!isLanguageSelection && (
                    <div className="flex gap-1 px-6 pt-4">
                        {TUTORIAL_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`flex-1 h-1 rounded-full transition-colors ${idx <= currentStep ? 'bg-primary' : 'bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Skip button - Only show on tutorial steps, not on language selection */}
                {!isLanguageSelection && (
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        {t('tutorial.skip')}
                    </button>
                )}

                {/* Content */}
                <div className="px-6 py-8 text-center">
                    {isLanguageSelection ? (
                        // Language Selection Screen
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
                                <Globe className="w-6 h-6" />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-2">
                                {t('tutorial.steps.welcome.title')}
                            </h2>

                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                {t('tutorial.steps.welcome.description')}
                            </p>

                            <div className="flex flex-col items-center gap-3">
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
                        </>
                    ) : (
                        // Tutorial Steps
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
                                {step?.icon}
                            </div>

                            <h2 className="text-xl font-bold text-white mb-2">
                                {step?.title}
                            </h2>

                            <p className="text-slate-400 text-sm leading-relaxed">
                                {step?.description}
                            </p>
                        </>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between px-6 pb-6">
                    <button
                        onClick={handlePrev}
                        disabled={isLanguageSelection}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${isLanguageSelection
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {t('tutorial.back')}
                    </button>

                    {!isLanguageSelection && (
                        <span className="text-sm text-slate-500">
                            {t('tutorial.stepCounter', { current: currentStep + 1, total: TUTORIAL_STEPS.length })}
                        </span>
                    )}

                    {isLanguageSelection && <div />}

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        {isLastStep ? t('tutorial.startExploring') : t('tutorial.next')}
                        {!isLastStep && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
