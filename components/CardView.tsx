import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GraphData, NodeData, Category } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';
import { getNodeSubtitle } from '../utils/labels';
import { useLocale } from '../hooks/useLocale';

interface CardViewProps {
  data: GraphData;
  fullData: GraphData;
  onNodeClick: (node: NodeData) => void;
  onTagClick: (node: NodeData) => void;
  onNodeDoubleClick?: (node: NodeData) => void;
  scrollToNodeId?: string | null;
  focusNodeId?: string | null;
}

type SortOption = 'IMPORTANCE' | 'ALPHABETICAL' | 'YEAR_OLDEST' | 'YEAR_NEWEST' | 'CATEGORY';

interface SearchSuggestion {
  label: string;       // 번역된 표시 라벨
  key: string;         // 원본 키 (검색 매칭용)
  type: 'CATEGORY' | 'ROLE' | 'TECH';
  count?: number;
}

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const CardView: React.FC<CardViewProps> = ({ data, fullData, onNodeClick, onTagClick, onNodeDoubleClick, scrollToNodeId, focusNodeId }) => {
  // i18n hook
  const { t } = useLocale();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('ALPHABETICAL');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Scroll container ref

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sort nodes based on selection
  const sortedNodes = useMemo(() => {
    return [...data.nodes].sort((a, b) => {
      // NAME (A-Z)
      if (sortBy === 'ALPHABETICAL') {
        return a.label.localeCompare(b.label);
      }

      // YEAR (Oldest First)
      if (sortBy === 'YEAR_OLDEST') {
        if (a.year !== b.year) return a.year - b.year;
        return a.label.localeCompare(b.label);
      }

      // YEAR (Newest First)
      if (sortBy === 'YEAR_NEWEST') {
        if (a.year !== b.year) return b.year - a.year;
        return a.label.localeCompare(b.label);
      }

      // CATEGORY (Company -> Person -> Technology, then A-Z)
      if (sortBy === 'CATEGORY') {
        const categoryOrder = { [Category.COMPANY]: 0, [Category.PERSON]: 1, [Category.TECHNOLOGY]: 2 };
        const catDiff = (categoryOrder[a.category] ?? 3) - (categoryOrder[b.category] ?? 3);
        if (catDiff !== 0) return catDiff;
        return a.label.localeCompare(b.label);
      }

      return 0;
    });
  }, [data.nodes, sortBy]);

  // Extract all searchable unique terms for Autocomplete with counts (i18n enabled)
  const searchSuggestions = useMemo(() => {
    const suggestionsMap = new Map<string, SearchSuggestion>();
    const countMap = new Map<string, number>();

    data.nodes.forEach(node => {
      // Company Categories - 번역 적용
      if (node.category === Category.COMPANY && node.companyCategories) {
        node.companyCategories.forEach(c => {
          if (CATEGORY_LABELS[c]) {
            const key = c; // 원본 키
            const translatedLabel = t(`companyCategories.${c}`) || CATEGORY_LABELS[c];
            suggestionsMap.set(key, { label: translatedLabel, key, type: 'CATEGORY' });
            countMap.set(key, (countMap.get(key) || 0) + 1);
          }
        });
      }
      // Person Roles - 번역 적용
      if (node.category === Category.PERSON && node.impactRole) {
        const key = node.impactRole; // 원본 키
        const translatedLabel = t(`personRoles.${node.impactRole}`) || toTitleCase(node.impactRole);
        suggestionsMap.set(key, { label: translatedLabel, key, type: 'ROLE' });
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }
      // Tech Categories - 번역 적용
      if (node.category === Category.TECHNOLOGY) {
        if (node.techCategoryL1) {
          const key = node.techCategoryL1;
          const translatedLabel = t(`techCategoryL1.${node.techCategoryL1}`) || node.techCategoryL1;
          suggestionsMap.set(key, { label: translatedLabel, key, type: 'TECH' });
          countMap.set(key, (countMap.get(key) || 0) + 1);
        }
        if (node.techCategoryL2) {
          const key = node.techCategoryL2;
          const translatedLabel = t(`techCategoryL2.${node.techCategoryL2}`) || node.techCategoryL2;
          suggestionsMap.set(key, { label: translatedLabel, key, type: 'TECH' });
          countMap.set(key, (countMap.get(key) || 0) + 1);
        }
      }
    });

    // Add counts to suggestions
    return Array.from(suggestionsMap.values())
      .map(s => ({ ...s, count: countMap.get(s.key) || 0 }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data.nodes, t]);

  // Filter suggestions based on query (검색: 번역 라벨 + 원본 키 둘 다 매칭)
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    // Exclude exact matches to avoid showing what user already typed perfectly
    return searchSuggestions.filter(s =>
      (s.label.toLowerCase().includes(lowerQuery) || s.key.toLowerCase().includes(lowerQuery)) &&
      s.label.toLowerCase() !== lowerQuery
    ).slice(0, 8); // Limit to 8 suggestions
  }, [searchQuery, searchSuggestions]);

  // Local text filter (검색: 원본 키 + 번역 라벨 둘 다 매칭)
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return sortedNodes;
    const lowerQuery = searchQuery.toLowerCase();
    return sortedNodes.filter(node => {
      // Standard text search
      const textMatch =
        node.label.toLowerCase().includes(lowerQuery) ||
        node.description.toLowerCase().includes(lowerQuery);

      // Category/Role precise matching (원본 키 + 번역 라벨 둘 다)
      const categoryMatch =
        (node.companyCategories?.some(c => {
          const translated = t(`companyCategories.${c}`) || CATEGORY_LABELS[c];
          return CATEGORY_LABELS[c].toLowerCase().includes(lowerQuery) ||
            translated.toLowerCase().includes(lowerQuery);
        })) ||
        (node.impactRole && (
          node.impactRole.toLowerCase().includes(lowerQuery) ||
          (t(`personRoles.${node.impactRole}`) || '').toLowerCase().includes(lowerQuery)
        )) ||
        (node.techCategoryL1 && (
          node.techCategoryL1.toLowerCase().includes(lowerQuery) ||
          (t(`techCategoryL1.${node.techCategoryL1}`) || '').toLowerCase().includes(lowerQuery)
        )) ||
        (node.techCategoryL2 && (
          node.techCategoryL2.toLowerCase().includes(lowerQuery) ||
          (t(`techCategoryL2.${node.techCategoryL2}`) || '').toLowerCase().includes(lowerQuery)
        ));

      return textMatch || categoryMatch;
    });
  }, [sortedNodes, searchQuery, t]);

  // Effect for scrolling - use container scrollTop to avoid iOS page push
  useEffect(() => {
    if (scrollToNodeId && containerRef.current) {
      const element = document.getElementById(`list-node-${scrollToNodeId}`);
      if (element) {
        const container = containerRef.current;
        const elementTop = element.offsetTop;
        const containerHeight = container.clientHeight;
        const targetScroll = elementTop - containerHeight / 2 + element.clientHeight / 2;
        container.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, [scrollToNodeId]);

  // Use getNodeSubtitle from labels.ts for consistent labeling
  const getSubLabel = (node: NodeData) => {
    if (node.category === Category.COMPANY) return `Founded in ${node.year}`;
    if (node.category === Category.PERSON) return node.primaryRole || `Active since ${node.year}`;
    if (node.category === Category.TECHNOLOGY) return node.techCategoryL2 || node.techCategoryL1 || `${node.year}`;
    return `${node.year}`;
  };

  const handleTagClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    // Use fullData to find node even if hidden
    const targetNode = fullData.nodes.find(n => n.id === nodeId);
    if (targetNode) onTagClick(targetNode);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // Keyboard navigation for autocomplete
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex].label);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Search & Sort Bar - hidden in Focus mode */}
      {!focusNodeId && (
        <div className="p-4 border-b border-slate-700 bg-surface/50 backdrop-blur sticky top-0 z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">

            {/* Search Input Container */}
            <div className="relative flex-1" ref={searchContainerRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg leading-5 bg-slate-900 text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                placeholder={t('cardView.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  setSearchQuery('');
                  setShowSuggestions(true);
                  setSelectedSuggestionIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
              />
              {/* Autocomplete Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-30 w-full mt-1 bg-slate-900 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredSuggestions.map((suggestion, index) => {
                    // Color-coded highlighting based on type
                    const typeColors = {
                      'CATEGORY': 'text-red-400 font-bold',
                      'ROLE': 'text-blue-400 font-bold',
                      'TECH': 'text-emerald-400 font-bold',
                    };
                    const textColor = typeColors[suggestion.type] || 'text-slate-300';
                    const badgeColors = {
                      'CATEGORY': 'bg-red-900/30 text-red-400',
                      'ROLE': 'bg-blue-900/30 text-blue-400',
                      'TECH': 'bg-emerald-900/30 text-emerald-400',
                    };
                    const badgeColor = badgeColors[suggestion.type] || 'bg-slate-800 text-slate-500';

                    return (
                      <div
                        key={index}
                        className={`px-4 py-2 cursor-pointer text-sm transition-colors flex items-center justify-between ${textColor} ${index === selectedSuggestionIndex ? 'bg-slate-700' : 'hover:bg-slate-800'
                          }`}
                        onClick={() => handleSuggestionClick(suggestion.label)}
                      >
                        <span>{suggestion.label}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeColor}`}>
                          {suggestion.type === 'TECH' ? 'CATEGORY' : suggestion.type}{suggestion.count ? ` (${suggestion.count})` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sort Selector */}
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="block w-full pl-10 pr-8 py-2 border border-slate-600 rounded-lg bg-slate-900 text-slate-200 focus:outline-none focus:border-primary text-sm appearance-none cursor-pointer"
              >
                <option value="ALPHABETICAL">{t('cardView.sortOptions.alphabetical')}</option>
                <option value="CATEGORY">{t('cardView.sortOptions.category')}</option>
                <option value="YEAR_NEWEST">{t('cardView.sortOptions.yearNewest')}</option>
                <option value="YEAR_OLDEST">{t('cardView.sortOptions.yearOldest')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredNodes.map(node => {
            // USE fullData for HASHTAGS to show even if filtered out
            const relatedLinks = fullData.links.filter(l => {
              const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
              const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
              return s === node.id || t === node.id;
            });

            const hashtags = relatedLinks.map(l => {
              const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
              const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
              const targetId = sId === node.id ? tId : sId;
              const targetNode = fullData.nodes.find(n => n.id === targetId);
              return targetNode ? { id: targetId, label: targetNode.label } : null;
            }).filter(Boolean);

            return (
              <div
                key={node.id}
                id={`list-node-${node.id}`}
                onClick={() => onNodeClick(node)}
                onDoubleClick={() => onNodeDoubleClick?.(node)}
                className="group relative bg-surface border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col select-none"
                style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: CATEGORY_COLORS[node.category] }}></div>

                <div className="p-5 flex flex-col flex-1">
                  {/* Category / Role Badges */}
                  <div className="min-h-[22px] flex flex-wrap gap-1 mb-2">
                    {/* Company Category Badge - RED (Muted) - UPPERCASE */}
                    {node.category === Category.COMPANY && node.companyCategories?.[0] && (
                      <span className="text-[9px] font-medium px-1.5 py-1 rounded bg-red-900/20 text-red-400/80 border border-red-800/30">
                        {(t(`companyCategories.${node.companyCategories[0]}`) || CATEGORY_LABELS[node.companyCategories[0]] || node.companyCategories[0]).toUpperCase()}
                      </span>
                    )}

                    {/* Person Role Badge (Muted) - Using impactRole (personRole) for display - UPPERCASE */}
                    {node.category === Category.PERSON && node.impactRole && (
                      <span className="text-[9px] font-medium px-1.5 py-1 rounded bg-blue-900/20 text-blue-400/80 border border-blue-800/30">
                        {(t(`personRoles.${node.impactRole}`) || node.impactRole).toUpperCase()}
                      </span>
                    )}

                    {/* Technology Categories - GREEN (Muted) - L2 ONLY (L1 still searchable) */}
                    {node.category === Category.TECHNOLOGY && node.techCategoryL2 && (
                      <span className="text-[9px] font-medium px-1.5 py-1 rounded bg-emerald-900/20 text-emerald-400/80 border border-emerald-800/30">
                        {(t(`techCategoryL2.${node.techCategoryL2}`) || node.techCategoryL2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{node.label}</h3>

                  <div className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
                    {getSubLabel(node) && (
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        {getSubLabel(node)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-7 mb-4 flex-1">
                    {node.description}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredNodes.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p>No nodes found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardView;