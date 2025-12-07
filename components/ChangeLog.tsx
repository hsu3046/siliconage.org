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

                    {/* Version 1.3.0 */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/50 text-blue-400 rounded-full text-xs font-bold">
                                v1.3.0
                            </span>
                            <span className="text-slate-500 text-sm">2025-12-06</span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-blue-400">📦</span> Added
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-1">+</span>
                                        <span><strong className="text-white">New Links View:</strong> Added a new view to easily grasp the relationships between topics.</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-amber-400">⚡</span> Changed
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        <span><strong className="text-white">History View UI:</strong> Redesigned the interface to make it easier to understand the historical flow of topics.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        <span><strong className="text-white">Search Functionality:</strong> Enhanced search capabilities for better navigation.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        <span><strong className="text-white">Topic Information:</strong> Significantly revised and added detailed information for each topic.</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-green-400">🛠️</span> Fixed
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span><strong className="text-white">Bug Fixes:</strong> Fixed various miscellaneous bugs.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 my-8"></div>

                    {/* Version 1.2.0 */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/50 text-purple-400 rounded-full text-xs font-bold">
                                v1.2.0
                            </span>
                            <span className="text-slate-500 text-sm">2025-12-05</span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-blue-400">📦</span> New Content
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span><strong className="text-white">Programming Languages:</strong> Added Python, C++, SQL, Swift as core technology nodes</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span><strong className="text-white">AI Concepts:</strong> Backpropagation, ImageNet, AlexNet, GAN, BERT, Diffusion, RLHF and more</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span><strong className="text-white">AI Companies:</strong> Anthropic (Claude), Stability AI, Midjourney</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span><strong className="text-white">AI Pioneers:</strong> Yoshua Bengio, Andrej Karpathy</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-amber-400">✨</span> Improvements
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        <span><strong className="text-white">Node Sizing:</strong> Improved sizing algorithm based on technology layers (L0-L3)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        <span><strong className="text-white">Detail Panel:</strong> Improved UI Design and added research paper link</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-red-400">🐛</span> Bug Fixes
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400 mt-1">•</span>
                                        <span>Various minor bug fixes</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 my-8"></div>
                    {/* Version 1.1.0 */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-500/10 border border-green-500/50 text-green-400 rounded-full text-xs font-bold">
                                v1.1.0
                            </span>
                            <span className="text-slate-500 text-sm">2025-12-04</span>
                        </div>

                        <div className="space-y-6">
                            {/* New Content */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-blue-400">📦</span> New Content
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Added massive new nodes related to Metaverse, Robotics, Quantum Computing, VC and more</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Added category information to Company and Technology nodes</span>
                                    </li>
                                </ul>
                            </div>

                            {/* New Features */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-purple-400">🚀</span> New Features
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Added search bar to Map mode - search and center the node on screen</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Added search bar to History mode</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Improvements */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-yellow-400">✨</span> Improvements
                                </h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Improved physics engine for better node positioning</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Minor UI adjustments</span>
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
                                        <span>Various minor bug fixes</span>
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
