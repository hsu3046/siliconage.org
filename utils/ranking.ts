
import { Category, LinkData, LinkType, NodeData, TechRole } from '../types';

/**
 * Assign Visual Radii to Nodes
 * 
 * Logic:
 * - Technology: Fixed sizes based on TechRole (L0, L1, L2, L3)
 * - Company: Fixed radius + zone radius for clustering
 * - Person/Episode: Minimum radius
 */
export const calculateSiliconRank = (nodes: NodeData[], links: LinkData[]) => {
  // 1. Assign Visual Radii
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
      // People / Episodes
      radius = 10;
    }

    n._radius = radius;
  });

  // 2. Assign Company Zone Radius (Fixed)
  nodes.filter(n => n.category === Category.COMPANY).forEach(comp => {
    comp._zoneRadius = 150;
  });
};
