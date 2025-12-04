
import React, { useEffect } from 'react';
import { GraphData, NodeData, Category, TechCategoryL1, TechCategoryL2 } from '../types';
import { CATEGORY_COLORS } from '../constants';
import TechCategoryFilter from './TechCategoryFilter';

interface TimelineViewProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
  scrollToNodeId?: string | null;
}

import { useState, useRef, useMemo } from 'react';

const TimelineView: React.FC<TimelineViewProps> = ({ data, onNodeClick, scrollToNodeId }) => {
  // Search State (Map-style)
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<NodeData[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Category Filter State
  const [selectedL1, setSelectedL1] = useState<TechCategoryL1 | null>(null);
  const [selectedL2, setSelectedL2] = useState<TechCategoryL2 | null>(null);

  const handleFilterChange = (l1: TechCategoryL1 | null, l2: TechCategoryL2 | null) => {
    setSelectedL1(l1);
    setSelectedL2(l2);
  };

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const l1Counts: Record<string, number> = {};
    const l2Counts: Record<string, number> = {};

    data.nodes.forEach(node => {
      if (node.techCategoryL1) {
        l1Counts[node.techCategoryL1] = (l1Counts[node.techCategoryL1] || 0) + 1;
      }
      if (node.techCategoryL2) {
        l2Counts[node.techCategoryL2] = (l2Counts[node.techCategoryL2] || 0) + 1;
      }
    });

    return { l1: l1Counts, l2: l2Counts };
  }, [data.nodes]);

  // Apply category filter
  const filteredNodes = data.nodes.filter(node => {
    if (!selectedL1) return true;
    if (node.techCategoryL1 !== selectedL1) return false;
    if (selectedL2 && node.techCategoryL2 !== selectedL2) return false;
    return true;
  });

  // Sort nodes by year
  const sortedNodes = [...filteredNodes].sort((a, b) => a.year - b.year);

  // Group by year to handle multiple events in one year
  const groupedByYear: Record<number, NodeData[]> = {};
  sortedNodes.forEach(node => {
    if (!groupedByYear[node.year]) groupedByYear[node.year] = [];
    groupedByYear[node.year].push(node);
  });

  const years = Object.keys(groupedByYear).map(Number).sort((a, b) => a - b);

  // Helper to handle internal scrolling
  const scrollToNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const element = document.getElementById(`timeline-node-${nodeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const targetNode = data.nodes.find(n => n.id === nodeId);
      if (targetNode) onNodeClick(targetNode);
    }
  };

  // Effect to scroll to specific node when prop changes (external navigation)
  useEffect(() => {
    if (scrollToNodeId) {
      const element = document.getElementById(`timeline-node-${scrollToNodeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToNodeId]);

  // Helper to formulate the Sub-Label matching Map/List view
  const getSubLabel = (node: NodeData) => {
    if (node.category === Category.COMPANY) {
      return `${node.year} - Current`;
    }
    if (node.category === Category.PERSON) {
      return node.role || null;
    }
    return `${node.year}`;
  };

  // Search Logic (Map-style: node names only with suggestions)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      const matches = data.nodes
        .filter(n => n.label.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(matches);
      setIsSearchFocused(true);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSelect = (node: NodeData) => {
    // Clear blur timeout if pending
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    // Get reference to container and target element before making changes
    const scrollContainer = document.querySelector('.w-full.h-full.overflow-y-auto') as HTMLElement;
    const targetElement = document.getElementById(`timeline-node-${node.id}`);

    setSearchTerm("");
    setSuggestions([]);
    setIsSearchFocused(false);

    // Blur input to dismiss keyboard on mobile
    searchInputRef.current?.blur();

    // Use requestAnimationFrame chain to wait for keyboard dismiss and then scroll
    // This is more reliable than setTimeout for iOS Safari
    const scrollToTarget = () => {
      if (targetElement && scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop + targetRect.top - containerRect.top - containerRect.height / 2 + targetRect.height / 2;

        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    };

    // Wait for keyboard to fully dismiss (300ms is typical iOS keyboard animation)
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToTarget();
        });
      });
    }, 300);
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
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSearchSelect(suggestions[0]);
      } else if (searchTerm) {
        const match = data.nodes.find(n => n.label.toLowerCase() === searchTerm.toLowerCase())
          || data.nodes.find(n => n.label.toLowerCase().includes(searchTerm.toLowerCase()));
        if (match) {
          handleSearchSelect(match);
        }
      }
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-background p-4 custom-scrollbar scroll-smooth">
      <div className="max-w-6xl mx-auto relative">
        {/* Central Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 transform md:-translate-x-1/2"></div>

        {/* Sticky Search Header - reduced margin to match ListView */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="e.g. Apple, Google"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              {/* Suggestions Dropdown */}
              {isSearchFocused && suggestions.length > 0 && (
                <div className="absolute mt-1 w-full bg-slate-900/95 border border-slate-600 rounded-md shadow-2xl backdrop-blur-md overflow-hidden z-50">
                  <ul className="max-h-60 overflow-auto custom-scrollbar">
                    {suggestions.map((node) => (
                      <li
                        key={node.id}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-800 text-slate-300 transition-colors border-b border-slate-800/50 last:border-0"
                        onClick={() => handleSearchSelect(node)}
                      >
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[node.category] }}></span>
                          <span className="block truncate font-medium text-sm">{node.label}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <TechCategoryFilter
              selectedL1={selectedL1}
              selectedL2={selectedL2}
              onFilterChange={handleFilterChange}
              counts={categoryCounts}
            />
          </div>
        </div>


        {years.map((year) => (
          <div key={year} className="mb-8 relative">

            {/* Year Badge */}
            <div className="flex items-center justify-start md:justify-center mb-6 pl-10 md:pl-0 pt-4">
              <span className="bg-slate-900 text-slate-300 font-mono font-bold text-lg px-4 py-1 rounded-full border border-slate-700 z-10 shadow-xl">
                {year}
              </span>
            </div>

            {/* Container for the year's events - Flex Wrap allows side-by-side */}
            <div className="relative flex flex-col md:flex-row md:flex-wrap w-full">
              {groupedByYear[year].map((node, i) => {
                // Calculate connections for hashtags
                const relatedLinks = data.links.filter(l => {
                  const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
                  const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
                  return s === node.id || t === node.id;
                });

                const hashtags = relatedLinks.map(l => {
                  const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                  const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                  const targetId = sId === node.id ? tId : sId;
                  const targetNode = data.nodes.find(n => n.id === targetId);
                  return targetNode ? { id: targetId, label: targetNode.label } : null;
                }).filter(Boolean);

                // Determine Layout: Left (Even index) vs Right (Odd index)
                const isLeft = i % 2 === 0;
                const subLabel = getSubLabel(node);

                return (
                  <div
                    key={node.id}
                    id={`timeline-node-${node.id}`}
                    className={`
                            relative w-full md:w-1/2 mb-8 flex
                            pl-12 md:pl-0
                            ${isLeft ? 'md:justify-end md:pr-12' : 'md:justify-start md:pl-12'}
                        `}
                  >
                    {/* Connector Line */}
                    <div
                      className={`
                                absolute top-6 h-0.5 bg-slate-700
                                left-4 w-8
                                ${isLeft ? 'md:left-auto md:right-0 md:w-12' : 'md:left-0 md:w-12'}
                            `}
                    ></div>

                    {/* Card */}
                    <div
                      onClick={() => onNodeClick(node)}
                      className={`
                                bg-surface p-5 rounded-xl border border-slate-700/50 shadow-lg 
                                cursor-pointer hover:border-slate-500 hover:shadow-2xl transition-all duration-300
                                group relative overflow-hidden w-full max-w-lg
                            `}
                    >
                      {/* Category Accent Bar */}
                      <div
                        className={`absolute top-0 bottom-0 w-1 ${isLeft ? 'right-0' : 'left-0'}`}
                        style={{ backgroundColor: CATEGORY_COLORS[node.category] }}
                      ></div>

                      <div className={`flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/50"
                            style={{ color: CATEGORY_COLORS[node.category] }}
                          >
                            {node.category}
                          </span>
                          {/* Exact Score Display */}
                          <div
                            className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-600 ml-2"
                            title="Impact Factor"
                          >
                            <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            <span className="text-xs font-mono font-bold text-slate-300">
                              {(node._score || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Company Categories */}
                        {node.category === Category.COMPANY && node.companyCategories && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {node.companyCategories.map((cat) => (
                              <span key={cat} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-800/50">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Technology Categories */}
                        {node.category === Category.TECHNOLOGY && (
                          <div className="flex flex-wrap gap-1 mb-2">
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
                          </div>
                        )}

                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors leading-tight text-left md:text-inherit">
                          {node.label}
                        </h3>

                        {/* Sub Label (Year/Role) */}
                        {subLabel && (
                          <span className={`text-xs font-mono text-slate-400 mb-3 block text-left ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                            {subLabel}
                          </span>
                        )}

                        <p className={`text-sm text-slate-400 leading-relaxed mb-4 text-left ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                          {node.description}
                        </p>

                        {/* Interactive Hashtags */}
                        {hashtags.length > 0 && (
                          <div className={`flex flex-wrap gap-2 justify-start ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                            {hashtags.map((tag, idx) => (
                              <span
                                key={`${node.id}-tag-${idx}`}
                                onClick={(e) => tag && scrollToNode(e, tag.id)}
                                className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline bg-blue-500/10 px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                #{tag?.label.replace(/\s+/g, '')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* End Cap */}
        <div className="flex justify-center mt-8 pb-12">
          <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600"></div>
        </div>
      </div>
    </div >
  );
};

export default TimelineView;
