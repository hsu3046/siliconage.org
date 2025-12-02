import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Logo } from './components/Logo';
import { INITIAL_DATA, CATEGORY_COLORS } from './constants';
import { NodeData, Category, GraphData, LinkType, CompanyMode } from './types';
import { calculateSiliconRank } from './utils/ranking';

// --- LAZY LOADING FOR PERFORMANCE (Code Splitting) ---
const NetworkGraph = React.lazy(() => import('./components/NetworkGraph'));
const TimelineView = React.lazy(() => import('./components/TimelineView'));
const ListView = React.lazy(() => import('./components/ListView'));
const DetailPanel = React.lazy(() => import('./components/DetailPanel'));
const AboutModal = React.lazy(() => import('./components/AboutModal'));

// Loading Spinner Component
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
  const [viewMode, setViewMode] = useState<'MAP' | 'TIMELINE' | 'LIST'>('MAP');
  const [lastViewMode, setLastViewMode] = useState<'MAP' | 'TIMELINE' | 'LIST'>('MAP');
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [scrollToNodeId, setScrollToNodeId] = useState<string | null>(null);

  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [companyMode, setCompanyMode] = useState<CompanyMode>('FULL');

  const [visibleCategories, setVisibleCategories] = useState<Record<Category, boolean>>({
    [Category.COMPANY]: true,
    [Category.PERSON]: true,
    [Category.TECHNOLOGY]: true,
    [Category.EPISODE]: true,
  });

  const [visibleLinkTypes, setVisibleLinkTypes] = useState<Record<LinkType, boolean>>({
    [LinkType.DEPENDENCY]: true,
    [LinkType.MAKER]: true,
    [LinkType.INFLUENCE]: true,
    [LinkType.BELONGING]: true,
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

  // --- DEEP LINKING & URL MANAGEMENT ---
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nodeId = params.get('node');

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
    setLastViewMode(viewMode);
    setFocusNodeId(node.id);
    setSelectedNode(null); // Auto-close Detail Panel
    setViewMode('MAP');
    updateUrl(node.id);
  };

  const exitFocusMode = () => {
    if (focusNodeId) {
      setScrollToNodeId(focusNodeId);
    }
    setFocusNodeId(null);
    setViewMode(lastViewMode);
    setScrollToNodeId(null); // Clear scroll target
    updateUrl(null);
  };

  const handleNodeSelect = (node: NodeData) => {
    setSelectedNode(node);
    setScrollToNodeId(node.id);
    if (viewMode === 'MAP') {
      updateUrl(node.id);
    }
  };

  const filteredData: GraphData = useMemo(() => {
    let activeNodes = INITIAL_DATA.nodes.map(node => ({ ...node }));
    let activeLinks = INITIAL_DATA.links.map(link => ({ ...link }));

    if (focusNodeId) {
      const relatedNodeIds = new Set<string>();
      relatedNodeIds.add(focusNodeId);

      INITIAL_DATA.links.forEach(link => {
        const source = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const target = typeof link.target === 'object' ? (link.target as any).id : link.target;

        if (source === focusNodeId) relatedNodeIds.add(target);
        if (target === focusNodeId) relatedNodeIds.add(source);
      });

      activeNodes = activeNodes.filter(node => relatedNodeIds.has(node.id));

      activeLinks = activeLinks.filter(link => {
        const source = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const target = typeof link.target === 'object' ? (link.target as any).id : link.target;
        return relatedNodeIds.has(source) && relatedNodeIds.has(target);
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
    <div className="flex flex-col h-screen w-screen bg-background text-white overflow-hidden">

      <header className="h-16 border-b border-slate-700 bg-surface flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 relative">
        <button
          onClick={() => setIsAboutOpen(true)}
          className="flex items-center gap-2 sm:gap-3 shrink-0 hover:bg-slate-800 p-2 -ml-2 rounded-lg transition-colors group"
          title="About The Silicon Age"
        >
          <Logo className="w-8 h-8 drop-shadow-lg group-hover:scale-110 transition-transform" />
          <h1 className="font-bold tracking-tight text-slate-100 text-base sm:text-lg md:text-xl truncate group-hover:text-primary transition-colors">
            The Silicon Age
          </h1>
        </button>

        <div className="hidden md:flex flex-1 min-w-0 items-center justify-center gap-4 mx-4 overflow-x-auto no-scrollbar">
          {focusNodeId && (
            <div className="flex items-center gap-2 shrink-0 mr-2 border-r border-slate-700 pr-4">
              <span className="text-sm text-slate-300 truncate max-w-[150px] sm:max-w-xs">
                Focus: <span className="font-bold text-white">{INITIAL_DATA.nodes.find(n => n.id === focusNodeId)?.label}</span>
              </span>
              <button
                onClick={exitFocusMode}
                className="p-1 bg-red-500/10 border border-red-500/50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all"
                title="Exit Focus Mode"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {Object.keys(CATEGORY_COLORS).map((key) => {
              const cat = key as Category;
              const color = CATEGORY_COLORS[cat];
              let isActive = false;
              let bgStyle = {};

              if (cat === Category.COMPANY) {
                isActive = companyMode !== 'HIDDEN';
                if (viewMode === 'MAP') {
                  if (companyMode === 'FULL') bgStyle = { backgroundColor: 'rgba(30, 41, 59, 1)', borderColor: color, color: 'white' };
                  else if (companyMode === 'MINIMAL') bgStyle = { backgroundColor: 'transparent', borderColor: color, color: '#94a3b8' };
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
                  className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-200 flex items-center gap-2 group`}
                  style={bgStyle}
                  title={cat === Category.COMPANY
                    ? (viewMode === 'MAP' ? "Click to cycle: Full View → Minimal View → Hidden" : "Click to toggle visibility")
                    : `Click to toggle ${cat} visibility`
                  }
                >
                  <div
                    className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] shrink-0`}
                    style={{
                      backgroundColor: (cat === Category.COMPANY && companyMode === 'MINIMAL' && viewMode === 'MAP') ? 'transparent' : (isActive ? color : '#64748b'),
                      border: (cat === Category.COMPANY && companyMode === 'MINIMAL' && viewMode === 'MAP') ? `1px solid ${color}` : 'none'
                    }}
                  />
                  <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-1000 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100">
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>

          {viewMode === 'MAP' && (
            <>
              <div className="h-6 w-px bg-slate-700 shrink-0"></div>
              <div className="flex items-center gap-2 shrink-0">
                {Object.keys(visibleLinkTypes).map((key) => {
                  const type = key as LinkType;
                  const isActive = visibleLinkTypes[type];
                  const getLineStyle = () => {
                    switch (type) {
                      case LinkType.DEPENDENCY: return "border-b-2 w-4 border-orange-500 border-solid";
                      case LinkType.MAKER: return "border-b-2 w-4 border-cyan-400";
                      case LinkType.INFLUENCE: return "border-b w-4 border-purple-400 border-dotted";
                      case LinkType.BELONGING: return "border-b w-4 border-slate-400";
                      default: return "w-4 border-b";
                    }
                  };
                  return (
                    <button
                      key={type}
                      onClick={() => toggleLinkType(type)}
                      className={`
                            px-3 py-1 text-xs font-bold rounded-full border border-slate-600 transition-all duration-200 flex items-center gap-2 group
                            ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-transparent text-slate-500 opacity-50'}
                        `}
                      title={`Click to toggle ${type.toLowerCase()} links`}
                    >
                      <div className={`${getLineStyle()} ${isActive ? 'opacity-100' : 'opacity-50'} shrink-0`}></div>
                      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-1000 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100">
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-2">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button onClick={() => setViewMode('MAP')} className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'MAP' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Map</button>
            <button onClick={() => setViewMode('TIMELINE')} className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'TIMELINE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>History</button>
            <button onClick={() => setViewMode('LIST')} className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'LIST' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>List</button>
          </div>
        </div>
      </header>

      <div className="md:hidden border-b border-slate-700 bg-surface/50 flex flex-col">
        {focusNodeId && (
          <div className="h-10 flex items-center justify-center px-4 bg-slate-900/30 border-b border-slate-700/50 gap-2">
            <span className="text-xs text-slate-300 truncate">
              Focus: <span className="font-bold text-white">{INITIAL_DATA.nodes.find(n => n.id === focusNodeId)?.label}</span>
            </span>
            <button
              onClick={exitFocusMode}
              className="px-2 py-0.5 bg-red-500/10 border border-red-500/50 text-red-400 rounded-full text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1 shrink-0"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              Exit
            </button>
          </div>
        )}

        <div className="h-14 flex items-center justify-center px-4 overflow-x-auto gap-4 custom-scrollbar">
          <div className="flex items-center gap-3 shrink-0">
            {Object.keys(CATEGORY_COLORS).map((key) => {
              const cat = key as Category;
              let isActive = false;
              if (cat === Category.COMPANY) isActive = companyMode !== 'HIDDEN';
              else isActive = visibleCategories[cat];

              let bgStyle = { backgroundColor: 'transparent', borderColor: CATEGORY_COLORS[cat] };
              let dotStyle = { backgroundColor: CATEGORY_COLORS[cat], border: 'none' };
              let containerClass = `w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center transition-all ${!isActive && 'opacity-30 grayscale'}`;

              if (cat === Category.COMPANY) {
                if (viewMode === 'MAP') {
                  if (companyMode === 'FULL' && isActive) bgStyle.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                  else if (companyMode === 'MINIMAL') dotStyle = { backgroundColor: 'transparent', border: `1px solid ${CATEGORY_COLORS[cat]}` };
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
                      case LinkType.DEPENDENCY: return "border-b-2 w-4 border-orange-500 border-solid";
                      case LinkType.MAKER: return "border-b-2 w-4 border-cyan-400";
                      case LinkType.INFLUENCE: return "border-b w-4 border-purple-400 border-dotted";
                      case LinkType.BELONGING: return "border-b w-4 border-slate-400";
                      default: return "w-4 border-b";
                    }
                  };
                  return (
                    <button
                      key={type}
                      onClick={() => toggleLinkType(type)}
                      className={`
                            w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center transition-all 
                            ${isActive ? 'bg-slate-800 border-slate-500 shadow-sm' : 'bg-transparent opacity-40'}
                        `}
                    >
                      <div className={`${getLineStyle()}`}></div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden">
        <Suspense fallback={<LoadingSpinner />}>
          {viewMode === 'MAP' && (
            <NetworkGraph
              data={filteredData}
              onNodeClick={handleNodeSelect}
              onNodeDoubleClick={handleNodeDoubleClick}
              width={width}
              height={contentHeight}
              focusNodeId={focusNodeId}
              scrollToNodeId={scrollToNodeId}
              companyMode={companyMode}
            />
          )}

          {viewMode === 'TIMELINE' && (
            <TimelineView
              data={filteredData}
              onNodeClick={handleNodeSelect}
              scrollToNodeId={scrollToNodeId}
            />
          )}

          {viewMode === 'LIST' && (
            <ListView
              data={filteredData}
              onNodeClick={handleNodeSelect}
              scrollToNodeId={scrollToNodeId}
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
            onClose={() => setIsAboutOpen(false)}
          />
        </Suspense>
      </main>

    </div >
  );
};

export default App;