/**
 * Label Generation Utilities
 * 
 * This module generates relationship labels based on LabelingRules.md
 * Labels are dynamically generated based on the focused node perspective.
 * 
 * Rules:
 * - ← In (incoming): Active voice - "{Source} {verb} {Focus}"
 * - → Out (outgoing): Passive voice - "{Target} was {verb} by {Focus}"
 * - ↔ Both (ENGAGES): Other as subject - "{Other} {verb} {Focus}"
 */

import { NodeData, LinkData, Category, LinkType, LinkIcon, CompanyCategory, TechCategoryL1 } from '../types';

// ============================================================================
// Tech Group Mapping (Group A/B/C/D based on TechCategoryL1)
// ============================================================================
export type TechGroup = 'A' | 'B' | 'C' | 'D';

export const getTechGroup = (node: NodeData): TechGroup => {
    const catL1 = node.techCategoryL1;
    if (catL1 === 'Hardware & Infrastructure') return 'A';
    if (catL1 === 'System Software' || catL1 === 'AI & Physical Systems') return 'B';
    if (catL1 === 'Digital Services & Platforms' || catL1 === 'Network & Connectivity') return 'C';
    if (catL1 === 'Fundamental Concepts') return 'D';
    return 'A'; // Default fallback
};

// ============================================================================
// Helper: Get primary company category
// ============================================================================
const getCompanyCategory = (node: NodeData): CompanyCategory | undefined => {
    return node.companyCategories?.[0];
};

// ============================================================================
// Verb Generators by Relationship Type
// ============================================================================

// --- Person → Company ---
const getPersonToCompanyVerb = (
    sourceRole: string | undefined,
    linkType: LinkType
): { active: string; passive: string } => {
    if (linkType === LinkType.CREATES) {
        return { active: 'founded', passive: 'was founded by' };
    }
    if (linkType === LinkType.CONTRIBUTES) {
        if (sourceRole === 'LEADER') return { active: 'served at', passive: 'was served by' };
        if (sourceRole === 'INVESTOR') return { active: 'invested in', passive: 'was invested in by' };
        return { active: 'significantly impacted', passive: 'was significantly impacted by' };
    }
    return { active: 'worked at', passive: 'was worked at by' };
};

// --- Person → Technology ---
const getPersonToTechVerb = (
    sourceRole: string | undefined,
    linkType: LinkType,
    techGroup: TechGroup
): { active: string; passive: string } => {
    // CREATES
    if (linkType === LinkType.CREATES) {
        if (sourceRole === 'VISIONARY') {
            if (techGroup === 'A' || techGroup === 'B') return { active: 'pioneered', passive: 'was pioneered by' };
            if (techGroup === 'C') return { active: 'launched', passive: 'was launched by' };
            if (techGroup === 'D') return { active: 'envisioned', passive: 'was envisioned by' };
        }
        if (sourceRole === 'THEORIST') {
            if (techGroup === 'A' || techGroup === 'B') return { active: 'invented', passive: 'was invented by' };
            if (techGroup === 'D') return { active: 'formulated', passive: 'was formulated by' };
        }
        if (sourceRole === 'BUILDER') {
            if (techGroup === 'A') return { active: 'engineered', passive: 'was engineered by' };
            if (techGroup === 'B') return { active: 'built', passive: 'was built by' };
            if (techGroup === 'C') return { active: 'architected', passive: 'was architected by' };
            if (techGroup === 'D') return { active: 'drafted', passive: 'was drafted by' };
        }
        if (sourceRole === 'LEADER') return { active: 'spearheaded', passive: 'was spearheaded by' };
        if (sourceRole === 'INVESTOR') return { active: 'seed-funded', passive: 'was seed-funded by' };
    }
    // CONTRIBUTES
    if (linkType === LinkType.CONTRIBUTES) {
        if (sourceRole === 'VISIONARY') return { active: 'championed', passive: 'was championed by' };
        if (sourceRole === 'THEORIST') return { active: 'advanced', passive: 'was advanced by' };
        if (sourceRole === 'BUILDER') return { active: 'developed', passive: 'was developed by' };
        if (sourceRole === 'LEADER') return { active: 'oversaw', passive: 'was overseen by' };
        if (sourceRole === 'INVESTOR') return { active: 'backed', passive: 'was backed by' };
    }
    return { active: 'created', passive: 'was created by' };
};

// --- Person → Person ---
const getPersonToPersonVerb = (
    sourceRole: string | undefined,
    targetRole: string | undefined,
    linkType: LinkType,
    icon?: LinkIcon
): { active: string; passive: string } => {
    // ENGAGES with RIVALRY
    if (linkType === LinkType.ENGAGES && icon === LinkIcon.RIVALRY) {
        if (sourceRole === 'VISIONARY' && targetRole === 'VISIONARY') {
            return { active: 'clashed with', passive: 'clashed with' };
        }
        if (sourceRole === 'THEORIST' && targetRole === 'THEORIST') {
            return { active: 'debated with', passive: 'debated with' };
        }
        if (sourceRole === 'LEADER' && targetRole === 'LEADER') {
            return { active: 'rivaled', passive: 'rivaled' };
        }
        return { active: 'competed with', passive: 'competed with' };
    }
    // ENGAGES with HEART
    if (linkType === LinkType.ENGAGES && icon === LinkIcon.HEART) {
        if (sourceRole === 'VISIONARY' && targetRole === 'BUILDER') {
            return { active: 'co-founded with', passive: 'co-founded with' };
        }
        if (sourceRole === 'BUILDER' && targetRole === 'VISIONARY') {
            return { active: 'built alongside', passive: 'built alongside' };
        }
        if (sourceRole === 'THEORIST' && targetRole === 'THEORIST') {
            return { active: 'collaborated with', passive: 'collaborated with' };
        }
        return { active: 'partnered with', passive: 'partnered with' };
    }
    // CONTRIBUTES (Mentorship)
    if (linkType === LinkType.CONTRIBUTES) {
        if (sourceRole === 'INVESTOR') return { active: 'backed', passive: 'was backed by' };
        if (sourceRole === 'THEORIST') return { active: 'taught', passive: 'was taught by' };
        if (sourceRole === 'LEADER') return { active: 'guided', passive: 'was guided by' };
        return { active: 'mentored', passive: 'was mentored by' };
    }
    return { active: 'engaged with', passive: 'engaged with' };
};

// --- Company → Company ---
const getCompanyToCompanyVerb = (
    sourceCategory: CompanyCategory | undefined,
    targetCategory: CompanyCategory | undefined,
    linkType: LinkType,
    icon?: LinkIcon
): { active: string; passive: string } => {
    // CREATES
    if (linkType === LinkType.CREATES) {
        if (targetCategory === CompanyCategory.ACADEMY_LAB) {
            return { active: 'established', passive: 'was established by' };
        }
        return { active: 'spun off', passive: 'was spun off from' };
    }
    // POWERS
    if (linkType === LinkType.POWERS) {
        if (sourceCategory === CompanyCategory.MANUFACTURING_SUPPLY) {
            if (targetCategory === CompanyCategory.CONSUMER_DEVICE) {
                return { active: 'manufactures chips for', passive: 'has chips manufactured by' };
            }
            if (targetCategory === CompanyCategory.SEMICONDUCTOR) {
                return { active: 'supplies equipment to', passive: 'receives equipment from' };
            }
        }
        if (sourceCategory === CompanyCategory.INFRA_TELECOM) {
            return { active: 'provides infrastructure to', passive: 'receives infrastructure from' };
        }
        return { active: 'powers', passive: 'is powered by' };
    }
    // CONTRIBUTES
    if (linkType === LinkType.CONTRIBUTES) {
        if (sourceCategory === CompanyCategory.VENTURE_CAPITAL) {
            return { active: 'funded', passive: 'was funded by' };
        }
        if (sourceCategory === CompanyCategory.PLATFORM_INTERNET) {
            return { active: 'acquired', passive: 'was acquired by' };
        }
        if (sourceCategory === CompanyCategory.ENTERPRISE_SAAS) {
            return { active: 'strategically backed', passive: 'was strategically backed by' };
        }
        return { active: 'invested in', passive: 'received investment from' };
    }
    // ENGAGES
    if (linkType === LinkType.ENGAGES) {
        if (icon === LinkIcon.RIVALRY) return { active: 'competes with', passive: 'competes with' };
        if (icon === LinkIcon.HEART) return { active: 'partners with', passive: 'partners with' };
        return { active: 'engages with', passive: 'engages with' };
    }
    return { active: 'is linked to', passive: 'is linked to' };
};

// --- Company → Technology ---
const getCompanyToTechVerb = (
    sourceCategory: CompanyCategory | undefined,
    linkType: LinkType,
    techGroup: TechGroup
): { active: string; passive: string } => {
    if (linkType === LinkType.CREATES) {
        // ACADEMY_LAB
        if (sourceCategory === CompanyCategory.ACADEMY_LAB) {
            if (techGroup === 'A' || techGroup === 'D') return { active: 'invented', passive: 'was invented by' };
            if (techGroup === 'B') return { active: 'developed', passive: 'was developed by' };
            return { active: 'created', passive: 'was created by' };
        }
        // CONSUMER_DEVICE
        if (sourceCategory === CompanyCategory.CONSUMER_DEVICE) {
            if (techGroup === 'A') return { active: 'introduced', passive: 'was introduced by' };
            return { active: 'launched', passive: 'was launched by' };
        }
        // PLATFORM/SAAS
        if (sourceCategory === CompanyCategory.PLATFORM_INTERNET || sourceCategory === CompanyCategory.ENTERPRISE_SAAS) {
            if (techGroup === 'C') return { active: 'launched', passive: 'was launched by' };
            if (techGroup === 'B') return { active: 'released', passive: 'was released by' };
            return { active: 'built', passive: 'was built by' };
        }
        // MANUFACTURING_SUPPLY
        if (sourceCategory === CompanyCategory.MANUFACTURING_SUPPLY) {
            return { active: 'commercialized', passive: 'was commercialized by' };
        }
    }
    if (linkType === LinkType.POWERS) {
        if (sourceCategory === CompanyCategory.SEMICONDUCTOR) {
            return { active: 'accelerates', passive: 'is accelerated by' };
        }
        if (sourceCategory === CompanyCategory.INFRA_TELECOM) {
            return { active: 'powers', passive: 'is powered by' };
        }
        return { active: 'drives', passive: 'is driven by' };
    }
    if (linkType === LinkType.CONTRIBUTES) {
        if (techGroup === 'D') return { active: 'standardized', passive: 'was standardized by' };
        if (techGroup === 'C') return { active: 'popularized', passive: 'was popularized by' };
        return { active: 'advanced', passive: 'was advanced by' };
    }
    return { active: 'created', passive: 'was created by' };
};

// --- Technology → Company ---
const getTechToCompanyVerb = (
    techGroup: TechGroup,
    techRole: string | undefined,
    targetCategory: CompanyCategory | undefined,
    linkType: LinkType
): { active: string; passive: string } => {
    if (linkType === LinkType.POWERS) {
        // Hardware → Manufacturing
        if (targetCategory === CompanyCategory.MANUFACTURING_SUPPLY) {
            return { active: 'enables manufacturing at', passive: 'has manufacturing enabled by' };
        }
        // Chip → AI
        if (targetCategory === CompanyCategory.AI_INNOVATION) {
            return { active: 'accelerates', passive: 'is accelerated by' };
        }
        // Cloud → Media
        if (targetCategory === CompanyCategory.MEDIA_CONTENT) {
            return { active: 'runs', passive: 'is run by' };
        }
        // OS → Device
        if (targetCategory === CompanyCategory.CONSUMER_DEVICE) {
            return { active: 'powers devices by', passive: 'has devices powered by' };
        }
        // Security/Protocol
        if (techGroup === 'D') {
            return { active: 'secures', passive: 'is secured by' };
        }
        return { active: 'powers', passive: 'is powered by' };
    }
    if (linkType === LinkType.CONTRIBUTES) {
        if (techRole === 'FOUNDATION') {
            return { active: 'laid the foundation for', passive: 'was founded upon' };
        }
        if (techRole === 'APPLICATION') {
            return { active: 'revolutionized', passive: 'was revolutionized by' };
        }
        return { active: 'advanced', passive: 'was advanced by' };
    }
    return { active: 'powers', passive: 'is powered by' };
};

// --- Technology → Technology ---
const getTechToTechVerb = (
    sourceGroup: TechGroup,
    sourceRole: string | undefined,
    targetGroup: TechGroup,
    linkType: LinkType,
    icon?: LinkIcon
): { active: string; passive: string } => {
    if (linkType === LinkType.POWERS) {
        // GPU/Chip → AI
        if (sourceGroup === 'A' && targetGroup === 'B') {
            return { active: 'accelerates', passive: 'is accelerated by' };
        }
        // Processor → OS
        if (sourceGroup === 'A') {
            return { active: 'executes', passive: 'is executed by' };
        }
        // OS → App
        if (sourceGroup === 'B') {
            return { active: 'runs', passive: 'runs on' };
        }
        // Protocol → Service
        if (sourceGroup === 'D') {
            return { active: 'underpins', passive: 'is underpinned by' };
        }
        // Network
        if (sourceGroup === 'C') {
            return { active: 'connects', passive: 'is connected by' };
        }
        return { active: 'powers', passive: 'is powered by' };
    }
    if (linkType === LinkType.CONTRIBUTES) {
        // Theory → Implementation
        if (sourceRole === 'FOUNDATION') {
            return { active: 'forms the basis of', passive: 'is based on' };
        }
        // AI Model → Service
        if (sourceGroup === 'B' && targetGroup === 'C') {
            return { active: 'is the engine behind', passive: 'is powered by' };
        }
        // Manufacturing → Chip
        if (sourceGroup === 'A' && targetGroup === 'A') {
            return { active: 'enables creation of', passive: 'was enabled by' };
        }
        // Evolution
        return { active: 'paved the way for', passive: 'evolved from' };
    }
    // ENGAGES (Tech Rivalry/Partnership)
    if (linkType === LinkType.ENGAGES) {
        if (icon === LinkIcon.HEART) {
            return { active: 'complements', passive: 'complements' };
        }
        if (icon === LinkIcon.RIVALRY) {
            return { active: 'competes with', passive: 'competes with' };
        }
        return { active: 'interacts with', passive: 'interacts with' };
    }
    return { active: 'is linked to', passive: 'is linked to' };
};

// ============================================================================
// Main Label Generator
// ============================================================================

export interface RelationLabelResult {
    /** Full label when focus is TARGET of the link (incoming) */
    incomingLabel: string;
    /** Full label when focus is SOURCE of the link (outgoing) */
    outgoingLabel: string;
    /** Verb only (active form) */
    activeVerb: string;
    /** Verb only (passive form) */
    passiveVerb: string;
}

/**
 * Generate relationship label based on source/target nodes and link data.
 * 
 * @param source - The source node of the link
 * @param target - The target node of the link
 * @param link - The link data
 * @returns Labels for both perspectives (incoming/outgoing)
 */
export const generateRelationLabel = (
    source: NodeData,
    target: NodeData,
    link: LinkData
): RelationLabelResult => {
    const sourceCategory = source.category;
    const targetCategory = target.category;
    const linkType = link.type;
    const icon = link.icon;

    let verbs = { active: 'is linked to', passive: 'is linked to' };

    // Person → Company
    if (sourceCategory === Category.PERSON && targetCategory === Category.COMPANY) {
        verbs = getPersonToCompanyVerb(source.impactRole as string, linkType);
    }
    // Person → Technology
    else if (sourceCategory === Category.PERSON && targetCategory === Category.TECHNOLOGY) {
        verbs = getPersonToTechVerb(source.impactRole as string, linkType, getTechGroup(target));
    }
    // Person → Person
    else if (sourceCategory === Category.PERSON && targetCategory === Category.PERSON) {
        verbs = getPersonToPersonVerb(source.impactRole as string, target.impactRole as string, linkType, icon);
    }
    // Company → Company
    else if (sourceCategory === Category.COMPANY && targetCategory === Category.COMPANY) {
        verbs = getCompanyToCompanyVerb(getCompanyCategory(source), getCompanyCategory(target), linkType, icon);
    }
    // Company → Technology
    else if (sourceCategory === Category.COMPANY && targetCategory === Category.TECHNOLOGY) {
        verbs = getCompanyToTechVerb(getCompanyCategory(source), linkType, getTechGroup(target));
    }
    // Technology → Company
    else if (sourceCategory === Category.TECHNOLOGY && targetCategory === Category.COMPANY) {
        verbs = getTechToCompanyVerb(getTechGroup(source), source.impactRole as string, getCompanyCategory(target), linkType);
    }
    // Technology → Technology
    else if (sourceCategory === Category.TECHNOLOGY && targetCategory === Category.TECHNOLOGY) {
        verbs = getTechToTechVerb(getTechGroup(source), source.impactRole as string, getTechGroup(target), linkType, icon);
    }

    // For ENGAGES (bidirectional), use active form with other as subject
    const isBidirectional = linkType === LinkType.ENGAGES;

    return {
        // ← In: "{Source} {active verb} {Target}" - when focus is target
        incomingLabel: `${source.label} ${verbs.active} ${target.label}`,
        // → Out: "{Target} {passive verb} {Source}" - when focus is source
        outgoingLabel: isBidirectional
            ? `${target.label} ${verbs.active} ${source.label}` // Other as subject for ENGAGES
            : `${target.label} ${verbs.passive} ${source.label}`,
        activeVerb: verbs.active,
        passiveVerb: verbs.passive,
    };
};

/**
 * Get label for a connection relative to a focused node.
 * Returns a SUBJECT-FREE label since the connected node name is already displayed.
 * 
 * Format:
 * - ← In (incoming): "{verb} {FocusNode}" (active voice without subject)
 * - → Out (outgoing): "{verb} {ConnectedNode}" (passive voice without subject)
 * - ↔ Both (ENGAGES): "{verb} {FocusNode}" (other as subject, but subject omitted)
 * 
 * @param focusNode - The currently focused node
 * @param connectedNode - The connected node
 * @param link - The link between them
 * @param isOutgoing - true if focusNode is the source, false if target
 * @returns Formatted label string WITHOUT subject
 */
export const getConnectionLabel = (
    focusNode: NodeData,
    connectedNode: NodeData,
    link: LinkData,
    isOutgoing: boolean
): string => {
    const source = isOutgoing ? focusNode : connectedNode;
    const target = isOutgoing ? connectedNode : focusNode;

    const result = generateRelationLabel(source, target, link);
    const isBidirectional = link.type === LinkType.ENGAGES;

    if (isOutgoing) {
        // → Out: "{verb} {Target}" - show what the connected node was affected by
        // e.g., "was founded by Apple" (without subject)
        return isBidirectional
            ? `${result.activeVerb} ${focusNode.label}` // e.g., "clashed with Steve Jobs"
            : `${result.passiveVerb} ${focusNode.label}`; // e.g., "was founded by Steve Jobs"
    } else {
        // ← In: "{verb} {Focus}" - show what the source did to focus
        // e.g., "backed Steve Jobs" (without subject)
        return `${result.activeVerb} ${focusNode.label}`;
    }
};

// ============================================================================
// Company Subtitle (for standalone display)
// ============================================================================
export const getCompanySubtitle = (node: NodeData): string => {
    return `was founded in ${node.year}`;
};

// ============================================================================
// Legacy exports for backward compatibility
// ============================================================================
export { getTechGroup as getTechGroupFromNode };

// ============================================================================
// LEGACY: getTechVerb (for DetailPanel, HistoryView, LinksView)
// ============================================================================
export const getTechVerb = (techNode: NodeData, pastTense = true): string => {
    const role = techNode.impactRole;
    const catL1 = techNode.techCategoryL1;

    // TechRole-based verbs (priority)
    if (role === 'FOUNDATION') return pastTense ? 'Theorized' : 'Theorize';
    if (role === 'CORE') return pastTense ? 'Developed' : 'Develop';
    if (role === 'PLATFORM') return pastTense ? 'Built' : 'Build';
    if (role === 'APPLICATION') {
        if (catL1 === 'Digital Services & Platforms') return pastTense ? 'Launched' : 'Launch';
        return pastTense ? 'Created' : 'Create';
    }

    // TechCategoryL1-based fallback
    if (catL1 === 'Hardware & Infrastructure') return pastTense ? 'Manufactured' : 'Manufacture';
    if (catL1 === 'System Software') return pastTense ? 'Developed' : 'Develop';
    if (catL1 === 'Network & Connectivity') return pastTense ? 'Designed' : 'Design';
    if (catL1 === 'Digital Services & Platforms') return pastTense ? 'Launched' : 'Launch';
    if (catL1 === 'AI & Physical Systems') return pastTense ? 'Pioneered' : 'Pioneer';
    if (catL1 === 'Fundamental Concepts') return pastTense ? 'Proposed' : 'Propose';

    return pastTense ? 'Created' : 'Create';
};

// ============================================================================
// LEGACY: PersonVerbs interface and getPersonVerbs
// ============================================================================
export interface PersonVerbs {
    foundedCompany: string;
    contributedCompany: string;
    createdTech: string;
    contributedTech: string;
    mentored: string;
    mentoredBy: string;
}

export const getPersonVerbs = (personNode: NodeData): PersonVerbs => {
    const role = personNode.impactRole;

    return {
        foundedCompany: role === 'VISIONARY' ? 'Visionary founder of' :
            role === 'THEORIST' ? 'Co-founded' :
                role === 'BUILDER' ? 'Built' :
                    role === 'LEADER' ? 'Led' :
                        role === 'INVESTOR' ? 'Angel investor in' : 'Founded',
        contributedCompany: role === 'VISIONARY' ? 'Vision architect at' :
            role === 'THEORIST' ? 'Research advisor to' :
                role === 'BUILDER' ? 'Core engineer at' :
                    role === 'LEADER' ? 'Executive at' :
                        role === 'INVESTOR' ? 'Invested in' : 'Contributed to',
        createdTech: role === 'VISIONARY' ? 'Envisioned' :
            role === 'THEORIST' ? 'Theorized' :
                role === 'BUILDER' ? 'Engineered' :
                    role === 'LEADER' ? 'Directed' :
                        role === 'INVESTOR' ? 'Funded' : 'Created',
        contributedTech: role === 'VISIONARY' ? 'Championed' :
            role === 'THEORIST' ? 'Researched' :
                role === 'BUILDER' ? 'Built' :
                    role === 'LEADER' ? 'Oversaw' :
                        role === 'INVESTOR' ? 'Backed' : 'Contributed to',
        mentored: role === 'VISIONARY' ? 'Inspired' :
            role === 'THEORIST' ? 'Taught' :
                role === 'BUILDER' ? 'Mentored' :
                    role === 'LEADER' ? 'Guided' :
                        role === 'INVESTOR' ? 'Advised' : 'Mentored',
        mentoredBy: role === 'VISIONARY' ? 'Inspired by' :
            role === 'THEORIST' ? 'Studied under' :
                role === 'BUILDER' ? 'Learned from' :
                    role === 'LEADER' ? 'Worked under' :
                        role === 'INVESTOR' ? 'Backed by' : 'Mentored by',
    };
};

// ============================================================================
// LEGACY: Achievement interface and getNodeSubtitle
// ============================================================================
export interface Achievement {
    label: string;
    year: number;
    category: Category;
}

export interface NodeSubtitleContext {
    creatorLabel?: string;
    achievements?: Achievement[];
}

export const getNodeSubtitle = (
    node: NodeData,
    context?: NodeSubtitleContext
): string => {
    // Company: "was founded in {year}"
    if (node.category === Category.COMPANY) {
        return `was founded in ${node.year}`;
    }

    // Person: "was born in {year}" - now that year = birthYear
    if (node.category === Category.PERSON) {
        return `was born in ${node.year}`;
    }

    // Technology: "{verb} by {creator} ({year})" or fallback
    if (node.category === Category.TECHNOLOGY) {
        const verb = getTechVerb(node);
        const creatorLabel = context?.creatorLabel;

        if (creatorLabel) {
            return `${verb} by ${creatorLabel} (${node.year})`;
        }

        const role = node.impactRole;
        const catL2 = node.techCategoryL2 || node.techCategoryL1;

        if (role === 'FOUNDATION') return `Foundational theory (${node.year})`;
        if (role === 'CORE') return `Core technology (${node.year})`;
        if (role === 'PLATFORM') return `Platform (${node.year})`;
        if (role === 'APPLICATION') return `Application (${node.year})`;

        if (catL2) return `${catL2} (${node.year})`;

        return `Technology (${node.year})`;
    }

    return `(${node.year})`;
};

