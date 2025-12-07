
import { Category, LinkData, LinkType, NodeData, TechRole } from '../types';

// === ZONE RADIUS CALCULATION WEIGHTS ===

// LinkType Weights: How important is each connection type?
const LINK_TYPE_WEIGHTS: Record<LinkType, number> = {
  [LinkType.CREATES]: 10,     // Company created this tech = highest
  [LinkType.POWERS]: 8,       // Tech powers/enables the company
  [LinkType.CONTRIBUTES]: 3,  // Influence/contribution
  [LinkType.ENGAGES]: 1,      // Partnership/rivalry
};

// Category Multipliers: Weight by what category is connected
const CATEGORY_MULTIPLIERS: Record<Category, number> = {
  [Category.TECHNOLOGY]: 1.0,  // Full weight for tech
  [Category.COMPANY]: 0.3,     // Subsidiaries/partners get less
  [Category.PERSON]: 0.1,      // People get minimal weight
};

// TechRole Bonuses: Extra points for foundational tech
const TECH_ROLE_BONUS: Record<string, number> = {
  [TechRole.L0_THEORY_PHYSICS]: 5,   // Foundation (Transistor, Transformer)
  [TechRole.L1_CORE_HARDWARE]: 3,    // Core (GPU, CPU)
  [TechRole.L2_RUNTIME_PLATFORM]: 1, // Platform (iOS, Android)
  [TechRole.L3_END_APPLICATION]: 0,  // Application (iPhone, ChatGPT)
};

// Zone Radius Constants
const BASE_ZONE_RADIUS = 80;
const ZONE_SCALE_FACTOR = 3;
const MAX_ZONE_RADIUS = 250;
const MIN_ZONE_RADIUS = 80;

/**
 * Assign Visual Radii to Nodes
 * 
 * Logic:
 * - Technology: Fixed sizes based on TechRole (L0, L1, L2, L3)
 * - Company: Fixed radius + dynamic zone radius based on connections
 * - Person: Minimum radius
 */
export const calculateSiliconRank = (nodes: NodeData[], links: LinkData[]) => {
  // Create a map for quick node lookup
  const nodeMap = new Map<string, NodeData>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // 1. Assign Visual Radii (for node circles)
  nodes.forEach(n => {
    let radius: number;

    if (n.category === Category.TECHNOLOGY) {
      // Tech Role Fixed Sizes
      switch (n.impactRole) {
        case TechRole.L0_THEORY_PHYSICS: radius = 50; break;
        case TechRole.L1_CORE_HARDWARE: radius = 35; break;
        case TechRole.L2_RUNTIME_PLATFORM: radius = 25; break;
        case TechRole.L3_END_APPLICATION: radius = 15; break;
        default: radius = 15;
      }
    } else if (n.category === Category.COMPANY) {
      radius = 35;
    } else {
      // People: Minimum radius
      radius = 10;
    }

    n._radius = radius;
  });

  // 2. Calculate Dynamic Company Zone Radius
  nodes.filter(n => n.category === Category.COMPANY).forEach(company => {
    let totalScore = 0;

    // Find all links connected to this company
    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

      // Check if this link involves the company
      let connectedNode: NodeData | undefined;
      let isOutbound = false;

      if (sourceId === company.id) {
        connectedNode = nodeMap.get(targetId);
        isOutbound = true;
      } else if (targetId === company.id) {
        connectedNode = nodeMap.get(sourceId);
        isOutbound = false;
      }

      if (!connectedNode) return;

      // 1. Get base weight from LinkType
      const linkWeight = LINK_TYPE_WEIGHTS[link.type] || 1;

      // 2. Apply category multiplier
      const categoryMultiplier = CATEGORY_MULTIPLIERS[connectedNode.category] || 0.1;

      // 3. Add TechRole bonus (only for tech nodes)
      let techBonus = 0;
      if (connectedNode.category === Category.TECHNOLOGY && connectedNode.impactRole) {
        techBonus = TECH_ROLE_BONUS[connectedNode.impactRole as string] || 0;
      }

      // Calculate score for this connection
      const connectionScore = (linkWeight * categoryMultiplier) + techBonus;
      totalScore += connectionScore;
    });

    // Convert score to zone radius
    const zoneRadius = BASE_ZONE_RADIUS + (totalScore * ZONE_SCALE_FACTOR);
    company._zoneRadius = Math.min(MAX_ZONE_RADIUS, Math.max(MIN_ZONE_RADIUS, zoneRadius));
  });
};
