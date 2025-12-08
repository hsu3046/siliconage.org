import { GraphData, NodeData, LinkData, Category, LinkType } from '../../types';

export interface ValidationError {
  severity: 'error' | 'warning' | 'info';
  category: 'orphan' | 'broken-link' | 'missing-data' | 'logic-error' | 'duplicate';
  nodeId?: string;
  linkIndex?: number;
  message: string;
  suggestion?: string;
  details?: any;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
  summary: {
    totalNodes: number;
    totalLinks: number;
    orphanCount: number;
    brokenLinkCount: number;
    missingDataCount: number;
    logicErrorCount: number;
    duplicateCount: number;
  };
}

// Helper: Get ID from link source/target (handles both string and object)
const getNodeId = (node: string | NodeData): string => {
  return typeof node === 'string' ? node : node.id;
};

// Rule 1: Detect Orphan Nodes (nodes with no connections)
function detectOrphanNodes(nodes: NodeData[], links: LinkData[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const connectedNodeIds = new Set<string>();

  // Collect all connected node IDs
  links.forEach(link => {
    connectedNodeIds.add(getNodeId(link.source));
    connectedNodeIds.add(getNodeId(link.target));
  });

  // Find orphans
  nodes.forEach(node => {
    if (!connectedNodeIds.has(node.id)) {
      errors.push({
        severity: 'warning',
        category: 'orphan',
        nodeId: node.id,
        message: `"${node.label}" has no connections`,
        suggestion: 'Add relevant links or remove this node if it\'s unused'
      });
    }
  });

  return errors;
}

// Rule 2: Detect Broken Links (links pointing to non-existent nodes)
function detectBrokenLinks(nodes: NodeData[], links: LinkData[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(nodes.map(n => n.id));

  links.forEach((link, index) => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);

    if (!nodeIds.has(sourceId)) {
      errors.push({
        severity: 'error',
        category: 'broken-link',
        linkIndex: index,
        message: `Link #${index}: source "${sourceId}" not found`,
        suggestion: findSimilarNodeId(sourceId, nodes),
        details: { source: sourceId, target: targetId, type: link.type }
      });
    }

    if (!nodeIds.has(targetId)) {
      errors.push({
        severity: 'error',
        category: 'broken-link',
        linkIndex: index,
        message: `Link #${index}: target "${targetId}" not found`,
        suggestion: findSimilarNodeId(targetId, nodes),
        details: { source: sourceId, target: targetId, type: link.type }
      });
    }
  });

  return errors;
}

// Rule 3: Detect Missing Required Metadata
function detectMissingMetadata(nodes: NodeData[]): ValidationError[] {
  const errors: ValidationError[] = [];

  nodes.forEach(node => {
    // Required for ALL nodes
    const requiredFields = ['id', 'label', 'category', 'year', 'description'];
    requiredFields.forEach(field => {
      if (!node[field as keyof NodeData]) {
        errors.push({
          severity: 'error',
          category: 'missing-data',
          nodeId: node.id,
          message: `"${node.label}" missing required field: ${field}`,
          suggestion: `Add ${field} to this node`
        });
      }
    });

    // Category-specific required fields
    if (node.category === Category.COMPANY) {
      if (!node.companyCategories || node.companyCategories.length === 0) {
        errors.push({
          severity: 'warning',
          category: 'missing-data',
          nodeId: node.id,
          message: `"${node.label}" missing companyCategories`,
          suggestion: 'Add at least one company category'
        });
      }
    }

    if (node.category === Category.PERSON) {
      if (!node.primaryRole) {
        errors.push({
          severity: 'warning',
          category: 'missing-data',
          nodeId: node.id,
          message: `"${node.label}" missing primaryRole`,
          suggestion: 'Add a primary role (e.g., FOUNDER, ENGINEER)'
        });
      }
    }

    if (node.category === Category.TECHNOLOGY) {
      if (!node.techCategoryL1) {
        errors.push({
          severity: 'warning',
          category: 'missing-data',
          nodeId: node.id,
          message: `"${node.label}" missing techCategoryL1`,
          suggestion: 'Add L1 tech category'
        });
      }
    }

    // ImpactRole check removed - no longer used in the app
  });

  return errors;
}

// Rule 4: Detect Logic Violations (invalid relationship types)
function detectLogicViolations(nodes: NodeData[], links: LinkData[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  links.forEach((link, index) => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);
    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);

    if (!sourceNode || !targetNode) return; // Skip if nodes don't exist (handled by broken link check)

    const sourceCat = sourceNode.category;
    const targetCat = targetNode.category;
    const linkType = link.type;

    // CREATES rules
    if (linkType === LinkType.CREATES) {
      // PERSON → PERSON: Invalid
      if (sourceCat === Category.PERSON && targetCat === Category.PERSON) {
        errors.push({
          severity: 'error',
          category: 'logic-error',
          linkIndex: index,
          message: `Invalid CREATES: Person cannot create Person (${sourceNode.label} → ${targetNode.label})`,
          suggestion: 'Use ENGAGES or CONTRIBUTES for person-to-person relationships'
        });
      }
      // TECHNOLOGY → anything: Invalid
      if (sourceCat === Category.TECHNOLOGY) {
        errors.push({
          severity: 'error',
          category: 'logic-error',
          linkIndex: index,
          message: `Invalid CREATES: Technology cannot create anything (${sourceNode.label} → ${targetNode.label})`,
          suggestion: 'Technologies are created, not creators. Reverse the relationship.'
        });
      }
    }

    // POWERS rules
    if (linkType === LinkType.POWERS) {
      // PERSON → COMPANY: Invalid
      if (sourceCat === Category.PERSON && targetCat === Category.COMPANY) {
        errors.push({
          severity: 'error',
          category: 'logic-error',
          linkIndex: index,
          message: `Invalid POWERS: Person cannot power Company (${sourceNode.label} → ${targetNode.label})`,
          suggestion: 'Use CREATES (founder) or CONTRIBUTES (employee/advisor)'
        });
      }
      // PERSON → PERSON: Invalid
      if (sourceCat === Category.PERSON && targetCat === Category.PERSON) {
        errors.push({
          severity: 'error',
          category: 'logic-error',
          linkIndex: index,
          message: `Invalid POWERS: Person cannot power Person (${sourceNode.label} → ${targetNode.label})`,
          suggestion: 'Use ENGAGES or CONTRIBUTES for person-to-person relationships'
        });
      }
    }

    // TECHNOLOGY → PERSON: Always invalid
    if (sourceCat === Category.TECHNOLOGY && targetCat === Category.PERSON) {
      errors.push({
        severity: 'error',
        category: 'logic-error',
        linkIndex: index,
        message: `Invalid relationship: Technology → Person (${sourceNode.label} → ${targetNode.label})`,
        suggestion: 'Technologies cannot point to people. Reverse the relationship.'
      });
    }
  });

  return errors;
}

// Rule 5: Detect Duplicate IDs and Links
function detectDuplicates(nodes: NodeData[], links: LinkData[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();
  const seenLinks = new Set<string>();

  // Check duplicate node IDs
  nodes.forEach(node => {
    if (seenIds.has(node.id)) {
      errors.push({
        severity: 'error',
        category: 'duplicate',
        nodeId: node.id,
        message: `Duplicate node ID: "${node.id}"`,
        suggestion: 'Each node must have a unique ID'
      });
    }
    seenIds.add(node.id);
  });

  // Check duplicate links (same source + target + type)
  links.forEach((link, index) => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);
    const key = `${sourceId}_${targetId}_${link.type}`;

    if (seenLinks.has(key)) {
      errors.push({
        severity: 'warning',
        category: 'duplicate',
        linkIndex: index,
        message: `Duplicate link: ${sourceId} → ${targetId} (${link.type})`,
        suggestion: 'Remove duplicate relationship'
      });
    }
    seenLinks.add(key);
  });

  return errors;
}

// Helper: Find similar node ID (for typo suggestions)
function findSimilarNodeId(targetId: string, nodes: NodeData[]): string | undefined {
  const similarities = nodes.map(node => ({
    id: node.id,
    distance: levenshteinDistance(targetId.toLowerCase(), node.id.toLowerCase())
  }));

  similarities.sort((a, b) => a.distance - b.distance);

  // Return suggestion if similarity is high (distance < 3)
  if (similarities.length > 0 && similarities[0].distance < 3) {
    return `Did you mean "${similarities[0].id}"?`;
  }

  return undefined;
}

// Levenshtein distance for fuzzy string matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Main validation function
export function validateGraphData(data: GraphData): ValidationResult {
  const allErrors: ValidationError[] = [];

  // Run all validation rules
  allErrors.push(...detectOrphanNodes(data.nodes, data.links));
  allErrors.push(...detectBrokenLinks(data.nodes, data.links));
  allErrors.push(...detectMissingMetadata(data.nodes));
  allErrors.push(...detectLogicViolations(data.nodes, data.links));
  allErrors.push(...detectDuplicates(data.nodes, data.links));

  // Categorize by severity
  const errors = allErrors.filter(e => e.severity === 'error');
  const warnings = allErrors.filter(e => e.severity === 'warning');
  const info = allErrors.filter(e => e.severity === 'info');

  // Calculate summary
  const summary = {
    totalNodes: data.nodes.length,
    totalLinks: data.links.length,
    orphanCount: allErrors.filter(e => e.category === 'orphan').length,
    brokenLinkCount: allErrors.filter(e => e.category === 'broken-link').length,
    missingDataCount: allErrors.filter(e => e.category === 'missing-data').length,
    logicErrorCount: allErrors.filter(e => e.category === 'logic-error').length,
    duplicateCount: allErrors.filter(e => e.category === 'duplicate').length,
  };

  return { errors, warnings, info, summary };
}
