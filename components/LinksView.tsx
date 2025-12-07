import React, { useState, useMemo, useRef } from 'react';
import { NodeData, LinkData, GraphData, LinkType, Category } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';
import { getPersonVerbs, getTechVerb } from '../utils/labels';
import { Handshake, Swords } from 'lucide-react';

interface LinksViewProps {
    data: GraphData;
    focusNodeId: string | null;
    onNodeClick: (node: NodeData) => void;
    onNodeFocus?: (nodeId: string) => void;
}

// Connection data structure
interface ConnectionItem {
    node: NodeData;
    link: LinkData;
    description: string;
    linkType: LinkType;
}

interface EngagesItem extends ConnectionItem {
    icon: string;
    color: string;
}

// LinkType display info with colors
const LINK_TYPE_INFO: Record<LinkType, { label: string; icon: string; color: string; bgColor: string }> = {
    [LinkType.CREATES]: { label: 'Created', icon: '🔨', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    [LinkType.POWERS]: { label: 'Powers', icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    [LinkType.CONTRIBUTES]: { label: 'Contributed', icon: '💡', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    [LinkType.ENGAGES]: { label: 'Relationships', icon: '🔗', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
};

// Get ENGAGES relationship icon and label
const getEngagesDisplay = (linkIcon?: string) => {
    if (linkIcon === 'HEART') return { icon: <Handshake className="w-4 h-4" />, label: 'Partner', color: 'text-amber-400' };
    if (linkIcon === 'RIVALRY') return { icon: <Swords className="w-4 h-4" />, label: 'Rival', color: 'text-orange-400' };
    return { icon: '🔗', label: 'Connected', color: 'text-slate-400' };
};

// Get relationship description using labels.ts
const getConnectionDescription = (
    focusNode: NodeData,
    otherNode: NodeData,
    linkType: LinkType,
    isInbound: boolean
): string => {
    // Person connecting to focus
    if (otherNode.category === Category.PERSON) {
        const verbs = getPersonVerbs(otherNode);
        if (linkType === LinkType.CREATES) {
            if (focusNode.category === Category.COMPANY) {
                return verbs.foundedCompany.replace(' of', '');
            }
            if (focusNode.category === Category.TECHNOLOGY) {
                return verbs.createdTech;
            }
        }
        if (linkType === LinkType.CONTRIBUTES) {
            if (focusNode.category === Category.COMPANY) {
                return verbs.contributedCompany.replace(' to', '').replace(' at', '');
            }
            return verbs.contributedTech.replace(' to', '');
        }
    }

    // Technology connecting to focus
    if (otherNode.category === Category.TECHNOLOGY) {
        const verb = getTechVerb(otherNode);
        if (linkType === LinkType.CREATES) {
            return isInbound ? verb : `${verb} by`;
        }
        if (linkType === LinkType.POWERS) {
            return isInbound ? 'Foundation' : 'Enables';
        }
        if (linkType === LinkType.CONTRIBUTES) {
            return isInbound ? 'Based on' : 'Inspired';
        }
    }

    // Company connecting
    if (otherNode.category === Category.COMPANY) {
        if (linkType === LinkType.CREATES) {
            return isInbound ? 'Created by' : 'Created';
        }
        if (linkType === LinkType.POWERS) {
            return isInbound ? 'Powered by' : 'Powers';
        }
    }

    // Default
    switch (linkType) {
        case LinkType.CREATES: return isInbound ? 'Created by' : 'Created';
        case LinkType.POWERS: return isInbound ? 'Powered by' : 'Powers';
        case LinkType.CONTRIBUTES: return isInbound ? 'Influenced by' : 'Influenced';
        default: return '';
    }
};

export const LinksView: React.FC<LinksViewProps> = ({ data, focusNodeId, onNodeClick, onNodeFocus }) => {
    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<NodeData[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const focusNode = useMemo(() => {
        return data.nodes.find(n => n.id === focusNodeId);
    }, [data.nodes, focusNodeId]);

    // Categorize connections by LinkType
    const { originsGrouped, impactGrouped, engages } = useMemo(() => {
        if (!focusNodeId || !focusNode) {
            return {
                originsGrouped: {} as Record<LinkType, ConnectionItem[]>,
                impactGrouped: {} as Record<LinkType, ConnectionItem[]>,
                engages: [] as EngagesItem[]
            };
        }

        const originsMap: Record<LinkType, ConnectionItem[]> = {
            [LinkType.CREATES]: [],
            [LinkType.POWERS]: [],
            [LinkType.CONTRIBUTES]: [],
            [LinkType.ENGAGES]: [],
        };
        const impactMap: Record<LinkType, ConnectionItem[]> = {
            [LinkType.CREATES]: [],
            [LinkType.POWERS]: [],
            [LinkType.CONTRIBUTES]: [],
            [LinkType.ENGAGES]: [],
        };
        const engagesArr: EngagesItem[] = [];

        data.links.forEach(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;

            if (sourceId === focusNodeId) {
                const targetNode = data.nodes.find(n => n.id === targetId);
                if (targetNode) {
                    if (link.type === LinkType.ENGAGES) {
                        const display = getEngagesDisplay(link.icon);
                        engagesArr.push({
                            node: targetNode,
                            link,
                            description: display.label,
                            linkType: link.type,
                            icon: display.icon,
                            color: display.color
                        });
                    } else {
                        impactMap[link.type].push({
                            node: targetNode,
                            link,
                            description: getConnectionDescription(focusNode, targetNode, link.type, false),
                            linkType: link.type
                        });
                    }
                }
            } else if (targetId === focusNodeId) {
                const sourceNode = data.nodes.find(n => n.id === sourceId);
                if (sourceNode) {
                    if (link.type === LinkType.ENGAGES) {
                        const display = getEngagesDisplay(link.icon);
                        engagesArr.push({
                            node: sourceNode,
                            link,
                            description: display.label,
                            linkType: link.type,
                            icon: display.icon,
                            color: display.color
                        });
                    } else {
                        originsMap[link.type].push({
                            node: sourceNode,
                            link,
                            description: getConnectionDescription(focusNode, sourceNode, link.type, true),
                            linkType: link.type
                        });
                    }
                }
            }
        });

        // Sort each group alphabetically
        const sortFn = (a: ConnectionItem, b: ConnectionItem) =>
            a.node.label.localeCompare(b.node.label);

        Object.values(originsMap).forEach(arr => arr.sort(sortFn));
        Object.values(impactMap).forEach(arr => arr.sort(sortFn));
        engagesArr.sort((a, b) => a.node.label.localeCompare(b.node.label));

        return { originsGrouped: originsMap, impactGrouped: impactMap, engages: engagesArr };
    }, [data, focusNodeId, focusNode]);

    // Search handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 0) {
            const categoryOrder = { [Category.COMPANY]: 0, [Category.TECHNOLOGY]: 1, [Category.PERSON]: 2 };
            const matches = data.nodes
                .filter(n => n.label.toLowerCase().includes(term.toLowerCase()))
                .sort((a, b) => {
                    const catDiff = (categoryOrder[a.category] ?? 3) - (categoryOrder[b.category] ?? 3);
                    if (catDiff !== 0) return catDiff;
                    return a.label.localeCompare(b.label);
                })
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

    // Calculate total connections for stats
    const totalConnections = useMemo(() => {
        const linkTypeOrder: LinkType[] = [LinkType.CREATES, LinkType.POWERS, LinkType.CONTRIBUTES];
        const originsCount = linkTypeOrder.reduce((sum, lt) => sum + (originsGrouped[lt]?.length || 0), 0);
        const impactCount = linkTypeOrder.reduce((sum, lt) => sum + (impactGrouped[lt]?.length || 0), 0);
        return originsCount + impactCount + engages.length;
    }, [originsGrouped, impactGrouped, engages]);

    // Helper: Get category badge (same as CardView)
    const getCategoryBadge = (node: NodeData) => {
        if (node.category === Category.COMPANY && node.companyCategories?.[0]) {
            return (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-red-900/20 text-red-400/80 border border-red-800/30">
                    {CATEGORY_LABELS[node.companyCategories[0]].toUpperCase()}
                </span>
            );
        }
        if (node.category === Category.PERSON && node.primaryRole) {
            return (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-900/20 text-blue-400/80 border border-blue-800/30">
                    {node.primaryRole.toUpperCase()}
                </span>
            );
        }
        if (node.category === Category.TECHNOLOGY && node.techCategoryL2) {
            return (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-900/20 text-emerald-400/80 border border-emerald-800/30">
                    {node.techCategoryL2.toUpperCase()}
                </span>
            );
        }
        return null;
    };

    // Helper: Get category icon (SVG from DetailPanel style)
    const getCategoryIcon = (category: Category) => {
        const iconClass = "w-4 h-4";
        const iconColor = CATEGORY_COLORS[category];

        switch (category) {
            case Category.COMPANY:
                return (
                    <svg className={iconClass} fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                );
            case Category.PERSON:
                return (
                    <svg className={iconClass} fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                );
            case Category.TECHNOLOGY:
                return (
                    <svg className={iconClass} fill="none" stroke={iconColor} viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                );
        }
    };

    // Render node card with CardView-style design
    const renderNodeCard = (conn: ConnectionItem, idx: number) => (
        <button
            key={`${conn.node.id}-${idx}`}
            onClick={() => onNodeClick(conn.node)}
            className="w-full p-3.5 flex flex-col gap-2 bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all duration-200 text-left group relative overflow-hidden hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20"
        >
            {/* Top color bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                style={{ backgroundColor: CATEGORY_COLORS[conn.node.category] }}
            />

            {/* Category Badge (CardView style) */}
            <div className="flex items-center gap-2 mt-1">
                {getCategoryBadge(conn.node)}
            </div>

            {/* Title with Icon */}
            <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                    {getCategoryIcon(conn.node.category)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm leading-tight group-hover:text-cyan-300 transition-colors">
                        {conn.node.label}
                    </div>
                </div>
            </div>
        </button>
    );

    // Render ENGAGES item with enhanced design
    const renderEngagesCard = (conn: EngagesItem, idx: number) => {
        const isPartner = conn.description === 'Partner';
        const isRival = conn.description === 'Rival';

        return (
            <button
                key={`engages-${conn.node.id}-${idx}`}
                onClick={() => onNodeClick(conn.node)}
                className={`w-full p-3.5 flex flex-col gap-2 border rounded-xl transition-all duration-200 text-left group relative overflow-hidden hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20 ${isPartner
                        ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                        : isRival
                            ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50'
                            : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
                    }`}
            >
                {/* Top color bar */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{ backgroundColor: CATEGORY_COLORS[conn.node.category] }}
                />

                {/* Category Badge */}
                <div className="flex items-center gap-2 mt-1">
                    {getCategoryBadge(conn.node)}
                </div>

                {/* Title with Relationship Icon */}
                <div className="flex items-start gap-2.5">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${isPartner ? 'bg-amber-500/20 text-amber-400' : isRival ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700/50'
                        }`}>
                        {conn.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm leading-tight group-hover:text-cyan-300 transition-colors">
                            {conn.node.label}
                        </div>
                        <div className={`text-[10px] mt-1 font-medium ${conn.color}`}>
                            {conn.description}
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    // Render grouped section by LinkType with enhanced headers
    const renderGroupedSection = (grouped: Record<LinkType, ConnectionItem[]>, direction: 'origins' | 'impact') => {
        const linkTypeOrder: LinkType[] = [LinkType.CREATES, LinkType.POWERS, LinkType.CONTRIBUTES];
        const hasItems = linkTypeOrder.some(lt => grouped[lt].length > 0);

        if (!hasItems) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center text-2xl mb-3">
                        {direction === 'origins' ? '🌱' : '🌟'}
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        {direction === 'origins' ? 'The beginning' : 'Story continues...'}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                        {direction === 'origins' ? 'No predecessors found' : 'No successors yet'}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-5">
                {linkTypeOrder.map(linkType => {
                    const items = grouped[linkType];
                    if (items.length === 0) return null;

                    const info = LINK_TYPE_INFO[linkType];
                    return (
                        <div key={linkType}>
                            {/* Simple section header */}
                            <div className="flex items-center gap-2 mb-3 px-2 py-1.5">
                                <span className={`text-[11px] font-semibold uppercase tracking-wide ${info.color}`}>
                                    {info.label}
                                </span>
                            </div>
                            <div className="space-y-2.5">
                                {items.map((item, idx) => renderNodeCard(item, idx))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Empty state with search
    if (!focusNodeId || !focusNode) {
        return (
            <div className="flex-1 flex flex-col bg-slate-900 h-full overflow-hidden">
                {/* Search Header */}
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
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                            />
                            {/* Suggestions */}
                            {isSearchFocused && suggestions.length > 0 && (
                                <div className="absolute mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50">
                                    {suggestions.map((node) => (
                                        <div
                                            key={node.id}
                                            className="cursor-pointer py-2 px-4 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-2"
                                            onClick={() => handleSearchSelect(node)}
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: CATEGORY_COLORS[node.category] }}
                                            />
                                            <span className="truncate text-sm">{node.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="text-6xl mb-4">🔗</div>
                        <h2 className="text-xl font-bold text-white mb-2">Explore Connections</h2>
                        <p className="text-slate-400">Search for a topic to see how it connects.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Main flow view
    return (
        <div className="flex-1 bg-slate-900 flex flex-col h-full overflow-hidden">
            {/* Mobile Layout */}
            <div className="md:hidden flex-1 overflow-y-auto">
                <div className="p-3 space-y-4">
                    {/* Focus Node */}
                    <div
                        className="p-4 rounded-xl border-2 text-center"
                        style={{
                            borderColor: CATEGORY_COLORS[focusNode.category],
                            backgroundColor: `${CATEGORY_COLORS[focusNode.category]}10`
                        }}
                    >
                        <div className="text-xl font-bold text-white">{focusNode.label}</div>
                        <div className="text-xs text-slate-400 mt-1">
                            {focusNode.category === Category.COMPANY && `${focusNode.year} - Current`}
                            {focusNode.category === Category.PERSON && focusNode.primaryRole}
                            {focusNode.category === Category.TECHNOLOGY && focusNode.year}
                        </div>
                    </div>

                    {/* Origins */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs px-1">
                            <span>←</span>
                            <span className="uppercase tracking-wider font-medium">Origins</span>
                        </div>
                        {renderGroupedSection(originsGrouped, 'origins')}
                    </div>

                    {/* ENGAGES */}
                    {engages.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-1.5 px-1">
                                <span className="text-xs">🔗</span>
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                    Relationships
                                </span>
                                <span className="text-[10px] text-slate-600">({engages.length})</span>
                            </div>
                            <div className="space-y-2">
                                {engages.map((item, idx) => renderEngagesCard(item, idx))}
                            </div>
                        </div>
                    )}

                    {/* Impact */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs px-1 justify-end">
                            <span className="uppercase tracking-wider font-medium">Impact</span>
                            <span>→</span>
                        </div>
                        {renderGroupedSection(impactGrouped, 'impact')}
                    </div>
                </div>
            </div>

            {/* Desktop Layout: 3 columns with enhanced design */}
            <div className="hidden md:flex md:items-stretch flex-1 overflow-y-auto">
                <div className="flex items-stretch p-6 gap-4 min-h-full w-full">
                    {/* Origins Column (Left) */}
                    <div className="flex-1 max-w-sm flex flex-col">
                        {/* Column Header - Enhanced */}
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent rounded-lg px-3 py-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-wide">Origins</h3>
                                <p className="text-[10px] text-slate-400 font-medium">What shaped this</p>
                            </div>
                        </div>
                        <div className="flex-1">
                            {renderGroupedSection(originsGrouped, 'origins')}
                        </div>
                    </div>

                    {/* Animated Arrow Left - Simple and Elegant */}
                    <div className="flex flex-col items-center justify-center px-2">
                        <svg className="w-8 h-8 text-slate-500/60" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </div>

                    {/* Focus Node (Center) - Enhanced */}
                    <div className="flex-1 max-w-md flex flex-col items-center">
                        {/* Main Focus Card with premium design */}
                        <div
                            className="w-full p-7 rounded-2xl border-2 text-center relative overflow-hidden shadow-2xl"
                            style={{
                                borderColor: CATEGORY_COLORS[focusNode.category],
                                background: `linear-gradient(135deg, ${CATEGORY_COLORS[focusNode.category]}18 0%, ${CATEGORY_COLORS[focusNode.category]}08 50%, transparent 100%)`,
                                boxShadow: `0 8px 32px ${CATEGORY_COLORS[focusNode.category]}25, 0 0 60px ${CATEGORY_COLORS[focusNode.category]}15`
                            }}
                        >
                            {/* Premium background effects */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    background: `radial-gradient(circle at 50% 30%, ${CATEGORY_COLORS[focusNode.category]}40 0%, transparent 65%)`
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/30" />

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Category Badge (CardView style) */}
                                <div className="flex justify-center mb-3">
                                    {getCategoryBadge(focusNode)}
                                </div>

                                {/* Category Icon - Larger and more prominent */}
                                <div className="mb-4 flex justify-center">
                                    {getCategoryIcon(focusNode.category)}
                                </div>

                                <div className="text-2xl font-bold text-white mb-3 leading-tight">{focusNode.label}</div>

                                <div className="text-sm text-slate-300 font-medium mb-4">
                                    {focusNode.category === Category.COMPANY && `Founded ${focusNode.year}`}
                                    {focusNode.category === Category.PERSON && focusNode.primaryRole}
                                    {focusNode.category === Category.TECHNOLOGY && `Introduced ${focusNode.year}`}
                                </div>

                                <div className="text-xs text-slate-400 line-clamp-3 leading-relaxed px-2">
                                    {focusNode.description}
                                </div>

                                {/* Connection Stats Badge - Premium style */}
                                <div className="mt-5 pt-5 border-t border-slate-700/50">
                                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-800/70 backdrop-blur-sm rounded-full border border-slate-700/50 shadow-lg">
                                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span className="text-sm font-bold text-white">{totalConnections}</span>
                                        <span className="text-xs text-slate-400 font-medium">connections</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ENGAGES Section - Simple Design */}
                        {engages.length > 0 && (
                            <div className="w-full mt-7">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div className="h-px flex-1 bg-slate-700/50" />
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2">
                                        Relationships
                                    </span>
                                    <div className="h-px flex-1 bg-slate-700/50" />
                                </div>
                                <div className="space-y-2.5">
                                    {engages.map((item, idx) => renderEngagesCard(item, idx))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Animated Arrow Right - Simple and Elegant */}
                    <div className="flex flex-col items-center justify-center px-2">
                        <svg className="w-8 h-8 text-slate-500/60" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </div>

                    {/* Impact Column (Right) */}
                    <div className="flex-1 max-w-sm flex flex-col">
                        {/* Column Header - Enhanced */}
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700/50 bg-gradient-to-l from-slate-800/50 to-transparent rounded-lg px-3 py-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-wide">Impact</h3>
                                <p className="text-[10px] text-slate-400 font-medium">What this shaped</p>
                            </div>
                        </div>
                        <div className="flex-1">
                            {renderGroupedSection(impactGrouped, 'impact')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinksView;
