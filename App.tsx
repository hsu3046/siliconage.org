import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './components/Logo';
import { INITIAL_DATA, CATEGORY_COLORS } from './constants';
import { NodeData, Category, GraphData, LinkType, CompanyMode } from './types';
import { calculateSiliconRank } from './utils/ranking';
import { useLocale } from './hooks/useLocale';

// Static Imports (non-lazy for performance)
import MapView from './components/MapView';
import DetailPanel from './components/DetailPanel';
import AboutModal from './components/AboutModal';
import ChangeLog from './components/ChangeLog';
import HistoryView from './components/HistoryView';
import CardView from './components/CardView';
import LinksView from './components/LinksView';
import WelcomeModal from './components/WelcomeModal';
import Tutorial from './components/Tutorial';
import SEOHead from './components/SEOHead';

// Debug mode - lazy loaded to exclude from production bundle
const DebugDashboard = lazy(() => import('./components/debug/DebugDashboard'));

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
  // Check if we're in debug mode (only in development)
  const isDebugMode = import.meta.env.DEV && window.location.pathname === '/debug';

  // If debug mode, render DebugDashboard
  if (isDebugMode) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <DebugDashboard />
      </Suspense>
    );
  }

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

  // i18n hook - handles locale initialization and provides t() function
  const { t, locale, setLocale, translateNode, translateLink, translateEvent } = useLocale();

  // Router hooks for SEO-friendly URLs
  const navigate = useNavigate();
  const location = useLocation();

  // Translate node and link data when locale changes
  const translatedData = useMemo(() => {
    const translatedNodes = INITIAL_DATA.nodes.map(node => {
      const translated = translateNode(
        node.id,
        node.label,
        node.description,
        node.primaryRole,
        node.secondaryRole
      );
      return {
        ...node,
        label: translated.label,
        description: translated.description,
        primaryRole: translated.primaryRole,
        secondaryRole: translated.secondaryRole
      };
    });

    const translatedLinks = INITIAL_DATA.links.map(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      const translatedStory = translateLink(sourceId, targetId, link.story);
      return {
        ...link,
        story: translatedStory
      };
    });

    const translatedEvents = (INITIAL_DATA.events || []).map(event => {
      const translatedStory = translateEvent(event.id, event.story);
      return {
        ...event,
        story: translatedStory
      };
    });

    return {
      nodes: translatedNodes,
      links: translatedLinks,
      events: translatedEvents
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]); // Only depend on locale - translate functions read from module state

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
  // Story visibility toggle for History View
  const [showStories, setShowStories] = useState(true);
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

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ESC: Exit Focus Mode
      if (e.key === 'Escape' && focusNodeId) {
        // Exit focus mode
        if (focusNodeId) {
          setScrollToNodeId(focusNodeId);
        }
        setFocusNodeId(null);
        setScrollToNodeId(null);
        updateUrl(null);
        return;
      }

      // Cmd+F (Mac) or Ctrl+F (Windows): Focus search input
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault(); // Prevent browser's default find
        // Find and focus the search input based on current view
        const searchInput = document.querySelector('input[type="text"][placeholder*="Search"], input[type="text"][placeholder*="Find"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [focusNodeId]);

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
    // Skip scroll reset in Focus mode - Focus mode manages its own scroll position
    if (focusNodeId) return;

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
  }, [viewMode, selectedNode, focusNodeId]);

  // --- SYNC VIEW MODE WITH URL ---
  useEffect(() => {
    updateViewUrl(viewMode);
  }, [viewMode]);

  // --- DEEP LINKING & URL MANAGEMENT ---
  // Parse path to extract node: /company/apple -> apple, /tech/transistor -> transistor
  const pathToCategory: Record<string, Category> = {
    'company': Category.COMPANY,
    'person': Category.PERSON,
    'tech': Category.TECHNOLOGY,
  };

  // View path mapping
  const pathToView: Record<string, 'MAP' | 'TIMELINE' | 'CARD' | 'LINKS'> = {
    'history': 'TIMELINE',
    'cards': 'CARD',
    'links': 'LINKS',
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const pathParts = path.split('/').filter(Boolean);

      // Legacy query param support (for backwards compatibility)
      const params = new URLSearchParams(window.location.search);
      const legacyNodeId = params.get('node');

      // Check for path-based node: /company/apple or /tech/transistor
      if (pathParts.length >= 2 && pathToCategory[pathParts[0]]) {
        const nodeId = pathParts[1];
        const node = INITIAL_DATA.nodes.find(n => n.id === nodeId);
        if (node) {
          setFocusNodeId(nodeId);
          setSelectedNode(node);
          setViewMode('MAP');
          setScrollToNodeId(nodeId);
          return;
        }
      }

      // Check for view paths: /history, /cards, /links
      if (pathParts.length === 1 && pathToView[pathParts[0]]) {
        setViewMode(pathToView[pathParts[0]]);
        setFocusNodeId(null);
        setSelectedNode(null);
        return;
      }

      // Check for /about path
      if (pathParts.length === 1 && pathParts[0] === 'about') {
        setIsAboutOpen(true);
        return;
      }

      // Legacy support: ?node=apple
      if (legacyNodeId) {
        const node = INITIAL_DATA.nodes.find(n => n.id === legacyNodeId);
        if (node) {
          setFocusNodeId(legacyNodeId);
          setSelectedNode(node);
          setViewMode('MAP');
          setScrollToNodeId(legacyNodeId);
          return;
        }
      }

      // Root path - Map View (default)
      if (path === '/' || pathParts.length === 0) {
        setFocusNodeId(null);
        setSelectedNode(null);
        setViewMode('MAP');
      }
    };

    handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // === SEO-FRIENDLY URL HELPER FUNCTIONS ===

  // Map category to URL path segment
  const categoryToPath = {
    [Category.COMPANY]: 'company',
    [Category.PERSON]: 'person',
    [Category.TECHNOLOGY]: 'tech',
  };

  // Navigate to a specific node with SEO-friendly path
  const navigateToNode = useCallback((node: NodeData | null) => {
    if (!node) {
      // Clear selection, go to current view
      navigate(location.pathname.includes('/about') ? '/about' : '/');
      return;
    }

    const categoryPath = categoryToPath[node.category];
    navigate(`/${categoryPath}/${node.id}`);
  }, [navigate, location.pathname]);

  // Legacy updateUrl for compatibility (now using navigateToNode)
  const updateUrl = (nodeId: string | null) => {
    if (nodeId) {
      const node = INITIAL_DATA.nodes.find(n => n.id === nodeId);
      if (node) {
        navigateToNode(node);
        return;
      }
    }
    navigate('/');
  };

  // Navigate to a specific view with SEO-friendly path
  const updateViewUrl = useCallback((view: 'MAP' | 'TIMELINE' | 'CARD' | 'LINKS') => {
    const viewToPath: Record<string, string> = {
      'TIMELINE': '/history',
      'CARD': '/cards',
      'LINKS': '/links',
      'MAP': '/',
    };
    navigate(viewToPath[view]);
  }, [navigate]);

  const updateAboutUrl = useCallback((isOpen: boolean) => {
    if (isOpen) {
      navigate('/about');
    } else {
      // Go back to previous view
      navigate('/');
    }
  }, [navigate]);


  const toggleCategory = (cat: Category) => {
    if (cat === Category.COMPANY) {
      setCompanyMode(prev => {
        // History/Card: Direct toggle FULL <-> HIDDEN (1-click)
        // Map: 3-step cycle FULL -> MINIMAL -> HIDDEN -> FULL
        if (viewMode === 'MAP') {
          if (prev === 'FULL') return 'MINIMAL';
          if (prev === 'MINIMAL') return 'HIDDEN';
          return 'FULL';
        } else {
          // History/Card View: simple toggle
          return prev === 'HIDDEN' ? 'FULL' : 'HIDDEN';
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

  const handleNodeDoubleClick = useCallback((node: NodeData) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    setFocusNodeId(node.id);
    setSelectedNode(null); // Auto-close Detail Panel
    updateUrl(node.id);
    // Don't change viewMode - stay in current view
  }, []);

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

  const handleNodeSelect = useCallback((node: NodeData) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // Double click logic handled in handleNodeDoubleClick, but we clear timeout here to prevent single click
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      setSelectedNode(node);
      setScrollToNodeId(node.id);
      // Update URL for all views (SEO-friendly navigation)
      navigateToNode(node);
      clickTimeoutRef.current = null;
    }, 250); // 250ms delay to wait for potential double click
  }, [navigateToNode]);

  // For search: focus on node by ID (used by LinksView)
  const handleNodeFocusById = (nodeId: string) => {
    setFocusNodeId(nodeId);
    setScrollToNodeId(nodeId);
    setSelectedNode(null); // Don't open DetailPanel
    updateUrl(nodeId);
  };

  // For MapView: center on node WITHOUT opening Detail Panel
  const handleNodeFocus = useCallback((node: NodeData) => {
    setScrollToNodeId(node.id);
    // Do NOT set focusNodeId or selectedNode
  }, []);

  // For CardView hashtags: Open Detail Panel WITHOUT scrolling/jumping
  const handleTagClick = (node: NodeData) => {
    setSelectedNode(node);
    // explicitly DO NOT set scrollToNodeId or focusNodeId
    if (viewMode === 'MAP') {
      // Optional: specific behavior for MAP mode if needed, but per request "no jump"
    }
  };

  const filteredData: GraphData = useMemo(() => {
    let activeNodes = translatedData.nodes.map(node => ({ ...node }));
    let activeLinks = translatedData.links.map(link => ({ ...link }));

    if (focusNodeId) {
      const firstDegreeIds = new Set<string>();
      const secondDegreeIds = new Set<string>();
      firstDegreeIds.add(focusNodeId);

      // Find 1st-degree connections
      translatedData.links.forEach(link => {
        const source = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const target = typeof link.target === 'object' ? (link.target as any).id : link.target;

        if (source === focusNodeId) firstDegreeIds.add(target);
        if (target === focusNodeId) firstDegreeIds.add(source);
      });

      // Find 2nd-degree connections
      translatedData.links.forEach(link => {
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

    // Focus 모드에서는 카테고리 필터링 무시 - 모든 연결된 노드 표시
    if (!focusNodeId) {
      activeNodes = activeNodes.filter(node => {
        if (node.category === Category.COMPANY) {
          return companyMode !== 'HIDDEN';
        }
        return visibleCategories[node.category];
      });
    }

    const activeNodeIds = new Set(activeNodes.map(n => n.id));

    activeLinks = activeLinks.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      // Focus 모드에서는 모든 LinkType 표시 (visibleLinkTypes 무시)
      const isVisibleType = focusNodeId ? true : (link.type ? visibleLinkTypes[link.type] : true);
      return activeNodeIds.has(sourceId) && activeNodeIds.has(targetId) && isVisibleType;
    });

    return { nodes: activeNodes, links: activeLinks };
  }, [visibleCategories, visibleLinkTypes, focusNodeId, companyMode, translatedData]);

  // Filtered data for HistoryView/CardView: 1st degree only in Focus mode
  const filteredDataFirstDegree: GraphData = useMemo(() => {
    if (!focusNodeId) return filteredData;

    // Filter to only show focus node (distance=0) and 1st degree (distance=1)
    const firstDegreeNodes = filteredData.nodes.filter(node =>
      node._focusDistance === 0 || node._focusDistance === 1
    );
    const firstDegreeNodeIds = new Set(firstDegreeNodes.map(n => n.id));

    const firstDegreeLinks = filteredData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      return firstDegreeNodeIds.has(sourceId) && firstDegreeNodeIds.has(targetId);
    });

    return { nodes: firstDegreeNodes, links: firstDegreeLinks };
  }, [filteredData, focusNodeId]);

  return (
    <div key={locale} className="flex flex-col h-screen w-screen bg-background text-white overflow-hidden" style={{ width: '100vw', height: '100vh', backgroundColor: '#0f172a', overflow: 'hidden' }}>
      {/* SEO: Dynamic meta tags based on selected node */}
      <SEOHead node={selectedNode} />

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
            <span className="block text-xs text-slate-500 -mt-0.5">{t('about.subtitle')}</span>
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
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{t('focus.focusOn')}</span>
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
                    // Map: 3-step toggle - FULL (active), MINIMAL (semi-active with gray border), HIDDEN (inactive)
                    // ON/OFF버튼 색상 조절(PC) - COMPANY - Button 전체
                    if (companyMode === 'FULL') bgStyle = { backgroundColor: 'rgba(30, 41, 59, 1)', borderColor: color, color: 'white' };
                    // ON/OFF버튼 투명도 조절(PC) - COMPANY - MINIMAL 상태 외곽선만 투명도 0.3, Dot은 그대로, TEXT는 흰색
                    else if (companyMode === 'MINIMAL') bgStyle = { backgroundColor: 'transparent', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'white' };
                    // ON/OFF버튼 투명도 조절(PC) - COMPANY - HIDDEN 상태 Button 전체
                    else bgStyle = { backgroundColor: 'transparent', borderColor: color, color: color, opacity: 0.5 };
                  } else {
                    // History/Card: 2-step toggle - keep color, use opacity
                    // ON/OFF버튼 색상 조절(PC) - COMPANY - ON 상태 Button 전체
                    if (isActive) bgStyle = { backgroundColor: 'rgba(30, 41, 59, 1)', borderColor: color, color: 'white' };
                    // ON/OFF버튼 투명도 조절(PC) - COMPANY - OFF 상태 Button 전체
                    else bgStyle = { backgroundColor: 'transparent', borderColor: color, color: color, opacity: 0.5 };
                  }
                } else {
                  isActive = visibleCategories[cat];
                  // ON/OFF버튼 색상 조절(PC) - PERSON/TECHNOLOGY - ON 상태 Button 전체
                  if (isActive) bgStyle = { backgroundColor: 'rgba(30, 41, 59, 1)', borderColor: color, color: 'white' };
                  // ON/OFF버튼 투명도 조절(PC) - PERSON/TECHNOLOGY - OFF 상태 Button 전체
                  else bgStyle = { backgroundColor: 'transparent', borderColor: color, color: color, opacity: 0.5 };
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
                        // ON/OFF버튼 색상 조절(PC) - COMPANY/PERSON/TECHNOLOGY - Dot 색상 (원래 카테고리 색상 유지)
                        backgroundColor: color,
                        // ON/OFF버튼 투명도 조절(PC) - COMPANY/PERSON/TECHNOLOGY - Dot 투명도
                        opacity: isActive ? 1 : 0.7
                      }}
                    />
                    <span className={`transition-all duration-500 ease-out whitespace-nowrap ${viewMode === 'MAP'
                      ? (hoverGroupActive === 'CATEGORY' ? "max-w-xs opacity-100" : "max-w-0 overflow-hidden opacity-0")
                      : "max-w-xs opacity-100"
                      }`}>
                      {t(`categories.${cat.toLowerCase()}`)}
                    </span>
                  </button>
                );
              })}

              {/* Episode Toggle - History View Only (after Categories) */}
              {viewMode === 'TIMELINE' && (
                <button
                  onClick={() => setShowStories(prev => !prev)}
                  className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-200 flex items-center justify-center gap-2 group min-w-[50px]`}
                  style={{
                    // ON/OFF버튼 색상 조절(PC) - EPISODE - Button 배경색
                    backgroundColor: showStories ? 'rgba(30, 41, 59, 1)' : 'transparent',
                    // ON/OFF버튼 색상 조절(PC) - EPISODE - Button 테두리색 (항상 보라색)
                    borderColor: '#a855f7',
                    // ON/OFF버튼 색상 조절(PC) - EPISODE - Button 텍스트색
                    color: showStories ? 'white' : '#a855f7',
                    // ON/OFF버튼 투명도 조절(PC) - EPISODE - Button 전체 투명도
                    opacity: showStories ? 1 : 0.6
                  }}
                  title="Click to toggle episode visibility"
                >
                  <div
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] shrink-0"
                    style={{
                      // ON/OFF버튼 색상 조절(PC) - EPISODE - Dot 색상 (항상 보라색)
                      backgroundColor: '#a855f7',
                      // ON/OFF버튼 투명도 조절(PC) - EPISODE - Dot 투명도
                      opacity: showStories ? 1 : 0.7
                    }}
                  />
                  <span className="max-w-xs opacity-100 whitespace-nowrap">{t('toggles.episode')}</span>
                </button>
              )}
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
                      case LinkType.POWERS: return t('linkTypes.POWERS');
                      case LinkType.CREATES: return t('linkTypes.CREATES');
                      case LinkType.CONTRIBUTES: return t('linkTypes.CONTRIBUTES');
                      case LinkType.ENGAGES: return t('linkTypes.ENGAGES');
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
            <button onClick={() => setViewMode('MAP')} className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'MAP' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>{t('nav.map')}</button>
            <button onClick={() => setViewMode('TIMELINE')} className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'TIMELINE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>{t('nav.history')}</button>
            <button onClick={() => setViewMode('CARD')} className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'CARD' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>{t('nav.cards')}</button>
            <button
              onClick={() => setViewMode('LINKS')}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${viewMode === 'LINKS' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >{t('nav.links')}</button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-700 bg-surface/50 flex flex-col">
        {focusNodeId && (() => {
          const focusNode = INITIAL_DATA.nodes.find(n => n.id === focusNodeId);
          const nodeColor = focusNode ? CATEGORY_COLORS[focusNode.category] : '#22d3ee';
          // Hide on PC for all views (each view has its own focus node display)
          return (
            <div className="h-14 flex items-center bg-slate-900/30 relative xl:hidden">
              {/* Target icon on the left - decorative only (not clickable) */}
              <div
                className="absolute left-4 p-2 text-red-400"
              >
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                </svg>
              </div>
              {/* Centered Focus Text - flex-1 with center using the container width */}
              <div className="flex-1 flex justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{t('focus.focusOn')}</span>
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

        {/* Category toggles - hidden in Focus mode AND Links View (Mobile only) */}
        {!focusNodeId && viewMode !== 'LINKS' && (
          <div className="h-14 flex items-center justify-center px-4 overflow-x-auto gap-4 custom-scrollbar xl:hidden">
            <div className="flex items-center gap-4 shrink-0">
              {Object.keys(CATEGORY_COLORS).map((key) => {
                const cat = key as Category;
                let isActive = false;
                if (cat === Category.COMPANY) isActive = companyMode !== 'HIDDEN';
                else isActive = visibleCategories[cat];

                // Default styles
                let containerClass = 'w-8 h-8 rounded-full border flex items-center justify-center transition-all';
                // ON/OFF버튼 색상 조절(Mobile) - COMPANY/PERSON/TECHNOLOGY - Button 테두리색 (원래 카테고리 색상)
                let borderColor = CATEGORY_COLORS[cat];
                // ON/OFF버튼 색상 조절(Mobile) - COMPANY/PERSON/TECHNOLOGY - Button 배경색
                let bgColor = isActive ? 'rgba(30, 41, 59, 0.5)' : 'transparent';
                // ON/OFF버튼 색상 조절(Mobile) - COMPANY/PERSON/TECHNOLOGY - Dot 색상 (원래 카테고리 색상 유지)
                let dotBg = CATEGORY_COLORS[cat];
                let dotBorder = 'none';
                // ON/OFF버튼 투명도 조절(Mobile) - COMPANY/PERSON/TECHNOLOGY - Button 전체 투명도
                let containerOpacity = isActive ? 1 : 0.5;

                // Company-specific styling for Map view (3-step toggle)
                if (cat === Category.COMPANY && viewMode === 'MAP') {
                  if (companyMode === 'FULL') {
                    // ON/OFF버튼 색상 조절(Mobile) - COMPANY - FULL 상태 Button 배경색
                    bgColor = 'rgba(30, 41, 59, 0.5)';
                  } else if (companyMode === 'MINIMAL') {
                    // ON/OFF버튼 투명도 조절(Mobile) - COMPANY - MINIMAL 상태 외곽선만 투명도 0.3, Dot은 그대로
                    borderColor = 'rgba(239, 68, 68, 0.3)';
                    containerOpacity = 1;
                  } else {
                    // ON/OFF버튼 투명도 조절(Mobile) - COMPANY - HIDDEN 상태 Button 전체 투명도
                    bgColor = 'transparent';
                    containerOpacity = 0.25;
                  }
                } else if (!isActive) {
                  // ON/OFF버튼 투명도 조절(Mobile) - PERSON/TECHNOLOGY - OFF 상태 Button 전체 투명도
                  bgColor = 'transparent';
                  containerOpacity = 0.3;
                }

                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={containerClass}
                    style={{
                      borderColor,
                      backgroundColor: bgColor,
                      opacity: containerOpacity,
                    }}
                    aria-label={`Toggle ${cat}`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dotBg, border: dotBorder }}
                    ></div>
                  </button>
                );
              })}
            </div>

            {/* Episode Toggle - History View Only (Mobile) */}
            {viewMode === 'TIMELINE' && (
              <button
                onClick={() => setShowStories(prev => !prev)}
                className="w-8 h-8 rounded-full border flex items-center justify-center transition-all"
                style={{
                  // ON/OFF버튼 색상 조절(Mobile) - EPISODE - Button 배경색
                  backgroundColor: showStories ? 'rgba(30, 41, 59, 0.5)' : 'transparent',
                  // ON/OFF버튼 색상 조절(Mobile) - EPISODE - Button 테두리색 (항상 보라색)
                  borderColor: '#a855f7',
                  // ON/OFF버튼 투명도 조절(Mobile) - EPISODE - Button 전체 투명도
                  opacity: showStories ? 1 : 0.3
                }}
                aria-label="Toggle Episodes"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  // ON/OFF버튼 색상 조절(Mobile) - EPISODE - Dot 색상 (항상 보라색)
                  style={{ backgroundColor: '#a855f7' }}
                ></div>
              </button>
            )}

            {viewMode === 'MAP' && (
              <>
                <div className="w-px h-6 bg-slate-700 shrink-0"></div>
                <div className="flex items-center gap-4 shrink-0">
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
        {/* Focus Mode Bottom Indicator */}
        {focusNodeId && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500/50 z-50" />
        )}
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
            data={filteredDataFirstDegree}
            fullData={translatedData}
            onNodeClick={handleNodeSelect}
            onNodeDoubleClick={handleNodeDoubleClick}
            scrollToNodeId={scrollToNodeId}
            focusNodeId={focusNodeId}
            showStories={showStories}
          />
        )}

        {viewMode === 'CARD' && (
          <CardView
            data={filteredDataFirstDegree}
            fullData={translatedData}
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
            fullData={translatedData}
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
          locale={locale}
          onLocaleChange={setLocale}
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