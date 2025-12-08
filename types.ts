
export enum Category {
  COMPANY = 'COMPANY',
  PERSON = 'PERSON',
  TECHNOLOGY = 'TECHNOLOGY',
}

export enum LinkType {
  POWERS = 'POWERS',           // Dependency, Infrastructure, Foundation
  CREATES = 'CREATES',         // Creation, Launch, Founding
  CONTRIBUTES = 'CONTRIBUTES', // Evolution, Influence, Inspiration
  ENGAGES = 'ENGAGES',         // Interaction, Rivalry, Partnership
}

// ArrowHead: 화살표 표시 방식
export enum ArrowHead {
  SINGLE = 'SINGLE',   // ──►
  DOUBLE = 'DOUBLE',   // ◄──►
  NONE = 'NONE',       // ─────
}

// LinkIcon: 선 중앙 아이콘 (optional)
export enum LinkIcon {
  NONE = 'NONE',       // 아이콘 없음
  HEART = 'HEART',     // ❤️ Co-op/Partnership
  RIVALRY = 'RIVALRY', // 🥊 Competition/Rivalry
  POWERS = 'POWERS',   // ⚡ Infrastructure/Foundation
  SPARK = 'SPARK',     // ✨ Innovation/Creation
}

// --- NEW ROLE DEFINITIONS ---
// CompanyRole removed as per request

export enum PersonRole {
  VISIONARY = 'VISIONARY', // Founders/CEOs (Jobs, Gates)
  THEORIST = 'THEORIST',   // Inventors/Academics (Turing, Hinton) - Score boosted
  BUILDER = 'BUILDER',     // Engineers/Architects (Wozniak, Ritchie)
  LEADER = 'LEADER',       // Corporate Leaders/Executives
  INVESTOR = 'INVESTOR',   // VCs/Investors
}

export enum TechRole {
  L0_THEORY_PHYSICS = 'FOUNDATION',         // Underlying tech (Transformer, PageRank)
  L1_CORE_HARDWARE = 'CORE', // Protocols (HTTP, x86)
  L2_RUNTIME_PLATFORM = 'PLATFORM', // Added for Platforms like Android/CUDA
  L3_END_APPLICATION = 'APPLICATION',   // Consumer facing (iPhone, ChatGPT) - Score boosted
}

export type Role = PersonRole | TechRole;

export type CompanyMode = 'FULL' | 'MINIMAL' | 'HIDDEN';

export interface ExternalLink {
  type: 'YOUTUBE' | 'WIKIPEDIA' | 'BLOG' | 'BOOK' | 'OTHER';
  url: string;
  label: string;
}

export type TechCategoryL1 =
  | 'Hardware & Infrastructure'
  | 'System Software'
  | 'Network & Connectivity'
  | 'Digital Services & Platforms'
  | 'AI & Physical Systems'
  | 'Fundamental Concepts';          // NEW: Theories, laws, standards

export type TechCategoryL2 =
  | 'Processors & Compute' | 'Devices & Form Factors' | 'Memory & Storage' | 'Components & Manufacturing'
  | 'Operating Systems (OS)' | 'Development & Languages'
  | 'Telecommunications' | 'Network Architecture'
  | 'Search & Information' | 'Social & Media' | 'Digital Platforms'
  | 'Artificial Intelligence' | 'Autonomous Mobility' | 'Robotics' | 'Fintech & Crypto' | 'Spatial Computing'
  // Fundamental Concepts L2
  | 'Theories & Architectures'       // ISA designs (RISC, x86, ARM)
  | 'Laws & Principles'              // Moore's Law, etc.
  | 'Standards & Protocols';         // PDF, VoIP, WebRTC, UPC

export enum CompanyCategory {
  PLATFORM_INTERNET = 'PLATFORM_INTERNET', // Network Effects (Google, Meta, PayPal)
  ENTERPRISE_SAAS = 'ENTERPRISE_SAAS',     // Productivity Tools (Microsoft, Adobe)
  AI_INNOVATION = 'AI_INNOVATION',         // Models & Intelligence (OpenAI)
  HARDWARE_ROBOTICS = 'HARDWARE_ROBOTICS', // Physical Devices (Apple, Tesla)
  SEMICONDUCTOR = 'SEMICONDUCTOR',         // Chips (Nvidia, TSMC)
  MEDIA_CONTENT = 'MEDIA_CONTENT',         // Entertainment (Netflix)
  INFRA_TELECOM = 'INFRA_TELECOM',         // Backbone (Cisco, AT&T)
  VENTURE_CAPITAL = 'VENTURE_CAPITAL',     // Funding (Sequoia)
  ACADEMY_LAB = 'ACADEMY_LAB',             // Research Institutes & Labs
  MANUFACTURING_SUPPLY = 'MANUFACTURING_SUPPLY', // Supply chain & Manufacturing
  CONSUMER_DEVICE = 'CONSUMER_DEVICE',     // Consumer Electronics
}

export interface NodeData {
  id: string;
  label: string;
  companyCategories?: CompanyCategory[];
  category: Category;
  year: number;
  description: string;
  image?: string;
  radius?: number;
  // Role Classification
  impactRole?: Role;

  // Search & SEO
  keywords?: string[];
  techCategoryL1?: TechCategoryL1;
  techCategoryL2?: TechCategoryL2;

  externalLinks?: ExternalLink[];

  // === NEW: Person Specific ===
  primaryRole?: string;   // e.g. "CEO of Tesla"
  secondaryRole?: string; // e.g. "CEO of SpaceX" (Optional)
  birthYear?: number;
  deathYear?: number;     // undefined = "Present"

  // === NEW: Company Specific ===
  marketCap?: {
    current?: string;     // e.g. "$1.5T"
    peak?: string;        // e.g. "$3.0T"
  };

  // === NEW: Technology Specific ===
  endYear?: number;       // For lifecycle display (undefined = "Present")

  // Computed Properties
  _radius?: number;
  _zoneRadius?: number;

  // D3 Simulation Properties
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  // Focus Mode Distance (0=focused, 1=1st-degree, 2=2nd-degree)
  _focusDistance?: number;
}

export interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
  label?: string;
  type: LinkType;
  arrow: ArrowHead;
  icon?: LinkIcon;
  strength: number;

  // Optional: Relationship Story & Timeline
  story?: string;       // e.g., "Jobs returned to Apple and started the turnaround"
  startYear?: number;   // When the relationship started
  endYear?: number;     // When it ended (undefined = ongoing)
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

export interface AIResponse {
  summary: string;
  significance: string;
  keyFacts: string[];
  entity?: string;
  category?: string;
  year?: number | string;
}
