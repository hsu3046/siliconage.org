import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Logo } from './components/Logo';
import { INITIAL_DATA, CATEGORY_COLORS } from './constants';
import { NodeData, Category, GraphData, LinkType, CompanyMode } from './types';
import { calculateSiliconRank } from './utils/ranking';

// --- Delete LAZY LOADING FOR PERFORMANCE (Code Splitting) ---
import MapView from './components/MapView';
import DetailPanel from './components/DetailPanel';
import AboutModal from './components/AboutModal';
import ChangeLog from './components/ChangeLog';
import HistoryView from './components/HistoryView';
import CardView from './components/CardView';
import LinksView from './components/LinksView';
import WelcomeModal from './components/WelcomeModal';
import Tutorial from './components/Tutorial';
const LoadingSpinner = () => (
  <div className="w-full h-full flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Run algorithm once on the global dataset to ensure consistent scoring
calculateSiliconRank(INITIAL_DATA.nodes, INITIAL_DATA.links);

// Simple useWindowSize hook for responsive graph
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'MAP' | 'TIMELINE' | 'CARD' | 'LINKS'>('MAP');
  const [lastViewMode, setLastViewMode] = useState<'MAP' | 'TIMELINE' | 'CARD' | 'LINKS'>('MAP');
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [scrollToNodeId, setScrollToNodeId] = useState<string | null>(null);

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    return !localStorage.getItem('siliconage-welcome-seen');
  });
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Featured Node of the Day - deterministic based on date
  const featuredNode = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    // Select from foundational technology nodes (L0/L1)
    const foundationalNodes = INITIAL_DATA.nodes.filter(n =>
      n.category === Category.TECHNOLOGY &&
      (n.impactRole === 'FOUNDATION' || n.impactRole === 'CORE')
    );
    const index = seed % foundationalNodes.length;
    return foundationalNodes[index];
  }, []);

  const [companyMode, setCompanyMode] = useState<CompanyMode>('FULL');
  // PC Header Toggle Hover State: Which group is being hovered - Default to CATEGORY
  const [hoverGroupActive, setHoverGroupActive] = useState<'CATEGORY' | 'LINK' | null>('CATEGORY');

  const [visibleCategories, setVisibleCategories] = useState<Record<Category, boolean>>({
    [Category.COMPANY]: true,
    [Category.PERSON]: true,
    [Category.TECHNOLOGY]: true,
  });

  const [visibleLinkTypes, setVisibleLinkTypes] = useState<Record<LinkType, boolean>>({
    [LinkType.CREATES]: true,
    [LinkType.POWERS]: true,
    [LinkType.CONTRIBUTES]: true,
    [LinkType.ENGAGES]: true,
  });

  const { width, height } = useWindowSize();
  const contentHeight = height - 64;

  // --- DYNAMIC TITLE MANAGEMENT (SEO) ---
  useEffect(() => {
    if (selectedNode) {
      document.title = `${selectedNode.label} - The Silicon Age`;
    } else if (focusNodeId) {
      const focused = INITIAL_DATA.nodes.find(n => n.id === focusNodeId);
      if (focused) document.title = `${focused.label} - The Silicon Age`;
    } else {
      document.title = "The Silicon Age | Interactive Map of AI History";
    }
  }, [selectedNode, focusNodeId]);

  // --- SCROLL RESET MANAGEMENT ---
  useEffect(() => {
    // Use setTimeout and requestAnimationFrame to ensure scroll happens after browser settles
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        // Also try to scroll the main container to top if it exists
        const mainElement = document.querySelector('main');
        if (mainElement) {
          mainElement.scrollTop = 0;
        }
      });
    }, 100); // Small delay to let browser stabilize

    return () => clearTimeout(timeoutId);
  }, [viewMode, selectedNode]);

  // --- SYNC VIEW MODE WITH URL ---
  useEffect(() => {
    updateViewUrl(viewMode);
  }, [viewMode]);

  // --- DEEP LINKING & URL MANAGEMENT ---
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nodeId = params.get('node');
      const aboutParam = params.get('about');
      const viewParam = params.get('view');

      // Handle about modal
      if (aboutParam === 'true') {
        setIsAboutOpen(true);
      }

      // Handle view mode
      if (viewParam === 'history') {
        setViewMode('TIMELINE');
      } else if (viewParam === 'card') {
        setViewMode('CARD');
      } else if (viewParam === 'links') {
        setViewMode('LINKS');
      } else if (viewParam === 'map') {
        setViewMode('MAP');
      }

      if (nodeId) {
        const node = INITIAL_DATA.nodes.find(n => n.id === nodeId);
        if (node) {
          setFocusNodeId(nodeId);
          setSelectedNode(node);
          setViewMode('MAP');
          setScrollToNodeId(nodeId); // Trigger scroll/center
        }
      } else {
        setFocusNodeId(null);
        setSelectedNode(null);
      }
    };

    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateUrl = (nodeId: string | null) => {
    const url = new URL(window.location.href);
    if (nodeId) {
      url.searchParams.set('node', nodeId);
    } else {
      url.searchParams.delete('node');
    }
    window.history.pushState({}, '', url);
  };

  const updateViewUrl = (view: 'MAP' | 'TIMELINE' | 'LIST') => {
    const url = new URL(window.location.href);
    if (view === 'TIMELINE') {
      url.searchParams.set('view', 'history');
    } else if (view === 'LIST') {
      url.searchParams.set('view', 'list');
    } else {
      url.searchParams.delete('view'); // Map is default
    }
    window.history.pushState({}, '', url);
  };

  const updateAboutUrl = (isOpen: boolean) => {
    const url = new URL(window.location.href);
    if (isOpen) {
      url.searchParams.set('about', 'true');
    } else {
      url.searchParams.delete('about');
    }
    window.history.pushState({}, '', url);
  };


  const toggleCategory = (cat: Category) => {
    if (cat === Category.COMPANY) {
      setCompanyMode(prev => {
        if (viewMode === 'MAP') {
          if (prev === 'FULL') return 'MINIMAL';
          if (prev === 'MINIMAL') return 'HIDDEN';
          return 'FULL';
        } else {
          if (prev === 'HIDDEN') return 'FULL';
          return 'HIDDEN';
        }
      });
    } else {
      setVisibleCategories(prev => ({
        ...prev,
        [cat]: !prev[cat]
      }));
    }
  };

  const toggleLinkType = (type: LinkType) => {
    setVisibleLinkTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleNodeDoubleClick = (node: NodeData) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    setFocusNodeId(node.id);
    setSelectedNode(null); // Auto-close Detail Panel
    updateUrl(node.id);
    // Don't change viewMode - stay in current view
  };

  const exitFocusMode = () => {
    if (focusNodeId) {
      setScrollToNodeId(focusNodeId);
    }
    setFocusNodeId(null);
    // Stay in current view (don't change viewMode)
    setScrollToNodeId(null); // Clear scroll target
    updateUrl(null);
  };

  // Click handler with debounce for double-click support
  const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNodeSelect = (node: NodeData) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // Double click logic handled in handleNodeDoubleClick, but we clear timeout here to prevent single click
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      setSelectedNode(node);
      setScrollToNodeId(node.id);
      if (viewMode === 'MAP') {
        updateUrl(node.id);
      }
      clickTimeoutRef.current = null;
    }, 250); // 250ms delay to wait for potential double click
  };

  // For search: focus on node by ID (used by LinksView)
  const handleNodeFocusById = (nodeId: string) => {
    setFocusNodeId(nodeId);
    setScrollToNodeId(nodeId);
    setSelectedNode(null); // Don't open DetailPanel
    updateUrl(nodeId);
  };

  // For MapView: center on node WITHOUT opening Detail Panel
  const handleNodeFocus = (node: NodeData) => {
    setScrollToNodeId(node.id);
    // Do NOT set focusNodeId or selectedNode
  };

  // For CardView hashtags: Open Detail Panel WITHOUT scrolling/jumping
  const handleTagClick = (node: NodeData) => {
    setSelectedNode(node);
    // explicitly DO NOT set scrollToNodeId or focusNodeId
    if (viewMode === 'MAP') {
      // Optional: specific behavior for MAP mode if needed, but per request "no jump"
    }
  };

  const filteredData: GraphData = useMemo(() => {
    let activeNodes = INITIAL_DATA.nodes.map(node => ({ ...node }));
    let activeLinks = INITIAL_DATA.links.map(link => ({ ...link }));

    if (focusNodeId) {
      const firstDegreeIds = new Set<string>();
      const secondDegreeIds = new Set<string>();
      firstDegreeIds.add(focusNodeId);

      // Find 1st-degree connections
      INITIAL_DATA.links.forEach(link => {
        const source = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const target = typeof link.target === 'object' ? (link.target as any).id : link.target;

        if (source === focusNodeId) firstDegreeIds.add(target);
        if (target === focusNodeId) firstDegreeIds.add(source);
      });

      // Find 2nd-degree connections
      INITIAL_DATA.links.forEach(link => {
        const source = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const target = typeof link.target === 'object' ? (link.target as any).id : link.target;

        if (firstDegreeIds.has(source) && !firstDegreeIds.has(target)) {
          secondDegreeIds.add(target);
        }
        if (firstDegreeIds.has(target) && !firstDegreeIds.has(source)) {
          secondDegreeIds.add(source);
        }
      });

      // Combine all related node IDs
      const allRelatedIds = new Set([...firstDegreeIds, ...secondDegreeIds]);

      // Set _focusDistance for each node (0=focused, 1=1st degree, 2=2nd degree)
      activeNodes = activeNodes.filter(node => allRelatedIds.has(node.id)).map(node => ({
        ...node,
        _focusDistance: node.id === focusNodeId ? 0 : (firstDegreeIds.has(node.id) ? 1 : 2)
      }));

      activeLinks = activeLinks.filter(link => {
        const source = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const target = typeof link.target === 'object' ? (link.target as any).id : link.target;
        return allRelatedIds.has(source) && allRelatedIds.has(target);
      });
    }

    activeNodes = activeNodes.filter(node => {
      if (node.category === Category.COMPANY) {
        return companyMode !== 'HIDDEN';
      }
      return visibleCategories[node.category];
    });

    const activeNodeIds = new Set(activeNodes.map(n => n.id));

    activeLinks = activeLinks.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      const isVisibleType = link.type ? visibleLinkTypes[link.type] : true;
      return activeNodeIds.has(sourceId) && activeNodeIds.has(targetId) && isVisibleType;
    });

    return { nodes: activeNodes, links: activeLinks };
  }, [visibleCategories, visibleLinkTypes, focusNodeId, companyMode]);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-white overflow-hidden" style={{ width: '100vw', height: '100vh', backgroundColor: '#0f172a', overflow: 'hidden' }}>

      <header className="h-16 border-b border-slate-700 bg-surface flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 relative">
        <button
          onClick={() => { setIsAboutOpen(true); updateAboutUrl(true); }}
          className="flex items-center gap-2 sm:gap-3 shrink-0 hover:bg-slate-800 p-2 -ml-2 rounded-lg transition-colors group"
          title="About The Silicon Age"
        >
          <Logo className="w-10 h-10 drop-shadow-lg group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-start">
            <h1 className="font-bold tracking-tight text-slate-100 text-base sm:text-lg md:text-xl truncate group-hover:text-primary transition-colors">
              The Silicon Age
            </h1>
            <span className="block text-xs text-slate-500 -mt-0.5">From Transistors to AI</span>
          </div>
        </button>

        <div className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-4 mx-4 overflow-x-auto no-scrollbar">
          {focusNodeId && (() => {
            const focusNode = INITIAL_DATA.nodes.find(n => n.id === focusNodeId);
            const nodeColor = focusNode ? CATEGORY_COLORS[focusNode.category] : '#22d3ee';
            return (
              <div className="relative flex items-center justify-center shrink-0">
                {/* Centered Node Text */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Focus on</span>
                  <span className="text-xl font-bold" style={{ color: nodeColor }}>
                    {focusNode?.label}
                  </span>
                </div>
                {/* Exit Button to the right */}
                <button
                  onClick={exitFocusMode}
                  className="ml-6 px-3 py-1 bg-red-500/10 border border-red-500/50 text-red-400 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
                  title="Exit Focus Mode"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  Exit
                </button>
              </div>
            );
          })()}

          {/* Category toggles - hidden in Focus mode AND Links View */}
          {!focusNodeId && viewMode !== 'LINKS' && (
            <div
              className="flex items-center gap-2 shrink-0"
              onMouseEnter={() => viewMode === 'MAP' && setHoverGroupActive('CATEGORY')}
            >
              {Object.keys(CATEGORY_COLORS).map((key) => {
                const cat = key as Category;
                const color = CATEGORY_COLORS[cat];
                let isActive = false;
                let bgStyle = {};

                if (cat === Category.COMPANY) {
                  isActive = companyMode !== 'HIDDEN';
                  if (viewMode === 'MAP') {
                    // FULL: Active background, colored border
                    if (companyMode === 'FULL') bgStyle = { backgroundColor: 'rgba(30, 41, 59, 1)', borderColor: color, color: 'white' };
                    // MINIMAL: Outer ring grayed out (gray border), inner dot stays colored
                    else if (companyMode === 'MINIMAL') bgStyle = { backgroundColor: 'transparent', borderColor: '#475569', color: '#94a3b8' };
                    // HIDDEN: Everything grayed out
                    else bgStyle = { backgroundColor: 'transparent', borderColor: '#475569', color: '#64748b', opacity: 0.5 };
                  } else {
                    if (isActive) bgStyle = { backgroundColor: 'rgba(30, 41, 59, 1)', borderColor: color, color: 'white' };
                    else bgStyle = { backgroundColor: 'transparent', borderColor: '#475569', color: '#64748b', opacity: 0.5 };
                  }
                } else {
                  isActive = visibleCategories[cat];
                  if (isActive) bgStyle = { backgroundColor: 'rgba(30, 41, 59, 1)', borderColor: color, color: 'white' };
                  else bgStyle = { backgroundColor: 'transparent', borderColor: '#475569', color: '#64748b', opacity: 0.5 };
                }

                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-200 flex items-center justify-center gap-2 group min-w-[50px]`}
                    style={bgStyle}
                    title={cat === Category.COMPANY
                      ? (viewMode === 'MAP' ? "Click to cycle: Full View → Minimal View → Hidden" : "Click to toggle visibility")
                      : `Click to toggle ${cat} visibility`
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] shrink-0`}
                      style={{
                        // FULL: Solid colored dot
                        // MINIMAL: Solid colored dot (inner stays visible, outer ring is grayed via border)
                        // HIDDEN: Grayed out dot
                        backgroundColor: (cat === Category.COMPANY && companyMode === 'HIDDEN' && viewMode === 'MAP') ? '#64748b' : color,
                        opacity: isActive ? 1 : 0.5
                      }}
                    />
                    <span className={`transition-all duration-500 ease-out whitespace-nowrap ${viewMode === 'MAP'
                      ? (hoverGroupActive === 'CATEGORY' ? "max-w-xs opacity-100" : "max-w-0 overflow-hidden opacity-0")
                      : "max-w-xs opacity-100"
                      }`}>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'MAP' && !focusNodeId && (
            <>
              <div className="h-6 w-px bg-slate-700 shrink-0"></div>
              <div
                className="flex items-center gap-2 shrink-0"
                onMouseEnter={() => setHoverGroupActive('LINK')}
              >
                {Object.keys(visibleLinkTypes).map((key) => {
                  const type = key as LinkType;
                  const isActive = visibleLinkTypes[type];
                  const getLineStyle = () => {
                    switch (type) {
                      case LinkType.POWERS: return "border-b-2 w-4 border-orange-700 border-solid";
                      case LinkType.CREATES: return "border-b-2 w-4 border-teal-600";
                      case LinkType.CONTRIBUTES: return "border-b w-4 border-purple-300 border-dotted";
                      case LinkType.ENGAGES: return "border-b w-4 border-slate-400";
                      default: return "w-4 border-b";
                    }
                  };

                  // Human-readable link type labels
                  const getLinkTypeLabel = () => {
                    switch (type) {
                      case LinkType.POWERS: return "POWERS";
                      case LinkType.CREATES: return "CREATES";
                      case LinkType.CONTRIBUTES: return "CONTRIBUTES";
                      case LinkType.ENGAGES: return "ENGAGES";
                      default: return type;
                    }
                  };

                  const getBorderColor = () => {
                    if (!isActive) return undefined; // Grey border when OFF (from className)
                    switch (type) {
                      case LinkType.POWERS: return "rgba(194, 65, 12, 1)";  // #c2410c
                      case LinkType.CREATES: return "rgba(8, 145, 178, 1)";  // #0891b2
                      case LinkType.CONTRIBUTES: return "rgba(216, 180, 254, 1)"; // #d8b4fe
                      case LinkType.ENGAGES: return "rgba(148, 163, 184, 1)"; // #94a3b8
                      default: return undefined;
                    }
                  };

                  return (
                    <button
                      key={type}
                      onClick={() => toggleLinkType(type)}
                      className={`
                            px-3 py-1 text-xs font-bold rounded-full border border-slate-600 transition-all duration-200 flex items-center justify-center gap-2 group min-w-[50px]
                            ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-transparent text-slate-500 opacity-50'}
                        `}
                      style={{ borderColor: getBorderColor() }}
                      title={`Click to toggle ${type.toLowerCase()} links`}
                    >
                      <div className={`${getLineStyle()} ${isActive ? 'opacity-100' : 'opacity-50'} shrink-0`}></div>
                      <span className={`transition-all duration-500 ease-out whitespace-nowrap ${hoverGroupActive === 'LINK' ? "max-w-xs opacity-100" : "max-w-0 overflow-hidden opacity-0"
                        }`}>
                        {getLinkTypeLabel()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-2">
          {/* Featured Node of the Day - REMOVED for PC */}

          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button onClick={() => setViewMode('MAP')} className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'MAP' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Map</button>
            <button onClick={() => setViewMode('TIMELINE')} className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'TIMELINE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>History</button>
            <button onClick={() => setViewMode('CARD')} className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'CARD' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Card</button>
            <button
              onClick={() => setViewMode('LINKS')}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'LINKS' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >Links</button>
          </div>
        </div>
      </header>

      <div className="xl:hidden border-b border-slate-700 bg-surface/50 flex flex-col">
        {focusNodeId && (() => {
          const focusNode = INITIAL_DATA.nodes.find(n => n.id === focusNodeId);
          const nodeColor = focusNode ? CATEGORY_COLORS[focusNode.category] : '#22d3ee';
          return (
            <div className="h-14 flex items-center bg-slate-900/30 border-b border-slate-700/50 relative">
              {/* Centered Focus Text - flex-1 with center using the container width */}
              <div className="flex-1 flex justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Focus on</span>
                  <span className="text-lg font-bold" style={{ color: nodeColor }}>
                    {focusNode?.label}
                  </span>
                </div>
              </div>
              {/* Exit button - positioned absolutely on the right side */}
              <button
                onClick={exitFocusMode}
                className="absolute right-4 px-2 py-0.5 bg-red-500/10 border border-red-500/50 text-red-400 rounded-full text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Exit
              </button>
            </div>
          );
        })()}

        {/* Mobile category toggles - hidden in Focus mode AND Links View */}
        {!focusNodeId && viewMode !== 'LINKS' && (
          <div className="h-14 flex items-center justify-center px-4 overflow-x-auto gap-4 custom-scrollbar">
            <div className="flex items-center gap-3 shrink-0">
              {Object.keys(CATEGORY_COLORS).map((key) => {
                const cat = key as Category;
                let isActive = false;
                if (cat === Category.COMPANY) isActive = companyMode !== 'HIDDEN';
                else isActive = visibleCategories[cat];

                let bgStyle = { backgroundColor: 'transparent', borderColor: CATEGORY_COLORS[cat] };
                let dotStyle = { backgroundColor: CATEGORY_COLORS[cat], border: 'none', opacity: isActive ? 1 : 0.5 };
                let containerClass = `w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center transition-all ${!isActive && 'opacity-50'}`;

                if (cat === Category.COMPANY) {
                  if (viewMode === 'MAP') {
                    if (companyMode === 'FULL' && isActive) bgStyle.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                    else if (companyMode === 'MINIMAL') dotStyle = { backgroundColor: 'transparent', border: `1px solid ${CATEGORY_COLORS[cat]}`, opacity: isActive ? 1 : 0.5 };
                  } else {
                    if (isActive) bgStyle.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                  }
                } else {
                  if (isActive) bgStyle.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                }

                return (
                  <button key={cat} onClick={() => toggleCategory(cat)} className={containerClass} style={bgStyle} aria-label={`Toggle ${cat}`}>
                    <div className="w-2.5 h-2.5 rounded-full" style={dotStyle}></div>
                  </button>
                );
              })}
            </div>

            {viewMode === 'MAP' && (
              <>
                <div className="w-px h-6 bg-slate-700 shrink-0"></div>
                <div className="flex items-center gap-3 shrink-0">
                  {Object.keys(visibleLinkTypes).map((key) => {
                    const type = key as LinkType;
                    const isActive = visibleLinkTypes[type];
                    const getLineStyle = () => {
                      switch (type) {
                        case LinkType.POWERS: return "border-b-2 w-4 border-orange-700 border-solid";
                        case LinkType.CREATES: return "border-b-2 w-4 border-cyan-400";
                        case LinkType.CONTRIBUTES: return "border-b w-4 border-purple-300 border-dotted";
                        case LinkType.ENGAGES: return "border-b w-4 border-slate-400";
                        default: return "w-4 border-b";
                      }
                    };

                    const getBorderColor = () => {
                      if (!isActive) return undefined;
                      switch (type) {
                        case LinkType.POWERS: return "rgba(194, 65, 12, 1)";  // #c2410c
                        case LinkType.CREATES: return "rgba(34, 211, 238, 1)";  // #22d3ee
                        case LinkType.CONTRIBUTES: return "rgba(216, 180, 254, 1)"; // #d8b4fe
                        case LinkType.ENGAGES: return "rgba(148, 163, 184, 1)"; // #94a3b8
                        default: return undefined;
                      }
                    };

                    return (
                      <button
                        key={type}
                        onClick={() => toggleLinkType(type)}
                        className={`
                            w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center transition-all 
                            ${isActive ? 'bg-slate-800 shadow-sm' : 'bg-transparent opacity-40'}
                        `}
                        style={{ borderColor: getBorderColor() }}
                      >
                        <div className={`${getLineStyle()}`}></div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <main className="flex-1 relative overflow-hidden">
        {viewMode === 'MAP' && (
          <MapView
            data={filteredData}
            onNodeClick={handleNodeSelect}
            onNodeFocus={handleNodeFocus}
            onNodeDoubleClick={handleNodeDoubleClick}
            width={width}
            height={contentHeight}
            focusNodeId={focusNodeId}
            scrollToNodeId={scrollToNodeId}
            companyMode={companyMode}
            featuredNode={featuredNode}
          />
        )}

        {viewMode === 'TIMELINE' && (
          <HistoryView
            data={filteredData}
            onNodeClick={handleNodeSelect}
            onNodeDoubleClick={handleNodeDoubleClick}
            scrollToNodeId={scrollToNodeId}
            focusNodeId={focusNodeId}
          />
        )}

        {viewMode === 'CARD' && (
          <CardView
            data={filteredData}
            fullData={INITIAL_DATA}
            onNodeClick={handleNodeSelect}
            onTagClick={handleTagClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            scrollToNodeId={scrollToNodeId}
            focusNodeId={focusNodeId}
          />
        )}

        {viewMode === 'LINKS' && (
          <LinksView
            data={filteredData}
            focusNodeId={focusNodeId}
            onNodeClick={handleNodeSelect}
            onNodeFocus={handleNodeFocusById}
          />
        )}

        <DetailPanel
          node={selectedNode}
          data={filteredData}
          onClose={() => { setSelectedNode(null); setScrollToNodeId(null); updateUrl(null); }}
          onFocus={() => { if (selectedNode) handleNodeDoubleClick(selectedNode); }}
          onNodeSelect={handleNodeSelect}
        />

        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => { setIsAboutOpen(false); updateAboutUrl(false); }}
          onOpenChangeLog={() => setIsChangeLogOpen(true)}
        />

        <ChangeLog
          isOpen={isChangeLogOpen}
          onClose={() => setIsChangeLogOpen(false)}
        />

        <WelcomeModal
          isOpen={isWelcomeOpen}
          onClose={() => setIsWelcomeOpen(false)}
          onStartTutorial={() => {
            setIsWelcomeOpen(false);
            setIsTutorialOpen(true);
          }}
        />

        <Tutorial
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
        />
      </main>

    </div >
  );
};

export default App;