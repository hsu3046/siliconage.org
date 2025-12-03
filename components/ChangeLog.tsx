import React from 'react';

interface ChangeLogProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangeLog: React.FC<ChangeLogProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white">📋 ChangeLog</h2>
                        <p className="text-sm text-slate-400 mt-1">Version History & Updates</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg p-2 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Version 1.0.1 */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-500/10 border border-green-500/50 text-green-400 rounded-full text-xs font-bold">
                                v1.0.1
                            </span>
                            <span className="text-slate-500 text-sm">2025-12-03</span>
                        </div>

                        <div className="space-y-6">
                            {/* Mobile UI Improvements */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-blue-400">📱</span> Mobile UI Improvements
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Center-aligned toggle buttons on mobile for better visual balance</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Increased title font size on mobile for better readability</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Disabled graph tooltips on touch devices to prevent conflicts</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Focus Mode Enhancements */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-purple-400">🎯</span> Focus Mode Enhancements
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Two-row layout on mobile: Focus info on top, Exit button + toggles on bottom</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Center-aligned Focus info and Exit button for cleaner appearance</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Enabled category and link type toggles while in Focus Mode</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Auto-close Detail Panel when entering Focus Mode</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Bug Fixes */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-red-400">🐛</span> Bug Fixes
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Fixed scroll position reset when switching views (Map/History/List)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Fixed mobile viewport shifting issues with delayed scroll reset</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Fixed unwanted auto-scroll after exiting Focus Mode or closing Detail Panel</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Improved Detail Panel close button reliability on mobile</span>
                                    </li>
                                </ul>
                            </div>

                            {/* UI Polish */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-yellow-400">✨</span> UI Polish
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Updated version number to v1.0.1</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Added ChangeLog feature to track updates</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>URL routing support for About modal</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Version 1.0.0 */}
                    <div className="space-y-4 pt-6 border-t border-slate-700">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-slate-700 border border-slate-600 text-slate-300 rounded-full text-xs font-bold">
                                v1.0.0
                            </span>
                            <span className="text-slate-500 text-sm">2025-11-29</span>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-white">🚀 Initial Release</h3>
                            <ul className="space-y-2 text-slate-300 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Interactive force-directed graph visualization</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Timeline and List view modes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Detail Panel with AI-generated insights</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Category and link type filtering</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Focus Mode for exploring node connections</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                    <p className="text-xs text-slate-500 text-center">
                        💡 Have feedback or found a bug? Use the feedback form in the About section.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangeLog;
