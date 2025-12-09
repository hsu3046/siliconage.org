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

/**
 * =================================================================================
 * DATA QUALITY & BALANCE ANALYSIS
 * =================================================================================
 */

export interface EraBalanceStats {
  eraName: string;
  yearRange: string;
  totalNodes: number;
  companies: number;
  people: number;
  technologies: number;
  balance: 'excellent' | 'good' | 'fair' | 'poor';
  diversityScore: number; // 0-100
  issues: string[];
}

export interface CategoryBalanceAnalysis {
  overall: {
    mostCommon: Category;
    leastCommon: Category;
    balanceScore: number; // 0-100, 100 = perfectly balanced
    isBalanced: boolean;
  };
  byEra: EraBalanceStats[];
  recommendations: string[];
}

export interface LinkDensityAnalysis {
  averageLinks: number;
  companyAvg: number;
  personAvg: number;
  techAvg: number;
  linkTypeBalance: {
    type: LinkType;
    count: number;
    percentage: number;
    isBalanced: boolean;
  }[];
  hubNodes: ConnectionStats[]; // Nodes with unusually high connections
  isolatedNodes: ConnectionStats[]; // Nodes with very few connections
  recommendations: string[];
}

export interface TemporalCoverageAnalysis {
  coverageByDecade: {
    decade: string;
    coverage: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
    nodeCount: number;
    gapYears: number[]; // Years with no nodes
  }[];
  gaps: {
    startYear: number;
    endYear: number;
    yearsSpan: number;
  }[];
  recommendations: string[];
}

export interface DataQualityReport {
  categoryBalance: CategoryBalanceAnalysis;
  linkDensity: LinkDensityAnalysis;
  temporalCoverage: TemporalCoverageAnalysis;
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Calculate diversity score using Shannon entropy
 */
function calculateDiversityScore(counts: number[]): number {
  const total = counts.reduce((sum, c) => sum + c, 0);
  if (total === 0) return 0;

  const probabilities = counts.map(c => c / total);
  const entropy = -probabilities.reduce((sum, p) => {
    return p > 0 ? sum + p * Math.log2(p) : sum;
  }, 0);

  // Normalize to 0-100 (max entropy for 3 categories is log2(3) ≈ 1.585)
  const maxEntropy = Math.log2(counts.length);
  return Math.round((entropy / maxEntropy) * 100);
}

/**
 * Analyze category balance across eras
 */
export function analyzeCategoryBalance(data: GraphData): CategoryBalanceAnalysis {
  const { nodes } = data;

  // Overall distribution
  const categoryCount = {
    [Category.COMPANY]: 0,
    [Category.PERSON]: 0,
    [Category.TECHNOLOGY]: 0,
  };

  nodes.forEach(node => {
    categoryCount[node.category]++;
  });

  const counts = Object.values(categoryCount);
  const total = nodes.length;
  const balanceScore = calculateDiversityScore(counts);

  // Find most/least common
  const entries = Object.entries(categoryCount) as [Category, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const mostCommon = entries[0][0];
  const leastCommon = entries[entries.length - 1][0];

  // Era-based analysis (simplified - using decades)
  const decades = calculateTimelineDistribution(nodes);
  const byEra: EraBalanceStats[] = decades.map(decade => {
    const total = decade.companies + decade.people + decade.technologies;
    const diversityScore = calculateDiversityScore([decade.companies, decade.people, decade.technologies]);

    let balance: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    if (diversityScore >= 90) balance = 'excellent';
    else if (diversityScore >= 75) balance = 'good';
    else if (diversityScore >= 60) balance = 'fair';

    const issues: string[] = [];
    if (total < 5) issues.push('Low total coverage');
    if (decade.companies === 0) issues.push('No companies');
    if (decade.people === 0) issues.push('No people');
    if (decade.technologies === 0) issues.push('No technologies');

    return {
      eraName: decade.decade,
      yearRange: decade.yearRange,
      totalNodes: total,
      companies: decade.companies,
      people: decade.people,
      technologies: decade.technologies,
      balance,
      diversityScore,
      issues,
    };
  });

  // Recommendations
  const recommendations: string[] = [];
  if (balanceScore < 75) {
    recommendations.push(`Category balance could be improved (score: ${balanceScore}/100)`);
    recommendations.push(`Consider adding more ${leastCommon} nodes to balance the dataset`);
  }

  byEra.forEach(era => {
    if (era.issues.length > 0) {
      recommendations.push(`${era.eraName}: ${era.issues.join(', ')}`);
    }
  });

  return {
    overall: {
      mostCommon,
      leastCommon,
      balanceScore,
      isBalanced: balanceScore >= 75,
    },
    byEra,
    recommendations,
  };
}

/**
 * Analyze link density and distribution
 */
export function analyzeLinkDensity(data: GraphData): LinkDensityAnalysis {
  const connectionStats = getTopConnectedNodes(data, data.nodes.length);

  // Calculate averages by category
  const categoryStats = {
    [Category.COMPANY]: [] as number[],
    [Category.PERSON]: [] as number[],
    [Category.TECHNOLOGY]: [] as number[],
  };

  connectionStats.forEach(stat => {
    categoryStats[stat.category].push(stat.totalConnections);
  });

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;

  const companyAvg = Math.round(avg(categoryStats[Category.COMPANY]) * 10) / 10;
  const personAvg = Math.round(avg(categoryStats[Category.PERSON]) * 10) / 10;
  const techAvg = Math.round(avg(categoryStats[Category.TECHNOLOGY]) * 10) / 10;
  const averageLinks = Math.round(avg(connectionStats.map(s => s.totalConnections)) * 10) / 10;

  // Link type balance
  const linkTypeStats = calculateLinkTypeDistribution(data.links);
  const idealPercentage = 100 / linkTypeStats.length;
  const linkTypeBalance = linkTypeStats.map(stat => ({
    ...stat,
    isBalanced: Math.abs(stat.percentage - idealPercentage) < 15, // Within 15% of ideal
  }));

  // Hub nodes (>2x average connections)
  const hubThreshold = averageLinks * 2;
  const hubNodes = connectionStats.filter(s => s.totalConnections > hubThreshold).slice(0, 10);

  // Isolated nodes (1 or fewer connections)
  const isolatedNodes = connectionStats.filter(s => s.totalConnections <= 1).slice(0, 10);

  // Recommendations
  const recommendations: string[] = [];

  if (isolatedNodes.length > 0) {
    recommendations.push(`${isolatedNodes.length} nodes have 1 or fewer connections`);
  }

  const unbalancedLinks = linkTypeBalance.filter(l => !l.isBalanced);
  if (unbalancedLinks.length > 0) {
    recommendations.push(`Some link types are underrepresented: ${unbalancedLinks.map(l => l.type).join(', ')}`);
  }

  if (hubNodes.length > 5) {
    recommendations.push(`${hubNodes.length} hub nodes detected - ensure connections are meaningful`);
  }

  return {
    averageLinks,
    companyAvg,
    personAvg,
    techAvg,
    linkTypeBalance,
    hubNodes,
    isolatedNodes,
    recommendations,
  };
}

/**
 * Analyze temporal coverage
 */
export function analyzeTemporalCoverage(nodes: NodeData[]): TemporalCoverageAnalysis {
  const years = nodes.map(n => n.year).filter(y => y !== undefined) as number[];
  if (years.length === 0) {
    return {
      coverageByDecade: [],
      gaps: [],
      recommendations: ['No year data available'],
    };
  }

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // Year-by-year coverage
  const yearCoverage = new Map<number, number>();
  nodes.forEach(node => {
    if (node.year) {
      yearCoverage.set(node.year, (yearCoverage.get(node.year) || 0) + 1);
    }
  });

  // Decade analysis
  const decadeStats = calculateTimelineDistribution(nodes);
  const coverageByDecade = decadeStats.map(stat => {
    const total = stat.count;
    let coverage: 'excellent' | 'good' | 'fair' | 'poor' | 'missing' = 'missing';

    if (total >= 15) coverage = 'excellent';
    else if (total >= 10) coverage = 'good';
    else if (total >= 5) coverage = 'fair';
    else if (total > 0) coverage = 'poor';

    // Find gap years in this decade
    const startDecade = parseInt(stat.decade);
    const gapYears: number[] = [];
    for (let y = startDecade; y < startDecade + 10; y++) {
      if (y >= minYear && y <= maxYear && !yearCoverage.has(y)) {
        gapYears.push(y);
      }
    }

    return {
      decade: stat.decade,
      coverage,
      nodeCount: total,
      gapYears,
    };
  });

  // Find multi-year gaps
  const gaps: { startYear: number; endYear: number; yearsSpan: number }[] = [];
  let gapStart: number | null = null;

  for (let y = minYear; y <= maxYear; y++) {
    if (!yearCoverage.has(y)) {
      if (gapStart === null) gapStart = y;
    } else {
      if (gapStart !== null) {
        const yearsSpan = y - gapStart;
        if (yearsSpan >= 2) { // Only report gaps of 2+ years
          gaps.push({ startYear: gapStart, endYear: y - 1, yearsSpan });
        }
        gapStart = null;
      }
    }
  }

  // Recommendations
  const recommendations: string[] = [];

  const poorDecades = coverageByDecade.filter(d => d.coverage === 'poor' || d.coverage === 'missing');
  if (poorDecades.length > 0) {
    recommendations.push(`Low coverage in: ${poorDecades.map(d => d.decade).join(', ')}`);
  }

  if (gaps.length > 0) {
    recommendations.push(`${gaps.length} significant time gap(s) detected`);
    gaps.forEach(gap => {
      recommendations.push(`  • ${gap.startYear}-${gap.endYear} (${gap.yearsSpan} years)`);
    });
  }

  return {
    coverageByDecade,
    gaps,
    recommendations,
  };
}

/**
 * Generate comprehensive data quality report
 */
export function generateDataQualityReport(data: GraphData): DataQualityReport {
  const categoryBalance = analyzeCategoryBalance(data);
  const linkDensity = analyzeLinkDensity(data);
  const temporalCoverage = analyzeTemporalCoverage(data.nodes);

  // Calculate overall score (weighted average)
  const weights = {
    categoryBalance: 0.3,
    linkDensity: 0.35,
    temporalCoverage: 0.35,
  };

  // Category balance score (already 0-100)
  const catScore = categoryBalance.overall.balanceScore;

  // Link density score (based on recommendations)
  const linkScore = Math.max(0, 100 - (linkDensity.recommendations.length * 15));

  // Temporal score (based on coverage quality)
  const excellentDecades = temporalCoverage.coverageByDecade.filter(d => d.coverage === 'excellent').length;
  const totalDecades = temporalCoverage.coverageByDecade.length;
  const tempScore = totalDecades > 0 ? (excellentDecades / totalDecades) * 100 : 0;

  const overallScore = Math.round(
    catScore * weights.categoryBalance +
    linkScore * weights.linkDensity +
    tempScore * weights.temporalCoverage
  );

  // Grade assignment
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (overallScore >= 90) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';

  return {
    categoryBalance,
    linkDensity,
    temporalCoverage,
    overallScore,
    grade,
  };
}
