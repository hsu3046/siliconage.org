import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { GraphData, NodeData, LinkData, Category, LinkType, ArrowHead, LinkIcon, CompanyMode } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { useLocale } from '../hooks/useLocale';

interface MapViewProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
  onNodeFocus?: (node: NodeData) => void;
  onNodeDoubleClick: (node: NodeData) => void;
  width: number;
  height: number;
  focusNodeId?: string | null;
  scrollToNodeId?: string | null;
  companyMode: CompanyMode;
  featuredNode?: NodeData;
}

// ============================================================================
// 🎛️ 물리 엔진 설정 (Physics Configuration)
// 모든 노드 위치/거리 관련 값을 여기서 조정하세요!
// 나중에 UI로 조정할 수 있도록 한 곳에 모았습니다.
// ============================================================================
const PHYSICS_CONFIG = {
  // === 화면 비율에 따른 퍼짐 (forceX, forceY) ===
  // 값이 작을수록 해당 방향으로 더 넓게 퍼짐
  forceX: {
    landscape: 0.01,    // 가로모드: X힘 (약할수록 좌우로 넓게) (기본값: 0.01)
    portrait: 0.5,      // 세로모드: X힘 (기본값: 0.5)
  },
  forceY: {
    landscape: 0.1,     // 가로모드: Y힘 (강할수록 상하로 모임) (기본값: 0.1)
    portrait: 0.01,     // 세로모드: Y힘 (약할수록 상하로 넓게) (기본값: 0.01)
  },

  // === 반발력 (Charge - 노드 간 밀어내는 힘) ===
  // 절대값이 클수록 더 강하게 밀어냄 (음수)
  charge: {
    company: -13500,    // 회사 노드 반발력 (기본값: -13500)
    other: -3750,       // 기술/인물 노드 반발력 (기본값: -3750)
    distanceMax: 6000,  // 반발력이 적용되는 최대 거리 (기본값: 6000)
  },

  // === 충돌 방지 (Collide - 노드 간 최소 거리) ===
  // 값이 클수록 노드간 거리가 멀어짐
  collide: {
    companyBuffer: 300, // 회사 노드 추가 버퍼 (기본값: 300)
    otherBuffer: 90,    // 기술/인물 노드 추가 버퍼 (기본값: 90)
    strength: 0.9,      // 충돌 회피 강도 (0~1) (기본값: 0.9)
  },

  // === 링크 거리 (Link Distance) ===
  link: {
    base: 540,          // 기본 링크 거리 (기본값: 540)
    engagesBase: 180,   // ENGAGES 링크 거리 (기본값: 180)
    // 연결 수에 따른 거리 배율
    fewLinksMultiplier: 0.5,    // 1~2개 연결: 50% (기본값: 0.5)
    mediumLinksMultiplier: 0.75, // 3~4개 연결: 75% (기본값: 0.75)
    manyLinksMultiplier: 1.0,    // 5개 이상: 100% (기본값: 1.0)
    strengthMultiplier: 1.5,     // 링크 당기는 힘 배율 (기본값: 1.5)
  },

  // === 중심력 (Center Force) ===
  center: {
    strength: 0.03,     // 전체 그래프를 화면 중앙으로 당기는 힘 (기본값: 0.03)
  },

  // === 시뮬레이션 속도/부드러움 ===
  simulation: {
    velocityDecay: 0.75, // 마찰력 (높을수록 부드럽게 멈춤, 0~1) (기본값: 0.75)
    alphaDecay: 0.02,    // 에너지 감소 속도 (기본값: 0.02)
    alphaOnLayoutChange: 0.6, // 레이아웃 변경 시 에너지 감소 속도 (기본값: 0.6)
  },

  // === 회사 간 분리력 ===
  companySeparation: {
    strength: 0.0,       // 회사끼리 밀어내는 힘 (기본값: 1.0)
  },

  // === 연결 기반 중력 ===
  weightedGravity: {
    strength: 0.3,       // 연결된 회사로 당기는 힘 (기본값: 0.3)
  },

  // === Focus Mode 전용 설정 (노드 클릭 시 집중 모드) ===
  // Focus Mode는 선택한 노드와 연결된 노드만 표시하는 모드
  // 노드 수가 적으므로 더 촘촘하게 배치
  focusMode: {
    forceXY: 0.05,              // X/Y 중심 당기는 힘 (강할수록 중앙에 모임) (기본값: 0.05)
    chargeCompany: -2000,       // 회사 반발력 (일반 모드보다 약함 = 더 가깝게) (기본값: -2000)
    chargeOther: -800,          // 기술/인물 반발력 (기본값: -800)
    collideCompanyBuffer: 150,  // 회사 충돌 버퍼 (일반 모드 300 vs Focus 150) (기본값: 150)
    collideOtherBuffer: 40,     // 기술/인물 충돌 버퍼 (일반 모드 90 vs Focus 40) (기본값: 40)
    linkDistance: 80,           // 일반 링크 거리 (일반 모드 540 vs Focus 80) (기본값: 80)
    linkEngagesDistance: 30,    // ENGAGES 링크 거리 (일반 모드 180 vs Focus 30) (기본값: 30)
    linkStrengthMultiplier: 0.6, // 링크 당기는 힘 배율 (일반 모드 1.5 vs Focus 0.6) (기본값: 0.6)
    distanceMax: 1000,          // 반발력 최대 거리 (일반 모드 6000 vs Focus 1000) (기본값: 1000)
    centerStrength: 0.1,        // 중심력 (일반 모드 0.03 vs Focus 0.1) (기본값: 0.1)
    velocityDecay: 0.5,         // 마찰력 (높을수록 빨리 멈춤, 일반 0.75 vs Focus 0.5) (기본값: 0.5)
  },
};

// Helper to formulate the Sub-Label (Role or Year) based on Category
const getSubLabel = (node: NodeData) => {
  if (node.category === Category.COMPANY) {
    return `${node.year} - Current`;
  }
  if (node.category === Category.PERSON) {
    return node.primaryRole || null;
  }
  if (node.category === Category.TECHNOLOGY) {
    return `${node.year}`;
  }
  return null;
};

// Helper to estimate label dimensions for "Compact" look
const getLabelDimensions = (label: string, category: Category) => {
  const charWidth = 9; // Approx width per char
  const paddingX = 24;

  // Base width on the main label
  const width = label.length * charWidth + paddingX;

  // Companies text box height
  const height = category === Category.COMPANY ? 34 : 32;

  return { width, height };
};

// Define styles for different link types
const getLinkStyle = (type: LinkType) => {
  switch (type) {
    case LinkType.CREATES:    // Creation, Launch, Founding
      return { dasharray: "none", width: 1.0, color: "#06b6d4", opacity: 0.7 }; // Cyan, Solid

    case LinkType.POWERS:     // Dependency, Infrastructure, Foundation
      return { dasharray: "none", width: 1.0, color: "#f97316", opacity: 0.7 }; // Orange, Solid

    case LinkType.CONTRIBUTES: // Evolution, Influence, Inspiration
      return { dasharray: "5,2", width: 1.5, color: "#a78bfa", opacity: 0.6 }; // Purple, Dashed

    case LinkType.ENGAGES:    // Interaction, Rivalry, Partnership
      return { dasharray: "none", width: 2.5, color: "#94a3b8", opacity: 0.8 }; // Emerald, Solid

    default:
      return { dasharray: "none", width: 1, color: "#94a3b8", opacity: 0.5 };
  }
};

// UPDATED: Company Separation using Dynamic Zone Radius
const forceCompanySeparation = (strength: number = 0.8) => {
  let nodes: NodeData[];

  function force(alpha: number) {
    const companies = nodes.filter(n => n.category === Category.COMPANY);
    const n = companies.length;

    for (let i = 0; i < n; ++i) {
      for (let j = i + 1; j < n; ++j) {
        const a = companies[i];
        const b = companies[j];

        if (a.x === undefined || a.y === undefined || b.x === undefined || b.y === undefined) continue;

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        let distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // Dynamic Distance based on calculated Zone Radii
        const minDist = (a._zoneRadius || 150) + (b._zoneRadius || 150) + 50; // +Padding

        if (dist < minDist) {
          const overlap = minDist - dist;
          const nx = (dx / dist) || 1;
          const ny = (dy / dist) || 0;

          const delta = overlap * alpha * strength;

          a.x += nx * delta;
          a.y += ny * delta;
          b.x -= nx * delta;
          b.y -= ny * delta;
        }
      }
    }
  }

  force.initialize = (_nodes: NodeData[]) => {
    nodes = _nodes;
  };

  return force;
};

// NEW ALGORITHM: Weighted Gravity Anchor
const forceWeightedGravity = (links: LinkData[], strengthMultiplier: number = 0.3) => {
  let nodes: NodeData[];

  function force(alpha: number) {
    nodes.forEach(node => {
      if (node.category === Category.COMPANY) return;
      if (node.fx !== null || node.fy !== null) return;

      let totalX = 0;
      let totalY = 0;
      let totalWeight = 0;
      let connectedCompanies = 0;

      links.forEach(link => {
        const source = link.source as NodeData;
        const target = link.target as NodeData;

        let other: NodeData | null = null;
        if (source.id === node.id && target.category === Category.COMPANY) other = target;
        else if (target.id === node.id && source.category === Category.COMPANY) other = source;

        if (other && other.x !== undefined && other.y !== undefined) {
          const weight = link.strength;
          totalX += other.x * weight;
          totalY += other.y * weight;
          totalWeight += weight;
          connectedCompanies++;
        }
      });

      if (totalWeight > 0) {
        const targetX = totalX / totalWeight;
        const targetY = totalY / totalWeight;

        const k = alpha * strengthMultiplier * (connectedCompanies === 1 ? 0.8 : 0.4);

        node.vx! += (targetX - node.x!) * k;
        node.vy! += (targetY - node.y!) * k;
      }
    });
  }

  force.initialize = (_nodes: NodeData[]) => {
    nodes = _nodes;
  };

  return force;
};

const forceCompanyAffinity = (links: LinkData[], strengthMultiplier: number = 0.5) => {
  let nodes: NodeData[];
  let affinities: { source: NodeData, target: NodeData, strength: number }[] = [];
  let isInitialized = false;

  function initAffinities() {
    const companies = nodes.filter(n => n.category === Category.COMPANY);
    const companyMap = new Map(companies.map(c => [c.id, c]));
    const pairStrength = new Map<string, number>();

    const intermediateNodes = nodes.filter(n => n.category !== Category.COMPANY);

    intermediateNodes.forEach(interNode => {
      const connectedCompanies: { company: NodeData, linkStrength: number }[] = [];

      links.forEach(link => {
        const s = link.source as NodeData;
        const t = link.target as NodeData;

        if (s.id === interNode.id && t.category === Category.COMPANY) {
          connectedCompanies.push({ company: t, linkStrength: link.strength });
        } else if (t.id === interNode.id && s.category === Category.COMPANY) {
          connectedCompanies.push({ company: s, linkStrength: link.strength });
        }
      });

      for (let i = 0; i < connectedCompanies.length; ++i) {
        for (let j = i + 1; j < connectedCompanies.length; ++j) {
          const c1 = connectedCompanies[i];
          const c2 = connectedCompanies[j];

          const [id1, id2] = [c1.company.id, c2.company.id].sort();
          const key = `${id1}-${id2}`;

          const affinity = c1.linkStrength * c2.linkStrength;

          pairStrength.set(key, (pairStrength.get(key) || 0) + affinity);
        }
      }
    });

    affinities = [];
    pairStrength.forEach((strength, key) => {
      const [id1, id2] = key.split('-');
      const c1 = companyMap.get(id1);
      const c2 = companyMap.get(id2);
      if (c1 && c2) {
        affinities.push({ source: c1, target: c2, strength });
      }
    });

    isInitialized = true;
  }

  function force(alpha: number) {
    if (!isInitialized) initAffinities();

    const k = alpha * strengthMultiplier;

    affinities.forEach(affinity => {
      const { source, target, strength } = affinity;
      if (source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;

      const force = strength * k;

      const vx = dx * force;
      const vy = dy * force;

      source.vx! += vx;
      source.vy! += vy;
      target.vx! -= vx;
      target.vy! -= vy;
    });
  }

  force.initialize = (_nodes: NodeData[]) => {
    nodes = _nodes;
    isInitialized = false;
  };

  return force;
};

// Helper to calculate intersection point on a Rectangle
const getRectIntersection = (
  sourceX: number, sourceY: number,
  targetX: number, targetY: number,
  w: number, h: number
) => {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  if (dx === 0 && dy === 0) return { x: sourceX, y: sourceY };

  // Half dimensions
  const hw = w / 2;
  const hh = h / 2;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Calculate scale factor to reach the edge from center
  const scaleX = absDx > 0 ? hw / absDx : Infinity;
  const scaleY = absDy > 0 ? hh / absDy : Infinity;

  const scale = Math.min(scaleX, scaleY);

  return {
    x: sourceX + dx * scale,
    y: sourceY + dy * scale
  };
};

// Helper to calculate intersection point on a Circle
const getCircleIntersection = (
  sourceX: number, sourceY: number,
  targetX: number, targetY: number,
  radius: number
) => {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return { x: sourceX, y: sourceY };

  // STOP EXACTLY AT RADIUS
  const scale = radius / dist;

  return {
    x: sourceX + dx * scale,
    y: sourceY + dy * scale
  };
};

const MapView: React.FC<MapViewProps> = ({ data, onNodeClick, onNodeFocus, onNodeDoubleClick, width, height, focusNodeId, scrollToNodeId, companyMode, featuredNode }) => {
  // i18n hook
  const { t } = useLocale();

  const svgRef = useRef<SVGSVGElement>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // START AT LEVEL 1 (Zoom Out)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const zoomLevelRef = useRef<number>(1);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    category: Category;
    description: string;
    score: number;
    companyRole?: string;
    personRole?: string;
    techRole?: string;
    techCategoryL1?: string;
    techCategoryL2?: string;
    hashtags?: { id: string, label: string }[];
  } | null>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<NodeData[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store simulation references to update them dynamically
  const simulationRef = useRef<d3.Simulation<NodeData, LinkData> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const zoomSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const prevFocusNodeIdRef = useRef<string | null>(null);
  // Track last layout dimensions for recalculation detection
  const lastLayoutRef = useRef<{ width: number; height: number } | null>(null);


  const handleNodeClick = (d: NodeData) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      onNodeClick(d);
      clickTimerRef.current = null;
    }, 250);
  };

  const handleNodeDoubleClick = (d: NodeData) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    onNodeDoubleClick(d);
  };

  // Search Logic
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
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(matches);
      // Ensure focus state is true when typing (fixes issue after search selection)
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

    setSearchTerm("");
    setSuggestions([]);
    setIsSearchFocused(false);

    // v1.2.1: Search now enters Focus Mode directly
    onNodeDoubleClick(node);
  };


  const handleSearchFocus = () => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsSearchFocused(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSearchBlur = () => {
    // Delay to allow click on suggestions
    blurTimeoutRef.current = setTimeout(() => {
      setIsSearchFocused(false);
      setSelectedSuggestionIndex(-1);
      blurTimeoutRef.current = null;
    }, 250);
  };

  // Keyboard navigation state for search
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      // Only select from visible suggestions list (already filtered by data.nodes)
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        handleSearchSelect(suggestions[selectedSuggestionIndex]);
      } else if (suggestions.length > 0) {
        handleSearchSelect(suggestions[0]);
      }
      // Removed: fallback search in full data.nodes - prevents focusing hidden nodes
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const zoomToLevel = (targetLevel: number) => {
    if (!zoomBehaviorRef.current || !zoomSelectionRef.current) return;

    let scale = 0.4; // Default fallback (Level 2)
    if (targetLevel === 1) scale = 0.15;
    if (targetLevel === 2) scale = 0.4;
    if (targetLevel === 3) scale = 0.8;
    if (targetLevel === 4) scale = 1.4;
    if (targetLevel === 5) scale = 2.0;

    setZoomLevel(targetLevel);
    zoomLevelRef.current = targetLevel;

    zoomSelectionRef.current.transition().duration(500).call(zoomBehaviorRef.current.scaleTo, scale);
  };

  // 1. Initial Setup Effect
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear existing
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // --- DEFINE MARKERS (Arrowheads) ---
    const defs = svg.append("defs");

    const markerTypes = [
      { id: "arrow-creates", color: "#06b6d4" },     // Cyan (Creates)
      { id: "arrow-powers", color: "#f97316" },      // Orange (Powers)
      { id: "arrow-contributes", color: "#a78bfa" }, // Purple (Contributes)
      { id: "arrow-engages", color: "#94a3b8" },     // Emerald (Engages)
    ];

    markerTypes.forEach(m => {
      // FORWARD MARKER (End of line)
      // refX=10 puts the TIP at the anchor point.
      defs.append("marker")
        .attr("id", m.id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 9)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", m.color);

      // REVERSE MARKER (Start of line)
      // refX=0 puts the TIP at the anchor point.
      defs.append("marker")
        .attr("id", `${m.id}-reverse`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 2)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M10,-5L0,0L10,5")
        .attr("fill", m.color);
    });

    // --- DEFINE LINK ICON SYMBOLS ---
    // HEART icon (Partnership) - Handshake icon from lucide (actual)
    defs.append("symbol")
      .attr("id", "icon-heart")
      .attr("viewBox", "0 0 24 24")
      .attr("fill", "none")
      .attr("stroke", "#3b82f6") // Blue
      .attr("stroke-width", "2")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .html('<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>');

    // RIVALRY icon (Rival) - Swords icon from lucide
    defs.append("symbol")
      .attr("id", "icon-rivalry")
      .attr("viewBox", "0 0 24 24")
      .attr("fill", "none")
      .attr("stroke", "#f59e0b") // Amber
      .attr("stroke-width", "2")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .html('<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>');


    // POWERS icon (Lightning bolt)
    defs.append("symbol")
      .attr("id", "icon-powers")
      .attr("viewBox", "0 0 24 24")
      .append("path")
      .attr("d", "M7 2v11h3v9l7-12h-4l4-8z")
      .attr("fill", "#fbbf24"); // Yellow

    // SPARK icon (Sparkle/Star)
    defs.append("symbol")
      .attr("id", "icon-spark")
      .attr("viewBox", "0 0 24 24")
      .append("path")
      .attr("d", "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z")
      .attr("fill", "#06b6d4"); // Cyan

    // --- FOCUS MODE: Pulsing Glow Effect ---
    const glowFilter = defs.append("filter")
      .attr("id", "focus-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    glowFilter.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", "4")
      .attr("result", "blur");

    glowFilter.append("feColorMatrix")
      .attr("in", "blur")
      .attr("type", "matrix")
      .attr("values", "0 0 0 0 0.2  0 0 0 0 0.8  0 0 0 0 1  0 0 0 1 0")
      .attr("result", "glow");

    glowFilter.append("feMerge")
      .selectAll("feMergeNode")
      .data(["glow", "SourceGraphic"])
      .enter()
      .append("feMergeNode")
      .attr("in", d => d);

    // Pulse animation will be handled by D3 interval in tick function

    const rootGroup = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2.2])
      .filter((event) => !event.ctrlKey && !event.button && event.type !== 'wheel' && event.type !== 'dblclick')
      .on("zoom", (event) => {
        rootGroup.attr("transform", event.transform);

        const k = event.transform.k;
        let level = 1;
        if (k < 0.25) level = 1;
        else if (k < 0.6) level = 2;
        else if (k < 1.1) level = 3;
        else if (k < 1.7) level = 4;
        else level = 5;

        if (!wheelTimeoutRef.current) {
          setZoomLevel(level);
          zoomLevelRef.current = level;
        }
      });

    svg.call(zoom);

    // Custom Wheel Handler
    svg.on("wheel", (event) => {
      event.preventDefault();
      if (wheelTimeoutRef.current) return;
      const delta = event.deltaY;
      const current = zoomLevelRef.current;
      if (Math.abs(delta) < 10) return;

      let nextLevel = current;
      if (delta > 0) nextLevel = Math.max(1, current - 1);
      else nextLevel = Math.min(5, current + 1);

      if (nextLevel !== current) {
        zoomToLevel(nextLevel);
        wheelTimeoutRef.current = setTimeout(() => {
          wheelTimeoutRef.current = null;
        }, 600);
      }
    });

    zoomBehaviorRef.current = zoom;
    zoomSelectionRef.current = svg;

    // Start at Level 1 (Scale 0.15)
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.15));

    // Layers
    rootGroup.append("g").attr("class", "layer-company-zone");
    rootGroup.append("g").attr("class", "layer-links");
    rootGroup.append("g").attr("class", "layer-link-icons"); // NEW: Icons on links
    rootGroup.append("g").attr("class", "layer-company-labels");
    rootGroup.append("g").attr("class", "layer-nodes");
    rootGroup.append("g").attr("class", "layer-labels");

    // Aspect Ratio Logic
    const aspectRatio = width / height;
    const isLandscape = aspectRatio > 1;

    // === 화면 비율에 따른 퍼짐 설정 (PHYSICS_CONFIG 참조) ===
    const forceXStrength = isLandscape ? PHYSICS_CONFIG.forceX.landscape : PHYSICS_CONFIG.forceX.portrait;
    const forceYStrength = isLandscape ? PHYSICS_CONFIG.forceY.landscape : PHYSICS_CONFIG.forceY.portrait;

    // Simulation Setup
    const simulation = d3.forceSimulation<NodeData>()
      .velocityDecay(PHYSICS_CONFIG.simulation.velocityDecay)
      .alphaDecay(PHYSICS_CONFIG.simulation.alphaDecay)
      .force("charge", d3.forceManyBody().strength(-250))
      .force("x", d3.forceX(0).strength(forceXStrength))
      .force("y", d3.forceY(0).strength(forceYStrength));

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, []);

  // Focus Zoom Effect - centers on the focused node
  useEffect(() => {
    const wasFocused = !!prevFocusNodeIdRef.current;
    const isFocused = !!focusNodeId;

    // Save the previous focus node ID at the START before any updates
    const savedPrevFocusNodeId = prevFocusNodeIdRef.current;

    const timer = setTimeout(() => {
      if (!zoomBehaviorRef.current || !zoomSelectionRef.current || !width || !height) return;

      if (isFocused && simulationRef.current) {
        // Find the focused node position
        const focusedNode = simulationRef.current.nodes().find(n => n.id === focusNodeId);

        if (focusedNode && focusedNode.x !== undefined && focusedNode.y !== undefined) {
          const scale = 0.8; // Level 3
          const tx = width / 2 - focusedNode.x * scale;
          const ty = height / 2 - focusedNode.y * scale;
          const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);

          setZoomLevel(3);
          zoomLevelRef.current = 3;

          zoomSelectionRef.current.transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .call(zoomBehaviorRef.current.transform, transform);
        }
      } else if (wasFocused && !isFocused) {
        // v1.2.1: Exit Focus Mode
        // Step 1: Zoom out to Level 1 first (let physics stabilize)
        const transform1 = d3.zoomIdentity.translate(width / 2, height / 2).scale(0.15);
        setZoomLevel(1);
        zoomLevelRef.current = 1;
        zoomSelectionRef.current.transition()
          .duration(500)
          .ease(d3.easeCubicOut)
          .call(zoomBehaviorRef.current.transform, transform1);

        // Step 2: After physics stabilizes (1000ms), zoom to Level 3 with focused node centered
        setTimeout(() => {
          if (!zoomBehaviorRef.current || !zoomSelectionRef.current || !simulationRef.current) return;

          const lastFocusedNode = simulationRef.current.nodes().find(n => n.id === savedPrevFocusNodeId);

          if (lastFocusedNode && lastFocusedNode.x !== undefined && lastFocusedNode.y !== undefined) {
            const scale = 0.8; // Zoom Level 3
            const tx = width / 2 - lastFocusedNode.x * scale;
            const ty = height / 2 - lastFocusedNode.y * scale;
            const transform2 = d3.zoomIdentity.translate(tx, ty).scale(scale);

            setZoomLevel(3);
            zoomLevelRef.current = 3;

            zoomSelectionRef.current.transition()
              .duration(750)
              .ease(d3.easeCubicOut)
              .call(zoomBehaviorRef.current.transform, transform2);
          }
        }, 1000);
      }
    }, 100);

    prevFocusNodeIdRef.current = focusNodeId || null;

    // === D3 PULSE ANIMATION (Safari/iOS Compatible) ===
    // Clear previous pulse interval
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }

    // Reset highlight strokes when focus ends
    if (wasFocused && !isFocused && svgRef.current) {
      const svg = d3.select(svgRef.current);
      // Reset company label strokes
      svg.selectAll(".layer-company-labels g rect")
        .transition()
        .duration(300)
        .attr("stroke", "none")
        .attr("stroke-width", 0)
        .attr("stroke-opacity", 0);
      // Reset circle strokes (Person, Tech nodes)
      svg.selectAll(".layer-nodes circle")
        .interrupt() // Stop any ongoing transitions
        .transition()
        .duration(300)
        .attr("stroke", "#0f172a") // Original dark slate color
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1);
    }

    if (focusNodeId && svgRef.current) {
      let pulsePhase = 0;

      pulseIntervalRef.current = setInterval(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const focusedCompany = svg.selectAll(".layer-company-labels g")
          .filter((d: any) => d._focusDistance === 0);
        const focusedOther = svg.selectAll(".layer-nodes circle")
          .filter((d: any) => d._focusDistance === 0);

        // Toggle pulse phase (0 -> 1 -> 0)
        pulsePhase = pulsePhase === 0 ? 1 : 0;

        const expandedStroke = 4;
        const normalStroke = 0;
        const expandedOpacity = 0.9;
        const normalOpacity = 1;
        const glowColor = "#fbbf24";  // Warm golden yellow for glow effect

        // Animate Company Labels (rect inside group)
        focusedCompany.select("rect")
          .transition()
          .duration(1000)
          .ease(d3.easeSinInOut)
          .attr("stroke", glowColor)
          .attr("stroke-width", pulsePhase === 1 ? expandedStroke : normalStroke)
          .attr("stroke-opacity", pulsePhase === 1 ? expandedOpacity : 0);

        // Animate Other Nodes (circles)
        focusedOther
          .transition()
          .duration(1000)
          .ease(d3.easeSinInOut)
          .attr("stroke", glowColor)
          .attr("stroke-width", pulsePhase === 1 ? expandedStroke + 2 : 2)
          .attr("stroke-opacity", pulsePhase === 1 ? expandedOpacity : 1);

      }, 1000);
    }

    return () => {
      clearTimeout(timer);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;

        // Reset all strokes when cleanup runs
        if (svgRef.current) {
          const svg = d3.select(svgRef.current);
          // Reset company rects
          svg.selectAll(".layer-company-labels g rect")
            .attr("stroke", "none")
            .attr("stroke-width", 0)
            .attr("stroke-opacity", 0);
          // Reset circles to original dark slate color
          svg.selectAll(".layer-nodes circle")
            .interrupt() // Stop any ongoing transitions
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 1);
        }
      }
    };
  }, [focusNodeId, width, height]);


  // Scroll To Node Effect (Same as before)
  useEffect(() => {
    if (scrollToNodeId && simulationRef.current && zoomBehaviorRef.current && zoomSelectionRef.current) {
      const node = simulationRef.current.nodes().find(n => n.id === scrollToNodeId);

      if (node && node.x !== undefined && node.y !== undefined) {
        const svg = zoomSelectionRef.current;
        svg.interrupt();
        const currentTransform = d3.zoomTransform(svg.node()!);
        const scale = currentTransform.k;
        const tx = width / 2 - node.x * scale;
        const ty = height / 2 - node.y * scale;

        const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);
        svg.transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .call(zoomBehaviorRef.current.transform, transform);
      }
    }
  }, [scrollToNodeId, width, height]);


  // Data Update Effect
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return;

    const svg = d3.select(svgRef.current);
    const rootGroup = svg.select("g");
    const simulation = simulationRef.current;

    let visibleNodes = data.nodes;
    if (focusNodeId) visibleNodes = data.nodes;

    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleLinks = data.links.filter(l => {
      const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return visibleNodeIds.has(s) && visibleNodeIds.has(t);
    });

    const oldNodesMap = new Map<string, NodeData>();
    simulation.nodes().forEach(n => {
      oldNodesMap.set(n.id, n);
    });

    visibleNodes.forEach(node => {
      const old = oldNodesMap.get(node.id);
      if (old) {
        node.x = old.x;
        node.y = old.y;
        node.vx = old.vx;
        node.vy = old.vy;
      }
    });

    if (focusNodeId) {
      const focusedNode = visibleNodes.find(n => n.id === focusNodeId);
      if (focusedNode) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Fix focused node at center
        focusedNode.fx = centerX;
        focusedNode.fy = centerY;

        // Get 1st and 2nd degree nodes
        const firstDegreeNodes = visibleNodes.filter(n => n._focusDistance === 1);
        const secondDegreeNodes = visibleNodes.filter(n => n._focusDistance === 2);

        // Radial distances
        const innerRadius = Math.min(width, height) * 0.25;  // 1st degree circle
        const outerRadius = Math.min(width, height) * 0.42; // 2nd degree circle

        // Position 1st degree nodes in a circle
        const angleStep1 = (2 * Math.PI) / firstDegreeNodes.length;
        firstDegreeNodes.forEach((node, i) => {
          const angle = i * angleStep1 - Math.PI / 2; // Start from top
          // Set initial position but allow physics to move them (release fx/fy)
          node.x = centerX + Math.cos(angle) * innerRadius;
          node.y = centerY + Math.sin(angle) * innerRadius;
          node.fx = null;
          node.fy = null;
          (node as any)._angle = angle; // Store angle for 2nd degree positioning
        });

        // Position 2nd degree nodes - extend from their 1st degree parent
        secondDegreeNodes.forEach(node => {
          // Find which 1st degree node this is connected to
          const connectedFirstDegree = firstDegreeNodes.find(first => {
            return visibleLinks.some(link => {
              const s = typeof link.source === 'object' ? (link.source as any).id : link.source;
              const t = typeof link.target === 'object' ? (link.target as any).id : link.target;
              return (s === first.id && t === node.id) || (t === first.id && s === node.id);
            });
          });

          if (connectedFirstDegree) {
            const parentAngle = (connectedFirstDegree as any)._angle || 0;
            // Count how many 2nd degree nodes share this parent
            const siblings = secondDegreeNodes.filter(n => {
              return visibleLinks.some(link => {
                const s = typeof link.source === 'object' ? (link.source as any).id : link.source;
                const t = typeof link.target === 'object' ? (link.target as any).id : link.target;
                return (s === connectedFirstDegree.id && t === n.id) || (t === connectedFirstDegree.id && s === n.id);
              });
            });
            const siblingIndex = siblings.indexOf(node);
            const siblingCount = siblings.length;

            // Spread siblings in a small angle range around parent's direction
            const spreadAngle = Math.PI / 6; // 30 degrees total spread
            const offsetAngle = siblingCount > 1
              ? (siblingIndex - (siblingCount - 1) / 2) * (spreadAngle / siblingCount)
              : 0;

            const finalAngle = parentAngle + offsetAngle;
            // Set initial position but allow physics to move them
            node.x = centerX + Math.cos(finalAngle) * outerRadius;
            node.y = centerY + Math.sin(finalAngle) * outerRadius;
            node.fx = null;
            node.fy = null;
          } else {
            // Fallback: place randomly on outer ring if no parent found
            const randomAngle = Math.random() * 2 * Math.PI;
            node.x = centerX + Math.cos(randomAngle) * outerRadius;
            node.y = centerY + Math.sin(randomAngle) * outerRadius;
            node.fx = null;
            node.fy = null;
          }
        });
      }
    } else {
      visibleNodes.forEach(n => { n.fx = null; n.fy = null; });
    }

    simulation.nodes(visibleNodes);

    // Update Forces
    const isFocusMode = visibleNodes.length < 50;

    // Detect transition from focus mode to normal mode
    const wasJustInFocusMode = prevFocusNodeIdRef.current && !focusNodeId;

    // Detect significant layout change (width/height changed by >100px)
    const layoutChanged = !lastLayoutRef.current ||
      Math.abs(lastLayoutRef.current.width - width) > 100 ||
      Math.abs(lastLayoutRef.current.height - height) > 100;

    // Update layout ref after detection
    if (layoutChanged) {
      lastLayoutRef.current = { width, height };
    }

    // === 화면 비율에 따른 퍼짐 설정 (PHYSICS_CONFIG 참조) ===
    const aspectRatio = width / height;
    const isLandscape = aspectRatio > 1;
    const forceXStrength = isLandscape ? PHYSICS_CONFIG.forceX.landscape : PHYSICS_CONFIG.forceX.portrait;
    const forceYStrength = isLandscape ? PHYSICS_CONFIG.forceY.landscape : PHYSICS_CONFIG.forceY.portrait;

    // Shorthand for config sections
    const cfg = PHYSICS_CONFIG;
    const fm = cfg.focusMode;

    simulation
      .force("link", d3.forceLink<NodeData, LinkData>(visibleLinks)
        .id(d => d.id)
        .distance(d => {
          if (isFocusMode) {
            if (d.type === LinkType.ENGAGES) return fm.linkEngagesDistance;
            return fm.linkDistance;
          }

          // 연결이 적은 노드는 거리를 짧게 (화면 밖으로 나가지 않도록)
          const source = d.source as NodeData;
          const target = d.target as NodeData;
          const sourceLinks = visibleLinks.filter(l =>
            (l.source as NodeData).id === source.id || (l.target as NodeData).id === source.id
          ).length;
          const targetLinks = visibleLinks.filter(l =>
            (l.source as NodeData).id === target.id || (l.target as NodeData).id === target.id
          ).length;
          const minLinks = Math.min(sourceLinks, targetLinks);

          // 연결 수에 따른 거리 배율
          const distanceMultiplier = minLinks <= 2 ? cfg.link.fewLinksMultiplier
            : (minLinks <= 4 ? cfg.link.mediumLinksMultiplier : cfg.link.manyLinksMultiplier);

          // Full graph
          if (d.type === LinkType.ENGAGES) return cfg.link.engagesBase * distanceMultiplier;
          return cfg.link.base * distanceMultiplier;
        })
        .strength(d => {
          if (isFocusMode) return d.strength * fm.linkStrengthMultiplier;
          return d.strength * cfg.link.strengthMultiplier;
        })
      )
      .force("charge", d3.forceManyBody<NodeData>()
        .strength((d: any) => {
          if (isFocusMode) {
            if (d.category === Category.COMPANY) return fm.chargeCompany;
            return fm.chargeOther;
          }
          if (d.category === Category.COMPANY) return cfg.charge.company;
          return cfg.charge.other;
        })
        .distanceMax(isFocusMode ? fm.distanceMax : cfg.charge.distanceMax)
      )
      .force("collide", d3.forceCollide<NodeData>()
        .radius((d: any) => {
          const base = (d._radius || 10);
          if (isFocusMode) {
            if (d.category === Category.COMPANY) return base + fm.collideCompanyBuffer;
            return base + fm.collideOtherBuffer;
          }
          if (d.category === Category.COMPANY) return base + cfg.collide.companyBuffer;
          return base + cfg.collide.otherBuffer;
        })
        .strength(cfg.collide.strength)
      )
      .force("center", d3.forceCenter(width / 2, height / 2).strength(isFocusMode ? fm.centerStrength : cfg.center.strength))
      // Aspect-ratio aware spreading forces
      .force("x", d3.forceX<NodeData>(width / 2).strength(isFocusMode ? fm.forceXY : forceXStrength))
      .force("y", d3.forceY<NodeData>(height / 2).strength(isFocusMode ? fm.forceXY : forceYStrength))
      // Custom forces
      .force("company-separation", forceCompanySeparation(isFocusMode ? 0.1 : cfg.companySeparation.strength))
      .force("weighted-gravity", forceWeightedGravity(visibleLinks, cfg.weightedGravity.strength))
      // Higher friction for smoother, less jittery movement
      .velocityDecay(wasJustInFocusMode ? 0.8 : (isFocusMode ? fm.velocityDecay : cfg.simulation.velocityDecay));

    // Smooth Focus Exit: Use very low energy to minimize jitter
    if (wasJustInFocusMode) {
      simulation
        .alpha(0.05) // Very low energy - minimal movement
        .alphaDecay(0.1) // Fast decay - quick settle
        .restart();
    } else if (layoutChanged && !isFocusMode) {
      // Layout significantly changed: use higher alpha for full recalculation
      simulation
        .alpha(0.6)
        .alphaDecay(0.02)
        .restart();
    } else {
      simulation
        .alpha(isFocusMode ? 0.8 : 0.3)
        .alphaDecay(isFocusMode ? 0.05 : 0.0228) // Faster decay in Focus Mode to settle quickly
        .restart();
    }

    const t = svg.transition().duration(300);

    // 1. Company Zones
    const companyNodesData = visibleNodes.filter(d => d.category === Category.COMPANY);
    rootGroup.select(".layer-company-zone")
      .selectAll("circle")
      .data(companyNodesData, (d: any) => d.id)
      .join(
        enter => enter.append("circle")
          .attr("r", 0)
          .attr("fill", d => CATEGORY_COLORS[d.category])
          .attr("fill-opacity", d => {
            if (companyMode === 'MINIMAL') return 0;
            // 2nd degree: no fill, just border
            if (d._focusDistance === 2) return 0;
            return 0.15;
          })
          .attr("stroke", d => d._focusDistance === 2 ? CATEGORY_COLORS[d.category] : "none")
          .attr("stroke-opacity", d => d._focusDistance === 2 ? 0.08 : 0)
          .attr("stroke-width", 1)
          .attr("pointer-events", "none")
          .call(enter => enter.transition(t).attr("r", (d: any) => d._zoneRadius || 150)),
        update => update.transition(t)
          .attr("r", (d: any) => d._zoneRadius || 150)
          .attr("fill-opacity", (d: any) => {
            if (companyMode === 'MINIMAL') return 0;
            if (d._focusDistance === 2) return 0;
            return 0.15;
          })
          .attr("stroke", (d: any) => d._focusDistance === 2 ? CATEGORY_COLORS[d.category] : "none")
          .attr("stroke-opacity", (d: any) => d._focusDistance === 2 ? 0.08 : 0),
        exit => exit.transition(t).attr("r", 0).remove()
      );

    // 2. Company Labels
    const companyLabels = rootGroup.select(".layer-company-labels")
      .selectAll("g")
      .data(companyNodesData, (d: any) => d.id)
      .join(
        enter => {
          const g = enter.append("g")
            .attr("cursor", "pointer")
            .style("filter", "drop-shadow(0px 4px 6px rgba(0,0,0,0.5))")
            .style("opacity", 0);

          g.append("rect")
            .attr("rx", 16).attr("ry", 16)
            .attr("width", d => getLabelDimensions(d.label, d.category).width)
            .attr("height", d => getLabelDimensions(d.label, d.category).height)
            .attr("x", d => -getLabelDimensions(d.label, d.category).width / 2)
            .attr("y", d => -getLabelDimensions(d.label, d.category).height / 2)
            .attr("fill", d => CATEGORY_COLORS[d.category]);

          g.append("text")
            .attr("class", "label-main")
            .text(d => d.label)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-family", "Inter, sans-serif").style("font-size", "14px")
            .style("font-weight", "800").style("fill", "#ffffff")
            .style("pointer-events", "none");

          g.append("text")
            .attr("class", "label-year")
            .text(d => getSubLabel(d))
            .attr("text-anchor", "middle")
            .attr("dy", d => `${(getLabelDimensions(d.label, d.category).height / 2) + 14}px`)
            .style("font-family", "Inter, sans-serif").style("font-size", "11px")
            .style("font-weight", "500").style("fill", "#cbd5e1")
            .style("text-shadow", "0px 1px 2px #000000")
            .style("pointer-events", "none");

          // Apply opacity based on focus distance (0=focused, 1=1st degree, 2=2nd degree)
          const getNodeOpacity = (d: NodeData) => {
            if (d._focusDistance === undefined) return 1;
            if (d._focusDistance === 0) return 1;      // Focused node
            if (d._focusDistance === 1) return 1;      // 1st degree
            return 0.15;                               // 2nd degree (very faint)
          };

          g.transition(t).style("opacity", (d: NodeData) => getNodeOpacity(d));

          g.on("click", (event, d) => { event.stopPropagation(); handleNodeClick(d); })
            .on("dblclick", (event, d) => { event.stopPropagation(); handleNodeDoubleClick(d); })
            .on("touchstart", (event, d) => { event.stopPropagation(); handleTouchStart(event, d); })
            .on("touchend", (event) => { event.stopPropagation(); handleTouchEnd(event); })
            .on("touchcancel", (event) => { event.stopPropagation(); handleTouchEnd(event); })
            .on("mouseenter", (event, d) => {
              // Disable tooltip on touch devices (모바일에서는 tooltip 비활성화)
              if (window.matchMedia('(pointer: coarse)').matches) return;

              // Calculate Hashtags
              const relatedLinks = data.links.filter(l => {
                const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
                const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
                return s === d.id || t === d.id;
              });
              const hashtags = relatedLinks.map(l => {
                const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                const targetId = sId === d.id ? tId : sId;
                const targetNode = data.nodes.find(n => n.id === targetId);
                return targetNode ? { id: targetId, label: targetNode.label } : null;
              }).filter(Boolean) as { id: string, label: string }[];

              setTooltip({
                x: event.clientX,
                y: event.clientY,
                label: d.label,
                category: d.category,
                description: d.description,
                // Assign roles based on node category
                companyRole: d.category === Category.COMPANY ? d.companyCategories?.[0] : undefined,
                personRole: d.category === Category.PERSON ? (d.impactRole as string) : undefined,
                techRole: d.category === Category.TECHNOLOGY ? (d.impactRole as string) : undefined,
                techCategoryL1: d.techCategoryL1,
                techCategoryL2: d.techCategoryL2,
                hashtags: hashtags
              });
            })
            .on("mousemove", (event) => setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null))
            .on("mouseleave", () => setTooltip(null));

          return g;
        },
        update => {
          // Get opacity function for update case
          const getNodeOpacity = (d: NodeData) => {
            if (d._focusDistance === undefined) return 1;
            if (d._focusDistance === 0) return 1;
            if (d._focusDistance === 1) return 1;
            return 0.15;
          };
          const g = update.transition(t).style("opacity", (d: NodeData) => getNodeOpacity(d));
          return g;
        },
        exit => exit.transition(t).style("opacity", 0).remove()
      );

    // Helper to get link opacity based on connected nodes' focus distance
    const getLinkOpacity = (d: any) => {
      const sourceNode = visibleNodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
      const targetNode = visibleNodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target));
      const sourceDist = sourceNode?._focusDistance;
      const targetDist = targetNode?._focusDistance;

      // In Focus Mode: Only links directly connected to focus node (distance 0) should be fully visible
      // If neither node is the focus node (distance 0), dim the link
      if (sourceDist !== undefined && targetDist !== undefined) {
        // Both nodes are 2nd degree -> very dim
        if (sourceDist === 2 && targetDist === 2) return getLinkStyle(d.type).opacity * 0.08;
        // Neither node is the focus node (0) -> this is a "secondary" link (e.g., 1st-to-1st)
        if (sourceDist !== 0 && targetDist !== 0) return getLinkStyle(d.type).opacity * 0.12;
      }
      return getLinkStyle(d.type).opacity;
    };

    // Helper to check if link should be dimmed (not directly connected to focus node)
    const isSecondaryLink = (d: any): boolean => {
      const sourceNode = visibleNodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
      const targetNode = visibleNodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target));
      const sourceDist = sourceNode?._focusDistance;
      const targetDist = targetNode?._focusDistance;
      // If neither node is the focus node (distance 0), it's a secondary link
      if (sourceDist !== undefined && targetDist !== undefined) {
        return sourceDist !== 0 && targetDist !== 0;
      }
      return false;
    };

    // 3. Links
    const linksSel = rootGroup.select(".layer-links")
      .selectAll("line")
      .data(visibleLinks, (d: any) => `${d.source.id}-${d.target.id}`)
      .join("line")
      .attr("stroke", d => getLinkStyle(d.type).color)
      .attr("stroke-opacity", d => getLinkOpacity(d))
      .attr("stroke-width", d => getLinkStyle(d.type).width)
      // FIX: FORCE SOLID LINE
      .attr("stroke-dasharray", d => getLinkStyle(d.type).dasharray === "none" ? null : getLinkStyle(d.type).dasharray)
      .attr("stroke-linecap", "butt")
      .attr("marker-end", d => {
        // Hide arrows for 2nd-degree links
        if (isSecondaryLink(d)) return null;
        // Show arrow at end for SINGLE or DOUBLE
        if (d.arrow === ArrowHead.SINGLE || d.arrow === ArrowHead.DOUBLE) {
          return `url(#arrow-${d.type.toLowerCase()})`;
        }
        return null;
      })
      .attr("marker-start", d => {
        // Hide arrows for 2nd-degree links
        if (isSecondaryLink(d)) return null;
        // Show arrow at start for DOUBLE only
        if (d.arrow === ArrowHead.DOUBLE) {
          return `url(#arrow-${d.type.toLowerCase()}-reverse)`;
        }
        return null;
      });

    // 3.1 Link Icons (NEW)
    const getIconSymbolId = (icon: LinkIcon | undefined): string | null => {
      switch (icon) {
        case LinkIcon.HEART: return "icon-heart";
        case LinkIcon.RIVALRY: return "icon-rivalry";
        case LinkIcon.POWERS: return "icon-powers";
        case LinkIcon.SPARK: return "icon-spark";
        default: return null;
      }
    };

    // 3.1 Link Icons - Only show ENGAGES icons (Partner/Rival)
    // Note: POWERS and CONTRIBUTES icons are disabled but function is preserved for future use
    const linksWithIcons = visibleLinks.filter(l =>
      l.icon && l.icon !== LinkIcon.NONE && l.type === LinkType.ENGAGES
    );
    const iconsSel = rootGroup.select(".layer-link-icons")
      .selectAll("use")
      .data(linksWithIcons, (d: any) => `icon-${d.source.id}-${d.target.id}`)
      .join(
        enter => enter.append("use")
          .attr("width", 24)
          .attr("height", 24)
          .attr("href", d => `#${getIconSymbolId(d.icon)}`)
          .style("pointer-events", "none")
          .style("opacity", 0)
          .call(enter => enter.transition(t).style("opacity", (d: any) => isSecondaryLink(d) ? 0.25 : 0.9)),
        update => update
          .attr("href", d => `#${getIconSymbolId(d.icon)}`)
          .call(update => update.transition(t).style("opacity", (d: any) => isSecondaryLink(d) ? 0.25 : 0.9)),
        exit => exit.transition(t).style("opacity", 0).remove()
      );

    // 4. Other Nodes
    const otherNodesData = visibleNodes.filter(d => d.category !== Category.COMPANY);
    const nodesSel = rootGroup.select(".layer-nodes")
      .selectAll("circle")
      .data(otherNodesData, (d: any) => d.id)
      .join(
        enter => enter.append("circle")
          .attr("r", 0)
          .attr("fill", d => CATEGORY_COLORS[d.category])
          .attr("fill-opacity", (d: any) => d._focusDistance === 2 ? 0.15 : 1)
          .attr("stroke", "none")
          .attr("cursor", "pointer")
          .call(enter => enter.transition(t).attr("r", (d: any) => d._radius || 10))
          .on("click", (event, d) => { event.stopPropagation(); handleNodeClick(d); })
          .on("dblclick", (event, d) => { event.stopPropagation(); handleNodeDoubleClick(d); })
          .on("touchstart", (event, d) => { event.stopPropagation(); handleTouchStart(event, d); })
          .on("touchend", (event) => { event.stopPropagation(); handleTouchEnd(event); })
          .on("touchcancel", (event) => { event.stopPropagation(); handleTouchEnd(event); })
          .on("mouseenter", (event, d) => {
            // Disable tooltip on touch devices (모바일에서는 tooltip 비활성화)
            if (window.matchMedia('(pointer: coarse)').matches) return;

            // Calculate Hashtags
            const relatedLinks = data.links.filter(l => {
              const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
              const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
              return s === d.id || t === d.id;
            });
            const hashtags = relatedLinks.map(l => {
              const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
              const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
              const targetId = sId === d.id ? tId : sId;
              const targetNode = data.nodes.find(n => n.id === targetId);
              return targetNode ? { id: targetId, label: targetNode.label } : null;
            }).filter(Boolean) as { id: string, label: string }[];

            setTooltip({
              x: event.clientX,
              y: event.clientY,
              label: d.label,
              category: d.category,
              description: d.description,
              // Assign roles based on node category
              companyRole: d.category === Category.COMPANY ? d.companyCategories?.[0] : undefined,
              personRole: d.category === Category.PERSON ? (d.impactRole as string) : undefined,
              techRole: d.category === Category.TECHNOLOGY ? (d.impactRole as string) : undefined,
              techCategoryL1: d.techCategoryL1,
              techCategoryL2: d.techCategoryL2,
              hashtags: hashtags
            });
          })
          .on("mousemove", (event) => setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null))
          .on("mouseleave", () => setTooltip(null)),
        update => update.transition(t)
          .attr("r", (d: any) => d._radius || 10)
          .attr("fill-opacity", (d: any) => d._focusDistance === 2 ? 0.15 : 1),
        exit => exit.transition(t).attr("r", 0).remove()
      );

    // 5. Labels
    const labelsSel = rootGroup.select(".layer-labels")
      .selectAll("text")
      .data(otherNodesData, (d: any) => d.id)
      .join(
        enter => {
          const text = enter.append("text")
            .attr("x", (d: any) => (d._radius || 10) + 12)
            .attr("y", 0)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .style("font-family", "Inter, sans-serif")
            .style("pointer-events", "none")
            .style("text-shadow", "0px 1px 3px #0f172a")
            .style("opacity", 0);

          text.append("tspan")
            .text((d: any) => d.label)
            .style("font-size", "12px")
            .style("font-weight", "600")
            .style("fill", (d: any) => CATEGORY_COLORS[d.category]);

          text.append("tspan")
            .text((d: any) => {
              const subLabel = getSubLabel(d);
              return subLabel ? subLabel : "";
            })
            .attr("x", (d: any) => (d._radius || 10) + 12)
            .attr("dy", "1.2em")
            .style("font-size", "10px")
            .style("font-weight", "400")
            .style("fill", "#94a3b8");

          return text.call(enter => enter.transition(t).style("opacity", (d: any) => d._focusDistance === 2 ? 0.5 : 1));
        },
        update => {
          const text = update.transition(t).style("opacity", (d: any) => d._focusDistance === 2 ? 0.5 : 1);
          text.attr("x", (d: any) => (d._radius || 10) + 12);
          text.selectAll("tspan").attr("x", (d: any) => (d._radius || 10) + 12);
          return text;
        },
        exit => exit.transition(t).style("opacity", 0).remove()
      );

    // CALCULATION LOGIC
    const calculatePoint = (node: NodeData, otherNode: NodeData) => {
      if (node.category === Category.COMPANY) {
        const dims = getLabelDimensions(node.label, node.category);
        return getRectIntersection(node.x!, node.y!, otherNode.x!, otherNode.y!, dims.width, dims.height);
      } else {
        // FIX: Exact Radius Intersection
        return getCircleIntersection(node.x!, node.y!, otherNode.x!, otherNode.y!, node._radius || 10);
      }
    };

    simulation.on("tick", () => {
      rootGroup.select(".layer-company-zone").selectAll("circle")
        .attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      companyLabels.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      linksSel.each(function (d: any) {
        const p1 = calculatePoint(d.source, d.target);
        const p2 = calculatePoint(d.target, d.source);

        d3.select(this)
          .attr("x1", p1.x)
          .attr("y1", p1.y)
          .attr("x2", p2.x)
          .attr("y2", p2.y);
      });

      // Update icon positions at link midpoints
      iconsSel.each(function (d: any) {
        const p1 = calculatePoint(d.source, d.target);
        const p2 = calculatePoint(d.target, d.source);
        const midX = (p1.x + p2.x) / 2 - 12; // offset by half icon width
        const midY = (p1.y + p2.y) / 2 - 12; // offset by half icon height
        d3.select(this)
          .attr("x", midX)
          .attr("y", midY);
      });

      nodesSel.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      labelsSel.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [data, width, height, focusNodeId, onNodeClick, onNodeDoubleClick, companyMode]);


  return (
    <div className="relative w-full h-full bg-background overflow-hidden border border-slate-700 rounded-xl shadow-2xl">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block"
        style={{
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      />

      {/* Search Overlay - hidden in Focus mode */}
      {!focusNodeId && (
        <div className="absolute top-4 left-4 z-20 w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg leading-5 bg-slate-900/90 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm backdrop-blur-md shadow-xl transition-all"
              placeholder={t('mapView.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {/* Suggestions Dropdown */}
            {isSearchFocused && suggestions.length > 0 && (
              <div className="absolute mt-1 w-full bg-slate-900/95 border border-slate-600 rounded-md shadow-2xl backdrop-blur-md overflow-hidden">
                <ul className="max-h-60 overflow-auto custom-scrollbar">
                  {suggestions.map((node, index) => (
                    <li
                      key={node.id}
                      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-300 transition-colors border-b border-slate-800/50 last:border-0 ${index === selectedSuggestionIndex ? 'bg-slate-700' : 'hover:bg-slate-800'
                        }`}
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

          {/* Mobile Featured Node - REMOVED */}
        </div>
      )}

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-4 py-3 bg-slate-900/95 border border-slate-600 rounded-lg shadow-2xl backdrop-blur-md flex flex-col gap-1 transform -translate-x-1/2 -translate-y-full -mt-4 max-w-xs"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: CATEGORY_COLORS[tooltip.category], color: CATEGORY_COLORS[tooltip.category] }}></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(`categories.${tooltip.category.toLowerCase()}`) || tooltip.category}</span>
          </div>
          <span className="text-sm font-bold text-white leading-tight">{tooltip.label}</span>

          {/* Categories - Always show for all node types */}
          <div className="flex flex-wrap gap-1 mt-1 mb-1">
            {tooltip.companyRole && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {t(`companyCategories.${tooltip.companyRole}`) || tooltip.companyRole.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            )}
            {tooltip.personRole && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-800/50">
                {t(`personRoles.${tooltip.personRole}`) || tooltip.personRole}
              </span>
            )}
            {tooltip.techRole && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-300 border border-green-800/50">
                {t(`techRoles.${tooltip.techRole}`) || tooltip.techRole}
              </span>
            )}
            {tooltip.techCategoryL1 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800/50">
                {t(`techCategoryL1.${tooltip.techCategoryL1}`) || tooltip.techCategoryL1}
              </span>
            )}
            {tooltip.techCategoryL2 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-800/50">
                {t(`techCategoryL2.${tooltip.techCategoryL2}`) || tooltip.techCategoryL2}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-snug border-t border-slate-700 pt-2 opacity-90">
            {tooltip.description}
          </p>

          {/* Connection Count - Right aligned, no top border */}
          {tooltip.hashtags && tooltip.hashtags.length > 0 && (
            <div className="flex justify-end mt-1">
              <span className="text-[9px] text-slate-500">
                🔗 {tooltip.hashtags.length} connection{tooltip.hashtags.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Zoom UI (Same as before) */}
      <div className="absolute bottom-6 right-6 z-10 hidden md:flex flex-col items-center gap-3 p-3 bg-surface/90 border border-slate-600 rounded-xl shadow-2xl backdrop-blur-md">
        <button onClick={() => zoomToLevel(Math.min(zoomLevel + 1, 5))} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </button>
        <div className="h-32 w-8 relative flex items-center justify-center py-2">
          <input type="range" min="1" max="5" step="1" value={zoomLevel} onChange={(e) => zoomToLevel(parseInt(e.target.value))} className="absolute w-32 h-8 origin-center -rotate-90 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:-mt-[6px] [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-slate-600 [&::-webkit-slider-runnable-track]:rounded-full" />
        </div>
        <button onClick={() => zoomToLevel(Math.max(zoomLevel - 1, 1))} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
        </button>
      </div>

      <div className="absolute bottom-16 right-4 z-10 flex md:hidden flex-col items-center gap-2 bg-surface/90 backdrop-blur rounded-lg border border-slate-600 shadow-lg p-2">
        <button onClick={() => zoomToLevel(Math.min(zoomLevel + 1, 5))} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </button>
        <div className="h-24 w-8 relative flex items-center justify-center py-2">
          <input type="range" min="1" max="5" step="1" value={zoomLevel} onChange={(e) => zoomToLevel(parseInt(e.target.value))} className="absolute w-24 h-8 origin-center -rotate-90 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:-mt-[6px] [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-slate-600 [&::-webkit-slider-runnable-track]:rounded-full" />
        </div>
        <button onClick={() => zoomToLevel(Math.max(zoomLevel - 1, 1))} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default MapView;