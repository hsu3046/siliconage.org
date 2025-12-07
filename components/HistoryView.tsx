import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GraphData, NodeData, Category, LinkType } from '../types';
import { CATEGORY_COLORS, ERAS, INITIAL_DATA } from '../constants';
import { getTechVerb, getPersonVerbs } from '../utils/labels';

interface HistoryViewProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
  scrollToNodeId?: string | null;
  focusNodeId?: string | null;
}

// Get era for a given year
const getEraForYear = (year: number) => {
  return ERAS.find(era => year >= era.startYear && year <= era.endYear);
};

// Get node size class based on radius
const getNodeSizeClass = (radius: number) => {
  if (radius >= 35) return 'large';
  if (radius >= 25) return 'medium';
  return 'small';
};

const HistoryView: React.FC<HistoryViewProps> = ({ data, onNodeClick, scrollToNodeId, focusNodeId }) => {
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<NodeData[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sort nodes by year
  const sortedNodes = useMemo(() => {
    return [...data.nodes].sort((a, b) => a.year - b.year);
  }, [data.nodes]);

  // Group by year
  const groupedByYear = useMemo(() => {
    const grouped: Record<number, NodeData[]> = {};
    sortedNodes.forEach(node => {
      if (!grouped[node.year]) grouped[node.year] = [];
      grouped[node.year].push(node);
    });
    return grouped;
  }, [sortedNodes]);

  const years = useMemo(() => {
    return Object.keys(groupedByYear).map(Number).sort((a, b) => a - b);
  }, [groupedByYear]);

  // Build creator map from INITIAL_DATA (not filtered data) to always show all created entities
  const creatorMap = useMemo(() => {
    // Achievement structure: { label, year, category }
    interface Achievement { label: string; year: number; category: Category; }
    const achievementMap: Record<string, Achievement[]> = {}; // personId -> [achievements]
    const createdByMap: Record<string, string> = {}; // techId -> creator label

    INITIAL_DATA.links.forEach(link => {
      if (link.type === LinkType.CREATES) {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;

        const sourceNode = INITIAL_DATA.nodes.find(n => n.id === sourceId);
        const targetNode = INITIAL_DATA.nodes.find(n => n.id === targetId);

        if (sourceNode && targetNode) {
          // Build achievements with year and category
          if (!achievementMap[sourceId]) achievementMap[sourceId] = [];
          achievementMap[sourceId].push({
            label: targetNode.label,
            year: targetNode.year,
            category: targetNode.category
          });

          if (targetNode.category === Category.TECHNOLOGY) {
            if (!createdByMap[targetId] || sourceNode.category === Category.COMPANY) {
              createdByMap[targetId] = sourceNode.label;
            }
          }
        }
      }
    });

    // Sort achievements by year for each creator
    Object.keys(achievementMap).forEach(id => {
      achievementMap[id].sort((a, b) => a.year - b.year);
    });

    return { achievements: achievementMap, createdBy: createdByMap };
  }, []); // No dependencies - always use INITIAL_DATA

  // Effect to scroll to specific node
  useEffect(() => {
    if (scrollToNodeId) {
      const element = document.getElementById(`timeline-node-${scrollToNodeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToNodeId]);

  // Search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      // Category priority: COMPANY=0, TECHNOLOGY=1, PERSON=2
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
    setSearchTerm(node.label);
    setSuggestions([]);
    setIsSearchFocused(false);
    searchInputRef.current?.blur();

    setTimeout(() => {
      const element = document.getElementById(`timeline-node-${node.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const handleSearchFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setSearchTerm("");
    setSuggestions([]);
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
      }
    }
  };

  // Track last era to show dividers
  let lastEraId: string | null = null;

  // Render Company Node
  const renderCompanyNode = (node: NodeData, isLeft: boolean) => {
    const radius = node._radius || 15;
    const sizeClass = getNodeSizeClass(radius);

    const sizeStyles = {
      large: 'py-3 px-4',
      medium: 'py-2 px-3',
      small: 'py-1.5 px-2'
    };

    const textSizeStyles = {
      large: 'text-lg',
      medium: 'text-base',
      small: 'text-sm'
    };

    return (
      <div
        id={`timeline-node-${node.id}`}
        onClick={() => onNodeClick(node)}
        className={`
          cursor-pointer transition-all duration-200 hover:scale-[1.02]
          bg-slate-800/50 border-l-4 border-red-500 rounded-r-lg
          ${sizeStyles[sizeClass]}
          ${isLeft ? 'md:text-right text-left' : 'text-left'}
        `}
      >
        <div className={`flex items-baseline gap-1 flex-wrap ${isLeft ? 'md:justify-end justify-start' : 'justify-start'}`}>
          <span className={`font-bold text-white ${textSizeStyles[sizeClass]}`}>{node.label}</span>
          <span className="text-slate-500 text-xs">Founded ({node.year})</span>
        </div>
        {node.description && (
          <p className={`text-slate-400 text-xs mt-1 line-clamp-2 ${isLeft ? 'md:text-right text-left' : 'text-left'}`}>
            {node.description}
          </p>
        )}
      </div>
    );
  };

  // Get person context based on PersonRole (impactRole)
  const getPersonContext = (node: NodeData): string => {
    const verbs = getPersonVerbs(node);
    // For timeline, use createdTech verb as the primary action
    return verbs.createdTech;
  };

  // Render Person Node - dot centered vertically relative to text block
  const renderPersonNode = (node: NodeData, isLeft: boolean) => {
    const verbs = getPersonVerbs(node);
    const achievements = creatorMap.achievements[node.id] || [];

    // Build achievement text with individual years
    const getAchievementText = () => {
      if (achievements.length === 0) return '';

      // Format each achievement based on category
      const formatted = achievements.slice(0, 3).map(a => {
        if (a.category === Category.COMPANY) {
          return `${verbs.foundedCompany} ${a.label} (${a.year})`;
        } else if (a.category === Category.TECHNOLOGY) {
          return `${verbs.createdTech} ${a.label} (${a.year})`;
        }
        return `${a.label} (${a.year})`;
      });

      return formatted.join(', ');
    };

    const achievementText = getAchievementText();

    return (
      <div
        id={`timeline-node-${node.id}`}
        onClick={() => onNodeClick(node)}
        className={`
          cursor-pointer transition-all duration-200 hover:opacity-80 
          flex items-center gap-2
          flex-row
          ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'}
        `}
      >
        {/* Dot - centered via items-center on container */}
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
        {/* Text content */}
        <div className={`flex flex-col items-start text-left ${isLeft ? 'md:items-end md:text-right' : 'md:items-start md:text-left'}`}>
          <span className="text-white text-sm font-medium">{node.label}</span>
          <span className="text-slate-500 text-xs">
            {achievementText || `Active since ${node.year}`}
          </span>
        </div>
      </div>
    );
  };

  // Render Technology Node - full width on mobile, 3 fixed sizes on desktop
  const renderTechNode = (node: NodeData, isLeft: boolean) => {
    const radius = node._radius || 15;
    const creator = creatorMap.createdBy[node.id];

    // Get fallback description for tech without creator
    const getFallbackDescription = () => {
      const role = node.impactRole;
      const catL2 = node.techCategoryL2 || node.techCategoryL1;

      // TechRole-based description
      if (role === 'FOUNDATION') return `Foundational theory`;
      if (role === 'CORE') return `Core technology`;
      if (role === 'PLATFORM') return `Platform`;
      if (role === 'APPLICATION') return `Application`;

      // TechCategoryL2 fallback
      if (catL2) return catL2;

      return 'Technology';
    };

    // 3 fixed sizes based on radius
    let sizeClass = 'md:w-40'; // small
    let textSize = 'text-sm';
    let padding = 'px-3 py-1.5';
    if (radius >= 35) {
      sizeClass = 'md:w-64'; // large
      textSize = 'text-base';
      padding = 'px-4 py-2';
    } else if (radius >= 25) {
      sizeClass = 'md:w-52'; // medium
      textSize = 'text-sm';
      padding = 'px-3 py-2';
    }

    // Build description text
    const descriptionText = creator
      ? `${getTechVerb(node)} by ${creator} (${node.year})`
      : `${getFallbackDescription()} (${node.year})`;

    return (
      <div
        id={`timeline-node-${node.id}`}
        onClick={() => onNodeClick(node)}
        className={`
          cursor-pointer transition-all duration-200 hover:scale-105 
          w-full ${sizeClass}
          ${isLeft ? 'md:ml-auto' : 'md:mr-auto'}
        `}
      >
        <div
          className={`
            flex flex-col items-start text-left w-full
            border border-emerald-500/50 bg-emerald-500/10 rounded-lg
            ${padding}
            ${isLeft ? 'md:items-end md:text-right' : 'md:items-start md:text-left'}
          `}
        >
          <span className={`text-emerald-400 font-medium ${textSize}`}>
            {node.label}
          </span>
          <span className="text-slate-500 text-xs">
            {descriptionText}
          </span>
        </div>
      </div>
    );
  };

  // Render node based on category
  const renderNode = (node: NodeData, isLeft: boolean) => {
    switch (node.category) {
      case Category.COMPANY:
        return renderCompanyNode(node, isLeft);
      case Category.PERSON:
        return renderPersonNode(node, isLeft);
      case Category.TECHNOLOGY:
        return renderTechNode(node, isLeft);
      default:
        return renderCompanyNode(node, isLeft);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-background p-4 custom-scrollbar scroll-smooth">
      <div className="max-w-4xl mx-auto relative">
        {/* Central Timeline Line - hidden on mobile, starts from first content on desktop */}
        <div className="hidden md:block absolute md:left-1/2 bottom-0 w-px bg-slate-700 transform md:-translate-x-1/2" style={{ top: '120px' }} />

        {/* Search Header - hidden in Focus mode, LEFT aligned */}
        {!focusNodeId && (
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pb-4 mb-6">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="Find & Jump to a Topic..."
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
                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[node.category] }} />
                          <span className="block truncate font-medium text-sm">{node.label}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline Content */}
        {years.map((year) => {
          const currentEra = getEraForYear(year);
          const showEraDivider = currentEra && currentEra.id !== lastEraId;
          if (currentEra) lastEraId = currentEra.id;

          return (
            <div key={year}>
              {/* Era Divider - thicker line, covers timeline */}
              {showEraDivider && currentEra && (
                <div className={`relative mb-10 md:mb-14 ${currentEra.id === 'genesis' ? 'mt-4 md:mt-6' : 'mt-16 md:mt-20'} -mx-4 md:-mx-12`}>
                  {/* Background to hide timeline */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-background z-10" />
                  {/* Thicker era line - wider with negative margins */}
                  <div className="relative z-20 flex items-center gap-4 px-4 md:px-12">
                    <div className="flex-1 h-0.5 bg-slate-600" />
                    <span className="text-xs font-mono text-slate-400 tracking-widest whitespace-nowrap bg-background px-3">
                      {currentEra.label} {currentEra.startYear}-{currentEra.endYear === 2099 ? 'NOW' : currentEra.endYear}
                    </span>
                    <div className="flex-1 h-0.5 bg-slate-600" />
                  </div>
                </div>
              )}

              {/* Year Content */}
              <div className="mb-6 relative">
                {/* Year Badge on Timeline */}
                <div className="flex items-center justify-start md:justify-center mb-4 pl-8 md:pl-0">
                  <span className="text-xs font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded z-10">
                    {year}
                  </span>
                </div>

                {/* Nodes for this year - closer to center line */}
                <div className="relative flex flex-col md:flex-row md:flex-wrap w-full gap-3">
                  {groupedByYear[year].map((node, i) => {
                    const isLeft = i % 2 === 0;

                    return (
                      <div
                        key={node.id}
                        className={`
                          relative w-full md:w-[calc(50%-0.5rem)]
                          pl-10 md:pl-0
                          ${isLeft ? 'md:pr-4 md:ml-0' : 'md:pl-4 md:ml-auto'}
                        `}
                      >
                        {renderNode(node, isLeft)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* End Cap */}
        <div className="flex justify-center mt-8 pb-12">
          <div className="w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-600" />
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
