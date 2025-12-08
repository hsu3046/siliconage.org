import { GraphData, NodeData, LinkData, Category, LinkType } from '../../types';

export interface CategoryStats {
  category: Category;
  count: number;
  percentage: number;
}

export interface RoleStats {
  role: string;
  count: number;
  category: Category;
}

export interface YearStats {
  decade: string;
  yearRange: string;
  count: number;
  companies: number;
  people: number;
  technologies: number;
}

export interface LinkTypeStats {
  type: LinkType;
  count: number;
  percentage: number;
}

export interface ConnectionStats {
  nodeId: string;
  label: string;
  category: Category;
  totalConnections: number;
  incoming: number;
  outgoing: number;
}

export interface OverallStats {
  totalNodes: number;
  totalLinks: number;
  avgConnectionsPerNode: number;
  dateRange: {
    earliest: number;
    latest: number;
    span: number;
  };
  categoryStats: CategoryStats[];
  linkTypeStats: LinkTypeStats[];
}

/**
 * Calculate category distribution
 */
export function calculateCategoryDistribution(nodes: NodeData[]): CategoryStats[] {
  const counts = new Map<Category, number>();

  nodes.forEach(node => {
    counts.set(node.category, (counts.get(node.category) || 0) + 1);
  });

  const total = nodes.length;
  const stats: CategoryStats[] = [];

  counts.forEach((count, category) => {
    stats.push({
      category,
      count,
      percentage: Math.round((count / total) * 100)
    });
  });

  return stats.sort((a, b) => b.count - a.count);
}

/**
 * Calculate role distribution by category
 */
export function calculateRoleDistribution(nodes: NodeData[]): RoleStats[] {
  const stats: RoleStats[] = [];
  const roleCounts = new Map<string, { count: number; category: Category }>();

  nodes.forEach(node => {
    let role: string | undefined;

    if (node.category === Category.COMPANY && node.companyCategories?.[0]) {
      role = node.companyCategories[0];
    } else if (node.category === Category.PERSON && node.primaryRole) {
      role = node.primaryRole;
    } else if (node.category === Category.TECHNOLOGY && node.impactRole) {
      role = node.impactRole;
    }

    if (role) {
      const existing = roleCounts.get(role);
      if (existing) {
        existing.count++;
      } else {
        roleCounts.set(role, { count: 1, category: node.category });
      }
    }
  });

  roleCounts.forEach((value, role) => {
    stats.push({
      role,
      count: value.count,
      category: value.category
    });
  });

  return stats.sort((a, b) => b.count - a.count);
}

/**
 * Calculate timeline distribution by decade
 */
export function calculateTimelineDistribution(nodes: NodeData[]): YearStats[] {
  const decades = new Map<number, { companies: number; people: number; technologies: number }>();

  nodes.forEach(node => {
    if (!node.year) return;

    const decade = Math.floor(node.year / 10) * 10;
    const stats = decades.get(decade) || { companies: 0, people: 0, technologies: 0 };

    if (node.category === Category.COMPANY) stats.companies++;
    else if (node.category === Category.PERSON) stats.people++;
    else if (node.category === Category.TECHNOLOGY) stats.technologies++;

    decades.set(decade, stats);
  });

  const result: YearStats[] = [];

  decades.forEach((stats, decade) => {
    const total = stats.companies + stats.people + stats.technologies;
    result.push({
      decade: `${decade}s`,
      yearRange: `${decade}-${decade + 9}`,
      count: total,
      companies: stats.companies,
      people: stats.people,
      technologies: stats.technologies
    });
  });

  return result.sort((a, b) => parseInt(a.decade) - parseInt(b.decade));
}

/**
 * Calculate link type distribution
 */
export function calculateLinkTypeDistribution(links: LinkData[]): LinkTypeStats[] {
  const counts = new Map<LinkType, number>();

  links.forEach(link => {
    counts.set(link.type, (counts.get(link.type) || 0) + 1);
  });

  const total = links.length;
  const stats: LinkTypeStats[] = [];

  counts.forEach((count, type) => {
    stats.push({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    });
  });

  return stats.sort((a, b) => b.count - a.count);
}

/**
 * Get top connected nodes
 */
export function getTopConnectedNodes(data: GraphData, limit: number = 10): ConnectionStats[] {
  const connectionCounts = new Map<string, { incoming: number; outgoing: number }>();

  // Initialize
  data.nodes.forEach(node => {
    connectionCounts.set(node.id, { incoming: 0, outgoing: 0 });
  });

  // Count connections
  data.links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;

    const sourceStats = connectionCounts.get(sourceId);
    const targetStats = connectionCounts.get(targetId);

    if (sourceStats) sourceStats.outgoing++;
    if (targetStats) targetStats.incoming++;
  });

  // Build stats
  const stats: ConnectionStats[] = [];

  data.nodes.forEach(node => {
    const counts = connectionCounts.get(node.id);
    if (counts) {
      stats.push({
        nodeId: node.id,
        label: node.label,
        category: node.category,
        totalConnections: counts.incoming + counts.outgoing,
        incoming: counts.incoming,
        outgoing: counts.outgoing
      });
    }
  });

  // Sort by total connections and limit
  return stats.sort((a, b) => b.totalConnections - a.totalConnections).slice(0, limit);
}

/**
 * Get least connected nodes (potential orphans)
 */
export function getLeastConnectedNodes(data: GraphData, limit: number = 10): ConnectionStats[] {
  const all = getTopConnectedNodes(data, data.nodes.length);
  return all.sort((a, b) => a.totalConnections - b.totalConnections).slice(0, limit);
}

/**
 * Calculate overall statistics
 */
export function calculateOverallStats(data: GraphData): OverallStats {
  const totalNodes = data.nodes.length;
  const totalLinks = data.links.length;

  // Calculate average connections
  const connectionCounts = getTopConnectedNodes(data, data.nodes.length);
  const totalConnections = connectionCounts.reduce((sum, stat) => sum + stat.totalConnections, 0);
  const avgConnectionsPerNode = totalNodes > 0 ? Math.round((totalConnections / totalNodes) * 10) / 10 : 0;

  // Calculate date range
  const years = data.nodes.map(n => n.year).filter(y => y !== undefined) as number[];
  const earliest = years.length > 0 ? Math.min(...years) : 0;
  const latest = years.length > 0 ? Math.max(...years) : 0;

  return {
    totalNodes,
    totalLinks,
    avgConnectionsPerNode,
    dateRange: {
      earliest,
      latest,
      span: latest - earliest
    },
    categoryStats: calculateCategoryDistribution(data.nodes),
    linkTypeStats: calculateLinkTypeDistribution(data.links)
  };
}

/**
 * Find coverage gaps (time periods with few nodes)
 */
export function findCoverageGaps(nodes: NodeData[], threshold: number = 3): YearStats[] {
  const timeline = calculateTimelineDistribution(nodes);
  return timeline.filter(stat => stat.count < threshold);
}

/**
 * Get category breakdown by year
 */
export function getCategoryBreakdownByYear(nodes: NodeData[]): Array<{
  year: number;
  COMPANY: number;
  PERSON: number;
  TECHNOLOGY: number;
}> {
  const yearMap = new Map<number, { COMPANY: number; PERSON: number; TECHNOLOGY: number }>();

  nodes.forEach(node => {
    if (!node.year) return;

    const stats = yearMap.get(node.year) || { COMPANY: 0, PERSON: 0, TECHNOLOGY: 0 };
    stats[node.category]++;
    yearMap.set(node.year, stats);
  });

  const result: Array<{ year: number; COMPANY: number; PERSON: number; TECHNOLOGY: number }> = [];

  yearMap.forEach((stats, year) => {
    result.push({ year, ...stats });
  });

  return result.sort((a, b) => a.year - b.year);
}
