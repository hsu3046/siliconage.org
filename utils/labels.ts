/**
 * Shared label generation utilities for DetailPanel and HistoryView
 */

import { NodeData } from '../types';

// ============================================================================
// getTechVerb: Get tech-specific verb based on TechRole and TechCategoryL1
// ============================================================================
// TechRole mapping:
//   - FOUNDATION → "Theorized"
//   - CORE → "Developed"
//   - PLATFORM → "Built"
//   - APPLICATION → "Created" or "Launched" (for Digital Services)
// ============================================================================
export const getTechVerb = (techNode: NodeData, pastTense = true): string => {
    const role = techNode.impactRole;
    const catL1 = techNode.techCategoryL1;

    // TechRole-based verbs (priority)
    if (role === 'FOUNDATION') return pastTense ? 'Theorized' : 'Theorize';
    if (role === 'CORE') return pastTense ? 'Developed' : 'Develop';
    if (role === 'PLATFORM') return pastTense ? 'Built' : 'Build';
    if (role === 'APPLICATION') {
        // APPLICATION + Services = "Launched"
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

    // Default
    return pastTense ? 'Created' : 'Create';
};

// ============================================================================
// getPersonVerbs: Get person-specific verbs based on PersonRole
// ============================================================================
// PersonRole mapping:
//   - VISIONARY → "Visionary founder of", "Envisioned"
//   - THEORIST → "Co-founded", "Theorized"
//   - BUILDER → "Built", "Engineered"
//   - LEADER → "Led", "Directed"
//   - INVESTOR → "Angel investor in", "Funded"
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
        // Person → Company
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
        // Person → Tech
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
        // Person → Person
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
