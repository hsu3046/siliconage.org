import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GraphData, NodeData, Category } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';

interface ListViewProps {
  data: GraphData;
  fullData: GraphData;
  onNodeClick: (node: NodeData) => void;
  onTagClick: (node: NodeData) => void;
  scrollToNodeId?: string | null;
  focusNodeId?: string | null;
}

type SortOption = 'IMPORTANCE' | 'ALPHABETICAL' | 'YEAR_OLDEST' | 'YEAR_NEWEST';

interface SearchSuggestion {
  label: string;
  type: 'CATEGORY' | 'ROLE' | 'TECH';
}

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const ListView: React.FC<ListViewProps> = ({ data, fullData, onNodeClick, onTagClick, scrollToNodeId, focusNodeId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('IMPORTANCE');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
      // IMPORTANCE (Highest Score First)
      if (sortBy === 'IMPORTANCE') {
        const scoreA = a._score || 0;
        const scoreB = b._score || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.label.localeCompare(b.label);
      }

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

      return 0;
    });
  }, [data.nodes, sortBy]);

  // Extract all searchable unique terms for Autocomplete
  const searchSuggestions = useMemo(() => {
    const suggestionsMap = new Map<string, SearchSuggestion>();

    data.nodes.forEach(node => {
      // Company Categories
      if (node.category === Category.COMPANY && node.companyCategories) {
        node.companyCategories.forEach(c => {
          if (CATEGORY_LABELS[c]) {
            suggestionsMap.set(CATEGORY_LABELS[c], { label: CATEGORY_LABELS[c], type: 'CATEGORY' });
          }
        });
      }
      // Person Roles
      if (node.category === Category.PERSON && node.impactRole) {
        const roleLabel = toTitleCase(node.impactRole);
        suggestionsMap.set(roleLabel, { label: roleLabel, type: 'ROLE' });
      }
      // Tech Categories
      if (node.category === Category.TECHNOLOGY) {
        if (node.techCategoryL1) {
          suggestionsMap.set(node.techCategoryL1, { label: node.techCategoryL1, type: 'TECH' });
        }
        if (node.techCategoryL2) {
          suggestionsMap.set(node.techCategoryL2, { label: node.techCategoryL2, type: 'TECH' });
        }
      }
    });

    return Array.from(suggestionsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [data.nodes]);

  // Filter suggestions based on query
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    // Exclude exact matches to avoid showing what user already typed perfectly
    return searchSuggestions.filter(s =>
      s.label.toLowerCase().includes(lowerQuery) && s.label.toLowerCase() !== lowerQuery
    ).slice(0, 8); // Limit to 8 suggestions
  }, [searchQuery, searchSuggestions]);

  // Local text filter
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return sortedNodes;
    const lowerQuery = searchQuery.toLowerCase();
    return sortedNodes.filter(node => {
      // Standard text search
      const textMatch =
        node.label.toLowerCase().includes(lowerQuery) ||
        node.description.toLowerCase().includes(lowerQuery);

      // Category/Role precise matching (for when clicking suggestions)
      const categoryMatch =
        (node.companyCategories?.some(c => CATEGORY_LABELS[c].toLowerCase().includes(lowerQuery))) ||
        (node.impactRole && node.impactRole.toLowerCase().includes(lowerQuery)) ||
        (node.techCategoryL1 && node.techCategoryL1.toLowerCase().includes(lowerQuery)) ||
        (node.techCategoryL2 && node.techCategoryL2.toLowerCase().includes(lowerQuery));

      return textMatch || categoryMatch;
    });
  }, [sortedNodes, searchQuery]);

  // Effect for scrolling
  useEffect(() => {
    if (scrollToNodeId) {
      const element = document.getElementById(`list-node-${scrollToNodeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToNodeId]);

  const getSubLabel = (node: NodeData) => {
    if (node.category === Category.COMPANY) return `Founded in ${node.year}`;
    if (node.category === Category.PERSON) return node.primaryRole;
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
                placeholder="Search by name, category, role, or tech..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              {/* Autocomplete Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-30 w-full mt-1 bg-slate-900 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2 hover:bg-slate-800 cursor-pointer text-sm text-slate-300 transition-colors flex items-center justify-between ${suggestion.type === 'CATEGORY' || suggestion.type === 'TECH' ? 'font-bold text-white' : ''
                        }`}
                      onClick={() => handleSuggestionClick(suggestion.label)}
                    >
                      <span>{suggestion.label}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-normal opacity-50 ml-2">
                        {suggestion.type === 'TECH' ? 'CATEGORY' : suggestion.type}
                      </span>
                    </div>
                  ))}
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

                <option value="IMPORTANCE">Highest Impact</option>
                <option value="ALPHABETICAL">Name (A-Z)</option>
                <option value="YEAR_OLDEST">Year: Oldest First</option>
                <option value="YEAR_NEWEST">Year: Newest First</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
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
                className="group relative bg-surface border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: CATEGORY_COLORS[node.category] }}></div>

                <div className="p-5 flex flex-col flex-1">
                  {/* Category / Role Badges */}
                  <div className="min-h-[22px] flex flex-wrap gap-1 mb-2">
                    {/* Company Category Badge */}
                    {node.category === Category.COMPANY && node.companyCategories?.[0] && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-800/50">
                        {CATEGORY_LABELS[node.companyCategories[0]]}
                      </span>
                    )}

                    {/* Person Role Badge - NEW */}
                    {node.category === Category.PERSON && node.impactRole && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/50">
                        {toTitleCase(node.impactRole)}
                      </span>
                    )}

                    {/* Technology Categories */}
                    {node.category === Category.TECHNOLOGY && (
                      <>
                        {node.techCategoryL1 && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/50">
                            {node.techCategoryL1}
                          </span>
                        )}
                        {node.techCategoryL2 && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-indigo-900/30 text-indigo-300 border border-indigo-800/50">
                            {node.techCategoryL2}
                          </span>
                        )}
                      </>
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

                  <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                    {node.description}
                  </p>

                  {hashtags.length > 0 && (
                    <div className="mt-auto pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
                      {hashtags.slice(0, 5).map((tag, idx) => (
                        <span
                          key={`${node.id}-tag-${idx}`}
                          onClick={(e) => tag && handleTagClick(e, tag.id)}
                          className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline bg-blue-500/10 px-2 py-1 rounded cursor-pointer transition-colors"
                        >
                          #{tag?.label.replace(/\s+/g, '')}
                        </span>
                      ))}
                      {hashtags.length > 5 && (
                        <span className="text-xs text-slate-500 py-1">+{hashtags.length - 5} more</span>
                      )}
                    </div>
                  )}

                  {/* Impact Score - Bottom Right */}
                  <div className="flex justify-end mt-3">
                    <div
                      className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-600"
                      title="Impact Factor"
                    >
                      <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {Math.round(node._score || 0)}
                      </span>
                    </div>
                  </div>
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

export default ListView;