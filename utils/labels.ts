/**
 * Shared label generation utilities for DetailPanel and HistoryView
 */

import { NodeData, Category } from '../types';

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

// ============================================================================
// getNodeSubtitle: 노드 이름 옆에 표시되는 서브타이틀(부제) 생성 함수
// ============================================================================
// 
// 📌 사용 위치:
//    - HistoryView.tsx: 타임라인의 각 노드 카드에 표시
//    - LinksView.tsx: 연결된 노드 목록에서 노드 이름 옆에 표시
//
// 📌 수정 방법:
//    - Company 서브타이틀 변경: COMPANY_SUBTITLE_FORMAT 섹션 수정
//    - Person 서브타이틀 변경: PERSON_SUBTITLE_FORMAT 섹션 수정
//    - Technology 서브타이틀 변경: TECH_SUBTITLE_FORMAT 섹션 수정
//
// 📌 Context 파라미터:
//    - creatorLabel?: Technology 노드의 경우 "Created by {creator}" 표시용
//    - achievements?: Person 노드의 경우 업적 목록 표시용 (최대 3개)
//
// ============================================================================

/**
 * Achievement 구조 (Person 노드용)
 * @property label - 업적 이름 (예: "Apple", "iPhone")
 * @property year - 업적 연도 (예: 1976, 2007)
 * @property category - 업적 카테고리 (COMPANY 또는 TECHNOLOGY)
 */
export interface Achievement {
    label: string;
    year: number;
    category: Category;
}

/**
 * getNodeSubtitle 함수의 옵션 파라미터
 */
export interface NodeSubtitleContext {
    /**
     * Technology 노드용: 이 기술을 만든 회사/사람 이름
     * 예: "Apple", "Steve Jobs"
     */
    creatorLabel?: string;

    /**
     * Person 노드용: 이 사람의 업적 목록 (회사 설립, 기술 발명 등)
     * 최대 3개까지 표시됨
     */
    achievements?: Achievement[];
}

/**
 * 노드 서브타이틀(부제) 생성 함수
 * 
 * @param node - 서브타이틀을 생성할 노드
 * @param context - 추가 컨텍스트 (creator, achievements 등)
 * @returns 서브타이틀 문자열 (예: "Founded (1885)", "Created by Apple (2007)")
 * 
 * @example
 * // Company 노드
 * getNodeSubtitle(appleNode) // → "Founded (1976)"
 * 
 * // Technology 노드 with creator
 * getNodeSubtitle(iphoneNode, { creatorLabel: "Apple" }) // → "Created by Apple (2007)"
 * 
 * // Person 노드 with achievements
 * getNodeSubtitle(jobsNode, { achievements: [...] }) // → "Founded Apple (1976), Created iPhone (2007)"
 */
export const getNodeSubtitle = (
    node: NodeData,
    context?: NodeSubtitleContext
): string => {
    // =========================================================================
    // 🏢 COMPANY_SUBTITLE_FORMAT
    // =========================================================================
    // 현재 형식: "Founded (연도)"
    // 수정 예시:
    //   - "설립 연도" 형식으로 변경: return `설립 ${node.year}`;
    //   - "Est. 연도" 형식으로 변경: return `Est. ${node.year}`;
    //   - 연도만 표시: return `(${node.year})`;
    // =========================================================================
    if (node.category === Category.COMPANY) {
        return `was founded in ${node.year}`;
    }

    // =========================================================================
    // 👤 PERSON_SUBTITLE_FORMAT
    // =========================================================================
    // 현재 로직:
    //   1. achievements가 있으면 → "동사 업적명 (연도), ..." 형식으로 최대 3개 표시
    //   2. achievements가 없으면 → "Active since 연도" 표시
    //
    // 동사(verb)는 PersonRole에 따라 결정됨:
    //   - VISIONARY → "Visionary founder of" (Company), "Envisioned" (Tech)
    //   - THEORIST → "Co-founded" (Company), "Theorized" (Tech)
    //   - BUILDER → "Built" (Company), "Engineered" (Tech)
    //   - LEADER → "Led" (Company), "Directed" (Tech)
    //   - INVESTOR → "Angel investor in" (Company), "Funded" (Tech)
    //
    // 수정 예시:
    //   - 업적 표시 개수 변경: .slice(0, 3) → .slice(0, 5)
    //   - 기본 문구 변경: `Active since ${node.year}` → `b. ${node.year}`
    // =========================================================================
    if (node.category === Category.PERSON) {
        const verbs = getPersonVerbs(node);
        const achievements = context?.achievements || [];

        if (achievements.length === 0) {
            // 업적이 없을 때의 기본 문구
            return `Active since ${node.year}`;
        }

        // 업적을 포맷팅 (최대 3개)
        const formatted = achievements.slice(0, 3).map(a => {
            if (a.category === Category.COMPANY) {
                // Company 업적: "Visionary founder of Apple (1976)"
                return `${verbs.foundedCompany} ${a.label} (${a.year})`;
            } else if (a.category === Category.TECHNOLOGY) {
                // Technology 업적: "Envisioned iPhone (2007)"
                return `${verbs.createdTech} ${a.label} (${a.year})`;
            }
            // 기타: "iPhone (2007)"
            return `${a.label} (${a.year})`;
        });

        return formatted.join(', ');
    }

    // =========================================================================
    // 💻 TECH_SUBTITLE_FORMAT
    // =========================================================================
    // 현재 로직:
    //   1. creatorLabel이 있으면 → "동사 by 제작자 (연도)" 형식
    //   2. creatorLabel이 없으면 → Fallback 설명 사용
    //
    // 동사(verb)는 TechRole에 따라 결정됨:
    //   - FOUNDATION → "Theorized"
    //   - CORE → "Developed"
    //   - PLATFORM → "Built"
    //   - APPLICATION → "Created" 또는 "Launched" (Digital Services인 경우)
    //
    // Fallback 우선순위:
    //   1. TechRole 기반 설명 (Foundational theory, Core technology 등)
    //   2. TechCategoryL2 값
    //   3. 기본값 "Technology"
    //
    // 수정 예시:
    //   - 연도 표시 제거: return `${verb} by ${creatorLabel}`;
    //   - 제작자 앞에 접두사 추가: return `${verb} @ ${creatorLabel} (${node.year})`;
    // =========================================================================
    if (node.category === Category.TECHNOLOGY) {
        const verb = getTechVerb(node);
        const creatorLabel = context?.creatorLabel;

        if (creatorLabel) {
            // 제작자 정보가 있는 경우
            return `${verb} by ${creatorLabel} (${node.year})`;
        }

        // Fallback: TechRole 또는 카테고리 기반 설명
        const role = node.impactRole;
        const catL2 = node.techCategoryL2 || node.techCategoryL1;

        if (role === 'FOUNDATION') return `Foundational theory (${node.year})`;
        if (role === 'CORE') return `Core technology (${node.year})`;
        if (role === 'PLATFORM') return `Platform (${node.year})`;
        if (role === 'APPLICATION') return `Application (${node.year})`;

        if (catL2) return `${catL2} (${node.year})`;

        return `Technology (${node.year})`;
    }

    // =========================================================================
    // 기본 Fallback (알 수 없는 카테고리)
    // =========================================================================
    return `(${node.year})`;
};
