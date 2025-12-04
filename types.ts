
export enum Category {
  COMPANY = 'COMPANY',
  PERSON = 'PERSON',
  TECHNOLOGY = 'TECHNOLOGY',
  EPISODE = 'EPISODE',
}

export enum LinkType {
  DEPENDENCY = 'DEPENDENCY', // User -> Supplier (Weighted Lower for Infra)
  MAKER = 'MAKER',           // Creator -> Creation (Weighted Higher for Product)
  INFLUENCE = 'INFLUENCE',   // Cause -> Effect
  BELONGING = 'BELONGING',   // Member -> Group
}

export enum LinkDirection {
  FORWARD = 'FORWARD', // Source -> Target
  REVERSE = 'REVERSE', // Target -> Source
}

// --- NEW ROLE DEFINITIONS ---
export enum CompanyRole {
  PLATFORM = 'PLATFORM', // High impact (Google, Apple, Microsoft)
  LAB = 'LAB',           // Research focused (OpenAI, Bell Labs)
  INFRA = 'INFRA',       // Supply chain/Hardware (TSMC, ASML) - Score dampened
  SERVICE = 'SERVICE',   // Service providers
  PRODUCT = 'PRODUCT',   // Consumer Hardware (iRobot, DJI, GoPro)
}

export enum PersonRole {
  VISIONARY = 'VISIONARY', // Founders/CEOs (Jobs, Gates)
  THEORIST = 'THEORIST',   // Inventors/Academics (Turing, Hinton) - Score boosted
  BUILDER = 'BUILDER',     // Engineers/Architects (Wozniak, Ritchie)
}

export enum TechRole {
  PRODUCT = 'PRODUCT',   // Consumer facing (iPhone, ChatGPT) - Score boosted
  CORE = 'CORE',         // Underlying tech (Transformer, PageRank)
  STANDARD = 'STANDARD', // Protocols (HTTP, x86)
  PLATFORM = 'PLATFORM', // Added for Platforms like Android/CUDA
}

export enum EpisodeRole {
  MILESTONE = 'MILESTONE', // Launch, Breakthrough - High weight
  DEAL = 'DEAL',           // Acquisition, Investment - Low weight
  CRISIS = 'CRISIS',       // Scandal, Failure
}

export type Role = CompanyRole | PersonRole | TechRole | EpisodeRole;

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
  | 'AI & Physical Systems';

export type TechCategoryL2 =
  | 'Processors & Compute' | 'Devices & Form Factors' | 'Memory & Storage' | 'Components & Manufacturing'
  | 'Operating Systems (OS)' | 'Development & Languages'
  | 'Telecommunications' | 'Network Architecture'
  | 'Search & Information' | 'Social & Media' | 'Digital Platforms'
  | 'Artificial Intelligence' | 'Autonomous Mobility' | 'Robotics' | 'Fintech & Crypto' | 'Spatial Computing';

export interface NodeData {
  id: string;
  label: string;
  category: Category;
  year: number;
  description: string;
  image?: string;
  radius?: number;
  importance: number; // Now required

  // Specific Role Classification
  roleType?: Role; // Optional because not all nodes might have it initially (though we enforce it)

  // Search & SEO
  keywords?: string[];
  techCategoryL1?: TechCategoryL1;
  techCategoryL2?: TechCategoryL2;

  role?: string; // For Person (e.g. "Founder", "CEO")
  externalLinks?: ExternalLink[];

  // Computed Properties (Impact Factor)
  _score?: number;
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
}

export interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
  label?: string;
  type: LinkType;
  direction: LinkDirection;
  strength: number;
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

export interface AIResponse {
  summary: string;
  significance: string;
  keyFacts: string[];
}