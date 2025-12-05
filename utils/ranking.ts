
import { NodeData, LinkData, Category, LinkType, CompanyRole, PersonRole, TechRole, EpisodeRole } from '../types';

// Configuration
const BASE_MASS: Record<number, number> = { 1: 20, 2: 10, 3: 5 }; // Reduced base mass to emphasize flow

// Multipliers based on Role (The "Nerf" and "Buff" logic)
const ROLE_MULTIPLIERS: Record<string, number> = {
  // Company Roles
  [CompanyRole.PLATFORM]: 1.2, // Consumer impact
  [CompanyRole.LAB]: 1.1,      // Innovation source
  [CompanyRole.INFRA]: 0.85,   // Dampen supply chain
  [CompanyRole.SERVICE]: 0.8,

  // Person Roles
  [PersonRole.THEORIST]: 1.8,  // Buff inventors (Turing, Hinton, LeCun)
  [PersonRole.BUILDER]: 1.2,   // Buff engineers
  [PersonRole.VISIONARY]: 0.85, // Nerf founders (to prevent Larry Page #1)

  // Tech Roles - Prioritize foundational over products
  [TechRole.PRODUCT]: 0.9,     // Services/products get less credit
  [TechRole.CORE]: 1.15,       // Core tech boosted
  [TechRole.STANDARD]: 1.4,    // Foundational standards highest

  // Episode Roles
  [EpisodeRole.MILESTONE]: 1.5, // High impact events
  [EpisodeRole.DEAL]: 0.6,      // Money moves matter less
  [EpisodeRole.CRISIS]: 0.8,
};

/**
 * Impact Factor 3.0 Algorithm
 * 
 * Logic:
 * 1. Base Score: Assigned by Importance.
 * 2. Iterative Propagation: Scores flow through the network.
 * 3. Role-Based Modulation: 
 *    - Infra companies absorb less score from dependencies.
 *    - Theorists absorb more score from their creations.
 */
export const calculateSiliconRank = (nodes: NodeData[], links: LinkData[]) => {
  const nodeMap = new Map<string, NodeData>();
  const scores = new Map<string, number>();

  // 1. Initialize with Base Mass
  nodes.forEach(n => {
    nodeMap.set(n.id, n);
    scores.set(n.id, BASE_MASS[n.importance || 3]);
  });

  // 2. Iterative Propagation (3 Passes)
  const iterations = 3;

  for (let i = 0; i < iterations; i++) {
    const nextScores = new Map(scores);

    links.forEach(link => {
      const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;

      const sNode = nodeMap.get(sId);
      const tNode = nodeMap.get(tId);

      if (!sNode || !tNode) return;

      const sScore = scores.get(sId) || 0;
      const tScore = scores.get(tId) || 0;

      // Flow Logic with Role Multipliers

      // A. BASED_ON: User(S) -> Supplier(T)
      // High impact path, but dampened for INFRA roles to prevent ASML/TSMC blowing up
      if (link.type === LinkType.BASED_ON) {
        const multiplier = ROLE_MULTIPLIERS[tNode.impactRole] || 1.0;
        // Reduced base weight from 0.4 to 0.3
        nextScores.set(tId, (nextScores.get(tId) || 0) + (sScore * 0.3 * multiplier));
      }

      // B. PART_OF: Member(S) -> Group(T)
      // Standard flow
      else if (link.type === LinkType.PART_OF) {
        const multiplier = ROLE_MULTIPLIERS[tNode.impactRole] || 1.0;
        nextScores.set(tId, (nextScores.get(tId) || 0) + (sScore * 0.2 * multiplier));
      }

      // C. CREATED: Maker(S) -> Product(T) (Reverse Flow)
      // Creation validates the creator. High boost for THEORISTS.
      else if (link.type === LinkType.CREATED) {
        const multiplier = ROLE_MULTIPLIERS[sNode.impactRole] || 1.0;
        // Increased base weight from 0.5 to 0.7 to boost inventors
        nextScores.set(sId, (nextScores.get(sId) || 0) + (tScore * 0.7 * multiplier));
      }

      // D. TRIGGERED: Cause(S) -> Effect(T) (Reverse Flow)
      else if (link.type === LinkType.TRIGGERED) {
        const multiplier = ROLE_MULTIPLIERS[sNode.impactRole] || 1.0;
        nextScores.set(sId, (nextScores.get(sId) || 0) + (tScore * 0.3 * multiplier));
      }
    });

    // Update scores for next pass
    nextScores.forEach((val, key) => scores.set(key, val));
  }

  // 3. Assign Final Scores & Visual Radii
  nodes.forEach(n => {
    const score = scores.get(n.id) || 10;
    n._score = score;

    // Visual Scaling
    let radius = Math.sqrt(score) * 2.2;

    // Min/Max Clamping
    if (n.category === Category.COMPANY) radius = Math.max(radius, 35);
    else radius = Math.max(radius, 8);

    n._radius = radius;
  });

  // 4. Calculate Company Zone Radius
  nodes.filter(n => n.category === Category.COMPANY).forEach(comp => {
    let totalChildScore = 0;

    links.forEach(link => {
      const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;

      if (sId === comp.id && link.type === LinkType.CREATED) {
        totalChildScore += (scores.get(tId) || 0);
      }
      if (tId === comp.id && link.type === LinkType.PART_OF) {
        totalChildScore += (scores.get(sId) || 0);
      }
    });

    // Zone calculation
    comp._zoneRadius = 110 + (Math.sqrt(totalChildScore) * 5.5);
  });
};
