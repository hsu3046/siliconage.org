import { GraphData, NodeData, LinkData, LinkType } from '../../types';

export interface ChainNode {
  node: NodeData;
  depth: number;
  link?: LinkData;
  linkDescription?: string;
  children?: ChainNode[];
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycles: string[][]; // Array of node ID paths forming cycles
}

// Helper: Get node ID from link source/target
const getNodeId = (node: string | NodeData): string => {
  return typeof node === 'string' ? node : node.id;
};

/**
 * Get upstream chain (incoming links) - Origins
 * Traces nodes that point TO the current node
 */
export function getUpstreamChain(
  nodeId: string,
  data: GraphData,
  maxDepth: number = 3,
  visited: Set<string> = new Set(),
  currentDepth: number = 0
): ChainNode[] {
  if (currentDepth >= maxDepth || visited.has(nodeId)) {
    return [];
  }

  visited.add(nodeId);
  const result: ChainNode[] = [];

  // Find all links where this node is the TARGET
  const incomingLinks = data.links.filter(link => {
    const targetId = getNodeId(link.target);
    return targetId === nodeId;
  });

  // Limit to prevent explosion (max 10 parents per level)
  const limitedLinks = incomingLinks.slice(0, 10);

  limitedLinks.forEach(link => {
    const sourceId = getNodeId(link.source);
    const sourceNode = data.nodes.find(n => n.id === sourceId);

    if (!sourceNode) return;

    const chainNode: ChainNode = {
      node: sourceNode,
      depth: currentDepth + 1,
      link,
      children: []
    };

    // Recursively get upstream of this source node
    const newVisited = new Set(visited);
    chainNode.children = getUpstreamChain(
      sourceId,
      data,
      maxDepth,
      newVisited,
      currentDepth + 1
    );

    result.push(chainNode);
  });

  // Sort by category (Company -> Person -> Technology) then by label
  result.sort((a, b) => {
    const categoryOrder = { COMPANY: 0, PERSON: 1, TECHNOLOGY: 2 };
    const catDiff = (categoryOrder[a.node.category] || 3) - (categoryOrder[b.node.category] || 3);
    if (catDiff !== 0) return catDiff;
    return a.node.label.localeCompare(b.node.label);
  });

  return result;
}

/**
 * Get downstream chain (outgoing links) - Impact
 * Traces nodes that this node points TO
 */
export function getDownstreamChain(
  nodeId: string,
  data: GraphData,
  maxDepth: number = 3,
  visited: Set<string> = new Set(),
  currentDepth: number = 0
): ChainNode[] {
  if (currentDepth >= maxDepth || visited.has(nodeId)) {
    return [];
  }

  visited.add(nodeId);
  const result: ChainNode[] = [];

  // Find all links where this node is the SOURCE
  const outgoingLinks = data.links.filter(link => {
    const sourceId = getNodeId(link.source);
    return sourceId === nodeId;
  });

  // Limit to prevent explosion
  const limitedLinks = outgoingLinks.slice(0, 10);

  limitedLinks.forEach(link => {
    const targetId = getNodeId(link.target);
    const targetNode = data.nodes.find(n => n.id === targetId);

    if (!targetNode) return;

    const chainNode: ChainNode = {
      node: targetNode,
      depth: currentDepth + 1,
      link,
      children: []
    };

    // Recursively get downstream of this target node
    const newVisited = new Set(visited);
    chainNode.children = getDownstreamChain(
      targetId,
      data,
      maxDepth,
      newVisited,
      currentDepth + 1
    );

    result.push(chainNode);
  });

  // Sort by category then label
  result.sort((a, b) => {
    const categoryOrder = { COMPANY: 0, PERSON: 1, TECHNOLOGY: 2 };
    const catDiff = (categoryOrder[a.node.category] || 3) - (categoryOrder[b.node.category] || 3);
    if (catDiff !== 0) return catDiff;
    return a.node.label.localeCompare(b.node.label);
  });

  return result;
}

/**
 * Detect cycles in the graph using DFS
 */
export function detectCycles(data: GraphData): CycleDetectionResult {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const pathStack: string[] = [];

  // Build adjacency list for efficient traversal
  const adjacencyList = new Map<string, string[]>();
  data.nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });

  data.links.forEach(link => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);
    const neighbors = adjacencyList.get(sourceId);
    if (neighbors) {
      neighbors.push(targetId);
    }
  });

  // DFS to detect cycles
  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      // Cycle detected - extract the cycle path
      const cycleStartIndex = pathStack.indexOf(nodeId);
      const cyclePath = [...pathStack.slice(cycleStartIndex), nodeId];
      cycles.push(cyclePath);
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);
    pathStack.push(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) {
        // Continue searching for more cycles
        // Don't return immediately to find all cycles
      }
    }

    recursionStack.delete(nodeId);
    pathStack.pop();
    return false;
  }

  // Run DFS from each unvisited node
  data.nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  });

  return {
    hasCycle: cycles.length > 0,
    cycles
  };
}

/**
 * Get all direct connections for a node (1st degree only)
 */
export function getDirectConnections(nodeId: string, data: GraphData) {
  const incoming: Array<{ node: NodeData; link: LinkData }> = [];
  const outgoing: Array<{ node: NodeData; link: LinkData }> = [];

  data.links.forEach(link => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);

    if (targetId === nodeId) {
      const sourceNode = data.nodes.find(n => n.id === sourceId);
      if (sourceNode) {
        incoming.push({ node: sourceNode, link });
      }
    }

    if (sourceId === nodeId) {
      const targetNode = data.nodes.find(n => n.id === targetId);
      if (targetNode) {
        outgoing.push({ node: targetNode, link });
      }
    }
  });

  return { incoming, outgoing };
}

/**
 * Count total nodes in chain (including nested children)
 */
export function countNodesInChain(chain: ChainNode[]): number {
  let count = chain.length;
  chain.forEach(node => {
    if (node.children && node.children.length > 0) {
      count += countNodesInChain(node.children);
    }
  });
  return count;
}

/**
 * Flatten chain into array (for easier rendering)
 */
export function flattenChain(chain: ChainNode[]): ChainNode[] {
  const result: ChainNode[] = [];

  function traverse(nodes: ChainNode[]) {
    nodes.forEach(node => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }

  traverse(chain);
  return result;
}

/**
 * Get link type counts for a node
 */
export function getLinkTypeCounts(nodeId: string, data: GraphData) {
  const counts = {
    creates: { incoming: 0, outgoing: 0 },
    powers: { incoming: 0, outgoing: 0 },
    contributes: { incoming: 0, outgoing: 0 },
    engages: { incoming: 0, outgoing: 0 }
  };

  data.links.forEach(link => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);

    if (targetId === nodeId) {
      switch (link.type) {
        case LinkType.CREATES:
          counts.creates.incoming++;
          break;
        case LinkType.POWERS:
          counts.powers.incoming++;
          break;
        case LinkType.CONTRIBUTES:
          counts.contributes.incoming++;
          break;
        case LinkType.ENGAGES:
          counts.engages.incoming++;
          break;
      }
    }

    if (sourceId === nodeId) {
      switch (link.type) {
        case LinkType.CREATES:
          counts.creates.outgoing++;
          break;
        case LinkType.POWERS:
          counts.powers.outgoing++;
          break;
        case LinkType.CONTRIBUTES:
          counts.contributes.outgoing++;
          break;
        case LinkType.ENGAGES:
          counts.engages.outgoing++;
          break;
      }
    }
  });

  return counts;
}
