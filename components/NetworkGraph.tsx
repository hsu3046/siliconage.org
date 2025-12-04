import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { GraphData, NodeData, LinkData, Category, LinkType, LinkDirection, CompanyMode } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface NetworkGraphProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
  onNodeFocus?: (node: NodeData) => void;
  onNodeDoubleClick: (node: NodeData) => void;
  width: number;
  height: number;
  focusNodeId?: string | null;
  scrollToNodeId?: string | null;
  companyMode: CompanyMode;
}

// Helper to formulate the Sub-Label (Role or Year) based on Category
const getSubLabel = (node: NodeData) => {
  if (node.category === Category.COMPANY) {
    return `${node.year} - Current`;
  }
  if (node.category === Category.PERSON) {
    return node.role || null;
  }
  if (node.category === Category.TECHNOLOGY || node.category === Category.EPISODE) {
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
    case LinkType.DEPENDENCY: // User -> Supplier (Weighted Lower for Infra)
      // Red/Orange, Thin, SOLID (Critical Path)
      return { dasharray: "none", width: 1.5, color: "#f97316", opacity: 1.0 };

    case LinkType.MAKER:      // Creator -> Creation (Weighted Higher for Product)
      // Cyan, Thin, Solid (Creative Output)
      return { dasharray: "0", width: 1.5, color: "#22d3ee", opacity: 0.8 };

    case LinkType.INFLUENCE:  // Cause -> Effect (Medium Weight)
      // Purple, Thin, Dotted (Abstract)
      return { dasharray: "2,4", width: 1.5, color: "#a78bfa", opacity: 0.6 };

    case LinkType.BELONGING:  // Member -> Group (Low Weight)
      // Slate, Thin, Solid (Structural)
      return { dasharray: "0", width: 1, color: "#64748b", opacity: 0.5 };

    default:
      return { dasharray: "0", width: 1, color: "#64748b", opacity: 0.5 };
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

const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, onNodeClick, onNodeFocus, onNodeDoubleClick, width, height, focusNodeId, scrollToNodeId, companyMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    companyCategories?: string[];
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
      const matches = data.nodes
        .filter(n => n.label.toLowerCase().includes(term.toLowerCase()))
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

    console.log('[Search] handleSearchSelect called for:', node.id, node.label);
    console.log('[Search] zoomBehaviorRef:', !!zoomBehaviorRef.current);
    console.log('[Search] zoomSelectionRef:', !!zoomSelectionRef.current);
    console.log('[Search] simulationRef:', !!simulationRef.current);
    console.log('[Search] simNodes count:', simulationRef.current?.nodes()?.length || 0);

    // Directly pan to node using internal zoom logic
    if (zoomBehaviorRef.current && zoomSelectionRef.current) {
      // Find node position from simulation (nodes have x/y after simulation runs)
      const simNodes = simulationRef.current?.nodes() || [];
      const simNode = simNodes.find(n => n.id === node.id);

      console.log('[Search] simNode found:', !!simNode, simNode?.x, simNode?.y);
      console.log('[Search] original node:', node.x, node.y);

      // Use simulation node position if available, otherwise use data node
      const targetNode = simNode || node;

      console.log('[Search] targetNode:', targetNode.id, targetNode.x, targetNode.y);

      if (targetNode.x !== undefined && targetNode.y !== undefined) {
        const svg = zoomSelectionRef.current;
        svg.interrupt();
        const currentTransform = d3.zoomTransform(svg.node()!);
        const scale = currentTransform.k;
        const tx = width / 2 - targetNode.x * scale;
        const ty = height / 2 - targetNode.y * scale;
        const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);
        console.log('[Search] Panning to:', tx, ty, 'scale:', scale);
        svg.transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .call(zoomBehaviorRef.current.transform, transform);
      } else {
        console.log('[Search] No x/y position found, cannot pan');
      }
    } else {
      console.log('[Search] Refs not ready');
    }
    // Note: We intentionally don't call onNodeFocus here to avoid double-pan interference
    // The direct pan above is sufficient for search navigation
  };


  const handleSearchFocus = () => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow click on suggestions
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
      { id: "arrow-dependency", color: "#f97316" }, // Orange
      { id: "arrow-maker", color: "#22d3ee" },      // Cyan
      { id: "arrow-influence", color: "#a78bfa" },  // Purple
      { id: "arrow-belonging", color: "#64748b" },  // Slate
    ];

    markerTypes.forEach(m => {
      // FORWARD MARKER (End of line)
      // refX=10 puts the TIP at the anchor point.
      defs.append("marker")
        .attr("id", m.id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
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
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M10,-5L0,0L10,5")
        .attr("fill", m.color);
    });

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
    rootGroup.append("g").attr("class", "layer-company-labels");
    rootGroup.append("g").attr("class", "layer-nodes");
    rootGroup.append("g").attr("class", "layer-labels");

    // Aspect Ratio Logic
    const aspectRatio = width / height;
    const isPortrait = aspectRatio < 1;

    // Portrait: Constrain Width (Strong X), Allow Height (Weak Y)
    // Landscape: Allow Width (Weak X), Constrain Height (Strong Y)
    const forceXStrength = isPortrait ? 0.05 : 0.01;
    const forceYStrength = isPortrait ? 0.01 : 0.05;

    // Simulation Setup
    const simulation = d3.forceSimulation<NodeData>()
      .velocityDecay(0.85) // High friction
      .alphaDecay(0.02)
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
        const transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(0.15); // Level 1 (most zoomed out)
        setZoomLevel(1);
        zoomLevelRef.current = 1;

        zoomSelectionRef.current.transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .call(zoomBehaviorRef.current.transform, transform);
      }
    }, 100);

    prevFocusNodeIdRef.current = focusNodeId || null;
    return () => clearTimeout(timer);
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
        // Fix: Pin to CENTER of screen, not (0,0)
        focusedNode.fx = width / 2;
        focusedNode.fy = height / 2;
      }
    } else {
      visibleNodes.forEach(n => { n.fx = null; n.fy = null; });
    }

    simulation.nodes(visibleNodes);

    // Update Forces
    const isFocusMode = visibleNodes.length < 50;

    simulation
      .force("link", d3.forceLink<NodeData, LinkData>(visibleLinks)
        .id((d: any) => d.id)
        .distance((d: any) => {
          // PLANETARY PHYSICS:
          // Maker/Belonging = Satellites (Close)
          // Dependency/Influence = Inter-planetary (Far)
          let dist = 150;
          if (d.type === LinkType.MAKER) dist = 60;      // Very close (Gravity)
          else if (d.type === LinkType.BELONGING) dist = 80;  // Close
          else if (d.type === LinkType.DEPENDENCY) dist = 250; // Far
          else if (d.type === LinkType.INFLUENCE) dist = 350;  // Very Far

          // In Focus Mode, tighten everything significantly
          return isFocusMode ? dist * 0.6 : dist;
        })
        .strength((d: any) => {
          if (d.type === LinkType.MAKER) return 2.0;      // Strongest pull
          if (d.type === LinkType.BELONGING) return 1.5;  // Strong pull
          if (d.type === LinkType.DEPENDENCY) return 0.2; // Weak pull
          if (d.type === LinkType.INFLUENCE) return 0.1;  // Very weak pull
          return 0.5;
        })
      )
      .force("charge", d3.forceManyBody()
        .strength((d: any) => {
          // Dynamic Repulsion based on Node Count
          if (isFocusMode) {
            // Focus Mode: Moderate repulsion to keep cluster tight but readable
            if (d.category === Category.COMPANY) return -500;
            return -150;
          }
          // Full Graph: Huge repulsion to clear space
          if (d.category === Category.COMPANY) return -4500;
          return -1000;
        })
        .distanceMax(isFocusMode ? 500 : 2000)
      )
      .force("collide", d3.forceCollide<NodeData>()
        .radius((d: any) => {
          // Prevent overlap, give Companies extra breathing room
          const base = (d._radius || 10); // Use _radius for visual size
          if (d.category === Category.COMPANY) return base + 100; // Huge buffer
          return base + 20;
        })
        .strength(0.9)
      )
      .force("center", d3.forceCenter(width / 2, height / 2).strength(isFocusMode ? 0.1 : 0.05))
      // Custom forces
      .force("company-separation", forceCompanySeparation(isFocusMode ? 0.1 : 1.0)) // Less separation in focus mode
      .force("weighted-gravity", forceWeightedGravity(visibleLinks, 0.3)) // Optional: keep or tune
      .velocityDecay(isFocusMode ? 0.5 : 0.6); // Tune friction

    simulation.alpha(0.3).restart();

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
          .attr("fill-opacity", companyMode === 'MINIMAL' ? 0 : 0.15)
          .attr("stroke", "none")
          .attr("pointer-events", "none")
          .call(enter => enter.transition(t).attr("r", (d: any) => d._zoneRadius || 150)),
        update => update.transition(t)
          .attr("r", (d: any) => d._zoneRadius || 150)
          .attr("fill-opacity", companyMode === 'MINIMAL' ? 0 : 0.15),
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

          g.transition(t).style("opacity", 1);

          g.on("click", (event, d) => { event.stopPropagation(); handleNodeClick(d); })
            .on("dblclick", (event, d) => { event.stopPropagation(); handleNodeDoubleClick(d); })
            .on("mouseenter", (event, d) => {
              if (window.matchMedia('(pointer: coarse)').matches) return; // Disable tooltip on touch devices

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
                score: d._score || 0,
                companyCategories: d.companyCategories,
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
          const g = update.transition(t).style("opacity", 1);
          return g;
        },
        exit => exit.transition(t).style("opacity", 0).remove()
      );

    // 3. Links
    const linksSel = rootGroup.select(".layer-links")
      .selectAll("line")
      .data(visibleLinks, (d: any) => `${d.source.id}-${d.target.id}`)
      .join("line")
      .attr("stroke", d => getLinkStyle(d.type).color)
      .attr("stroke-opacity", d => getLinkStyle(d.type).opacity)
      .attr("stroke-width", d => getLinkStyle(d.type).width)
      // FIX: FORCE SOLID LINE
      .attr("stroke-dasharray", d => getLinkStyle(d.type).dasharray === "none" ? null : getLinkStyle(d.type).dasharray)
      .attr("stroke-linecap", "butt")
      .attr("marker-end", d => {
        if (d.direction === LinkDirection.FORWARD) {
          const suffix = d.type.toLowerCase().split('_')[0];
          return `url(#arrow-${d.type.toLowerCase()})`;
        }
        return null;
      })
      .attr("marker-start", d => {
        if (d.direction === LinkDirection.REVERSE) {
          return `url(#arrow-${d.type.toLowerCase()}-reverse)`;
        }
        return null;
      });

    // 4. Other Nodes
    const otherNodesData = visibleNodes.filter(d => d.category !== Category.COMPANY);
    const nodesSel = rootGroup.select(".layer-nodes")
      .selectAll("circle")
      .data(otherNodesData, (d: any) => d.id)
      .join(
        enter => enter.append("circle")
          .attr("r", 0)
          .attr("fill", d => CATEGORY_COLORS[d.category])
          .attr("stroke", "#0f172a")
          .attr("stroke-width", 2)
          .attr("cursor", "pointer")
          .call(enter => enter.transition(t).attr("r", (d: any) => d._radius || 10))
          .on("click", (event, d) => { event.stopPropagation(); handleNodeClick(d); })
          .on("dblclick", (event, d) => { event.stopPropagation(); handleNodeDoubleClick(d); })
          .on("mouseenter", (event, d) => {
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
              score: d._score || 0,
              companyCategories: d.companyCategories,
              techCategoryL1: d.techCategoryL1,
              techCategoryL2: d.techCategoryL2,
              hashtags: hashtags
            });
          })
          .on("mousemove", (event) => setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null))
          .on("mouseleave", () => setTooltip(null)),
        update => update.transition(t).attr("r", (d: any) => d._radius || 10),
        exit => exit.transition(t).attr("r", 0).remove()
      );

    // 5. Labels
    const labelsSel = rootGroup.select(".layer-labels")
      .selectAll("text")
      .data(otherNodesData, (d: any) => d.id)
      .join(
        enter => {
          const text = enter.append("text")
            .attr("x", (d: any) => (d._radius || 10) + 6)
            .attr("y", 4)
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
            .attr("x", (d: any) => (d._radius || 10) + 6)
            .attr("dy", "1.2em")
            .style("font-size", "10px")
            .style("font-weight", "400")
            .style("fill", "#94a3b8");

          return text.call(enter => enter.transition(t).style("opacity", 1));
        },
        update => {
          const text = update.transition(t).style("opacity", 1);
          text.attr("x", (d: any) => (d._radius || 10) + 6);
          text.selectAll("tspan").attr("x", (d: any) => (d._radius || 10) + 6);
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

      nodesSel.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      labelsSel.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [data, width, height, focusNodeId, onNodeClick, onNodeDoubleClick, companyMode]);


  return (
    <div className="relative w-full h-full bg-background overflow-hidden border border-slate-700 rounded-xl shadow-2xl">
      <svg ref={svgRef} width={width} height={height} className="block" />

      {/* Search Overlay - hidden in Focus mode */}
      {!focusNodeId && (
        <div className="absolute top-4 left-4 z-20 w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg leading-5 bg-slate-900/90 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm backdrop-blur-md shadow-xl transition-all"
              placeholder="Search nodes..."
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
        </div>
      )}

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-4 py-3 bg-slate-900/95 border border-slate-600 rounded-lg shadow-2xl backdrop-blur-md flex flex-col gap-1 transform -translate-x-1/2 -translate-y-full -mt-4 max-w-xs"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: CATEGORY_COLORS[tooltip.category], color: CATEGORY_COLORS[tooltip.category] }}></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tooltip.category}</span>
          </div>
          <span className="text-sm font-bold text-white leading-tight">{tooltip.label}</span>

          {/* Categories */}
          {(tooltip.companyCategories || tooltip.techCategoryL1) && (
            <div className="flex flex-wrap gap-1 mt-1 mb-1">
              {tooltip.companyCategories?.map(cat => (
                <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {cat}
                </span>
              ))}
              {tooltip.techCategoryL1 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800/50">
                  {tooltip.techCategoryL1}
                </span>
              )}
              {tooltip.techCategoryL2 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-800/50">
                  {tooltip.techCategoryL2}
                </span>
              )}
            </div>
          )}
          <p className="text-xs text-slate-300 mt-1 leading-snug border-t border-slate-700 pt-2 opacity-90">
            {tooltip.description}
          </p>
          {/* UPDATED TOOLTIP: Simplified */}
          <div className="mt-2 flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span className="text-xs font-mono font-bold text-slate-300">
              {(data.nodes.find(n => n.id === tooltip.label || n.label === tooltip.label) || {} as any)._score?.toFixed(1) || '0.0'}
            </span>
          </div>



          {/* Hashtags */}
          {tooltip.hashtags && tooltip.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-700/50">
              {tooltip.hashtags.slice(0, 4).map((tag, idx) => (
                <span key={`${tag.id}-${idx}`} className="text-[9px] font-mono text-blue-400">
                  #{tag.label.replace(/\s+/g, '')}
                </span>
              ))}
              {tooltip.hashtags.length > 4 && (
                <span className="text-[9px] text-slate-500">+{tooltip.hashtags.length - 4}</span>
              )}
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

      <div className="absolute bottom-4 right-4 z-10 flex md:hidden flex-col items-center gap-2 bg-surface/90 backdrop-blur rounded-lg border border-slate-600 shadow-lg p-2">
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

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none opacity-50 text-xs text-slate-400 hidden sm:block">
        Scroll to Zoom • Double Click Node to Focus
      </div>
    </div>
  );
};

export default NetworkGraph;