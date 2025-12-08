import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GraphData, NodeData, Category, LinkType, LinkData, EventData } from '../types';
import { CATEGORY_COLORS, ERAS, INITIAL_DATA } from '../constants';
import { getTechVerb, getPersonVerbs, getNodeSubtitle, Achievement, generateRelationLabel } from '../utils/labels';

interface HistoryViewProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
  onNodeDoubleClick?: (node: NodeData) => void;
  scrollToNodeId?: string | null;
  focusNodeId?: string | null;
  showStories?: boolean;
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

const HistoryView: React.FC<HistoryViewProps> = ({ data, onNodeClick, onNodeDoubleClick, scrollToNodeId, focusNodeId, showStories = true }) => {
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<NodeData[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Scroll container ref

  // Sort nodes by year
  const sortedNodes = useMemo(() => {
    return [...data.nodes].sort((a, b) => a.year - b.year);
  }, [data.nodes]);

  // Collect link events (links with story + startYear)
  const linkEvents = useMemo(() => {
    let events = INITIAL_DATA.links
      .filter(link => link.story && link.startYear)
      .map(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
        const sourceNode = INITIAL_DATA.nodes.find(n => n.id === sourceId);
        const targetNode = INITIAL_DATA.nodes.find(n => n.id === targetId);
        return {
          link,
          sourceNode,
          targetNode,
          year: link.startYear!
        };
      })
      .filter(e => e.sourceNode && e.targetNode);

    // Focus Mode: filter to only directly connected links
    if (focusNodeId) {
      events = events.filter(e => {
        const sourceId = typeof e.link.source === 'object' ? (e.link.source as any).id : e.link.source;
        const targetId = typeof e.link.target === 'object' ? (e.link.target as any).id : e.link.target;
        return sourceId === focusNodeId || targetId === focusNodeId;
      });
    }

    return events;
  }, [focusNodeId]);

  // Collect standalone events
  const standaloneEvents = useMemo(() => {
    let events = (INITIAL_DATA.events || []).map(event => ({
      event,
      year: event.year
    }));

    // Focus Mode: filter to only events connected to focusNodeId
    if (focusNodeId) {
      events = events.filter(se => {
        const relatedNodes = se.event.relatedNodes || [];
        return relatedNodes.includes(focusNodeId);
      });
    }

    return events;
  }, [focusNodeId]);

  // Group by year (nodes + link events + standalone events)
  const groupedByYear = useMemo(() => {
    const grouped: Record<number, { nodes: NodeData[]; linkEvents: typeof linkEvents; standaloneEvents: typeof standaloneEvents }> = {};

    // Add nodes
    sortedNodes.forEach(node => {
      if (!grouped[node.year]) grouped[node.year] = { nodes: [], linkEvents: [], standaloneEvents: [] };
      grouped[node.year].nodes.push(node);
    });

    // Add link events
    linkEvents.forEach(le => {
      if (!grouped[le.year]) grouped[le.year] = { nodes: [], linkEvents: [], standaloneEvents: [] };
      grouped[le.year].linkEvents.push(le);
    });

    // Add standalone events
    standaloneEvents.forEach(se => {
      if (!grouped[se.year]) grouped[se.year] = { nodes: [], linkEvents: [], standaloneEvents: [] };
      grouped[se.year].standaloneEvents.push(se);
    });

    return grouped;
  }, [sortedNodes, linkEvents, standaloneEvents]);

  const years = useMemo(() => {
    return Object.keys(groupedByYear).map(Number).sort((a, b) => a - b);
  }, [groupedByYear]);

  // Build creator map from INITIAL_DATA (not filtered data) to always show all created entities
  const creatorMap = useMemo(() => {
    // Achievement structure: { label, year, category }
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

  // Effect to scroll to specific node - use container scrollTop to avoid iOS page push
  useEffect(() => {
    if (scrollToNodeId && containerRef.current) {
      const element = document.getElementById(`timeline-node-${scrollToNodeId}`);
      if (element) {
        const container = containerRef.current;
        const elementTop = element.offsetTop;
        const containerHeight = container.clientHeight;
        const targetScroll = elementTop - containerHeight / 2 + element.clientHeight / 2;
        container.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, [scrollToNodeId]);

  // Search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Check if it's a year search (4-digit number)
    const isYearSearch = /^\d{4}$/.test(term.trim());

    if (isYearSearch) {
      // Don't show node suggestions for year search
      setSuggestions([]);
    } else if (term.length > 0) {
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
    setSelectedIndex(-1);
    searchInputRef.current?.blur();

    // Scroll to the selected node
    setTimeout(() => {
      const element = document.getElementById(`timeline-node-${node.id}`);
      if (element) {
        // Use scrollIntoView with block: 'center' for reliable cross-browser support
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add highlight effect
        element.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-900');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-900');
        }, 2000);
      }
    }, 100);
  };

  const handleSearchFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setSearchTerm("");
    setSuggestions([]);
    setIsSearchFocused(true);
    setSelectedIndex(-1);
  };

  const handleSearchBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsSearchFocused(false);
      setSelectedIndex(-1);
      blurTimeoutRef.current = null;
    }, 250);
  };

  // Keyboard navigation state
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      // Check for year search first
      const isYearSearch = /^\d{4}$/.test(searchTerm.trim());
      if (isYearSearch) {
        const year = parseInt(searchTerm.trim(), 10);
        const yearElement = document.getElementById(`timeline-year-${year}`);
        if (yearElement) {
          yearElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          yearElement.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2', 'ring-offset-slate-900');
          setTimeout(() => {
            yearElement.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2', 'ring-offset-slate-900');
          }, 2000);
        }
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      } else if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSearchSelect(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSearchSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setSelectedIndex(-1);
      searchInputRef.current?.blur();
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
        onDoubleClick={() => onNodeDoubleClick?.(node)}
        className={`
          cursor-pointer transition-all duration-200 hover:scale-[1.02]
          bg-slate-800/50
          select-none
          w-full
          ${sizeStyles[sizeClass]}
          ${isLeft
            ? 'md:text-right text-left border-l-4 md:border-l-0 md:border-r-4 border-red-500 rounded-r-lg md:rounded-r-none md:rounded-l-lg'
            : 'text-left border-l-4 border-red-500 rounded-r-lg'
          }
        `}
        style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
      >
        <div className={`flex items-baseline gap-1 flex-wrap ${isLeft ? 'md:justify-end justify-start' : 'justify-start'}`}>
          <span className={`font-bold text-white ${textSizeStyles[sizeClass]}`}>{node.label}</span>
          <span className="text-slate-500 text-xs">{getNodeSubtitle(node)}</span>
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

    const subtitle = getNodeSubtitle(node, { achievements });

    return (
      <div
        id={`timeline-node-${node.id}`}
        onClick={() => onNodeClick(node)}
        onDoubleClick={() => onNodeDoubleClick?.(node)}
        className={`
          cursor-pointer transition-all duration-200 hover:opacity-80
          flex items-center gap-2
          flex-row
          select-none
          ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'}
        `}
        style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
      >
        {/* Dot - centered via items-center on container */}
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
        {/* Text content */}
        <div className={`flex flex-col items-start text-left ${isLeft ? 'md:items-end md:text-right' : 'md:items-start md:text-left'}`}>
          <span className="text-white text-sm font-medium">{node.label}</span>
          <span className="text-slate-500 text-xs">
            {subtitle}
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

    // Unified width: ~70% of company box (company is full width, so ~70%)
    const sizeClass = 'md:w-[70%]';
    let textSize = 'text-sm';
    let padding = 'px-3 py-2';

    // Build description text using getNodeSubtitle
    const descriptionText = getNodeSubtitle(node, { creatorLabel: creator });

    return (
      <div
        id={`timeline-node-${node.id}`}
        onClick={() => onNodeClick(node)}
        onDoubleClick={() => onNodeDoubleClick?.(node)}
        className={`
          cursor-pointer transition-all duration-200 hover:scale-105
          w-full ${sizeClass}
          select-none
          ${isLeft ? 'md:ml-auto' : 'md:mr-auto'}
        `}
        style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
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
    <div ref={containerRef} className="w-full h-full overflow-y-auto bg-background p-4 custom-scrollbar scroll-smooth relative">
      {/* 
        Mobile Background Arrow - Customization Guide:
        - Position: top-[80px] (below search bar), adjust inset-x-0
        - Size: w-48 (width), h-[70vh] (height)
        - Color: text-slate-500 (Tailwind class) or fill="currentColor"
        - Opacity: opacity-10 (10% opacity)
        - Arrow body: rect x="35" width="30" height="280" 
        - Arrow head: polygon points controls the triangle shape
      */}
      <div className="md:hidden fixed top-[80px] inset-x-0 bottom-0 flex items-center justify-center pointer-events-none z-0 opacity-10">
        <svg className="w-48 h-[70vh]" viewBox="0 0 100 400" fill="none">
          {/* Thick arrow body - adjust x, width, height for size */}
          <rect x="35" y="0" width="30" height="280" fill="currentColor" className="text-slate-500" />
          {/* Triangle arrow head - adjust points for shape */}
          <polygon points="50,400 0,260 100,260" fill="currentColor" className="text-slate-500" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Central Timeline Line - hidden on mobile, starts from first content on desktop */}
        <div className="hidden md:block absolute md:left-1/2 bottom-0 w-px bg-slate-700 transform md:-translate-x-1/2" style={{ top: '120px' }} />

        {/* Search Header - hidden in Focus mode, LEFT aligned */}
        {!focusNodeId && (
          <div className="sticky top-0 z-30 pb-4 mb-6">
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
                    {suggestions.map((node, index) => (
                      <li
                        key={node.id}
                        className={`cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-300 transition-colors border-b border-slate-800/50 last:border-0 ${index === selectedIndex ? 'bg-slate-700' : 'hover:bg-slate-800'
                          }`}
                        onClick={() => handleSearchSelect(node)}
                        onDoubleClick={() => onNodeDoubleClick?.(node)}
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
                    <div className="flex-1 h-0.5" style={{ backgroundColor: '#e9a23b' }} />
                    <span className="text-xs font-mono tracking-widest whitespace-nowrap bg-background px-3" style={{ color: '#e9a23b' }}>
                      {currentEra.label} {currentEra.startYear}-{currentEra.endYear === 2099 ? 'NOW' : currentEra.endYear}
                    </span>
                    <div className="flex-1 h-0.5" style={{ backgroundColor: '#e9a23b' }} />
                  </div>
                </div>
              )}

              {/* Year Content */}
              <div className="mb-6 relative">
                {/* Year Badge on Timeline */}
                <div id={`timeline-year-${year}`} className="flex items-center justify-center mb-4 md:pl-0 transition-all rounded-lg">
                  <span className="text-xs font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded z-10">
                    {year}
                  </span>
                </div>

                {/* Nodes for this year - closer to center line */}
                <div className="relative flex flex-col md:flex-row md:flex-wrap w-full gap-3">
                  {groupedByYear[year].nodes.map((node, i) => {
                    const isLeft = i % 2 === 0;

                    return (
                      <div
                        key={node.id}
                        className={`
                          relative w-full md:w-[calc(50%-0.5rem)]
                          pl-0 md:pl-0
                          ${isLeft ? 'md:pr-4 md:ml-0' : 'md:pl-4 md:ml-auto'}
                        `}
                      >
                        {renderNode(node, isLeft)}
                      </div>
                    );
                  })}
                </div>

                {/* Link Events for this year - purple bullet style */}
                {showStories && groupedByYear[year].linkEvents.length > 0 && (
                  <div className="relative flex flex-col md:flex-row md:flex-wrap w-full gap-2 mt-3">
                    {groupedByYear[year].linkEvents.map((le, i) => {
                      const isLeft = i % 2 === 0;
                      return (
                        <div
                          key={`link-${i}-${le.year}`}
                          className={`
                            relative w-full md:w-[calc(50%-0.5rem)] flex
                            ${isLeft ? 'md:pr-4 md:ml-0 md:justify-end' : 'md:pl-4 md:ml-auto justify-start'}
                          `}
                        >
                          <span className={`text-xs text-slate-400 inline-flex items-center gap-1.5 ${isLeft ? 'md:flex-row-reverse md:text-right' : 'flex-row text-left'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                            <span>{le.link.story} ({le.year})</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Standalone Events for this year */}
                {showStories && groupedByYear[year].standaloneEvents.length > 0 && (
                  <div className="relative flex flex-col md:flex-row md:flex-wrap w-full gap-2 mt-3">
                    {groupedByYear[year].standaloneEvents.map((se, i) => {
                      const isLeft = i % 2 === 0;
                      return (
                        <div
                          key={`event-${se.event.id}`}
                          className={`
                            relative w-full md:w-[calc(50%-0.5rem)] flex
                            ${isLeft ? 'md:pr-4 md:ml-0 md:justify-end' : 'md:pl-4 md:ml-auto justify-start'}
                          `}
                        >
                          <span className={`text-xs text-slate-400 inline-flex items-center gap-1.5 ${isLeft ? 'md:flex-row-reverse md:text-right' : 'flex-row text-left'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                            <span>{se.event.story} ({se.year})</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
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
