import React, { useState, useMemo, useRef } from 'react';
import { NodeData, LinkData, GraphData, LinkType, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface LinksViewProps {
    data: GraphData;
    focusNodeId: string | null;
    onNodeClick: (node: NodeData) => void;
    onNodeFocus?: (nodeId: string) => void;
}

// Human-readable relationship labels
const getRelationshipLabel = (type: LinkType, isInbound: boolean): string => {
    switch (type) {
        case LinkType.CREATED:
            return isInbound ? 'Created by' : 'Created';
        case LinkType.BASED_ON:
            return isInbound ? 'Based on' : 'Foundation for';
        case LinkType.INFLUENCED:
            return isInbound ? 'Influenced by' : 'Influenced';
        case LinkType.PART_OF:
            return isInbound ? 'Member of' : 'Contains';
        default:
            return type;
    }
};

// Get category icon
const getCategoryIcon = (category: Category): string => {
    switch (category) {
        case Category.COMPANY: return '🏢';
        case Category.PERSON: return '👤';
        case Category.TECHNOLOGY: return '💡';
        case Category.EPISODE: return '📅';
        default: return '•';
    }
};

export const LinksView: React.FC<LinksViewProps> = ({ data, focusNodeId, onNodeClick, onNodeFocus }) => {
    const [activeTab, setActiveTab] = useState<'origins' | 'impact'>('origins');

    // Search State (History-style)
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<NodeData[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const focusNode = useMemo(() => {
        return data.nodes.find(n => n.id === focusNodeId);
    }, [data.nodes, focusNodeId]);

    // Categorize connections into Origins (inbound) and Impact (outbound)
    const { origins, impact } = useMemo(() => {
        if (!focusNodeId) return { origins: [], impact: [] };

        const originsArr: { node: NodeData; link: LinkData; label: string }[] = [];
        const impactArr: { node: NodeData; link: LinkData; label: string }[] = [];

        data.links.forEach(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;

            if (sourceId === focusNodeId) {
                const targetNode = data.nodes.find(n => n.id === targetId);
                if (targetNode) {
                    impactArr.push({
                        node: targetNode,
                        link,
                        label: getRelationshipLabel(link.type, false)
                    });
                }
            } else if (targetId === focusNodeId) {
                const sourceNode = data.nodes.find(n => n.id === sourceId);
                if (sourceNode) {
                    originsArr.push({
                        node: sourceNode,
                        link,
                        label: getRelationshipLabel(link.type, true)
                    });
                }
            }
        });

        return { origins: originsArr, impact: impactArr };
    }, [data, focusNodeId]);

    // Group connections by relationship type
    const groupByType = (connections: typeof origins) => {
        const groups: Record<string, typeof origins> = {};
        connections.forEach(conn => {
            if (!groups[conn.label]) groups[conn.label] = [];
            groups[conn.label].push(conn);
        });
        return groups;
    };

    const originsGrouped = groupByType(origins);
    const impactGrouped = groupByType(impact);

    // Search handlers (History-style)
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 0) {
            const matches = data.nodes
                .filter(n => n.label.toLowerCase().includes(term.toLowerCase()))
                .slice(0, 5);
            setSuggestions(matches);
            setIsSearchFocused(true);
        } else {
            setSuggestions([]);
        }
    };

    const handleSearchSelect = (node: NodeData) => {
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
        }
        setSearchTerm('');
        setSuggestions([]);
        setIsSearchFocused(false);
        searchInputRef.current?.blur();

        // Only focus on the selected node (don't open detail panel)
        if (onNodeFocus) onNodeFocus(node.id);
    };

    const handleSearchFocus = () => {
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
        }
        setIsSearchFocused(true);
    };

    const handleSearchBlur = () => {
        blurTimeoutRef.current = setTimeout(() => {
            setIsSearchFocused(false);
            blurTimeoutRef.current = null;
        }, 250);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            handleSearchSelect(suggestions[0]);
        }
    };

    // Render a single node card (Card-style)
    const renderNodeCard = (conn: { node: NodeData; link: LinkData; label: string }, idx: number) => (
        <button
            key={`${conn.node.id}-${idx}`}
            onClick={() => {
                onNodeClick(conn.node);
                // Only show Detail panel, don't change focus
            }}
            className="w-full p-4 flex items-start gap-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-all text-left group relative overflow-hidden"
        >
            {/* Category Color Bar */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: CATEGORY_COLORS[conn.node.category] }}
            />

            {/* Content (no icon) */}
            <div className="flex-1 min-w-0 pl-2">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                            backgroundColor: `${CATEGORY_COLORS[conn.node.category]}20`,
                            color: CATEGORY_COLORS[conn.node.category]
                        }}
                    >
                        {conn.node.category}
                    </span>
                    <span className="text-[10px] text-slate-500">{conn.node.year}</span>
                </div>

                {/* Name */}
                <div className="font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {conn.node.label}
                </div>

                {/* Description */}
                <div className="text-xs text-slate-400 truncate mt-0.5">
                    {conn.node.description}
                </div>
            </div>

            {/* Arrow indicator */}
            <div className="text-slate-600 group-hover:text-slate-400 transition-colors self-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );

    const renderConnectionList = (grouped: Record<string, typeof origins>) => (
        <div className="space-y-4">
            {Object.entries(grouped).map(([label, connections]) => (
                <div key={label}>
                    <div className="px-1 py-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                        <span className="ml-2 text-xs text-slate-500">({connections.length})</span>
                    </div>
                    <div className="space-y-2">
                        {connections.map((conn, idx) => renderNodeCard(conn, idx))}
                    </div>
                </div>
            ))}
            {Object.keys(grouped).length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-3">🌱</div>
                    <p className="text-sm">This is where it all begins</p>
                </div>
            )}
        </div>
    );

    // Empty state with search (no focus node)
    if (!focusNodeId || !focusNode) {
        return (
            <div className="flex-1 flex flex-col bg-slate-900 h-full overflow-hidden">
                {/* Search Header - History style */}
                <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md p-4 border-b border-slate-800">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm"
                                placeholder="Find & Focus on a Topic..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                            />
                            {/* Suggestions Dropdown */}
                            {isSearchFocused && suggestions.length > 0 && (
                                <div className="absolute mt-1 w-full bg-slate-900/95 border border-slate-600 rounded-lg shadow-2xl backdrop-blur-md overflow-hidden z-50">
                                    <ul className="max-h-60 overflow-auto custom-scrollbar">
                                        {suggestions.map((node) => (
                                            <li
                                                key={node.id}
                                                className="cursor-pointer select-none relative py-3 px-4 hover:bg-slate-800 text-slate-300 transition-colors border-b border-slate-800/50 last:border-0 flex items-center gap-3"
                                                onClick={() => handleSearchSelect(node)}
                                            >
                                                <span className="text-xl">{getCategoryIcon(node.category)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <span className="block truncate font-medium">{node.label}</span>
                                                    <span className="block truncate text-xs text-slate-500">{node.description}</span>
                                                </div>
                                                <span
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: CATEGORY_COLORS[node.category] }}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="flex-1 flex items-center justify-center overflow-y-auto">
                    <div className="text-center p-8">
                        <div className="text-6xl mb-4">🔗</div>
                        <h2 className="text-xl font-bold text-white mb-2">Relationship Explorer</h2>
                        <p className="text-slate-400">Search for a node above to discover its origins and impact</p>
                    </div>
                </div>
            </div>
        );
    }

    // Main view with focused node - NO SEARCH BAR
    return (
        <div className="flex-1 bg-slate-900 flex flex-col h-full overflow-hidden">
            <div className="lg:hidden flex border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('origins')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'origins'
                        ? 'text-slate-200 border-b-2 border-slate-400 bg-slate-800/50'
                        : 'text-slate-500 hover:text-white'
                        }`}
                >
                    ← Origins
                </button>
                <button
                    onClick={() => setActiveTab('impact')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'impact'
                        ? 'text-slate-200 border-b-2 border-slate-400 bg-slate-800/50'
                        : 'text-slate-500 hover:text-white'
                        }`}
                >
                    Impact →
                </button>
            </div>

            {/* Desktop: Split View | Mobile: Tab Content */}
            <div className="flex-1 flex min-h-0 overflow-y-auto">
                {/* Origins Column (Left) */}
                <div className={`lg:flex-1 lg:border-r lg:border-slate-700 p-4 ${activeTab === 'origins' ? 'flex-1' : 'hidden lg:block'
                    }`}>
                    <div className="hidden lg:block mb-4">
                        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                            ← Origins
                        </h2>
                    </div>
                    {renderConnectionList(originsGrouped)}
                </div>

                {/* Impact Column (Right) */}
                <div className={`lg:flex-1 p-4 w-full overflow-hidden ${activeTab === 'impact' ? 'flex-1' : 'hidden lg:block'
                    }`}>
                    <div className="hidden lg:flex lg:justify-end mb-4">
                        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                            Impact →
                        </h2>
                    </div>
                    {renderConnectionList(impactGrouped)}
                </div>
            </div>
        </div>
    );
};

export default LinksView;
