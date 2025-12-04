import React from 'react';
import { X, MousePointer, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartTutorial: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onStartTutorial }) => {
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
                        Welcome to The Silicon Age
                    </h1>
                    <p className="text-slate-400 text-sm">
                        From Transistors to AI
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <MousePointer className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">
                                {isTouchDevice ? 'Tap & Explore' : 'Click & Explore'}
                            </h3>
                            <p className="text-sm text-slate-400">
                                Explore through <strong className="text-emerald-400">Map</strong>, <strong className="text-amber-400">History</strong>, and <strong className="text-cyan-400">List</strong> views. {isTouchDevice ? 'Tap' : 'Click'} any node for details, {isTouchDevice ? 'double-tap' : 'double-click'} to focus.
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
                        Start Interactive Tutorial
                    </button>

                    <button
                        onClick={handleDontShowAgain}
                        className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
                    >
                        Skip & Explore on My Own
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
