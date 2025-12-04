import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, MapPin, Clock, List, MousePointerClick, Search, CheckCircle } from 'lucide-react';

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
    const [currentStep, setCurrentStep] = useState(0);

    // Detect touch device
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    const TUTORIAL_STEPS: TutorialStep[] = [
        {
            title: "Map View",
            description: "Visualize the connections between companies, technologies, people, and events in an interactive network graph.",
            icon: <MapPin className="w-6 h-6" />,
        },
        {
            title: "History View",
            description: "Browse innovations chronologically — from the first transistor in 1947 to AI breakthroughs today.",
            icon: <Clock className="w-6 h-6" />,
        },
        {
            title: "List View",
            description: "Filter and sort all nodes by name, category, or impact score. Great for quick lookups.",
            icon: <List className="w-6 h-6" />,
        },
        {
            title: isTouchDevice ? "Tap to Explore" : "Click to Explore",
            description: isTouchDevice
                ? "Tap any node for details. Double-tap to enter Focus Mode and see all connections."
                : "Click any node for details. Double-click to enter Focus Mode and see all connections.",
            icon: <MousePointerClick className="w-6 h-6" />,
        },
        {
            title: "Search Anything",
            description: "Use the search bar to find Apple, Google, Elon Musk, iPhone, or any topic you're curious about.",
            icon: <Search className="w-6 h-6" />,
        },
        {
            title: "You're Ready!",
            description: "Explore the connections between companies, technologies, and the people who shaped the digital age.",
            icon: <CheckCircle className="w-6 h-6" />,
        },
    ];

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const step = TUTORIAL_STEPS[currentStep];
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
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('siliconage-tutorial-done', 'true');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                {/* Progress */}
                <div className="flex gap-1 px-6 pt-4">
                    {TUTORIAL_STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`flex-1 h-1 rounded-full transition-colors ${idx <= currentStep ? 'bg-primary' : 'bg-slate-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Skip button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                    Skip
                </button>

                {/* Content */}
                <div className="px-6 py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
                        {step.icon}
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">
                        {step.title}
                    </h2>

                    <p className="text-slate-400 text-sm leading-relaxed">
                        {step.description}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between px-6 pb-6">
                    <button
                        onClick={handlePrev}
                        disabled={isFirstStep}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${isFirstStep
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    <span className="text-sm text-slate-500">
                        {currentStep + 1} / {TUTORIAL_STEPS.length}
                    </span>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        {isLastStep ? "Start Exploring" : "Next"}
                        {!isLastStep && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
