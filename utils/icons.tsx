/**
 * 아이콘 유틸리티 - LinkType, TechRole에 따른 아이콘 제공
 * 
 * 📌 사용 위치:
 *    - LinksView.tsx: 연결 관계 표시
 *    - DetailPanel.tsx: 상세 정보 표시 (향후)
 *    - MapView.tsx: 그래프 노드 표시 (향후)
 */

import React from 'react';
import { Category, LinkType } from '../types';
import {
    // CREATES icons
    Building2,      // Person → Company (founder)
    Lightbulb,      // Person → Technology (inventor)
    Factory,        // Company → Technology (product)
    GitFork,        // Company → Company (spin-off)

    // POWERS icons
    Zap,            // Tech → Tech (enables)
    Plug,           // Tech → Company (powers business)
    Fuel,           // Company → Tech (resources)

    // CONTRIBUTES icons
    Briefcase,      // Person → Company (employee)
    GitCommit,      // Person → Technology (contributor)
    GraduationCap,  // Person → Person (mentor)
    ArrowRight,     // Tech → Tech (influences)
    CircleDollarSign, // Company → Company (investment)

    // ENGAGES icons
    Handshake,      // Partner
    Swords,         // Rival

    // TechRole icons
    BookOpen,       // Foundation
    Cpu,            // Core
    Layers,         // Platform
    AppWindow,      // Application

    // Default
    Link,
    LucideIcon
} from 'lucide-react';

// ============================================================================
// getLinkIcon: LinkType + Source/Target Category에 따른 아이콘 반환
// ============================================================================
// 
// 📌 수정 방법:
//    - 새 아이콘 추가: LINK_ICON_MAP에 Source_Target 키 추가
//    - 아이콘 변경: 해당 키의 icon 값 변경
//    - 색상 변경: 해당 키의 color 값 변경
//
// ============================================================================

interface LinkIconConfig {
    icon: LucideIcon;
    color: string;      // Tailwind color class (예: 'text-red-500')
    label: string;      // 설명 라벨
}

/**
 * LinkType + Category 조합별 아이콘 매핑
 * 
 * 키 형식: `${LinkType}_${SourceCategory}_${TargetCategory}`
 * 예: 'CREATES_PERSON_COMPANY' = Person이 Company를 창업
 */
const LINK_ICON_MAP: Record<string, LinkIconConfig> = {
    // =========================================================================
    // CREATES (생성 관계)
    // =========================================================================
    'CREATES_PERSON_COMPANY': {
        icon: Building2,
        color: 'text-red-400',
        label: 'Founded'
    },
    'CREATES_PERSON_TECHNOLOGY': {
        icon: Lightbulb,
        color: 'text-amber-400',
        label: 'Invented'
    },
    'CREATES_COMPANY_TECHNOLOGY': {
        icon: Factory,
        color: 'text-emerald-400',
        label: 'Produced'
    },
    'CREATES_COMPANY_COMPANY': {
        icon: GitFork,
        color: 'text-red-400',
        label: 'Spin-off'
    },

    // =========================================================================
    // POWERS (기반/활성화 관계)
    // =========================================================================
    'POWERS_TECHNOLOGY_TECHNOLOGY': {
        icon: Zap,
        color: 'text-yellow-400',
        label: 'Powers'
    },
    'POWERS_TECHNOLOGY_COMPANY': {
        icon: Plug,
        color: 'text-yellow-400',
        label: 'Enables'
    },
    'POWERS_COMPANY_TECHNOLOGY': {
        icon: Fuel,
        color: 'text-orange-400',
        label: 'Funds'
    },

    // =========================================================================
    // CONTRIBUTES (기여 관계)
    // =========================================================================
    'CONTRIBUTES_PERSON_COMPANY': {
        icon: Briefcase,
        color: 'text-blue-400',
        label: 'Worked at'
    },
    'CONTRIBUTES_PERSON_TECHNOLOGY': {
        icon: GitCommit,
        color: 'text-emerald-400',
        label: 'Contributed'
    },
    'CONTRIBUTES_PERSON_PERSON': {
        icon: GraduationCap,
        color: 'text-purple-400',
        label: 'Mentored'
    },
    'CONTRIBUTES_TECHNOLOGY_TECHNOLOGY': {
        icon: ArrowRight,
        color: 'text-slate-400',
        label: 'Influenced'
    },
    'CONTRIBUTES_COMPANY_COMPANY': {
        icon: CircleDollarSign,
        color: 'text-green-400',
        label: 'Invested'
    },

    // =========================================================================
    // ENGAGES (관계 - Partner/Rival)
    // =========================================================================
    'ENGAGES_PARTNER': {
        icon: Handshake,
        color: 'text-blue-500',
        label: 'Partner'
    },
    'ENGAGES_RIVAL': {
        icon: Swords,
        color: 'text-amber-500',
        label: 'Rival'
    },
};

/**
 * LinkType별 기본 아이콘 (Source/Target 조합이 없을 때)
 */
const LINK_TYPE_DEFAULT: Record<LinkType, LinkIconConfig> = {
    [LinkType.CREATES]: { icon: Lightbulb, color: 'text-amber-400', label: 'Created' },
    [LinkType.POWERS]: { icon: Zap, color: 'text-yellow-400', label: 'Powers' },
    [LinkType.CONTRIBUTES]: { icon: GitCommit, color: 'text-emerald-400', label: 'Contributed' },
    [LinkType.ENGAGES]: { icon: Link, color: 'text-slate-400', label: 'Connected' },
};

/**
 * Link 아이콘 정보 반환
 * 
 * @param linkType - CREATES, POWERS, CONTRIBUTES, ENGAGES
 * @param sourceCategory - 소스 노드 카테고리
 * @param targetCategory - 타겟 노드 카테고리
 * @param engagesIcon - ENGAGES의 경우 'HEART'(Partner) 또는 'RIVALRY'(Rival)
 */
export const getLinkIconConfig = (
    linkType: LinkType,
    sourceCategory?: Category,
    targetCategory?: Category,
    engagesIcon?: string
): LinkIconConfig => {
    // ENGAGES: Partner/Rival 처리
    if (linkType === LinkType.ENGAGES) {
        if (engagesIcon === 'HEART') return LINK_ICON_MAP['ENGAGES_PARTNER'];
        if (engagesIcon === 'RIVALRY') return LINK_ICON_MAP['ENGAGES_RIVAL'];
        return LINK_TYPE_DEFAULT[LinkType.ENGAGES];
    }

    // Source/Target 조합으로 조회
    if (sourceCategory && targetCategory) {
        const key = `${linkType}_${sourceCategory}_${targetCategory}`;
        if (LINK_ICON_MAP[key]) {
            return LINK_ICON_MAP[key];
        }
    }

    // 기본값 반환
    return LINK_TYPE_DEFAULT[linkType];
};

/**
 * Link 아이콘 컴포넌트 반환 (JSX)
 */
export const getLinkIcon = (
    linkType: LinkType,
    sourceCategory?: Category,
    targetCategory?: Category,
    engagesIcon?: string,
    className?: string
): React.ReactNode => {
    const config = getLinkIconConfig(linkType, sourceCategory, targetCategory, engagesIcon);
    const Icon = config.icon;
    return <Icon className={className || `w-4 h-4 ${config.color}`} />;
};

// ============================================================================
// getTechRoleIcon: TechRole에 따른 아이콘 반환
// ============================================================================
//
// 📌 수정 방법:
//    - 아이콘 변경: TECH_ROLE_ICON_MAP에서 해당 role의 icon 변경
//    - 색상 변경: color 값 변경
//
// ============================================================================

interface TechRoleIconConfig {
    icon: LucideIcon;
    color: string;
    label: string;
}

const TECH_ROLE_ICON_MAP: Record<string, TechRoleIconConfig> = {
    'FOUNDATION': {
        icon: BookOpen,
        color: 'text-purple-400',
        label: 'Foundation'
    },
    'CORE': {
        icon: Cpu,
        color: 'text-blue-400',
        label: 'Core'
    },
    'PLATFORM': {
        icon: Layers,
        color: 'text-orange-400',
        label: 'Platform'
    },
    'APPLICATION': {
        icon: AppWindow,
        color: 'text-emerald-400',
        label: 'Application'
    },
};

/**
 * TechRole 아이콘 설정 반환
 */
export const getTechRoleIconConfig = (role?: string): TechRoleIconConfig | null => {
    if (!role) return null;
    return TECH_ROLE_ICON_MAP[role] || null;
};

/**
 * TechRole 아이콘 컴포넌트 반환 (JSX)
 */
export const getTechRoleIcon = (
    role?: string,
    className?: string
): React.ReactNode | null => {
    const config = getTechRoleIconConfig(role);
    if (!config) return null;

    const Icon = config.icon;
    return <Icon className={className || `w-4 h-4 ${config.color}`} />;
};
