import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, ChevronRight, X, Filter } from 'lucide-react';
import { TechCategoryL1, TechCategoryL2 } from '../types';

// Category hierarchy
const TECH_HIERARCHY: Record<TechCategoryL1, TechCategoryL2[]> = {
    'Hardware & Infrastructure': ['Processors & Compute', 'Devices & Form Factors', 'Memory & Storage', 'Components & Manufacturing'],
    'System Software': ['Operating Systems (OS)', 'Development & Languages'],
    'Network & Connectivity': ['Telecommunications', 'Network Architecture'],
    'Digital Services & Platforms': ['Search & Information', 'Social & Media', 'Digital Platforms'],
    'AI & Physical Systems': ['Artificial Intelligence', 'Autonomous Mobility', 'Robotics', 'Fintech & Crypto', 'Spatial Computing'],
    'Fundamental Concepts': ['Theories & Architectures', 'Laws & Principles', 'Standards & Protocols'],
};

const L1_SHORT_NAMES: Record<TechCategoryL1, string> = {
    'Hardware & Infrastructure': 'Hardware',
    'System Software': 'Software',
    'Network & Connectivity': 'Network',
    'Digital Services & Platforms': 'Platforms',
    'AI & Physical Systems': 'AI & Robotics',
    'Fundamental Concepts': 'Concepts',
};

interface TechCategoryFilterProps {
    selectedL1: TechCategoryL1 | null;
    selectedL2: TechCategoryL2 | null;
    onFilterChange: (l1: TechCategoryL1 | null, l2: TechCategoryL2 | null) => void;
    counts: { l1: Record<string, number>; l2: Record<string, number> };
}

const TechCategoryFilter: React.FC<TechCategoryFilterProps> = ({ selectedL1, selectedL2, onFilterChange, counts }) => {
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [expandedL1, setExpandedL1] = useState<TechCategoryL1 | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleL1Click = (l1: TechCategoryL1) => {
        if (expandedL1 === l1) {
            setExpandedL1(null);
        } else {
            setExpandedL1(l1);
        }
    };

    const handleL2Select = (l1: TechCategoryL1, l2: TechCategoryL2) => {
        onFilterChange(l1, l2);
        setIsBottomSheetOpen(false);
        setIsDropdownOpen(false);
    };

    const handleL1Select = (l1: TechCategoryL1) => {
        onFilterChange(l1, null);
        setIsBottomSheetOpen(false);
        setIsDropdownOpen(false);
    };

    const handleClear = () => {
        onFilterChange(null, null);
        setIsBottomSheetOpen(false);
        setIsDropdownOpen(false);
    };

    const getFilterLabel = () => {
        if (selectedL2) return selectedL2;
        if (selectedL1) return L1_SHORT_NAMES[selectedL1];
        return 'All Technologies';
    };

    const isFiltered = selectedL1 !== null;

    return (
        <>
            {/* PC: Dropdown */}
            <div className="hidden sm:block relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${isFiltered
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    <span className="truncate max-w-[150px]">{getFilterLabel()}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                        <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <div className="max-h-80 overflow-y-auto">
                                <button
                                    onClick={handleClear}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${!isFiltered ? 'text-primary font-medium' : 'text-slate-300'
                                        }`}
                                >
                                    All Categories
                                </button>
                                <div className="border-t border-slate-700" />
                                {(Object.keys(TECH_HIERARCHY) as TechCategoryL1[]).map((l1) => (
                                    <div key={l1}>
                                        <button
                                            onClick={() => handleL1Click(l1)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${selectedL1 === l1 && !selectedL2 ? 'text-primary font-medium' : 'text-slate-300'
                                                }`}
                                        >
                                            <span>{L1_SHORT_NAMES[l1]} <span className="text-slate-500 ml-0.5 text-xs font-normal">({counts.l1[l1] || 0})</span></span>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${expandedL1 === l1 ? 'rotate-90' : ''}`} />
                                        </button>
                                        {expandedL1 === l1 && (
                                            <div className="bg-slate-800/50">
                                                <button
                                                    onClick={() => handleL1Select(l1)}
                                                    className={`w-full text-left pl-8 pr-4 py-2 text-xs font-semibold hover:bg-slate-700 transition-colors ${selectedL1 === l1 && !selectedL2 ? 'text-primary' : 'text-slate-400'
                                                        }`}
                                                >
                                                    All {L1_SHORT_NAMES[l1]} <span className="text-slate-500 ml-0.5 font-normal">({counts.l1[l1] || 0})</span>
                                                </button>
                                                {TECH_HIERARCHY[l1].map((l2) => (
                                                    <button
                                                        key={l2}
                                                        onClick={() => handleL2Select(l1, l2)}
                                                        className={`w-full text-left pl-8 pr-4 py-2 text-xs hover:bg-slate-700 transition-colors ${selectedL2 === l2 ? 'text-primary font-medium' : 'text-slate-400'
                                                            }`}
                                                    >
                                                        {l2} <span className="text-slate-500 ml-0.5 font-normal">({counts.l2[l2] || 0})</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile: Filter Button */}
            <button
                onClick={() => setIsBottomSheetOpen(true)}
                className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors text-sm ${isFiltered
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-slate-800/50 border-slate-600 text-slate-300'
                    }`}
            >
                <Filter className="w-4 h-4" />
                {isFiltered && <span className="truncate max-w-[80px]">{getFilterLabel()}</span>}
            </button>

            {/* Mobile: Bottom Sheet - using Portal to escape overflow constraints */}
            {isBottomSheetOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[100] sm:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setIsBottomSheetOpen(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-2xl border-t border-slate-700 max-h-[70vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                            <h3 className="font-semibold text-white">Filter by Category</h3>
                            <button onClick={() => setIsBottomSheetOpen(false)} className="p-1 hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <button
                                onClick={handleClear}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${!isFiltered ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-300'
                                    }`}
                            >
                                All Categories
                            </button>

                            {(Object.keys(TECH_HIERARCHY) as TechCategoryL1[]).map((l1) => (
                                <div key={l1} className="rounded-lg overflow-hidden border border-slate-700">
                                    <button
                                        onClick={() => handleL1Click(l1)}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${selectedL1 === l1 ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300'
                                            }`}
                                    >
                                        <span>{L1_SHORT_NAMES[l1]} <span className="text-slate-400 ml-1 text-xs font-normal">({counts.l1[l1] || 0})</span></span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedL1 === l1 ? 'rotate-180' : ''}`} />
                                    </button>
                                    {expandedL1 === l1 && (
                                        <div className="bg-slate-800/50 border-t border-slate-700">
                                            <button
                                                onClick={() => handleL1Select(l1)}
                                                className={`w-full text-left px-6 py-2.5 text-xs font-semibold transition-colors ${selectedL1 === l1 && !selectedL2 ? 'text-primary' : 'text-slate-400'
                                                    }`}
                                            >
                                                All {L1_SHORT_NAMES[l1]} <span className="text-slate-500 ml-1 font-normal">({counts.l1[l1] || 0})</span>
                                            </button>
                                            {TECH_HIERARCHY[l1].map((l2) => (
                                                <button
                                                    key={l2}
                                                    onClick={() => handleL2Select(l1, l2)}
                                                    className={`w-full text-left px-6 py-2.5 text-xs transition-colors ${selectedL2 === l2 ? 'text-primary font-medium' : 'text-slate-400'
                                                        }`}
                                                >
                                                    {l2} <span className="text-slate-500 ml-1 font-normal">({counts.l2[l2] || 0})</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default TechCategoryFilter;
