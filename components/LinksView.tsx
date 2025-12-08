import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NodeData, LinkData, GraphData, LinkType, Category } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';
import { getPersonVerbs, getTechVerb, getNodeSubtitle } from '../utils/labels';
import { getLinkIconConfig, getLinkIcon } from '../utils/icons';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface LinksViewProps {
    data: GraphData;
    focusNodeId: string | null;
    onNodeClick: (node: NodeData) => void;
    onNodeFocus?: (nodeId: string) => void;
}

interface ConnectionItem {
    node: NodeData;
    link: LinkData;
    description: string;
    linkType: LinkType;
    sourceCategory: Category;  // 소스 노드 카테고리
    targetCategory: Category;  // 타겟 노드 카테고리
}

interface EngagesItem extends ConnectionItem {
    engagesIcon: string;  // 'HEART' | 'RIVALRY'
}

// LinkType display info with unified Yellow color for headers
const LINK_TYPE_INFO: Record<LinkType, { label: string; icon: string; }> = {
    [LinkType.CREATES]: { label: 'Created', icon: '🔨' },
    [LinkType.POWERS]: { label: 'Powers', icon: '⚡' },
    [LinkType.CONTRIBUTES]: { label: 'Contributed', icon: '💡' },
    [LinkType.ENGAGES]: { label: 'Relationships', icon: '🔗' },
};

// Get ENGAGES relationship display using icons.tsx
const getEngagesDisplay = (linkIcon?: string) => {
    const config = getLinkIconConfig(LinkType.ENGAGES, undefined, undefined, linkIcon);
    return {
        label: config.label,
        color: config.color
    };
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

    // Collapsed Sections State
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const toggleSection = (key: string) => {
        setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const focusNode = useMemo(() => {
        return data.nodes.find(n => n.id === focusNodeId);
    }, [data.nodes, focusNodeId]);

    // Mobile: Removed auto-scroll to prevent viewport jumping issues on iOS
    // Previously scrolled to 'mobile-flow-arrow-1' but this causes the screen to push up unexpectedly

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

        // Deduplication trackers: seen (nodeId + linkType) combinations
        const seenImpact = new Set<string>();
        const seenOrigins = new Set<string>();

        data.links.forEach(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;

            // Deduplication: track seen (nodeId + linkType) combinations
            // For ENGAGES: bidirectional dedup - A↔B and B↔A with same icon = same relationship
            // Sort IDs alphabetically so both directions produce the same key
            const getKey = (nodeId: string, linkType: LinkType, icon?: string) => {
                if (linkType === LinkType.ENGAGES) {
                    // ENGAGES는 양방향이므로, 두 노드 ID를 정렬해서 키 생성
                    // 예: (apple, samsung, RIVALRY) → "apple_samsung_ENGAGES_RIVALRY"
                    const sortedIds = [focusNodeId, nodeId].sort();
                    return `${sortedIds[0]}_${sortedIds[1]}_${linkType}_${icon || ''}`;
                }
                return `${nodeId}_${linkType}`;
            };


            // ... helper to push to arrays with dedup check
            const addToMapIfNew = (
                map: Record<LinkType, ConnectionItem[]>,
                seenSet: Set<string>,
                type: LinkType,
                item: ConnectionItem,
                key: string
            ) => {
                if (!seenSet.has(key)) {
                    seenSet.add(key);
                    map[type].push(item);
                }
            };

            const addToEngagesIfNew = (
                arr: EngagesItem[],
                seenSet: Set<string>,
                item: EngagesItem,
                key: string
            ) => {
                if (!seenSet.has(key)) {
                    seenSet.add(key);
                    arr.push(item);
                }
            };

            if (sourceId === focusNodeId) {
                const targetNode = data.nodes.find(n => n.id === targetId);
                if (targetNode) {
                    const key = getKey(targetId, link.type, link.icon);
                    if (link.type === LinkType.ENGAGES) {
                        const display = getEngagesDisplay(link.icon);
                        addToEngagesIfNew(engagesArr, seenImpact, {
                            node: targetNode,
                            link,
                            description: display.label,
                            linkType: link.type,
                            engagesIcon: link.icon || '',
                            sourceCategory: focusNode.category,
                            targetCategory: targetNode.category
                        }, key);
                    } else {
                        addToMapIfNew(impactMap, seenImpact, link.type, {
                            node: targetNode,
                            link,
                            description: getConnectionDescription(focusNode, targetNode, link.type, false),
                            linkType: link.type,
                            sourceCategory: focusNode.category,
                            targetCategory: targetNode.category
                        }, key);
                    }
                }
            } else if (targetId === focusNodeId) {
                const sourceNode = data.nodes.find(n => n.id === sourceId);
                if (sourceNode) {
                    const key = getKey(sourceId, link.type, link.icon);
                    if (link.type === LinkType.ENGAGES) {
                        const display = getEngagesDisplay(link.icon);
                        addToEngagesIfNew(engagesArr, seenOrigins, {
                            node: sourceNode,
                            link,
                            description: display.label,
                            linkType: link.type,
                            engagesIcon: link.icon || '',
                            sourceCategory: sourceNode.category,
                            targetCategory: focusNode.category
                        }, key);
                    } else {
                        addToMapIfNew(originsMap, seenOrigins, link.type, {
                            node: sourceNode,
                            link,
                            description: getConnectionDescription(focusNode, sourceNode, link.type, true),
                            linkType: link.type,
                            sourceCategory: sourceNode.category,
                            targetCategory: focusNode.category
                        }, key);
                    }
                }
            }
        });

        // Sort fn: Company -> Person -> Technology, then Alphabetical
        const sortFn = (a: ConnectionItem, b: ConnectionItem) => {
            const categoryOrder = { [Category.COMPANY]: 0, [Category.PERSON]: 1, [Category.TECHNOLOGY]: 2 };
            const catDiff = (categoryOrder[a.node.category] ?? 3) - (categoryOrder[b.node.category] ?? 3);
            if (catDiff !== 0) return catDiff;
            return a.node.label.localeCompare(b.node.label);
        };

        // Engages Sort: Partner -> Rival, then Company->Person->Technology
        const engagesSortFn = (a: EngagesItem, b: EngagesItem) => {
            // Partner (Heart) first
            const isAPartner = a.description === 'Partner';
            const isBPartner = b.description === 'Partner';
            if (isAPartner && !isBPartner) return -1;
            if (!isAPartner && isBPartner) return 1;

            return sortFn(a, b);
        };

        Object.values(originsMap).forEach(arr => arr.sort(sortFn));
        Object.values(impactMap).forEach(arr => arr.sort(sortFn));
        engagesArr.sort(engagesSortFn);

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
    const handleSearchFocus = () => { if (blurTimeoutRef.current) { clearTimeout(blurTimeoutRef.current); blurTimeoutRef.current = null; } setIsSearchFocused(true); };
    const handleSearchBlur = () => { blurTimeoutRef.current = setTimeout(() => { setIsSearchFocused(false); blurTimeoutRef.current = null; }, 250); };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && suggestions.length > 0) { handleSearchSelect(suggestions[0]); } };


    // Helper: Category badge
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

    // Helper: Category icon
    const getCategoryIcon = (category: Category, sizeClass = "w-4 h-4") => {
        switch (category) {
            case Category.COMPANY:
                return (
                    <svg className={sizeClass} fill="none" stroke={CATEGORY_COLORS[Category.COMPANY]} viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                );
            case Category.PERSON:
                return (
                    <svg className={sizeClass} fill="none" stroke={CATEGORY_COLORS[Category.PERSON]} viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                );
            case Category.TECHNOLOGY:
                return (
                    <svg className={sizeClass} fill="none" stroke={CATEGORY_COLORS[Category.TECHNOLOGY]} viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                );
        }
    };

    // Helper: Extra description
    const getNodeExtraDescription = (node: NodeData) => {
        if (node.category === Category.COMPANY) return "Company";
        if (node.category === Category.PERSON) return node.primaryRole || "Person";
        if (node.category === Category.TECHNOLOGY) return node.techCategoryL2 || "Technology";
        return "";
    };

    // Render node card with Double Click support
    const renderNodeCard = (conn: ConnectionItem, idx: number) => (
        <button
            key={`${conn.node.id}-${idx}`}
            onClick={() => onNodeClick(conn.node)}
            onDoubleClick={() => onNodeFocus?.(conn.node.id)}
            className="w-full p-3.5 flex flex-col gap-2 bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all duration-200 text-left group relative overflow-hidden hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20 select-none"
            style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
        >
            {/* Top color bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                style={{ backgroundColor: CATEGORY_COLORS[conn.node.category] }}
            />

            {/* Category Badge + Link Icon */}
            <div className="flex items-center justify-between mt-1">
                {getCategoryBadge(conn.node)}
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                    {getLinkIcon(conn.linkType, conn.sourceCategory, conn.targetCategory, undefined, 'w-3.5 h-3.5')}
                    <span>{conn.description}</span>
                </div>
            </div>

            {/* Title + Inline Description */}
            <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                    {getCategoryIcon(conn.node.category)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm leading-tight group-hover:text-cyan-300 transition-colors">
                            {conn.node.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                            {getNodeSubtitle(conn.node)}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );

    // Render ENGAGES item with Double Click support
    const renderEngagesCard = (conn: EngagesItem, idx: number) => {
        return (
            <button
                key={`engages-${conn.node.id}-${idx}`}
                onClick={() => onNodeClick(conn.node)}
                onDoubleClick={() => onNodeFocus?.(conn.node.id)}
                className="w-full p-3.5 flex flex-col gap-2 bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all duration-200 text-left group relative overflow-hidden hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20 select-none"
                style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
            >
                {/* Top color bar */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{ backgroundColor: CATEGORY_COLORS[conn.node.category] }}
                />

                {/* Category Badge + Relationship Info */}
                <div className="flex items-center justify-between mt-1">
                    {getCategoryBadge(conn.node)}
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${conn.description === 'Partner' ? 'text-blue-500' : conn.description === 'Rival' ? 'text-amber-500' : 'text-slate-400'}`}>
                        {getLinkIcon(conn.linkType, conn.sourceCategory, conn.targetCategory, conn.engagesIcon, 'w-4 h-4')}
                        <span>{conn.description}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex items-center gap-2.5">
                    {/* Node Type Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                        {getCategoryIcon(conn.node.category)}
                    </div>

                    {/* Node Label & Description */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm leading-tight group-hover:text-cyan-300 transition-colors">
                                {conn.node.label}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                {getNodeSubtitle(conn.node)}
                            </span>
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    // Render grouped section with COLLAPSIBLE Logic
    const renderGroupedSection = (grouped: Record<LinkType, ConnectionItem[]>, sectionPrefix: string) => {
        const linkTypeOrder: LinkType[] = [LinkType.CREATES, LinkType.POWERS, LinkType.CONTRIBUTES];
        const hasItems = linkTypeOrder.some(lt => grouped[lt].length > 0);

        if (!hasItems) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600 opacity-50">
                    <p className="text-sm font-medium">No direct impact</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {linkTypeOrder.map(linkType => {
                    const items = grouped[linkType];
                    if (items.length === 0) return null;

                    const info = LINK_TYPE_INFO[linkType];
                    const sectionKey = `${sectionPrefix}-${linkType}`;
                    const isCollapsed = collapsedSections[sectionKey];

                    return (
                        <div key={linkType}>
                            {/* Header with Toggle + Count */}
                            <div className="flex items-center justify-center gap-3 mb-2 cursor-pointer group hover:bg-slate-800/20 rounded py-1 transition-colors"
                                onClick={() => toggleSection(sectionKey)}>
                                <div className="h-px flex-1 bg-amber-500/20" />
                                <div className="flex items-center gap-1.5 text-amber-500">
                                    <span className="text-[11px] font-bold uppercase tracking-widest">
                                        {info.label}
                                    </span>
                                    <span className="text-[10px] font-medium opacity-70">
                                        ({items.length})
                                    </span>
                                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                </div>
                                <div className="h-px flex-1 bg-amber-500/20" />
                            </div>

                            {/* Items (Conditionally Rendered) */}
                            {!isCollapsed && (
                                <div className="space-y-2">
                                    {items.map((item, idx) => renderNodeCard(item, idx))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Empty state search
    if (!focusNodeId || !focusNode) {
        // ... (Same Empty State Code as Previous - Retained for brevity/completeness, but no changes requested here)
        return (
            <div className="flex-1 flex flex-col bg-slate-900 h-full overflow-hidden">
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
                            {isSearchFocused && suggestions.length > 0 && (
                                <div className="absolute mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50">
                                    {suggestions.map((node) => (
                                        <div key={node.id} className="cursor-pointer py-2 px-4 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-2"
                                            onClick={() => handleSearchSelect(node)}>
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[node.category] }} />
                                            <span className="truncate text-sm">{node.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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

    const enagagesSectionKey = 'engages';
    const isEngagesCollapsed = collapsedSections[enagagesSectionKey];

    // Main flow view
    return (
        <div className="flex-1 bg-slate-900 flex flex-col h-full overflow-hidden relative">
            {/* Background Flow Arrow (Desktop Only) - Darker Blue Body */}
            <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none z-0 opacity-20 text-blue-900/40">
                <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                    <polygon points="50,150 630,150 630,80 780,200 630,320 630,250 50,250" fill="currentColor" />
                </svg>
            </div>

            <div className="hidden md:flex md:items-stretch flex-1 overflow-y-auto relative z-10 w-full px-4 pt-6 pb-20">
                <div className="grid grid-cols-3 gap-8 min-h-full w-full">

                    {/* Origins Column */}
                    <div className="flex flex-col pb-8">
                        <div className="flex-1">
                            {renderGroupedSection(originsGrouped, 'origins')}
                        </div>
                    </div>

                    {/* Focus Node (Center) */}
                    <div className="flex flex-col items-center justify-start pt-0">
                        {/* Focus Card - Clickable to open Detail Panel */}
                        <div
                            className="w-full p-5 rounded-3xl border-2 text-center relative overflow-hidden shadow-2xl mb-8 cursor-pointer hover:scale-[1.01] transition-transform"
                            onClick={() => onNodeClick(focusNode)}
                            style={{
                                borderColor: CATEGORY_COLORS[focusNode.category],
                                background: `linear-gradient(135deg, ${CATEGORY_COLORS[focusNode.category]}18 0%, ${CATEGORY_COLORS[focusNode.category]}08 50%, transparent 100%)`,
                                boxShadow: `0 8px 32px ${CATEGORY_COLORS[focusNode.category]}25, 0 0 60px ${CATEGORY_COLORS[focusNode.category]}15`
                            }}
                        >
                            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 30%, ${CATEGORY_COLORS[focusNode.category]}40 0%, transparent 65%)` }} />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/30" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="mb-2 p-1">{getCategoryIcon(focusNode.category, "w-10 h-10")}</div>
                                <div className="mb-2">{getCategoryBadge(focusNode)}</div>
                                <div className="text-3xl font-extrabold text-white mb-1 leading-tight tracking-tight">{focusNode.label}</div>
                                <div className="text-sm text-slate-300 font-medium mb-4 opacity-80">
                                    {focusNode.category === Category.COMPANY && `Founded ${focusNode.year}`}
                                    {focusNode.category === Category.PERSON && focusNode.primaryRole}
                                    {focusNode.category === Category.TECHNOLOGY && `Introduced ${focusNode.year}`}
                                </div>
                                <div className="w-full text-left text-sm text-slate-300 leading-relaxed px-1">{focusNode.description}</div>
                            </div>
                        </div>

                        {/* ENGAGES Section - Collapsible */}
                        {engages.length > 0 && (
                            <div className="w-full">
                                {/* Header */}
                                <div className="flex items-center justify-center gap-3 mb-3 cursor-pointer group hover:bg-slate-800/20 rounded py-1 transition-colors"
                                    onClick={() => toggleSection(enagagesSectionKey)}>
                                    <div className="h-px flex-1 bg-amber-500/20" />
                                    <div className="flex items-center gap-1.5 text-amber-500">
                                        <span className="text-[11px] font-bold uppercase tracking-widest">Relationships</span>
                                        <span className="text-[10px] font-medium opacity-70">({engages.length})</span>
                                        {isEngagesCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                    </div>
                                    <div className="h-px flex-1 bg-amber-500/20" />
                                </div>
                                {/* Items */}
                                {!isEngagesCollapsed && (
                                    <div className="space-y-2">
                                        {engages.map((item, idx) => renderEngagesCard(item, idx))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Impact Column */}
                    <div className="flex flex-col pb-8">
                        <div className="flex-1">
                            {renderGroupedSection(impactGrouped, 'impact')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Layout - PC 컬럼 순서대로: Origins → Focus+Relationships → Impact */}
            <div className="md:hidden flex-1 overflow-y-auto relative z-10">
                <div className="p-4 space-y-4">
                    {/* 1. Origins (PC 왼쪽 컬럼) */}
                    <div>
                        {renderGroupedSection(originsGrouped, 'm-origins')}
                    </div>

                    {/* Flow Arrow ↓ - 3개 with wider spacing + bigger */}
                    <div id="mobile-flow-arrow-1" className="flex justify-center items-center gap-12 py-3">
                        <svg width="32" height="24" viewBox="0 0 32 24" className="text-blue-600/70">
                            <polygon points="16,24 0,0 32,0" fill="currentColor" />
                        </svg>
                        <svg width="32" height="24" viewBox="0 0 32 24" className="text-blue-600/70">
                            <polygon points="16,24 0,0 32,0" fill="currentColor" />
                        </svg>
                        <svg width="32" height="24" viewBox="0 0 32 24" className="text-blue-600/70">
                            <polygon points="16,24 0,0 32,0" fill="currentColor" />
                        </svg>
                    </div>

                    {/* 2. Focus Node (PC 중앙 컬럼) - Clickable to open Detail Panel */}
                    <div className="p-4 rounded-2xl border-2 relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
                        onClick={() => onNodeClick(focusNode)}
                        style={{ borderColor: CATEGORY_COLORS[focusNode.category], backgroundColor: `${CATEGORY_COLORS[focusNode.category]}10` }}>
                        <div className="flex flex-col items-center">
                            {/* Category Icon */}
                            <div className="mb-2">{getCategoryIcon(focusNode.category, "w-8 h-8")}</div>
                            {/* Category Badge */}
                            <div className="mb-2">{getCategoryBadge(focusNode)}</div>
                            {/* Name */}
                            <div className="text-xl font-bold text-white mb-1">{focusNode.label}</div>
                            {/* Date Info - like PC */}
                            <div className="text-sm text-slate-300 font-medium mb-3 opacity-80">
                                {focusNode.category === Category.COMPANY && `Founded ${focusNode.year}`}
                                {focusNode.category === Category.PERSON && focusNode.primaryRole}
                                {focusNode.category === Category.TECHNOLOGY && `Introduced ${focusNode.year}`}
                            </div>
                            {/* Description - Left aligned like PC */}
                            <div className="w-full text-left text-sm text-slate-300 leading-relaxed">{focusNode.description}</div>
                        </div>
                    </div>

                    {/* Relationships - Same grouped section style (no icon) */}
                    {engages.length > 0 && (
                        <div className="space-y-2">
                            {/* Header - Collapsible */}
                            <div
                                className="flex items-center justify-center gap-2 cursor-pointer group hover:bg-slate-800/20 rounded py-1 transition-colors"
                                onClick={() => toggleSection('m-engages')}
                            >
                                <div className="h-px flex-1 bg-amber-500/30" />
                                <div className="flex items-center gap-1.5 text-amber-500">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Relationships</span>
                                    <span className="text-[9px] font-medium opacity-70">({engages.length})</span>
                                    {collapsedSections['m-engages'] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                </div>
                                <div className="h-px flex-1 bg-amber-500/30" />
                            </div>
                            {/* Items */}
                            {!collapsedSections['m-engages'] && (
                                <div className="space-y-2">
                                    {engages.map((item, idx) => renderEngagesCard(item, idx))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Flow Arrow ↓ - 3개 with wider spacing + bigger */}
                    <div className="flex justify-center items-center gap-12 py-3">
                        <svg width="32" height="24" viewBox="0 0 32 24" className="text-blue-600/70">
                            <polygon points="16,24 0,0 32,0" fill="currentColor" />
                        </svg>
                        <svg width="32" height="24" viewBox="0 0 32 24" className="text-blue-600/70">
                            <polygon points="16,24 0,0 32,0" fill="currentColor" />
                        </svg>
                        <svg width="32" height="24" viewBox="0 0 32 24" className="text-blue-600/70">
                            <polygon points="16,24 0,0 32,0" fill="currentColor" />
                        </svg>
                    </div>

                    {/* 3. Impact (PC 오른쪽 컬럼) */}
                    <div>
                        {renderGroupedSection(impactGrouped, 'm-impact')}
                    </div>

                    {/* Bottom padding */}
                    <div className="h-20" />
                </div>
            </div>
        </div>
    );
};

export default LinksView;
