import { Category, GraphData, LinkType, LinkDirection, NodeData, LinkData, CompanyRole, PersonRole, TechRole, EpisodeRole, CompanyCategory, Role, TechCategoryL1, TechCategoryL2 } from './types';

// Visual Colors mapped to categories
export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.COMPANY]: '#ef4444', // Red
  [Category.PERSON]: '#3b82f6',  // Blue
  [Category.TECHNOLOGY]: '#10b981', // Emerald
  [Category.EPISODE]: '#8b5cf6', // Violet
};

// Company Category Colors for visual differentiation
export const COMPANY_CATEGORY_COLORS: Record<CompanyCategory, string> = {
  [CompanyCategory.PLATFORM_INTERNET]: '#14b8a6', // Teal
  [CompanyCategory.ENTERPRISE_SAAS]: '#3b82f6',   // Blue
  [CompanyCategory.AI_INNOVATION]: '#8b5cf6',     // Violet
  [CompanyCategory.HARDWARE_ROBOTICS]: '#f97316', // Orange
  [CompanyCategory.SEMICONDUCTOR]: '#ef4444',     // Red
  [CompanyCategory.MEDIA_CONTENT]: '#ec4899',     // Pink
  [CompanyCategory.INFRA_TELECOM]: '#64748b',     // Slate
  [CompanyCategory.VENTURE_CAPITAL]: '#22c55e',   // Green
};

// Company Category Weights for Impact Score
export const CATEGORY_WEIGHTS: Record<CompanyCategory, number> = {
  [CompanyCategory.PLATFORM_INTERNET]: 1.2,
  [CompanyCategory.HARDWARE_ROBOTICS]: 1.1,
  [CompanyCategory.AI_INNOVATION]: 1.1,
  [CompanyCategory.ENTERPRISE_SAAS]: 1.0,
  [CompanyCategory.SEMICONDUCTOR]: 0.9,
  [CompanyCategory.MEDIA_CONTENT]: 0.9,
  [CompanyCategory.INFRA_TELECOM]: 0.8,
  [CompanyCategory.VENTURE_CAPITAL]: 0.6,
};

// Company Category Labels for UI display
export const CATEGORY_LABELS: Record<CompanyCategory, string> = {
  [CompanyCategory.PLATFORM_INTERNET]: 'Platform & Internet',
  [CompanyCategory.ENTERPRISE_SAAS]: 'Enterprise & SaaS',
  [CompanyCategory.AI_INNOVATION]: 'AI & Innovation',
  [CompanyCategory.HARDWARE_ROBOTICS]: 'Hardware & Robotics',
  [CompanyCategory.SEMICONDUCTOR]: 'Semiconductor',
  [CompanyCategory.MEDIA_CONTENT]: 'Media & Content',
  [CompanyCategory.INFRA_TELECOM]: 'Infra & Telecom',
  [CompanyCategory.VENTURE_CAPITAL]: 'Venture Capital',
};

// Era definitions for History View timeline
export const ERAS = [
  { id: 'genesis', label: 'THE GENESIS', startYear: 1885, endYear: 1939 },
  { id: 'dawn', label: 'THE SILICON DAWN', startYear: 1940, endYear: 1969 },
  { id: 'pc', label: 'THE PC REVOLUTION', startYear: 1970, endYear: 1990 },
  { id: 'internet', label: 'THE INTERNET AGE', startYear: 1991, endYear: 2006 },
  { id: 'mobile', label: 'THE MOBILE REVOLUTION', startYear: 2007, endYear: 2011 },
  { id: 'ai_early', label: 'THE RISE OF AI', startYear: 2012, endYear: 2022 },
  { id: 'ai_renaissance', label: 'THE AI RENAISSANCE', startYear: 2023, endYear: 2099 },
];

// --- DATA BUILDER HELPERS ---

const nodes: NodeData[] = [];
const links: LinkData[] = [];

// Extended helper with metadata support
const createCompany = (
  id: string, label: string, year: number, importance: number, impactRole: CompanyRole, description: string,
  companyCategory: CompanyCategory,
  meta?: { marketCap?: { current?: string; peak?: string } }
) => {
  nodes.push({ id, label, category: Category.COMPANY, year, importance, impactRole, description, companyCategories: [companyCategory], ...meta });
};

const createPerson = (
  id: string, label: string, year: number, importance: number, impactRole: PersonRole, description: string,
  meta?: { primaryRole?: string; secondaryRole?: string; birthYear?: number; deathYear?: number }
) => {
  nodes.push({ id, label, category: Category.PERSON, year, importance, impactRole, description, ...meta });
};

const createTech = (
  id: string, label: string, year: number, importance: number, impactRole: TechRole, description: string,
  l1?: TechCategoryL1, l2?: TechCategoryL2,
  meta?: { endYear?: number }
) => {
  nodes.push({ id, label, category: Category.TECHNOLOGY, year, importance, impactRole, description, techCategoryL1: l1, techCategoryL2: l2, ...meta });
};

const createEpisode = (
  id: string, label: string, year: number, importance: number, impactRole: EpisodeRole, description: string,
  meta?: { eventType?: string; impactScale?: string }
) => {
  nodes.push({ id, label, category: Category.EPISODE, year, importance, impactRole, description, ...meta });
};

const linkCreated = (source: string, target: string, strength: number = 0.9) => {
  links.push({ source, target, type: LinkType.CREATED, direction: LinkDirection.FORWARD, strength });
};

const linkBasedOn = (source: string, target: string, strength: number = 1.0) => {
  links.push({ source, target, type: LinkType.BASED_ON, direction: LinkDirection.FORWARD, strength });
};

const linkPartOf = (source: string, target: string, strength: number = 0.8) => {
  links.push({ source, target, type: LinkType.PART_OF, direction: LinkDirection.FORWARD, strength });
};

const linkInfluenced = (source: string, target: string, strength: number = 0.5) => {
  links.push({ source, target, type: LinkType.INFLUENCED, direction: LinkDirection.FORWARD, strength });
};


// --- DATA ENTRY START ---

// ==========================================
// ERA 0: FOUNDATIONS
// ==========================================
createPerson('turing', 'Alan Turing', 1950, 1, PersonRole.THEORIST, 'Pioneered theoretical computer science and AI concepts like the Turing Machine.', { primaryRole: 'Creator of the Turing Machine', secondaryRole: 'Father of Computer Science', birthYear: 1912, deathYear: 1954 });
createPerson('mccarthy', 'John McCarthy', 1956, 1, PersonRole.THEORIST, 'Founding father of AI who developed the Lisp language and time-sharing systems.', { primaryRole: 'Creator of Artificial Intelligence', birthYear: 1927, deathYear: 2011 });
createPerson('von_neumann', 'John von Neumann', 1945, 1, PersonRole.THEORIST, 'Polymath who established the architectural framework for modern digital computers.', { primaryRole: 'Mathematician & Computer Scientist', birthYear: 1903, deathYear: 1957 });
createEpisode('dartmouth', 'Dartmouth Workshop', 1956, 2, EpisodeRole.MILESTONE, 'The birth of AI as a field. McCarthy, Minsky, Shannon, and Rochester attended.', { eventType: 'Conference', impactScale: 'Birth of AI Field' });

linkPartOf('mccarthy', 'dartmouth');
linkInfluenced('turing', 'mccarthy', 0.8);

// ==========================================
// ERA 5: THE AI RACE
// ==========================================

// AMD - The Challenger
createCompany('amd', 'AMD', 1969, 1, CompanyRole.INFRA, 'High-performance computing leader, rivaling Intel with Ryzen and EPYC chips.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$220B', peak: '$260B' } });
createPerson('lisa_su', 'Lisa Su', 2014, 2, PersonRole.LEADER, 'Resurrected AMD from near-bankruptcy to a leader in high-performance computing.', { primaryRole: 'CEO of AMD', birthYear: 1969 });
createTech('ryzen', 'AMD Ryzen', 2017, 2, TechRole.PRODUCT, 'Revolutionary CPU architecture that challenged Intel\'s market dominance.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('epyc', 'AMD EPYC', 2017, 2, TechRole.PRODUCT, 'Server processors that broke Intel\'s data center monopoly.', 'Hardware & Infrastructure', 'Processors & Compute');

linkPartOf('lisa_su', 'amd');
linkCreated('amd', 'ryzen');
linkCreated('amd', 'epyc');
// AMD uses TSMC for chip manufacturing - Linked via Products
linkBasedOn('ryzen', 'tsmc');
linkBasedOn('epyc', 'tsmc');

// TSMC customer dependencies
// Qualcomm manufactures Snapdragon at TSMC - Linked via Product
linkBasedOn('snapdragon', 'tsmc');
// Broadcom chips manufactured at TSMC
// linkBasedOn('broadcom', 'tsmc'); // Removed direct link, need product or leave implicit

// Intel uses TSMC for some products
// linkBasedOn('intel', 'tsmc'); // Removed direct link

// ==========================================
// ERA 1: THE GENESIS
// ==========================================

createCompany('att', 'AT&T', 1885, 2, CompanyRole.PLATFORM, 'Telecommunications monopoly that birthed the transistor, Unix, and the cell phone.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: '$140B', peak: '$310B' } });
createPerson('alexander_graham_bell', 'Alexander Graham Bell', 1885, 1, PersonRole.VISIONARY, 'Revolutionized global communication methods with the invention of the telephone.', { primaryRole: 'Co-founder of AT&T', secondaryRole: 'Inventor of Telephone', birthYear: 1847, deathYear: 1922 });
createEpisode('att_breakup', 'The Breakup', 1984, 2, EpisodeRole.MILESTONE, 'Antitrust ruling splitting AT&T, fostering competition in telecom.', { eventType: 'Antitrust', impactScale: 'Industry Restructure' });

linkCreated('alexander_graham_bell', 'att');
linkPartOf('att_breakup', 'att');

createPerson('shockley', 'William Shockley', 1947, 2, PersonRole.THEORIST, 'Brilliant physicist whose controversial management style sparked the Traitorous Eight.', { primaryRole: 'Co-inventor of Transistor', birthYear: 1910, deathYear: 1989 });
createPerson('shannon', 'Claude Shannon', 1948, 1, PersonRole.THEORIST, 'Established the mathematical foundations of digital communication and information.', { primaryRole: 'Creator of Information Theory', birthYear: 1916, deathYear: 2001 });
createPerson('ritchie', 'Dennis Ritchie', 1972, 1, PersonRole.BUILDER, 'Architect of the C language and Unix, laying the software foundations for the world.', { primaryRole: 'Creator of C Language', secondaryRole: 'Co-creator of Unix', birthYear: 1941, deathYear: 2011 });
createPerson('thompson', 'Ken Thompson', 1969, 2, PersonRole.BUILDER, 'Mastermind behind the B language, UTF-8 encoding, and co-creation of Unix.', { primaryRole: 'Co-creator of Unix', secondaryRole: 'Creator of Go', birthYear: 1943 });
createPerson('bardeen', 'John Bardeen', 1947, 1, PersonRole.THEORIST, 'Only two-time Nobel Laureate in Physics for the transistor and superconductivity.', { primaryRole: 'Co-inventor of Transistor', birthYear: 1908, deathYear: 1991 });
createPerson('brattain', 'Walter Brattain', 1947, 2, PersonRole.THEORIST, 'Experimental physicist who built the first working point-contact transistor.', { primaryRole: 'Co-inventor of Transistor', birthYear: 1902, deathYear: 1987 });

createTech('transistor', 'Transistor', 1947, 1, TechRole.CORE, 'Semiconductor device used to amplify or switch electrical signals.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('unix', 'Unix', 1969, 2, TechRole.STANDARD, 'Portable, multi-user operating system that inspired Linux and macOS.', 'System Software', 'Operating Systems (OS)');
createTech('c_language', 'C Language', 1972, 1, TechRole.STANDARD, 'Foundational programming language for system software.', 'System Software', 'Development & Languages');
createTech('laser', 'Laser', 1958, 1, TechRole.CORE, 'Light Amplification by Stimulated Emission of Radiation - revolutionized communications, medicine, and manufacturing.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('ccd', 'CCD', 1969, 2, TechRole.CORE, 'Charge-Coupled Device - enabled digital imaging and modern cameras.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('cdma', 'CDMA', 1989, 2, TechRole.STANDARD, 'Code Division Multiple Access - wireless communication standard that enabled modern mobile networks.', 'Network & Connectivity', 'Telecommunications');
createTech('solar_cell', 'Solar Cell', 1954, 2, TechRole.CORE, 'First practical photovoltaic cell, converting sunlight to electricity.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('mosfet', 'MOSFET', 1959, 1, TechRole.CORE, 'Metal-Oxide-Semiconductor Field-Effect Transistor - the most common transistor in modern chips.', 'Hardware & Infrastructure', 'Components & Manufacturing');

// Bell Labs belongs to AT&T
// linkPartOf('bell_labs', 'att'); // Removed direct link

// People at Bell Labs (Linked to AT&T)
linkPartOf('shockley', 'att');
linkPartOf('shannon', 'att');
linkPartOf('ritchie', 'att');
linkPartOf('thompson', 'att');
linkPartOf('bardeen', 'att');
linkPartOf('brattain', 'att');

// Bell Labs innovations (Linked to AT&T now)
linkCreated('att', 'transistor');
linkCreated('att', 'unix');
linkCreated('att', 'c_language');
linkCreated('att', 'laser');
linkCreated('att', 'ccd');
linkCreated('att', 'cdma');
linkCreated('att', 'solar_cell');
linkCreated('att', 'mosfet');

// Individual creators
linkCreated('ritchie', 'unix');
linkCreated('thompson', 'unix');
linkCreated('ritchie', 'c_language');
linkCreated('bardeen', 'transistor');
linkCreated('brattain', 'transistor');
linkCreated('shockley', 'transistor');

// Technology influences
linkBasedOn('unix', 'c_language'); // Unix rewritten in C
// Note: C++ linkBasedOn is in the AI section (line ~815)
linkInfluenced('transistor', 'mosfet', 0.9); // MOSFET is evolution of transistor

// Shannon's influence
linkPartOf('shannon', 'dartmouth');

// Transistor's fundamental influence
linkInfluenced('transistor', 'integrated_circuit', 0.95);

createCompany('ibm', 'IBM', 1911, 1, CompanyRole.PLATFORM, 'Big Blue. The dominant force in computing for most of the 20th century.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$200B', peak: '$260B' } });
createTech('mainframe', 'Mainframe', 1952, 2, TechRole.PRODUCT, 'High-performance computers for large-scale data processing.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('deep_blue', 'Deep Blue', 1997, 2, TechRole.PRODUCT, 'Chess-playing computer that defeated world champion Garry Kasparov.', 'AI & Physical Systems', 'Artificial Intelligence');
createEpisode('kasparov_match', 'Kasparov vs Deep Blue', 1997, 2, EpisodeRole.MILESTONE, 'First defeat of a reigning world chess champion by a computer.', { eventType: 'Competition', impactScale: 'AI Milestone' });

linkCreated('ibm', 'mainframe');
linkCreated('ibm', 'deep_blue');
linkPartOf('deep_blue', 'kasparov_match');
linkPartOf('kasparov_match', 'ibm');
linkInfluenced('von_neumann', 'mainframe', 0.6);

createCompany('fairchild', 'Fairchild Semi', 1957, 2, CompanyRole.LAB, 'The "mother ship" of Silicon Valley created by the Traitorous Eight.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: 'Acquired', peak: '$2.4B' } });
createPerson('noyce', 'Robert Noyce', 1968, 1, PersonRole.VISIONARY, 'The "Mayor of Silicon Valley" who co-invented the IC and instituted casual culture.', { primaryRole: 'Co-founder of Intel', secondaryRole: 'Co-inventor of IC', birthYear: 1927, deathYear: 1990 });
createPerson('moore', 'Gordon Moore', 1968, 1, PersonRole.VISIONARY, 'Correctly predicted the exponential growth of computing power that drove the industry.', { primaryRole: 'Co-founder of Intel', secondaryRole: "Author of Moore's Law", birthYear: 1929, deathYear: 2023 });
createEpisode('traitorous_eight', 'The Traitorous Eight', 1957, 2, EpisodeRole.MILESTONE, 'Eight engineers leave Shockley Lab to found Fairchild Semiconductor.', { eventType: 'Spinoff', impactScale: 'Birth of Silicon Valley' });
createTech('ic', 'Integrated Circuit', 1959, 1, TechRole.CORE, 'Set of electronic circuits on one small flat piece of semiconductor material.', 'Hardware & Infrastructure', 'Processors & Compute');

linkCreated('noyce', 'fairchild');
linkCreated('moore', 'fairchild');
linkCreated('fairchild', 'ic');
linkInfluenced('shockley', 'traitorous_eight');
linkInfluenced('traitorous_eight', 'fairchild');

createCompany('ti', 'Texas Instruments', 1930, 2, CompanyRole.INFRA, 'Pioneer of the integrated circuit and handheld calculators.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$180B', peak: '$200B' } });
createPerson('kilby', 'Jack Kilby', 1958, 2, PersonRole.THEORIST, 'Built the first working integrated circuit while at Texas Instruments.', { primaryRole: 'Inventor of IC', secondaryRole: 'Nobel Laureate (Physics)', birthYear: 1923, deathYear: 2005 });

createTech('ti_calculator', 'Handheld Calculator', 1967, 2, TechRole.PRODUCT, 'First handheld electronic calculator, democratizing computation.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('dsp', 'DSP Chip', 1982, 2, TechRole.CORE, 'Specialized microprocessor for digital signal processing.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('ttl_logic', 'TTL Logic', 1964, 2, TechRole.STANDARD, 'Transistor-Transistor Logic - became the industry standard for digital logic circuits.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('tms1000', 'TMS1000 Microcontroller', 1974, 2, TechRole.PRODUCT, 'First commercially successful microcontroller for embedded apps.', 'Hardware & Infrastructure', 'Components & Manufacturing');

createEpisode('ic_patent_battle', 'IC Patent Battle', 1966, 2, EpisodeRole.MILESTONE, 'Legal dispute between TI (Kilby) and Fairchild (Noyce) over IC invention.', { eventType: 'Lawsuit', impactScale: 'Patent Precedent' });

linkPartOf('kilby', 'ti');
linkCreated('ti', 'ic');
linkCreated('kilby', 'ic');
linkCreated('ti', 'ti_calculator');
linkCreated('ti', 'dsp');
linkCreated('ti', 'ttl_logic');
linkCreated('ti', 'tms1000');

// IC Patent Battle
linkPartOf('ic_patent_battle', 'ti');
linkPartOf('ic_patent_battle', 'fairchild');
linkInfluenced('ic_patent_battle', 'ic', 0.3);

// Technology influences
linkBasedOn('ti_calculator', 'ic');
linkBasedOn('dsp', 'microprocessor', 0.7);
linkInfluenced('tms1000', 'microprocessor', 0.5);
linkBasedOn('ttl_logic', 'transistor');

createCompany('intel', 'Intel', 1968, 1, CompanyRole.INFRA, 'Inventor of the microprocessor and x86 architecture.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$110B', peak: '$290B' } });
createPerson('andy_grove', 'Andy Grove', 1979, 2, PersonRole.LEADER, 'Transformed Intel into a microprocessor powerhouse through disciplined management.', { primaryRole: 'Former CEO of Intel', birthYear: 1936, deathYear: 2016 });
createPerson('faggin', 'Federico Faggin', 1971, 2, PersonRole.BUILDER, 'Led the design of the Intel 4004, the world\'s first commercial microprocessor.', { primaryRole: 'Designer of Intel 4004', birthYear: 1941 });
createPerson('gelsinger', 'Pat Gelsinger', 2021, 1, PersonRole.LEADER, 'Returned to Intel to drive its IDM 2.0 strategy and foundry ambitions.', { primaryRole: 'CEO of Intel', birthYear: 1961 });

createTech('microprocessor', 'Microprocessor (4004)', 1971, 1, TechRole.CORE, 'First commercially available microprocessor (Intel 4004).', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('x86', 'x86 Architecture', 1978, 1, TechRole.CORE, 'Complex instruction set architecture dominating personal computing.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('pentium', 'Pentium', 1993, 2, TechRole.PRODUCT, 'Brand of x86-compatible microprocessors introduced by Intel in 1993.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('core_processor', 'Intel Core', 2006, 2, TechRole.PRODUCT, 'High-performance multi-core processor line replacing Pentium.', 'Hardware & Infrastructure', 'Processors & Compute');

createTech('moores_law', 'Moore\'s Law', 1965, 1, TechRole.STANDARD, 'Observation that transistor count doubles every two years.', 'Fundamental Concepts', 'Laws & Principles');

createEpisode('intel_inside', 'Intel Inside Campaign', 1991, 2, EpisodeRole.MILESTONE, 'Marketing campaign that made a component manufacturer a household name.', { eventType: 'Marketing', impactScale: 'Brand Revolution' });
createEpisode('pentium_bug', 'Pentium FDIV Bug', 1994, 3, EpisodeRole.CRISIS, 'Floating-point division flaw leading to a $475M recall.', { eventType: 'Crisis', impactScale: '$475M Recall' });
createEpisode('memory_to_cpu', 'Memory to Microprocessor Pivot', 1985, 2, EpisodeRole.MILESTONE, 'Intel\'s strategic exit from DRAM to focus on microprocessors.', { eventType: 'Pivot', impactScale: 'Strategic Shift' });
createEpisode('tick_tock', 'Tick-Tock Strategy', 2007, 3, EpisodeRole.MILESTONE, 'Manufacturing model alternating between process shrinks and new architectures.', { eventType: 'Strategy', impactScale: 'Manufacturing Model' });

linkCreated('noyce', 'intel');
linkCreated('moore', 'intel');
linkPartOf('andy_grove', 'intel');
linkPartOf('faggin', 'intel');
linkPartOf('gelsinger', 'intel');

linkCreated('intel', 'microprocessor');
linkCreated('faggin', 'microprocessor');
linkCreated('intel', 'x86');
linkCreated('intel', 'pentium');
linkCreated('intel', 'core_processor');
linkCreated('moore', 'moores_law');

// Technology evolution
linkInfluenced('ic', 'microprocessor');
linkInfluenced('microprocessor', 'x86', 0.9);
linkBasedOn('pentium', 'x86');
linkBasedOn('core_processor', 'x86');
linkInfluenced('pentium', 'core_processor', 0.7);

// Episodes - Intel initiated these
linkInfluenced('intel', 'intel_inside'); // Intel's marketing campaign
linkInfluenced('intel', 'pentium_bug'); // Intel caused the bug
linkInfluenced('intel', 'memory_to_cpu'); // Intel's strategic pivot
linkInfluenced('intel', 'tick_tock'); // Intel's manufacturing strategy
linkInfluenced('memory_to_cpu', 'microprocessor', 0.5);

// Moore's Law influence on industry
linkInfluenced('moores_law', 'ic', 0.8);
linkInfluenced('moores_law', 'microprocessor', 0.8);

// ==========================================
// ERA 2: PERSONAL COMPUTING & OS
// ==========================================

createCompany('xerox', 'Xerox PARC', 1970, 2, CompanyRole.LAB, 'Research center that invented the GUI, mouse, and Ethernet.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: '$1.6B', peak: '$150B' } });
createPerson('kay', 'Alan Kay', 1970, 2, PersonRole.THEORIST, 'Visionary behind object-oriented programming and the graphical user interface.', { primaryRole: 'Creator of OOP', secondaryRole: 'Pioneer of GUI', birthYear: 1940 });
createTech('gui', 'GUI', 1973, 2, TechRole.CORE, 'Visual way of interacting with a computer using items like icons and menus.', 'System Software', 'Operating Systems (OS)');
linkPartOf('kay', 'xerox');
linkCreated('xerox', 'gui');

createCompany('apple', 'Apple', 1976, 1, CompanyRole.PLATFORM, 'Creator of the Mac, iPhone, and iPad, emphasizing design and user experience.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$3.5T', peak: '$3.5T' } });
createPerson('jobs', 'Steve Jobs', 1976, 1, PersonRole.VISIONARY, 'Creative genius who redefined personal computing, music, phones, and tablets.', { primaryRole: 'Co-founder of Apple', secondaryRole: 'CEO of Pixar', birthYear: 1955, deathYear: 2011 });
createPerson('wozniak', 'Steve Wozniak', 1976, 2, PersonRole.BUILDER, 'Engineering wizard who single-handedly designed the Apple I and Apple II.', { primaryRole: 'Co-founder of Apple', birthYear: 1950 });
createPerson('cook', 'Tim Cook', 2011, 2, PersonRole.LEADER, 'Operational expert who steered Apple to become the world\'s most valuable company.', { primaryRole: 'CEO of Apple', birthYear: 1960 });
createTech('macintosh', 'Macintosh', 1984, 2, TechRole.PRODUCT, 'First mass-market personal computer featuring a graphical user interface.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('iphone', 'iPhone', 2007, 1, TechRole.PRODUCT, 'Touchscreen smartphone that redefined mobile computing and internet access.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createEpisode('gui_visit', 'The PARC Visit', 1979, 3, EpisodeRole.MILESTONE, 'Steve Jobs visits Xerox PARC, inspiring the Macintosh\'s interface.', { eventType: 'Deal', impactScale: 'GUI Revolution' });
createEpisode('xerox_investment', 'Xerox Invests in Apple', 1979, 3, EpisodeRole.DEAL, 'Xerox buys Apple stock in exchange for showing Jobs their technology.', { eventType: 'Investment', impactScale: '$1M Pre-IPO' });

linkCreated('jobs', 'apple');
linkCreated('wozniak', 'apple');
linkPartOf('cook', 'apple');
linkCreated('apple', 'macintosh');
linkCreated('apple', 'iphone');
linkInfluenced('jobs', 'gui_visit'); // Jobs initiated the PARC visit
linkPartOf('xerox_investment', 'apple');
linkPartOf('xerox_investment', 'xerox');
linkInfluenced('xerox_investment', 'apple');
linkInfluenced('gui_visit', 'macintosh');

createCompany('microsoft', 'Microsoft', 1975, 1, CompanyRole.PLATFORM, 'Software giant behind Windows, Office, and Azure.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$3.1T', peak: '$3.1T' } });
createPerson('gates', 'Bill Gates', 1975, 1, PersonRole.VISIONARY, 'Software titan who envisioned a computer on every desk and in every home.', { primaryRole: 'Co-founder of Microsoft', secondaryRole: 'Philanthropist', birthYear: 1955 });
createPerson('nadella', 'Satya Nadella', 2014, 1, PersonRole.LEADER, 'Revitalized the company by prioritizing cloud computing and open collaborations.', { primaryRole: 'CEO of Microsoft', birthYear: 1967 });
createTech('windows', 'Windows', 1985, 1, TechRole.PRODUCT, 'Dominant graphical operating system family for personal computers.', 'System Software', 'Operating Systems (OS)');
createEpisode('wintel_alliance', 'Wintel Alliance', 1980, 2, EpisodeRole.DEAL, 'Dominant partnership between Microsoft Windows and Intel CPUs.', { eventType: 'Partnership', impactScale: 'PC Duopoly' });
createEpisode('ms_saves_apple', 'Microsoft Saves Apple', 1997, 3, EpisodeRole.DEAL, 'Microsoft invests $150M in Apple, settling patent disputes.', { eventType: 'Investment', impactScale: '$150M Bailout' });

linkCreated('gates', 'microsoft');
linkPartOf('nadella', 'microsoft');
linkCreated('microsoft', 'windows');
linkPartOf('ms_saves_apple', 'microsoft');
linkInfluenced('ms_saves_apple', 'apple');
linkPartOf('wintel_alliance', 'microsoft');
linkPartOf('wintel_alliance', 'intel');

createCompany('oracle', 'Oracle', 1977, 1, CompanyRole.PLATFORM, 'Enterprise software giant known for its relational database management system.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$450B', peak: '$450B' } });
createPerson('ellison', 'Larry Ellison', 1977, 2, PersonRole.VISIONARY, 'Aggressive leader who built a database and enterprise software empire.', { primaryRole: 'Co-founder of Oracle', birthYear: 1944 });
createPerson('safra_catz', 'Safra Catz', 1999, 2, PersonRole.LEADER, 'Strategic executor behind aggressive acquisitions and the cloud pivot.', { primaryRole: 'CEO of Oracle', birthYear: 1961 });
createTech('oracle_db', 'Oracle Database', 1979, 2, TechRole.STANDARD, 'Proprietary multi-model database management system.', 'System Software', 'Development & Languages');
createEpisode('oracle_buys_sun', 'Oracle Acquires Sun', 2010, 2, EpisodeRole.DEAL, 'Oracle acquires Sun Microsystems, gaining Java and Solaris.', { eventType: 'Acquisition', impactScale: '$7.4B Deal' });

linkCreated('ellison', 'oracle');
linkPartOf('safra_catz', 'oracle');
linkCreated('oracle', 'oracle_db');
linkPartOf('oracle_buys_sun', 'oracle');

createCompany('sap', 'SAP', 1972, 2, CompanyRole.PLATFORM, 'Ranking among the world\'s leading producers of software for the management of business processes.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$280B', peak: '$280B' } });
createPerson('hasso_plattner', 'Hasso Plattner', 1972, 2, PersonRole.VISIONARY, 'Revolutionized business with real-time enterprise resource planning software.', { primaryRole: 'Co-founder of SAP', birthYear: 1944 });
createTech('erp', 'ERP', 1972, 2, TechRole.PRODUCT, 'Integrated management of main business processes.', 'Digital Services & Platforms', 'Digital Platforms');

linkCreated('hasso_plattner', 'sap');
linkCreated('sap', 'erp');
linkCreated('sap', 'saas');

createCompany('sun', 'Sun Microsystems', 1982, 2, CompanyRole.PLATFORM, 'Created Java, Solaris, and NFS; famoulsy \'The Network is the Computer\'.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: 'Acquired', peak: '$200B' } });
createPerson('scott_mcnealy', 'Scott McNealy', 1982, 2, PersonRole.VISIONARY, 'Outspoken leader who defined the network computing era during the dot-com boom.', { primaryRole: 'Co-founder of Sun', birthYear: 1954 });
createTech('java', 'Java', 1995, 1, TechRole.STANDARD, 'Object-oriented programming language designed to run on any device.', 'System Software', 'Development & Languages');
createTech('solaris', 'Solaris', 1992, 2, TechRole.PRODUCT, 'Unix operating system known for scalability and DTrace.', 'System Software', 'Operating Systems (OS)');
createTech('nfs', 'NFS', 1984, 2, TechRole.STANDARD, 'Distributed file system protocol allowing remote file access.', 'Network & Connectivity', 'Network Architecture');

linkCreated('scott_mcnealy', 'sun');
linkCreated('sun', 'java');
linkCreated('sun', 'solaris');
linkCreated('sun', 'nfs');
linkBasedOn('oracle', 'oracle_buys_sun');
linkBasedOn('oracle', 'oracle_buys_sun');
linkInfluenced('oracle_buys_sun', 'sun');
linkPartOf('sun', 'oracle'); // Sun acquired by Oracle

createCompany('adobe', 'Adobe', 1982, 2, CompanyRole.PLATFORM, 'Leader in creative software and digital document solutions.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$230B', peak: '$320B' } });
createPerson('john_warnock', 'John Warnock', 1982, 2, PersonRole.VISIONARY, 'Innovator of PostScript and PDF, transforming digital publishing.', { primaryRole: 'Co-founder of Adobe', birthYear: 1940, deathYear: 2023 });
createPerson('charles_geschke', 'Charles Geschke', 1982, 2, PersonRole.VISIONARY, 'Partnered with Warnock to build a creative software powerhouse.', { primaryRole: 'Co-founder of Adobe', birthYear: 1939, deathYear: 2021 });

createTech('postscript', 'PostScript', 1982, 2, TechRole.STANDARD, 'Page description language revolutionizing desktop publishing.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('illustrator', 'Illustrator', 1987, 2, TechRole.PRODUCT, 'Vector graphics editor for design and illustration.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('photoshop', 'Photoshop', 1990, 2, TechRole.PRODUCT, 'Raster graphics editor; the industry standard for digital art.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('pdf', 'PDF', 1993, 2, TechRole.STANDARD, 'File format for presenting documents independent of software.', 'Fundamental Concepts', 'Standards & Protocols');

createEpisode('dtp_revolution', 'Desktop Publishing Revolution', 1985, 2, EpisodeRole.MILESTONE, 'Convergence of Mac, LaserWriter, and PostScript democratizing publishing.', { eventType: 'Revolution', impactScale: 'Industry Disruption' });

linkCreated('john_warnock', 'adobe');
linkCreated('charles_geschke', 'adobe');
linkPartOf('john_warnock', 'xerox'); // Alumni
linkPartOf('charles_geschke', 'xerox'); // Alumni

linkCreated('adobe', 'postscript');
linkCreated('adobe', 'illustrator');
linkCreated('adobe', 'photoshop');
linkCreated('adobe', 'pdf');

linkPartOf('dtp_revolution', 'adobe');
linkPartOf('dtp_revolution', 'apple');
linkBasedOn('dtp_revolution', 'postscript');
linkBasedOn('dtp_revolution', 'macintosh');

createPerson('linus', 'Linus Torvalds', 1991, 1, PersonRole.BUILDER, 'Created the Linux kernel and Git, powering the open-source movement.', { primaryRole: 'Creator of Linux', secondaryRole: 'Creator of Git', birthYear: 1969 });
linkInfluenced('unix', 'linus');

// ==========================================
// ERA 3: INTERNET & CLOUD
// ==========================================

createCompany('darpa', 'DARPA', 1958, 1, CompanyRole.LAB, 'Defense agency funding the Internet, GPS, and autonomous vehicles.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: 'N/A (Gov)', peak: 'N/A (Gov)' } });
createTech('gps', 'GPS', 1973, 2, TechRole.CORE, 'Satellite-based radio navigation system for global positioning.', 'Network & Connectivity', 'Telecommunications');
createEpisode('darpa_grand_challenge', 'DARPA Grand Challenge', 2004, 2, EpisodeRole.MILESTONE, 'Autonomous vehicle competition that ignited the self-driving car industry.', { eventType: 'Competition', impactScale: 'Birth of Self-Driving' });
createTech('arpanet', 'ARPANET', 1969, 1, TechRole.CORE, 'First wide-area packet-switched network; precursor to the Internet.', 'Network & Connectivity', 'Network Architecture');
createPerson('cerf', 'Vint Cerf', 1973, 2, PersonRole.THEORIST, 'Co-designed the TCP/IP protocols that form the backbone of the Internet.', { primaryRole: 'Co-creator of the Internet', birthYear: 1943 });
linkCreated('darpa', 'arpanet');
linkCreated('cerf', 'arpanet');
linkCreated('darpa', 'gps');
linkPartOf('darpa_grand_challenge', 'darpa');

createCompany('cern', 'CERN', 1954, 2, CompanyRole.LAB, 'European particle physics lab where the World Wide Web was born.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: 'N/A (Intl Org)', peak: 'N/A (Intl Org)' } });
createTech('www', 'World Wide Web', 1989, 1, TechRole.STANDARD, 'System of interlinked documents accessed via the Internet.', 'Network & Connectivity', 'Network Architecture');
createPerson('berners_lee', 'Tim Berners-Lee', 1989, 2, PersonRole.THEORIST, 'Invented the World Wide Web, HTML, and HTTP at CERN.', { primaryRole: 'Inventor of the Web', birthYear: 1955 });
linkPartOf('berners_lee', 'cern');
linkCreated('cern', 'www');
linkInfluenced('arpanet', 'www');

createCompany('netscape', 'Netscape', 1994, 2, CompanyRole.PLATFORM, 'Creator of the first commercial web browser and JavaScript.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: 'Acquired', peak: '$10B' } });
createPerson('andreessen', 'Marc Andreessen', 1994, 2, PersonRole.VISIONARY, 'Co-authored Mosaic and founded Netscape, sparking the commercial internet.', { primaryRole: 'Co-founder of Netscape', secondaryRole: 'Co-founder of a16z', birthYear: 1971 });
createTech('javascript', 'JavaScript', 1995, 2, TechRole.STANDARD, 'Core programming language of the World Wide Web.', 'System Software', 'Development & Languages');
createEpisode('browser_wars', 'Browser Wars', 1995, 2, EpisodeRole.MILESTONE, 'Battle for dominance between Netscape Navigator and Microsoft IE.', { eventType: 'Competition', impactScale: 'Web Platform Wars' });

linkPartOf('andreessen', 'netscape');
linkCreated('netscape', 'javascript');
linkInfluenced('www', 'netscape');
linkPartOf('browser_wars', 'netscape');
linkPartOf('browser_wars', 'microsoft');

createCompany('google', 'Google', 1998, 1, CompanyRole.PLATFORM, 'Organizer of the world\'s information; leader in Search and AI.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$2.1T', peak: '$2.1T' } });
createPerson('larry_page', 'Larry Page', 1998, 2, PersonRole.VISIONARY, 'Developed the PageRank algorithm that became the foundation of Google Search.', { primaryRole: 'Co-founder of Google', birthYear: 1973 });
createPerson('pichai', 'Sundar Pichai', 2015, 2, PersonRole.LEADER, 'Steered key products like Chrome and Android before leading Alphabet into AI.', { primaryRole: 'CEO of Alphabet/Google', birthYear: 1972 });
createTech('search', 'Google Search', 1998, 1, TechRole.PRODUCT, 'Algorithm capable of indexing and retrieving vast amounts of web data.', 'Digital Services & Platforms', 'Search & Information');
createTech('android', 'Android', 2008, 2, TechRole.PRODUCT, 'Open-source mobile operating system based on the Linux kernel.', 'System Software', 'Operating Systems (OS)');
createTech('tpu', 'TPU', 2015, 2, TechRole.PRODUCT, 'Custom ASIC designed by Google for machine learning acceleration.', 'Hardware & Infrastructure', 'Processors & Compute');

linkCreated('larry_page', 'google');
linkPartOf('pichai', 'google');
linkPartOf('cerf', 'google');
linkCreated('google', 'search');
linkCreated('google', 'android');
linkCreated('google', 'tpu');
linkInfluenced('iphone', 'android');

createCompany('amazon', 'Amazon', 1994, 1, CompanyRole.PLATFORM, 'Global leader in e-commerce and cloud computing.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$2.1T', peak: '$2.1T' } });
createPerson('bezos', 'Jeff Bezos', 1994, 1, PersonRole.VISIONARY, 'Built an online bookstore into a global empire of e-commerce and cloud computing.', { primaryRole: 'Founder of Amazon', secondaryRole: 'Founder of Blue Origin', birthYear: 1964 });

// Amazon Products
createTech('aws', 'AWS', 2006, 1, TechRole.PRODUCT, 'On-demand cloud computing platforms and APIs.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('alexa', 'Amazon Alexa', 2014, 2, TechRole.PRODUCT, 'Intelligent virtual assistant used in smart speakers.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('kindle', 'Kindle', 2007, 2, TechRole.PRODUCT, 'E-reader series that popularized digital books.', 'Hardware & Infrastructure', 'Devices & Form Factors');

linkCreated('bezos', 'amazon');
linkCreated('amazon', 'aws');
linkCreated('amazon', 'alexa');
linkCreated('amazon', 'kindle');

createTech('cloud_computing', 'Cloud Computing', 2006, 1, TechRole.CORE, 'On-demand delivery of computing services over the internet.', 'Network & Connectivity', 'Network Architecture');
linkCreated('amazon', 'cloud_computing');
linkCreated('microsoft', 'cloud_computing');
createTech('azure', 'Microsoft Azure', 2010, 1, TechRole.PLATFORM, 'Microsoft\'s cloud computing platform and services.', 'Network & Connectivity', 'Network Architecture');
linkCreated('microsoft', 'azure');
linkCreated('google', 'cloud_computing');
createTech('gcp', 'Google Cloud Platform', 2008, 1, TechRole.PLATFORM, 'Suite of cloud computing services offered by Google.', 'Network & Connectivity', 'Network Architecture');
linkCreated('google', 'gcp');
linkCreated('alibaba', 'cloud_computing');
linkBasedOn('aws', 'cloud_computing');
linkBasedOn('saas', 'cloud_computing'); // SaaS runs on Cloud

createCompany('salesforce', 'Salesforce', 1999, 2, CompanyRole.PLATFORM, 'Pioneer of cloud-based CRM and the SaaS business model.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$270B', peak: '$310B' } });
createPerson('benioff', 'Marc Benioff', 1999, 2, PersonRole.VISIONARY, 'Pioneered the SaaS model and cloud-based CRM, replacing on-premise software.', { primaryRole: 'CEO of Salesforce', birthYear: 1964 });
createTech('crm', 'CRM', 1999, 2, TechRole.PRODUCT, 'Software for managing a company\'s interactions with customers.', 'Digital Services & Platforms', 'Digital Platforms');
createEpisode('no_software', 'No Software Campaign', 2000, 2, EpisodeRole.MILESTONE, 'Marketing campaign launching the concept of Software as a Service.', { eventType: 'Marketing', impactScale: 'SaaS Revolution' });

linkCreated('benioff', 'salesforce');
linkCreated('salesforce', 'crm');
linkInfluenced('salesforce', 'no_software'); // Salesforce's marketing campaign
linkInfluenced('oracle', 'benioff');

createTech('saas', 'SaaS', 1999, 1, TechRole.STANDARD, 'Software licensing/delivery model with subscription access.', 'Digital Services & Platforms', 'Digital Platforms');
linkCreated('salesforce', 'saas');
linkBasedOn('crm', 'saas');

// createCompany('cisco', 'Cisco', 1984, 2, CompanyRole.INFRA, 'Internet plumbing.'); // Moved to Networking section
// linkBasedOn('arpanet', 'cisco'); // Moved to Networking section

createCompany('netflix', 'Netflix', 1997, 1, CompanyRole.PLATFORM, 'Streaming giant that revolutionized entertainment consumption.', CompanyCategory.MEDIA_CONTENT, { marketCap: { current: '$280B', peak: '$310B' } });
createPerson('reed_hastings', 'Reed Hastings', 1997, 2, PersonRole.VISIONARY, 'Disrupted the entertainment industry by shifting from DVDs to streaming.', { primaryRole: 'Co-founder of Netflix', birthYear: 1960 });
createTech('chaos_monkey', 'Chaos Monkey', 2011, 2, TechRole.CORE, 'Tool that tests system resilience by randomly disabling instances.', 'AI & Physical Systems', 'Artificial Intelligence');
createEpisode('netflix_prize', 'Netflix Prize', 2006, 2, EpisodeRole.MILESTONE, 'Open competition to improve movie recommendation algorithms.', { eventType: 'Competition', impactScale: '$1M Prize' });
createEpisode('streaming_wars', 'Streaming Wars', 2019, 2, EpisodeRole.MILESTONE, 'Intense market competition among video streaming services.', { eventType: 'Competition', impactScale: 'Industry War' });

linkCreated('reed_hastings', 'netflix');
linkCreated('netflix', 'chaos_monkey');
linkPartOf('netflix_prize', 'netflix');
linkPartOf('streaming_wars', 'netflix');
linkBasedOn('netflix', 'aws');
linkBasedOn('chaos_monkey', 'aws');



// ==========================================
// ERA 4: HARDWARE & GLOBAL SUPPLY CHAIN
// ==========================================

createCompany('tsmc', 'TSMC', 1987, 1, CompanyRole.INFRA, 'World\'s largest dedicated independent semiconductor foundry.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$650B', peak: '$700B' } });
createPerson('morris_chang', 'Morris Chang', 1987, 2, PersonRole.VISIONARY, 'Revolutionized the chip industry by establishing the dedicated foundry model.', { primaryRole: 'Founder of TSMC', birthYear: 1931 });
createTech('apple_silicon', 'Apple Silicon', 2020, 2, TechRole.PRODUCT, 'Apple\'s custom system-on-chip processors based on ARM architecture.', 'Hardware & Infrastructure', 'Processors & Compute');

linkCreated('morris_chang', 'tsmc');
linkCreated('apple', 'apple_silicon');
// linkBasedOn('apple', 'tsmc'); // Removed direct link
linkBasedOn('apple_silicon', 'tsmc');

createCompany('asml', 'ASML', 1984, 1, CompanyRole.INFRA, 'Sole supplier of EUV lithography machines essential for advanced chips.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$290B', peak: '$380B' } });
createTech('euv', 'EUV Lithography', 2019, 1, TechRole.CORE, 'Lithography technology using extreme ultraviolet light to print tiny features.', 'Hardware & Infrastructure', 'Components & Manufacturing');
linkCreated('asml', 'euv');
// Companies use EUV technology, which is made by ASML
linkBasedOn('tsmc', 'euv');
linkBasedOn('intel', 'euv');
// linkBasedOn('tsmc', 'asml'); // Removed direct link
// linkBasedOn('intel', 'asml'); // Removed direct link



// ==========================================
// ARM HOLDINGS - RISC REVOLUTION
// ==========================================

createCompany('arm', 'ARM', 1990, 2, CompanyRole.INFRA, 'Designer of energy-efficient RISC architectures dominant in mobile.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$140B', peak: '$170B' } });
createPerson('sophie_wilson', 'Sophie Wilson', 1983, 2, PersonRole.BUILDER, 'Architect of the ARM instruction set now powering billions of devices.', { primaryRole: 'Designer of ARM ISA', birthYear: 1957 });
createPerson('steve_furber', 'Steve Furber', 1983, 2, PersonRole.BUILDER, 'Key designer of the original ARM processor architecture.', { primaryRole: 'Co-designer of ARM', birthYear: 1953 });

createTech('arm_arch', 'ARM Architecture', 1990, 2, TechRole.STANDARD, 'RISC instruction set architecture maximizing power efficiency.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('arm_cortex', 'ARM Cortex', 2004, 2, TechRole.PRODUCT, 'Series of ARM processor cores designed for various performance needs.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('arm_neoverse', 'ARM Neoverse', 2018, 2, TechRole.PRODUCT, 'High-performance ARM cores designed for data center infrastructure.', 'Hardware & Infrastructure', 'Processors & Compute');

createEpisode('arm_license_model', 'ARM Licensing Model', 1990, 2, EpisodeRole.MILESTONE, 'Business model of licensing IP designs rather than manufacturing chips.', { eventType: 'Business Model', impactScale: 'IP Licensing Pioneer' });
createEpisode('nvidia_arm_fail', 'NVIDIA Failed ARM Bid', 2020, 2, EpisodeRole.DEAL, 'Blocked $40B acquisition of ARM by NVIDIA due to antitrust concerns.', { eventType: 'Failed Acquisition', impactScale: '$40B Blocked' });
// Duplicate softbank_arm removed from here

linkPartOf('sophie_wilson', 'arm');
linkPartOf('steve_furber', 'arm');
linkCreated('arm', 'arm_arch');
linkCreated('sophie_wilson', 'arm_arch');
linkCreated('steve_furber', 'arm_arch');
linkCreated('arm', 'arm_cortex');
linkCreated('arm', 'arm_neoverse');

linkPartOf('arm_license_model', 'arm');
linkPartOf('nvidia_arm_fail', 'nvidia');
linkPartOf('nvidia_arm_fail', 'arm');
// linkPartOf('softbank_arm', 'arm'); // Removed duplicate
linkPartOf('arm', 'softbank'); // ARM acquired by SoftBank

// ARM influences
linkBasedOn('apple_silicon', 'arm_arch');
linkInfluenced('arm_cortex', 'apple_silicon', 0.6);

// ==========================================
// QUALCOMM - WIRELESS PIONEER
// ==========================================

createCompany('qualcomm', 'Qualcomm', 1985, 2, CompanyRole.INFRA, 'Wireless tech pioneer dominating mobile connectivity and patents.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$190B', peak: '$220B' } });
createPerson('irwin_jacobs', 'Irwin Jacobs', 1985, 2, PersonRole.VISIONARY, 'Pioneered CDMA digital wireless technology used in 3G networks globally.', { primaryRole: 'Co-founder of Qualcomm', birthYear: 1933 });
createPerson('paul_jacobs', 'Paul Jacobs', 2005, 2, PersonRole.LEADER, 'Expanded the company\'s dominance in the smartphone chipset market.', { primaryRole: 'Former CEO of Qualcomm', birthYear: 1962 });

createTech('snapdragon', 'Snapdragon', 2007, 2, TechRole.PRODUCT, 'Suite of system-on-chip semiconductor products for mobile devices.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('cdma_tech', 'CDMA Technology', 1989, 2, TechRole.STANDARD, 'Digital cellular technology that maximizes bandwidth usage.', 'Network & Connectivity', 'Telecommunications');
createTech('3g_patents', '3G Patents', 2001, 2, TechRole.STANDARD, 'Key intellectual property underpinning 3rd generation networks.', 'Network & Connectivity', 'Telecommunications');
createTech('4g_lte', '4G LTE', 2009, 2, TechRole.STANDARD, 'Standard for wireless broadband communication for mobile devices.', 'Network & Connectivity', 'Telecommunications');
createTech('5g_patents', '5G Patents', 2019, 2, TechRole.STANDARD, 'Essential patents defining the 5th generation mobile standard.', 'Network & Connectivity', 'Telecommunications');

createEpisode('apple_qcom_war', 'Apple-Qualcomm Patent War', 2017, 2, EpisodeRole.CRISIS, 'Legal battle over patent royalties and licensing terms.', { eventType: 'Lawsuit', impactScale: 'Billions in Dispute' });
createEpisode('qcom_licensing', 'Qualcomm Licensing Model', 1990, 2, EpisodeRole.MILESTONE, 'Revenue model based on patent royalties from device manufacturers.', { eventType: 'Business Model', impactScale: 'Patent Licensing' });

linkPartOf('irwin_jacobs', 'qualcomm');
linkPartOf('paul_jacobs', 'qualcomm');

linkCreated('qualcomm', 'snapdragon');
linkCreated('qualcomm', 'cdma_tech');
linkCreated('irwin_jacobs', 'cdma_tech');
linkCreated('qualcomm', '3g_patents');
linkCreated('qualcomm', '4g_lte');
linkCreated('qualcomm', '5g_patents');

// Patent and technology evolution
linkInfluenced('cdma', 'cdma_tech', 0.9); // Bell Labs CDMA influenced Qualcomm's implementation
linkInfluenced('cdma_tech', '3g_patents', 0.9);
linkInfluenced('3g_patents', '4g_lte', 0.8);
linkInfluenced('4g_lte', '5g_patents', 0.8);

// Snapdragon dependencies
linkBasedOn('snapdragon', 'arm_arch');
linkBasedOn('snapdragon', '4g_lte');
linkBasedOn('snapdragon', '5g_patents');

// Episodes
linkPartOf('apple_qcom_war', 'qualcomm');
linkPartOf('apple_qcom_war', 'apple');
linkPartOf('qcom_licensing', 'qualcomm');
linkBasedOn('android', 'snapdragon');


// ==========================================
// JAPANESE TECH GIANTS
// ==========================================

// SoftBank Group & Vision Fund
createCompany('softbank', 'SoftBank', 1981, 2, CompanyRole.PLATFORM, 'Japanese conglomerate and world\'s largest tech investor via Vision Fund.', CompanyCategory.VENTURE_CAPITAL, { marketCap: { current: '$70B', peak: '$210B' } });
createPerson('masayoshi_son', 'Masayoshi Son', 1981, 1, PersonRole.INVESTOR, 'Risk-taking investor who built a global tech investment empire.', { primaryRole: 'Founder of SoftBank', birthYear: 1957 });
createEpisode('vision_fund', 'Vision Fund Launch', 2017, 2, EpisodeRole.DEAL, 'Largest tech investment fund in history ($100B) backing AI and startups.', { eventType: 'Investment', impactScale: '$100B Fund' });
createEpisode('softbank_arm', 'SoftBank Acquires ARM', 2016, 2, EpisodeRole.DEAL, 'SoftBank acquires ARM for $32B to bet on IoT and mobile.', { eventType: 'Acquisition', impactScale: '$32B Deal' });

linkCreated('masayoshi_son', 'softbank');
linkInfluenced('softbank', 'vision_fund'); // SoftBank launched the fund
linkInfluenced('softbank', 'softbank_arm'); // SoftBank initiated the acquisition
linkPartOf('softbank_arm', 'arm'); // ARM was the target
linkInfluenced('vision_fund', 'openai', 0.3); // Vision Fund invested in many AI companies

// NTT - Telecom Pioneer
createCompany('ntt', 'NTT', 1952, 2, CompanyRole.PLATFORM, 'Japan\'s telecommunications giant and pioneer of mobile internet.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: '$80B', peak: '$330B' } });
createPerson('shigeki_goto', 'Shigeki Goto', 1990, 3, PersonRole.THEORIST, 'Instrumental researcher in the development of the internet in Asia.', { primaryRole: 'NTT Researcher' });
createTech('ntt_docomo', 'NTT DoCoMo i-mode', 1999, 2, TechRole.PRODUCT, 'First major mobile internet platform, preceding the iPhone by 8 years.', 'Digital Services & Platforms', 'Social & Media');
createTech('emoji', 'Emoji', 1999, 2, TechRole.STANDARD, 'Set of picture characters revolutionizing digital communication.', 'Fundamental Concepts', 'Standards & Protocols');
createPerson('kurita', 'Shigetaka Kurita', 1999, 2, PersonRole.BUILDER, 'Designed the original set of 176 emoji, changing digital communication.', { primaryRole: 'Creator of Emoji', birthYear: 1972 });
createTech('optical_fiber', 'Optical Fiber Network', 1980, 2, TechRole.CORE, 'Glass strands transmitting data as light; the internet\'s backbone.', 'Network & Connectivity', 'Telecommunications');

linkPartOf('shigeki_goto', 'ntt');
linkCreated('ntt', 'ntt_docomo');
linkCreated('ntt', 'emoji');
linkCreated('kurita', 'emoji');
linkPartOf('kurita', 'ntt');
linkBasedOn('emoji', 'ntt_docomo');
linkCreated('ntt', 'optical_fiber');
linkInfluenced('ntt_docomo', 'iphone', 0.4); // i-mode influenced mobile internet thinking





// Fujitsu - Enterprise Computing
createCompany('fujitsu', 'Fujitsu', 1935, 2, CompanyRole.INFRA, 'Japanese IT services giant and supercomputer manufacturer.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$35B', peak: '$90B' } });
createTech('fugaku', 'Fugaku Supercomputer', 2020, 2, TechRole.PRODUCT, 'World\'s fastest supercomputer (2020-2022) utilizing ARM architecture.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('fm_towns', 'FM Towns', 1989, 2, TechRole.PRODUCT, 'Pioneering multimedia PC with built-in CD-ROM drive.', 'Hardware & Infrastructure', 'Devices & Form Factors', { endYear: 1997 });
createTech('fujitsu_mainframe', 'Fujitsu Mainframe', 1974, 2, TechRole.PRODUCT, 'IBM-compatible mainframes powering Japanese enterprise infrastructure.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('hemt', 'HEMT', 1980, 2, TechRole.CORE, 'High Electron Mobility Transistor; crucial for satellite communications.', 'Hardware & Infrastructure', 'Components & Manufacturing');

linkCreated('fujitsu', 'fugaku');
linkCreated('fujitsu', 'fm_towns');
linkCreated('fujitsu', 'fujitsu_mainframe');
linkCreated('fujitsu', 'hemt');
linkBasedOn('fugaku', 'arm_arch');
linkBasedOn('fujitsu_mainframe', 'mainframe'); // Compatible with IBM

// ==========================================
// SOUTH KOREAN TECH POWERHOUSES
// ==========================================

// Samsung - Memory & Display Dominance
// Toshiba - Flash Memory Pioneer
createCompany('toshiba', 'Toshiba', 1939, 2, CompanyRole.INFRA, 'Japanese conglomerate and inventor of Flash memory.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$15B', peak: '$40B' } });
createPerson('fujio_masuoka', 'Fujio Masuoka', 1980, 2, PersonRole.THEORIST, 'Invented flash memory, enabling modern portable storage devices.', { primaryRole: 'Inventor of Flash Memory', birthYear: 1943 });

linkPartOf('fujio_masuoka', 'toshiba');

// Samsung - Memory & Display Dominance
createCompany('samsung', 'Samsung', 1938, 1, CompanyRole.INFRA, 'Global leader in memory chips, displays, and smartphones.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$350B', peak: '$500B' } });
createPerson('lee_byung_chul', 'Lee Byung-chul', 1938, 2, PersonRole.VISIONARY, 'Laid the groundwork for the conglomerate\'s rise as a global giant.', { primaryRole: 'Founder of Samsung', birthYear: 1910, deathYear: 1987 });
createPerson('lee_kun_hee', 'Lee Kun-hee', 1987, 2, PersonRole.LEADER, 'Transformed the company into a top-tier global electronics brand.', { primaryRole: 'Leader of Samsung', birthYear: 1942, deathYear: 2020 });
createPerson('lee_jae_yong', 'Lee Jae-yong', 2014, 2, PersonRole.LEADER, 'Driving the future focus on AI, semiconductors, and bio-pharmaceuticals.', { primaryRole: 'Leader of Samsung', birthYear: 1968 });

createTech('galaxy', 'Samsung Galaxy', 2009, 2, TechRole.PRODUCT, 'Flagship Android smartphone series rivalry the iPhone.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('oled_display', 'OLED Display', 2007, 2, TechRole.CORE, 'Display technology offering superior contrast and color.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('nand_flash', 'NAND Flash', 1987, 2, TechRole.CORE, 'Non-volatile storage technology essential for smartphones and SSDs.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('t1100', 'Toshiba T1100', 1985, 2, TechRole.PRODUCT, 'First mass-market laptop computer, defining the portable PC form factor.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('hbm', 'HBM', 2013, 1, TechRole.CORE, 'High Bandwidth Memory; high-speed RAM essential for AI GPUs.', 'Hardware & Infrastructure', 'Memory & Storage');

createEpisode('samsung_memory_bet', 'Samsung Memory Bet', 1983, 2, EpisodeRole.MILESTONE, 'Bold investment during downturn determining Samsung\'s memory leadership.', { eventType: 'Investment', impactScale: 'Industry Dominance' });
createEpisode('galaxy_launch', 'Galaxy Launch', 2010, 2, EpisodeRole.MILESTONE, 'Debut of Samsung\'s flagship phone, sparking the smartphone wars.', { eventType: 'Product Launch', impactScale: 'Smartphone Wars' });

linkCreated('lee_byung_chul', 'samsung');
linkPartOf('lee_kun_hee', 'samsung');
linkPartOf('lee_jae_yong', 'samsung');
linkCreated('samsung', 'galaxy');
linkCreated('samsung', 'oled_display');
linkCreated('samsung', 'nand_flash');
linkCreated('toshiba', 'nand_flash');
linkCreated('toshiba', 't1100');
linkCreated('fujio_masuoka', 'nand_flash');
linkCreated('samsung', 'hbm');
linkInfluenced('samsung', 'samsung_memory_bet'); // Samsung's strategic decision
linkInfluenced('samsung', 'galaxy_launch'); // Samsung's product launch

// Samsung uses EUV for advanced manufacturing
linkBasedOn('samsung', 'euv');
// linkBasedOn('samsung', 'asml'); // Removed direct link

// iPhone uses Samsung displays and chips - Linked via Products
// linkBasedOn('iphone', 'samsung'); // Removed direct link
linkBasedOn('iphone', 'oled_display');
linkBasedOn('iphone', 'nand_flash');
linkBasedOn('galaxy', 'android');
linkBasedOn('galaxy', 'snapdragon');

// SK Hynix - Memory Specialist
createCompany('sk_hynix', 'SK Hynix', 1983, 2, CompanyRole.INFRA, 'Second-largest memory chip maker and leader in HBM for AI.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$90B', peak: '$120B' } });
createPerson('park_jung_ho', 'Park Jung-ho', 2018, 3, PersonRole.LEADER, 'Led strategic investments in memory and AI technologies.', { primaryRole: 'CEO of SK Hynix' });

linkPartOf('park_jung_ho', 'sk_hynix');
linkCreated('sk_hynix', 'hbm');
linkBasedOn('sk_hynix', 'euv'); // Uses EUV
// linkBasedOn('sk_hynix', 'asml'); // Removed direct link
// linkBasedOn('nvidia', 'sk_hynix'); // Removed direct link - GPU depends on HBM

// LG Electronics removed as per request

// Naver and Kakao removed as per request

createCompany('broadcom', 'Broadcom', 1961, 2, CompanyRole.INFRA, 'Semiconductor and software giant known for connectivity solutions.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$800B', peak: '$800B' } });
createPerson('hock_tan', 'Hock Tan', 2006, 2, PersonRole.LEADER, 'Consolidator of the semiconductor industry through strategic acquisitions.', { primaryRole: 'CEO of Broadcom', birthYear: 1952 });
createEpisode('broadcom_vmware', 'Broadcom Acquires VMware', 2022, 2, EpisodeRole.DEAL, 'Massive acquisition expanding Broadcom into enterprise software.', { eventType: 'Acquisition', impactScale: '$69B Deal' });

linkPartOf('hock_tan', 'broadcom');
linkPartOf('broadcom_vmware', 'broadcom');
linkBasedOn('tpu', 'broadcom');

// ==========================================
// FOXCONN - WORLD'S FACTORY
// ==========================================

createCompany('foxconn', 'Foxconn', 1974, 2, CompanyRole.INFRA, 'World\'s largest electronics contract manufacturer, assembling the iPhone.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$50B', peak: '$70B' } });
createPerson('terry_gou', 'Terry Gou', 1974, 2, PersonRole.VISIONARY, 'Founded the world\'s largest electronics contract manufacturer.', { primaryRole: 'Founder of Foxconn', birthYear: 1950 });

createEpisode('foxconn_apple_deal', 'Apple-Foxconn Partnership', 2000, 2, EpisodeRole.DEAL, 'Strategic partnership making Foxconn Apple\'s primary manufacturer.', { eventType: 'Partnership', impactScale: 'Manufacturing Alliance' });
createEpisode('foxconn_suicides', 'Foxconn Labor Crisis', 2010, 2, EpisodeRole.CRISIS, 'Labor crisis highlighting the human cost of global electronics supply chains.', { eventType: 'Crisis', impactScale: 'Labor Reform' });
createEpisode('foxconn_automation', 'Foxconn Automation Push', 2016, 3, EpisodeRole.MILESTONE, 'Strategic push to replace manual labor with "Foxbot" robots.', { eventType: 'Strategy', impactScale: 'Manufacturing Evolution' });

linkPartOf('terry_gou', 'foxconn');
linkPartOf('foxconn_apple_deal', 'foxconn');
linkPartOf('foxconn_apple_deal', 'apple');
linkPartOf('foxconn_suicides', 'foxconn');
linkPartOf('foxconn_automation', 'foxconn');

// Foxconn client dependencies
linkBasedOn('iphone', 'foxconn');
linkBasedOn('macintosh', 'foxconn');
// linkBasedOn('apple', 'foxconn'); // Removed direct link



// Microsoft Xbox manufactured by Foxconn
createTech('xbox', 'Xbox', 2001, 2, TechRole.PRODUCT, 'Microsoft\'s home video game console brand.', 'Hardware & Infrastructure', 'Devices & Form Factors');
linkCreated('microsoft', 'xbox');
linkBasedOn('xbox', 'foxconn');
// linkBasedOn('microsoft', 'foxconn'); // Removed direct link

// ==========================================
// ERA 5: THE AI REVOLUTION
// ==========================================

createCompany('nvidia', 'NVIDIA', 1993, 1, CompanyRole.PLATFORM, 'Chipmaker whose GPUs power the modern AI revolution.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$3.4T', peak: '$3.4T' } });
createPerson('jensen_huang', 'Jensen Huang', 1993, 1, PersonRole.VISIONARY, 'Visionary who bet on GPUs for AI, making NVIDIA the engine of the era.', { primaryRole: 'CEO of NVIDIA', birthYear: 1963 });
createTech('gpu', 'GPU', 1999, 1, TechRole.PRODUCT, 'Specialized electronic circuit designed to accelerate graphics and AI workloads.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('cuda', 'CUDA', 2007, 1, TechRole.PLATFORM, 'Parallel computing platform allowing developers to use GPUs for general processing.', 'System Software', 'Development & Languages');

linkCreated('jensen_huang', 'nvidia');
linkCreated('nvidia', 'gpu');
linkCreated('nvidia', 'cuda');
// linkBasedOn('nvidia', 'tsmc'); // Removed direct link - GPU depends on TSMC
linkBasedOn('gpu', 'tsmc'); // Added explicit link
linkBasedOn('gpu', 'hbm');

createCompany('openai', 'OpenAI', 2015, 1, CompanyRole.PLATFORM, 'AI research lab leading the generative AI boom with ChatGPT.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: '$157B', peak: '$157B' } });
createPerson('altman', 'Sam Altman', 2015, 1, PersonRole.VISIONARY, 'Leading the generative AI revolution as the face of OpenAI.', { primaryRole: 'CEO of OpenAI', birthYear: 1985 });
createPerson('ilya', 'Ilya Sutskever', 2015, 2, PersonRole.THEORIST, 'Key theorist behind deep learning breakthroughs like AlexNet and GPT.', { primaryRole: 'Co-founder of OpenAI', secondaryRole: 'Founder of SSI', birthYear: 1986 });

// Added Product Nodes to boost Impact Score
createTech('chatgpt', 'ChatGPT', 2022, 1, TechRole.PRODUCT, 'Conversational AI chatbot that triggered the global AI arms race.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('gpt', 'GPT-4', 2023, 1, TechRole.PRODUCT, 'Large language model exhibiting advanced reasoning capabilities.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('dalle', 'DALL-E', 2021, 2, TechRole.PRODUCT, 'AI system capable of generating images from text descriptions.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('sora', 'Sora', 2024, 2, TechRole.PRODUCT, 'Text-to-video model generating realistic and imaginative scenes.', 'AI & Physical Systems', 'Artificial Intelligence');

createEpisode('chatgpt_launch', 'ChatGPT Launch', 2022, 1, EpisodeRole.MILESTONE, 'Release of ChatGPT, marking the "iPhone moment" for AI.', { eventType: 'Product Launch', impactScale: 'AI Revolution' });
createEpisode('openai_coup', 'The Board Coup', 2023, 2, EpisodeRole.CRISIS, 'Leadership crisis involving the firing and rehiring of Sam Altman.', { eventType: 'Crisis', impactScale: 'Leadership Drama' });
createEpisode('ms_openai_deal', 'The $10B Partnership', 2023, 1, EpisodeRole.DEAL, 'Strategic $10B+ partnership cementing Microsoft\'s AI leadership.', { eventType: 'Investment', impactScale: '$10B+ Partnership' });

linkPartOf('altman', 'openai');
linkPartOf('ilya', 'openai');
linkCreated('openai', 'chatgpt');
linkCreated('openai', 'gpt');
linkCreated('openai', 'dalle');
linkCreated('openai', 'sora');

linkInfluenced('openai', 'chatgpt_launch'); // OpenAI's product launch
linkPartOf('openai_coup', 'openai'); // Crisis that happened to OpenAI
linkInfluenced('microsoft', 'ms_openai_deal'); // Microsoft initiated the investment
linkPartOf('ms_openai_deal', 'openai'); // OpenAI received the investment
linkBasedOn('openai', 'gpu');

createPerson('hinton', 'Geoffrey Hinton', 2012, 1, PersonRole.THEORIST, 'Pioneered backpropagation and deep learning neural networks.', { primaryRole: 'Deep Learning Theorist', birthYear: 1947 });
createPerson('hassabis', 'Demis Hassabis', 2010, 2, PersonRole.VISIONARY, 'Pushing the boundaries of AGI with systems like AlphaGo and AlphaFold.', { primaryRole: 'CEO of Google DeepMind', birthYear: 1976 });
createPerson('fei_fei_li', 'Fei-Fei Li', 2009, 2, PersonRole.THEORIST, 'Creator of ImageNet, which catalyzed the modern deep learning boom.', { primaryRole: 'Creator of ImageNet', secondaryRole: 'Stanford Professor', birthYear: 1976 });
createPerson('vaswani', 'Ashish Vaswani', 2017, 2, PersonRole.THEORIST, 'Lead author of the Transformer paper that revolutionized NLP.', { primaryRole: 'Inventor of Transformer', birthYear: 1983 });

createTech('transformer', 'Transformer', 2017, 1, TechRole.CORE, 'Neural network architecture using attention mechanisms; basis of LLMs.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('alphafold', 'AlphaFold', 2020, 2, TechRole.PRODUCT, 'AI system that solves the protein folding problem, aiding drug discovery.', 'AI & Physical Systems', 'Artificial Intelligence');

linkPartOf('hinton', 'google');
linkPartOf('hassabis', 'google');
linkPartOf('vaswani', 'google');
linkCreated('google', 'transformer');
linkCreated('vaswani', 'transformer');
linkCreated('google', 'alphafold');

// Foundational links: Modern AI depends on Transformer architecture
linkBasedOn('gpt', 'transformer');
linkBasedOn('chatgpt', 'transformer');
linkBasedOn('dalle', 'transformer');
linkBasedOn('alphafold', 'transformer');
linkInfluenced('transformer', 'gpt');
linkInfluenced('gpu', 'fei_fei_li');

// Turing's legacy: his work influenced McCarthy and modern AI
linkInfluenced('turing', 'transformer');  // Conceptual lineage

// ==========================================
// PROGRAMMING LANGUAGES
// ==========================================

createTech('python', 'Python', 1991, 1, TechRole.STANDARD, 'Programming language serving as the primary tool for AI development.', 'System Software', 'Development & Languages');
createTech('cpp', 'C++', 1983, 1, TechRole.STANDARD, 'High-performance language used for systems programming and game engines.', 'System Software', 'Development & Languages');
createTech('sql', 'SQL', 1974, 1, TechRole.STANDARD, 'Standard language for managing and querying relational databases.', 'System Software', 'Development & Languages');
createTech('swift', 'Swift', 2014, 2, TechRole.STANDARD, 'Powerful and intuitive programming language for Apple platforms.', 'System Software', 'Development & Languages');

linkBasedOn('pytorch', 'python');
linkBasedOn('python', 'c_language');
linkBasedOn('cpp', 'c_language');
linkCreated('apple', 'swift');
linkBasedOn('oracle_db', 'sql');

// ==========================================
// AI FOUNDATIONS & CONCEPTS
// ==========================================

// Key AI Concepts
createTech('backprop', 'Backpropagation', 1986, 1, TechRole.CORE, 'Algorithm for training neural networks by adjusting weights based on error.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('imagenet', 'ImageNet', 2009, 1, TechRole.CORE, 'Large visual database designed for object recognition software research.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('alexnet', 'AlexNet', 2012, 1, TechRole.CORE, 'Deep convolutional neural network that revolutionized computer vision.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('word2vec', 'Word2Vec', 2013, 2, TechRole.CORE, 'Technique for natural language processing determining word associations.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('gan', 'GAN', 2014, 1, TechRole.CORE, 'Framework where two neural networks contest with each other to generate new data.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('resnet', 'ResNet', 2015, 2, TechRole.CORE, 'Residual neural network simplifying the training of very deep networks.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('attention', 'Attention Mechanism', 2014, 1, TechRole.CORE, 'Mechanism allowing models to weigh the importance of different input elements.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('bert', 'BERT', 2018, 1, TechRole.CORE, 'Technique for natural language processing pre-training.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('diffusion', 'Diffusion Models', 2020, 1, TechRole.CORE, 'Generative model that creates data by reversing a gradual noise addition process.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('rlhf', 'RLHF', 2017, 1, TechRole.CORE, 'Training method that fine-tunes language models with human feedback.', 'AI & Physical Systems', 'Artificial Intelligence');

// AI Concept Links
linkCreated('hinton', 'backprop');
linkCreated('fei_fei_li', 'imagenet');
linkCreated('hinton', 'alexnet');
linkCreated('google', 'word2vec');
linkCreated('microsoft', 'resnet');
linkCreated('google', 'bert');
linkCreated('openai', 'rlhf');
linkCreated('google', 'gan');  // GAN originated from Google Brain (Ian Goodfellow)

linkBasedOn('alexnet', 'imagenet');
linkBasedOn('alexnet', 'gpu');
linkBasedOn('alexnet', 'backprop');
linkBasedOn('transformer', 'attention');
linkBasedOn('bert', 'transformer');
linkBasedOn('gpt', 'bert');  // GPT learned from BERT's approach
linkBasedOn('dalle', 'diffusion');
linkBasedOn('sora', 'diffusion');
linkBasedOn('chatgpt', 'rlhf');
linkBasedOn('gan', 'backprop');  // GAN uses backprop for training
linkBasedOn('diffusion', 'gan'); // Diffusion models evolved from GAN concepts

// ==========================================
// GENERATIVE AI COMPANIES
// ==========================================

createCompany('anthropic', 'Anthropic', 2021, 2, CompanyRole.LAB, 'AI safety and research company; creator of the Claude conversational assistant.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: 'Private (~$18B)', peak: 'Private (~$18B)' } });
createTech('claude', 'Claude', 2023, 2, TechRole.PRODUCT, 'AI assistant built with Constitutional AI, prioritizing helpfulness and safety.', 'AI & Physical Systems', 'Artificial Intelligence');
linkCreated('anthropic', 'claude');
linkBasedOn('claude', 'transformer');
linkBasedOn('claude', 'rlhf');

createCompany('stability_ai', 'Stability AI', 2020, 2, CompanyRole.LAB, 'Champion of open-source generative AI; developer of Stable Diffusion.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: 'Private (~$1B)', peak: 'Private (~$4B)' } });
createTech('stable_diffusion', 'Stable Diffusion', 2022, 2, TechRole.PRODUCT, 'Latent diffusion model capable of generating photo-realistic images from text.', 'AI & Physical Systems', 'Artificial Intelligence');
linkCreated('stability_ai', 'stable_diffusion');
linkBasedOn('stable_diffusion', 'diffusion');

createCompany('midjourney', 'Midjourney', 2022, 2, CompanyRole.LAB, 'Generative AI program renowned for creating high-quality, artistic images.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: 'Private', peak: 'Private' } });
linkBasedOn('midjourney', 'diffusion');

// Additional AI Pioneers
createPerson('yoshua_bengio', 'Yoshua Bengio', 2018, 1, PersonRole.THEORIST, 'Turing Award winner known as one of the "Godfathers of AI".', { primaryRole: 'AI Researcher', birthYear: 1964 });
createPerson('andrej_karpathy', 'Andrej Karpathy', 2017, 2, PersonRole.THEORIST, 'AI educator and builder who led Tesla\'s Autopilot vision system.', { primaryRole: 'Founder of Eureka Labs', secondaryRole: 'Former Tesla AI Director', birthYear: 1986 });

linkCreated('yoshua_bengio', 'backprop');
linkPartOf('andrej_karpathy', 'tesla');
linkPartOf('andrej_karpathy', 'openai');


createCompany('tesla', 'Tesla', 2003, 1, CompanyRole.PLATFORM, 'Electric vehicle and clean energy company leading in AI and robotics.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$1.1T', peak: '$1.2T' } });
createPerson('musk', 'Elon Musk', 2004, 1, PersonRole.VISIONARY, 'Driving multiple industries from electric vehicles to space exploration.', { primaryRole: 'CEO of Tesla & SpaceX', secondaryRole: 'Owner of X', birthYear: 1971 });
createTech('autopilot', 'Autopilot', 2014, 2, TechRole.PRODUCT, 'Advanced driver-assistance system enabling semi-autonomous driving.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('optimus', 'Optimus', 2021, 2, TechRole.PRODUCT, 'General-purpose humanoid robot designed to perform unsafe or repetitive tasks.', 'AI & Physical Systems', 'Robotics');
linkCreated('musk', 'tesla');
linkPartOf('musk', 'paypal');
linkCreated('tesla', 'autopilot');
linkCreated('tesla', 'optimus');
linkBasedOn('optimus', 'robotics');
linkCreated('tesla', 'autonomous_driving');
linkBasedOn('autopilot', 'autonomous_driving');
linkInfluenced('musk', 'openai');
linkBasedOn('tesla', 'gpu');

createCompany('spacex', 'SpaceX', 2002, 1, CompanyRole.INFRA, 'Aerospace manufacturer revolutionizing space access with reusable rockets.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$210B', peak: '$210B' } });
createPerson('gwynne_shotwell', 'Gwynne Shotwell', 2002, 2, PersonRole.LEADER, 'Operational mastermind who made commercial spaceflight profitable.', { primaryRole: 'Leader of SpaceX', birthYear: 1963 });
createTech('falcon9', 'Falcon 9', 2010, 1, TechRole.PRODUCT, 'Partially reusable rocket capable of reliable and safe transport to orbit.', 'AI & Physical Systems', 'Robotics');
createTech('starlink', 'Starlink', 2019, 2, TechRole.PRODUCT, 'Satellite constellation providing high-speed, low-latency broadband globally.', 'Network & Connectivity', 'Telecommunications');
createTech('starship', 'Starship', 2023, 1, TechRole.PRODUCT, 'Super heavy-lift vehicle designed for fully reusable interplanetary travel.', 'AI & Physical Systems', 'Robotics');
createEpisode('first_reusable_rocket', 'First Reusable Rocket', 2015, 1, EpisodeRole.MILESTONE, 'Falcon 9\'s historic landing, proving the viability of reusable orbital rockets.', { eventType: 'Milestone', impactScale: 'Space Revolution' });

linkCreated('musk', 'spacex');
linkPartOf('gwynne_shotwell', 'spacex');
linkCreated('spacex', 'falcon9');
linkCreated('spacex', 'starlink');
linkCreated('spacex', 'starship');
linkPartOf('first_reusable_rocket', 'spacex');

createCompany('palantir', 'Palantir', 2003, 1, CompanyRole.SERVICE, 'Software company specializing in big data analytics for defense and enterprise.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$150B', peak: '$150B' } });
createCompany('paypal', 'PayPal', 1998, 2, CompanyRole.PLATFORM, 'Online payments giant that revolutionized digital money transfers.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$70B', peak: '$350B' } });
createPerson('thiel', 'Peter Thiel', 2003, 2, PersonRole.VISIONARY, 'Contrarian investor and influential member of the PayPal Mafia.', { primaryRole: 'Co-founder of PayPal', secondaryRole: 'Co-founder of Palantir', birthYear: 1967 });
linkCreated('thiel', 'paypal');
createPerson('alex_karp', 'Alex Karp', 2004, 2, PersonRole.LEADER, 'Philosopher-CEO who built a defense AI giant.', { primaryRole: 'CEO of Palantir', birthYear: 1967 });

createTech('gotham', 'Gotham', 2008, 2, TechRole.PRODUCT, 'OS for integrating and analyzing data for counter-terrorism and fraud detection.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('foundry', 'Foundry', 2016, 2, TechRole.PRODUCT, 'Platform for integrating and analyzing data in commercial organizations.', 'AI & Physical Systems', 'Artificial Intelligence');

createEpisode('in_q_tel', 'In-Q-Tel Funding', 2003, 3, EpisodeRole.DEAL, 'CIA investment arm funds Palantir.', { eventType: 'Investment', impactScale: 'Defense AI' });
createEpisode('project_maven', 'Project Maven', 2017, 2, EpisodeRole.CRISIS, 'Controversial DoD AI project.', { eventType: 'Contract', impactScale: 'Defense AI Controversy' });

linkCreated('thiel', 'palantir');
linkPartOf('alex_karp', 'palantir');
linkCreated('palantir', 'gotham');
linkCreated('palantir', 'foundry');
linkPartOf('in_q_tel', 'darpa');
linkInfluenced('in_q_tel', 'palantir');
linkPartOf('project_maven', 'palantir');
linkPartOf('project_maven', 'google'); // Google was also involved initially



// ==========================================
// NETWORKING & INFRASTRUCTURE
// ==========================================

createCompany('cisco', 'Cisco', 1984, 1, CompanyRole.INFRA, 'Networking hardware giant enabling the global internet infrastructure.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$230B', peak: '$555B' } });
createPerson('bosack', 'Leonard Bosack', 1984, 2, PersonRole.BUILDER, 'Stanford scientist who co-pioneered the multi-protocol router.', { primaryRole: 'Co-founder of Cisco', birthYear: 1952 });
createPerson('lerner', 'Sandy Lerner', 1984, 2, PersonRole.BUILDER, 'Co-developed the technology that connected disparate networks.', { primaryRole: 'Co-founder of Cisco', birthYear: 1955 });

createTech('router', 'Multi-Protocol Router', 1986, 2, TechRole.PRODUCT, 'Device forwarding data packets between networks; key internet building block.', 'Network & Connectivity', 'Network Architecture');
createTech('ios_cisco', 'Cisco IOS', 1987, 2, TechRole.PLATFORM, 'Proprietary OS running on most Cisco network routers and switches.', 'System Software', 'Operating Systems (OS)');

createEpisode('dot_com_bubble', 'Dot-com Bubble Peak', 2000, 2, EpisodeRole.MILESTONE, 'Cisco became most valuable company in the world ($500B+).', { eventType: 'Milestone', impactScale: '$555B Peak Valuation' });

linkCreated('bosack', 'cisco');
linkCreated('lerner', 'cisco');
linkCreated('cisco', 'router');
linkCreated('cisco', 'ios_cisco');
linkBasedOn('router', 'ios_cisco');
linkPartOf('dot_com_bubble', 'cisco');
linkBasedOn('arpanet', 'router'); // ARPANET evolved into Internet via routers

// Foundational Links: Core infrastructure dependencies
linkBasedOn('www', 'router');       // Web depends on routers
linkBasedOn('cloud_computing', 'router');  // Cloud depends on networking
linkBasedOn('android', 'java');     // Android built on Java
linkBasedOn('photoshop', 'windows'); // Photoshop runs on Windows
linkBasedOn('office', 'windows');    // Office runs on Windows

createCompany('tencent', 'Tencent', 1998, 2, CompanyRole.PLATFORM, 'Chinese tech conglomerate; owner of WeChat and world\'s largest gaming company.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$450B', peak: '$900B' } });
createPerson('pony_ma', 'Pony Ma', 1998, 2, PersonRole.VISIONARY, 'Quiet architect of China\'s digital ecosystem with WeChat and gaming.', { primaryRole: 'Founder of Tencent', birthYear: 1971 });
createTech('wechat', 'WeChat', 2011, 1, TechRole.PRODUCT, 'All-in-one "super app" for messaging, payments, and social media in China.', 'Digital Services & Platforms', 'Social & Media');

createCompany('alibaba', 'Alibaba', 1999, 2, CompanyRole.PLATFORM, 'Global e-commerce and cloud computing titan founded by Jack Ma.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$200B', peak: '$850B' } });
createPerson('jack_ma', 'Jack Ma', 1999, 1, PersonRole.VISIONARY, 'Face of Chinese entrepreneurship who built an e-commerce empire.', { primaryRole: 'Founder of Alibaba', birthYear: 1964 });
createTech('alipay', 'Alipay', 2004, 2, TechRole.PRODUCT, 'Mobile payment platform reshaping China\'s digital economy.', 'Digital Services & Platforms', 'Digital Platforms');
createEpisode('ant_group_halt', 'Ant Group IPO Halt', 2020, 2, EpisodeRole.CRISIS, 'Chinese government crackdown on Jack Ma and Big Tech.', { eventType: 'Regulatory', impactScale: '$37B IPO Cancelled' });

linkCreated('pony_ma', 'tencent');
linkCreated('tencent', 'wechat');

linkCreated('jack_ma', 'alibaba');
linkCreated('alibaba', 'alipay');
linkPartOf('ant_group_halt', 'alibaba');
linkPartOf('ant_group_halt', 'jack_ma');

// Baidu removed as per request

// ByteDance - Social Media & AI
createCompany('bytedance', 'ByteDance', 2012, 1, CompanyRole.PLATFORM, 'World\'s most valuable startup; parent company of TikTok and Douyin.', CompanyCategory.MEDIA_CONTENT, { marketCap: { current: '$300B', peak: '$400B' } });
createPerson('zhang_yiming', 'Zhang Yiming', 2012, 2, PersonRole.VISIONARY, 'Engineer-turned-entrepreneur who built a global empire on AI recommendation.', { primaryRole: 'Founder of ByteDance', birthYear: 1983 });
createPerson('shou_zi_chew', 'Shou Zi Chew', 2021, 2, PersonRole.LEADER, 'Led TikTok through intense global regulatory scrutiny and growth.', { primaryRole: 'CEO of TikTok', birthYear: 1983 });

// TikTok/Douyin merged into single node (same service, different markets)
createTech('tiktok', 'TikTok', 2016, 1, TechRole.PRODUCT, 'Short-form video app disrupting global social media with viral content.', 'Digital Services & Platforms', 'Social & Media');
createTech('rec_algo', 'Recommendation Algorithm', 2012, 2, TechRole.CORE, 'Algorithm delivering highly personalized content feeds to maximize engagement.', 'AI & Physical Systems', 'Artificial Intelligence');

createEpisode('tiktok_ban_threat', 'TikTok US Ban Threat', 2020, 2, EpisodeRole.CRISIS, 'US government threatens to ban TikTok over national security concerns.', { eventType: 'Regulatory', impactScale: 'National Security Concern' });

linkCreated('zhang_yiming', 'bytedance');
linkPartOf('shou_zi_chew', 'bytedance');
linkCreated('bytedance', 'tiktok');
linkCreated('bytedance', 'rec_algo');
linkBasedOn('tiktok', 'rec_algo');
linkPartOf('tiktok_ban_threat', 'bytedance');

// Huawei - Telecom & Hardware
createCompany('huawei', 'Huawei', 1987, 1, CompanyRole.INFRA, 'Global leader in telecommunications equipment and consumer electronics.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: 'Private (~$100B)', peak: 'Private (~$150B)' } });
createPerson('ren_zhengfei', 'Ren Zhengfei', 1987, 2, PersonRole.VISIONARY, 'Former PLA engineer who built a global telecommunications research powerhouse.', { primaryRole: 'Founder of Huawei', birthYear: 1944 });

createTech('5g_infra', '5G Infrastructure', 2019, 1, TechRole.CORE, 'Critical hardware and software infrastructure for next-gen mobile networks.', 'Network & Connectivity', 'Telecommunications');
createTech('harmony_os', 'HarmonyOS', 2019, 2, TechRole.PLATFORM, 'Distributed operating system managing smart devices across all scenarios.', 'System Software', 'Operating Systems (OS)');
createTech('kirin_chip', 'Kirin Chip', 2014, 2, TechRole.PRODUCT, 'High-performance mobile processors designed by HiSilicon (Huawei).', 'Hardware & Infrastructure', 'Processors & Compute');

createEpisode('us_sanctions', 'US Entity List', 2019, 2, EpisodeRole.CRISIS, 'US bans American companies from selling tech to Huawei, crippling its smartphone business.', { eventType: 'Sanctions', impactScale: 'Trade War' });
createEpisode('meng_wanzhou', 'Meng Wanzhou Arrest', 2018, 2, EpisodeRole.CRISIS, 'Huawei CFO arrested in Canada on US fraud charges, sparking diplomatic crisis.', { eventType: 'Arrest', impactScale: 'Diplomatic Crisis' });

linkCreated('ren_zhengfei', 'huawei');
linkCreated('huawei', '5g_infra');
linkCreated('huawei', 'harmony_os');
linkCreated('huawei', 'kirin_chip');
linkPartOf('us_sanctions', 'huawei');
linkPartOf('meng_wanzhou', 'huawei');

// Dependencies
linkBasedOn('harmony_os', 'android'); // Forked/Compatible
linkBasedOn('kirin_chip', 'arm_arch'); // Uses ARM architecture
linkBasedOn('5g_infra', '5g_patents'); // Relies on global standards (Qualcomm etc)

// ==========================================
// DRONE INDUSTRY & AUTONOMOUS FLIGHT
// ==========================================

// DJI - Drone Market Leader
createCompany('dji', 'DJI', 2006, 2, CompanyRole.PLATFORM, 'Global leader in civilian drones and aerial imaging technology.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: 'Private (~$15B)', peak: 'Private (~$16B)' } });
createPerson('frank_wang', 'Frank Wang', 2006, 2, PersonRole.VISIONARY, 'Revolutionized aerial photography by building the drone industry giant.', { primaryRole: 'Founder of DJI', birthYear: 1980 });

// Core DJI Technologies (reduced to 3)
createTech('quadcopter', 'Consumer Quadcopter', 2010, 2, TechRole.PRODUCT, 'UAV with four rotors, enabling stable and accessible aerial photography.', 'AI & Physical Systems', 'Robotics');
createTech('gimbal_stabilization', 'Gimbal Stabilization', 2012, 2, TechRole.CORE, '3-axis camera stabilization for smooth aerial footage.', 'AI & Physical Systems', 'Robotics');

createEpisode('phantom_launch', 'DJI Phantom Launch', 2013, 2, EpisodeRole.MILESTONE, 'Launch of the Phantom, democratizing aerial photography for consumers.', { eventType: 'Product Launch', impactScale: 'Drone Market Creator' });
createEpisode('faa_drone_rules', 'FAA Drone Regulations', 2016, 2, EpisodeRole.MILESTONE, 'US FAA established Part 107 commercial drone rules, legitimizing drone industry.', { eventType: 'Regulatory', impactScale: 'Industry Legitimization' });

linkCreated('frank_wang', 'dji');
linkCreated('dji', 'quadcopter');
linkCreated('dji', 'gimbal_stabilization');
linkCreated('dji', 'drone');
linkBasedOn('quadcopter', 'drone');
linkPartOf('phantom_launch', 'dji');
linkPartOf('faa_drone_rules', 'dji');

// ==========================================
// VIDEO COMMUNICATION & REMOTE WORK
// ==========================================

createTech('voip', 'VoIP', 1995, 2, TechRole.STANDARD, 'Technology delivering voice communications over Internet Protocol networks.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('webrtc', 'WebRTC', 2011, 2, TechRole.STANDARD, 'Real-time communication standard.', 'Fundamental Concepts', 'Standards & Protocols');

// Skype (Microsoft Product)
createTech('skype', 'Skype', 2003, 2, TechRole.PRODUCT, 'Pioneering application for peer-to-peer video calls and messaging.', 'Digital Services & Platforms', 'Digital Platforms');
createEpisode('ms_skype_deal', 'Microsoft Acquires Skype', 2011, 2, EpisodeRole.DEAL, 'Microsoft buys Skype for $8.5B to dominate enterprise comms.', { eventType: 'Acquisition', impactScale: '$8.5B Deal' });

linkCreated('microsoft', 'skype');
linkBasedOn('skype', 'voip');
linkPartOf('ms_skype_deal', 'microsoft');
linkPartOf('ms_skype_deal', 'skype');

// ==========================================
// ROBOTICS & AUTONOMOUS SYSTEMS
// ==========================================

// 1. Autonomous Driving
// Waymo removed as per request, linked directly to Google
createTech('self_driving_car', 'Self-Driving Car', 2009, 1, TechRole.PRODUCT, 'Vehicle capable of sensing its environment and operating without human input.', 'AI & Physical Systems', 'Autonomous Mobility');
createCompany('mobileye', 'Mobileye', 1999, 2, CompanyRole.INFRA, 'Leader in advanced driver-assistance systems and autonomous driving tech.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$20B', peak: '$50B' } });
createTech('adas', 'ADAS', 1999, 2, TechRole.STANDARD, 'Advanced Driver Assistance Systems - electronic systems that assist drivers.', 'AI & Physical Systems', 'Autonomous Mobility');

linkCreated('google', 'self_driving_car'); // Waymo (formerly Google Self-Driving Car Project)
linkInfluenced('darpa_grand_challenge', 'self_driving_car'); // Origins
linkCreated('mobileye', 'adas');
linkPartOf('mobileye', 'intel'); // Acquired by Intel

// 2. Robotics
createCompany('boston_dynamics', 'Boston Dynamics', 1992, 2, CompanyRole.LAB, 'Robotics company famous for highly mobile and dynamic humanoid robots.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$1.1B', peak: '$1.5B' } });
createPerson('marc_raibert', 'Marc Raibert', 1992, 2, PersonRole.VISIONARY, 'Father of dynamic robots that can run, jump, and dance.', { primaryRole: 'Founder of Boston Dynamics', birthYear: 1949 });
createTech('spot', 'Spot', 2016, 2, TechRole.PRODUCT, 'Agile dog-like robot designed for sensing and inspection in tough terrain.', 'AI & Physical Systems', 'Robotics');
createTech('atlas', 'Atlas', 2013, 2, TechRole.PRODUCT, 'Advanced humanoid robot demonstrating remarkable agility and coordination.', 'AI & Physical Systems', 'Robotics');
createEpisode('hyundai_robot_deal', 'Hyundai Robot Deal', 2020, 2, EpisodeRole.DEAL, 'Hyundai Motor Group acquires controlling interest in Boston Dynamics from SoftBank.', { eventType: 'Acquisition', impactScale: '$1.1B Deal' });

createCompany('irobot', 'iRobot', 1990, 2, CompanyRole.PRODUCT, 'Consumer robot company known for Roomba.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$1.4B', peak: '$10B' } });
createTech('roomba', 'Roomba', 2002, 2, TechRole.PRODUCT, 'Series of autonomous robotic vacuum cleaners for home use.', 'AI & Physical Systems', 'Robotics');

linkCreated('marc_raibert', 'boston_dynamics');
linkCreated('boston_dynamics', 'spot');
linkCreated('boston_dynamics', 'atlas');
linkInfluenced('hyundai_robot_deal', 'boston_dynamics');
linkInfluenced('hyundai_robot_deal', 'softbank');
linkCreated('irobot', 'roomba');

// 3. Core Technologies
createTech('robotics', 'Robotics', 1961, 1, TechRole.CORE, 'The branch of technology that deals with the design, construction, operation, and application of robots.', 'AI & Physical Systems', 'Robotics');
createTech('autonomous_driving', 'Autonomous Driving', 2004, 1, TechRole.CORE, 'Self-driving technology enabling vehicles to navigate without human input.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('drone', 'Drone', 2010, 1, TechRole.CORE, 'Unmanned Aerial Vehicles (UAVs) for consumer and industrial use.', 'AI & Physical Systems', 'Robotics');

createTech('ros', 'ROS', 2007, 2, TechRole.STANDARD, 'Robot Operating System - flexible framework for writing robot software.', 'System Software', 'Operating Systems (OS)');
createTech('lidar', 'LiDAR', 2005, 2, TechRole.CORE, 'Light Detection and Ranging - essential sensor for 3D mapping and autonomy.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('computer_vision', 'Computer Vision', 2012, 1, TechRole.CORE, 'Field of AI that enables computers to derive meaningful information from digital images.', 'AI & Physical Systems', 'Artificial Intelligence');

// Interconnections (The Trinity)
linkBasedOn('autonomous_driving', 'robotics');
linkBasedOn('drone', 'robotics');
linkInfluenced('autonomous_driving', 'drone'); // Shared autonomy tech

// Robotics Ecosystem
linkBasedOn('spot', 'robotics');
linkBasedOn('atlas', 'robotics');
linkBasedOn('roomba', 'robotics');
linkBasedOn('ros', 'robotics');
linkCreated('boston_dynamics', 'robotics');
linkCreated('irobot', 'robotics');

// Autonomous Driving Ecosystem
linkBasedOn('self_driving_car', 'autonomous_driving');
linkBasedOn('adas', 'autonomous_driving');
linkCreated('google', 'autonomous_driving');
linkCreated('mobileye', 'autonomous_driving');

// Drone Ecosystem
// linkBasedOn('quadcopter', 'drone'); // defined earlier
// linkBasedOn('fpv_drone', 'drone'); // defined earlier
// linkBasedOn('autonomous_flight', 'drone'); // defined earlier
linkCreated('dji', 'drone');

linkBasedOn('self_driving_car', 'lidar');
linkBasedOn('self_driving_car', 'computer_vision');
linkBasedOn('adas', 'computer_vision');
linkBasedOn('spot', 'ros');
linkBasedOn('atlas', 'ros');
linkBasedOn('roomba', 'ros');
linkCreated('nvidia', 'computer_vision'); // Major enabler via GPU

linkCreated('dji', 'drone');

linkBasedOn('self_driving_car', 'lidar');
linkBasedOn('self_driving_car', 'computer_vision');
linkBasedOn('adas', 'computer_vision');
linkBasedOn('spot', 'ros');
linkBasedOn('atlas', 'ros');
linkBasedOn('roomba', 'ros');
linkCreated('nvidia', 'computer_vision'); // Major enabler via GPU

// ==========================================
// FRONTIER TECHNOLOGIES
// ==========================================

// 1. Internet of Things (IoT)
createTech('iot', 'IoT', 1999, 1, TechRole.CORE, 'Network of physical objects embedded with sensors exchanging data.', 'Network & Connectivity', 'Network Architecture');
createTech('raspberry_pi', 'Raspberry Pi', 2012, 2, TechRole.PRODUCT, 'Affordable credit-card-sized computer inspiring makers and educators.', 'Hardware & Infrastructure', 'Devices & Form Factors');

linkBasedOn('iot', '5g_patents'); // Connectivity
linkBasedOn('iot', 'arm'); // Powering 90%+ of IoT
linkCreated('raspberry_pi', 'iot');
linkBasedOn('raspberry_pi', 'arm');

// 2. Metaverse & Spatial Computing
createTech('metaverse', 'Metaverse', 1992, 2, TechRole.STANDARD, 'Hypothetical iteration of the internet as a single, universal virtual world.', 'Digital Services & Platforms', 'Spatial Computing');
createTech('vr', 'Virtual Reality', 1968, 2, TechRole.CORE, 'Simulated 3D environment enabling immersive user interaction.', 'AI & Physical Systems', 'Spatial Computing');
createTech('ar', 'Augmented Reality', 1990, 2, TechRole.CORE, 'Digital overlays on the real world.', 'AI & Physical Systems', 'Spatial Computing');

createTech('oculus', 'Oculus', 2012, 2, TechRole.PRODUCT, 'VR headset brand that revitalized consumer interest in virtual reality.', 'AI & Physical Systems', 'Spatial Computing');
createPerson('palmer_luckey', 'Palmer Luckey', 2012, 2, PersonRole.VISIONARY, 'Revived the virtual reality industry with the Oculus Rift.', { primaryRole: 'Founder of Oculus', secondaryRole: 'Founder of Anduril', birthYear: 1992 });

linkPartOf('palmer_luckey', 'oculus');
linkCreated('meta', 'oculus'); // Acquired by Meta
linkBasedOn('oculus', 'vr');
linkBasedOn('metaverse', 'vr');
linkBasedOn('metaverse', 'ar');
linkCreated('nvidia', 'metaverse'); // Omniverse / GPU power

// 3. Quantum Computing
createTech('quantum_computing', 'Quantum Computing', 1980, 1, TechRole.CORE, 'Advanced computing leveraging quantum mechanics to solve complex problems.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('qubit', 'Qubit', 1995, 2, TechRole.CORE, 'Fundamental unit of quantum information, capable of superposition.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('sycamore', 'Sycamore', 2019, 2, TechRole.PRODUCT, 'Quantum processor claiming supremacy by solving a task infeasible for classical PCs.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('ibm_q', 'IBM Q System One', 2019, 2, TechRole.PRODUCT, 'First circuit-based commercial quantum computer.', 'Hardware & Infrastructure', 'Processors & Compute');

linkBasedOn('quantum_computing', 'qubit');
linkCreated('google', 'sycamore');
linkBasedOn('sycamore', 'quantum_computing');
linkCreated('ibm', 'ibm_q');
linkBasedOn('ibm_q', 'quantum_computing');

// ==========================================
// VENTURE CAPITAL & INVESTORS
// ==========================================

// 1. The Sand Hill Road Giants
createCompany('sequoia', 'Sequoia Capital', 1972, 2, CompanyRole.INFRA, 'Top-tier venture capital firm backing companies like Apple and Google.', CompanyCategory.VENTURE_CAPITAL, { marketCap: { current: 'AUM ~$85B', peak: 'AUM ~$85B' } });
createPerson('don_valentine', 'Don Valentine', 1972, 2, PersonRole.INVESTOR, 'The grandfather of Silicon Valley VC who backed Apple, Oracle, and Cisco.', { primaryRole: 'Founder of Sequoia', birthYear: 1932, deathYear: 2019 });

createCompany('kpcb', 'Kleiner Perkins', 1972, 2, CompanyRole.INFRA, 'Historic venture firm known for backing Amazon, Google, and Netscape.', CompanyCategory.VENTURE_CAPITAL, { marketCap: { current: 'AUM ~$18B', peak: 'AUM ~$18B' } });
createPerson('john_doerr', 'John Doerr', 1980, 2, PersonRole.INVESTOR, 'Legendary proselytizer of OKRs who backed Google and Amazon.', { primaryRole: 'Investor at Kleiner Perkins', birthYear: 1951 });

createCompany('a16z', 'Andreessen Horowitz', 2009, 2, CompanyRole.INFRA, 'Venture capital firm famous for the motto \'Software is eating the world\'.', CompanyCategory.VENTURE_CAPITAL, { marketCap: { current: 'AUM ~$35B', peak: 'AUM ~$35B' } });
// Marc Andreessen already exists

// 2. The Accelerators
createCompany('y_combinator', 'Y Combinator', 2005, 2, CompanyRole.INFRA, 'Premiere startup accelerator launching Airbnb, Stripe, and Dropbox.', CompanyCategory.VENTURE_CAPITAL, { marketCap: { current: 'AUM ~$600M', peak: 'AUM ~$600M' } });
createPerson('paul_graham', 'Paul Graham', 2005, 2, PersonRole.INVESTOR, 'Hacker, essayist, and mentor who created the startup accelerator model.', { primaryRole: 'Co-founder of Y Combinator', birthYear: 1964 });

// Connections
linkCreated('don_valentine', 'sequoia');
linkCreated('john_doerr', 'kpcb');
linkCreated('andreessen', 'a16z'); // Marc Andreessen
linkCreated('paul_graham', 'y_combinator');

// Sequoia Portfolio - via Investment Episodes
createEpisode('sequoia_apple', 'Sequoia invests in Apple', 1978, 3, EpisodeRole.DEAL, 'Don Valentine made the crucial early investment in Apple.', { eventType: 'Investment', impactScale: 'Early Stage' });
createEpisode('sequoia_google', 'Sequoia invests in Google', 1999, 2, EpisodeRole.DEAL, 'Sequoia backed Google in its Series A round.', { eventType: 'Investment', impactScale: 'Series A' });
createEpisode('sequoia_oracle', 'Sequoia invests in Oracle', 1977, 3, EpisodeRole.DEAL, 'Early investment in database giant.', { eventType: 'Investment', impactScale: 'Early Stage' });
createEpisode('sequoia_nvidia', 'Sequoia invests in NVIDIA', 1993, 2, EpisodeRole.DEAL, 'Sequoia backed the GPU pioneer.', { eventType: 'Investment', impactScale: 'Seed Round' });
createEpisode('sequoia_paypal', 'Sequoia invests in PayPal', 1999, 2, EpisodeRole.DEAL, 'Sequoia backed the payments revolution.', { eventType: 'Investment', impactScale: 'Early Stage' });
createEpisode('sequoia_youtube', 'Sequoia invests in YouTube', 2005, 2, EpisodeRole.DEAL, 'Sequoia backed the video platform.', { eventType: 'Investment', impactScale: 'First Round' });
createEpisode('sequoia_whatsapp', 'Sequoia invests in WhatsApp', 2011, 2, EpisodeRole.DEAL, 'Sequoia was the sole institutional investor.', { eventType: 'Investment', impactScale: '60x Return' });

// Sequoia triggered these investments
linkInfluenced('sequoia', 'sequoia_apple');
linkInfluenced('sequoia', 'sequoia_google');
linkInfluenced('sequoia', 'sequoia_oracle');
linkInfluenced('sequoia', 'sequoia_nvidia');
linkInfluenced('sequoia', 'sequoia_paypal');
linkInfluenced('sequoia', 'sequoia_youtube');
linkInfluenced('sequoia', 'sequoia_whatsapp');

linkInfluenced('sequoia_apple', 'apple');
linkInfluenced('sequoia_google', 'google');
linkInfluenced('sequoia_oracle', 'oracle');
linkInfluenced('sequoia_nvidia', 'nvidia');
linkInfluenced('sequoia_paypal', 'paypal');
linkInfluenced('sequoia_youtube', 'youtube');
linkInfluenced('sequoia_whatsapp', 'whatsapp');

// Kleiner Perkins Portfolio - via Investment Episodes
createEpisode('kpcb_amazon', 'Kleiner Perkins invests in Amazon', 1996, 2, EpisodeRole.DEAL, 'John Doerr backed Amazon early.', { eventType: 'Investment', impactScale: 'Early Stage' });
createEpisode('kpcb_google', 'Kleiner Perkins invests in Google', 1999, 2, EpisodeRole.DEAL, 'Kleiner Perkins co-led Google Series A.', { eventType: 'Investment', impactScale: 'Series A' });
createEpisode('kpcb_netscape', 'Kleiner Perkins invests in Netscape', 1994, 2, EpisodeRole.DEAL, 'Kleiner Perkins backed the browser pioneer.', { eventType: 'Investment', impactScale: 'Early Stage' });
createEpisode('kpcb_sun', 'Kleiner Perkins invests in Sun', 1982, 3, EpisodeRole.DEAL, 'Early investment in Sun Microsystems.', { eventType: 'Investment', impactScale: 'Early Stage' });

// KPCB triggered these investments
linkInfluenced('kpcb', 'kpcb_amazon');
linkInfluenced('kpcb', 'kpcb_google');
linkInfluenced('kpcb', 'kpcb_netscape');
linkInfluenced('kpcb', 'kpcb_sun');

linkInfluenced('kpcb_amazon', 'amazon');
linkInfluenced('kpcb_google', 'google');
linkInfluenced('kpcb_netscape', 'netscape');
linkInfluenced('kpcb_sun', 'sun');

// a16z Portfolio - via Investment Episodes
createEpisode('a16z_facebook', 'a16z invests in Facebook', 2010, 2, EpisodeRole.DEAL, 'Andreessen Horowitz backed the social giant.', { eventType: 'Investment', impactScale: 'Late Stage' });
createEpisode('a16z_twitter', 'a16z invests in Twitter', 2011, 2, EpisodeRole.DEAL, 'a16z invested in the microblogging platform.', { eventType: 'Investment', impactScale: 'Growth Stage' });
createEpisode('a16z_airbnb', 'a16z invests in Airbnb', 2011, 2, EpisodeRole.DEAL, 'a16z backed the sharing economy pioneer.', { eventType: 'Investment', impactScale: 'Series A' });
createEpisode('a16z_github', 'a16z invests in GitHub', 2012, 2, EpisodeRole.DEAL, 'a16z led GitHub Series A.', { eventType: 'Investment', impactScale: 'Series A' });
createEpisode('a16z_skype', 'a16z invests in Skype', 2009, 2, EpisodeRole.DEAL, 'a16z backed the VoIP pioneer.', { eventType: 'Investment', impactScale: 'Growth Stage' });

// a16z triggered these investments
linkInfluenced('a16z', 'a16z_facebook');
linkInfluenced('a16z', 'a16z_twitter');
linkInfluenced('a16z', 'a16z_airbnb');
linkInfluenced('a16z', 'a16z_github');
linkInfluenced('a16z', 'a16z_skype');

linkInfluenced('a16z_facebook', 'meta');
linkInfluenced('a16z_twitter', 'twitter');
linkInfluenced('a16z_airbnb', 'airbnb');
linkInfluenced('a16z_github', 'github');
linkInfluenced('a16z_skype', 'skype');

// Y Combinator Portfolio - via Investment Episodes
createEpisode('yc_airbnb', 'Y Combinator funds Airbnb', 2009, 2, EpisodeRole.DEAL, 'YC backed Airbnb in its earliest days.', { eventType: 'Investment', impactScale: 'Seed Stage' });
linkInfluenced('y_combinator', 'yc_airbnb'); // YC triggered the investment
linkInfluenced('yc_airbnb', 'airbnb');

// SoftBank Investments - via Investment Episodes
createEpisode('softbank_uber', 'SoftBank invests in Uber', 2018, 2, EpisodeRole.DEAL, 'Vision Fund led massive investment in Uber.', { eventType: 'Investment', impactScale: '$7.7B Investment' });
createEpisode('softbank_nvidia', 'SoftBank invests in NVIDIA', 2017, 2, EpisodeRole.DEAL, 'SoftBank bought $4B stake in NVIDIA.', { eventType: 'Investment', impactScale: '$4B Stake' });

linkPartOf('softbank_uber', 'softbank');
linkPartOf('softbank_nvidia', 'softbank');

linkInfluenced('softbank_uber', 'uber');
linkInfluenced('softbank_nvidia', 'nvidia');

// ==========================================
// FINTECH & CRYPTOCURRENCY
// ==========================================

// 1. Core Technologies
createTech('blockchain', 'Blockchain', 2008, 1, TechRole.CORE, 'Decentralized, distributed ledger technology ensuring data integrity.', 'Digital Services & Platforms', 'Fintech & Crypto');
createTech('smart_contracts', 'Smart Contracts', 2015, 2, TechRole.STANDARD, 'Self-executing contracts with the terms directly written into code.', 'System Software', 'Development & Languages');
createTech('defi', 'DeFi', 2017, 2, TechRole.STANDARD, 'Decentralized Finance - financial services on public blockchains.', 'Digital Services & Platforms', 'Fintech & Crypto');
createTech('stablecoin', 'Stablecoin', 2014, 2, TechRole.STANDARD, 'Cryptocurrencies pegged to stable assets like USD.', 'Digital Services & Platforms', 'Fintech & Crypto');

// 2. Major Platforms & Cryptocurrencies
// Bitcoin
createTech('bitcoin', 'Bitcoin', 2009, 1, TechRole.PRODUCT, 'First decentralized cryptocurrency, enabling peer-to-peer value transfer.', 'Digital Services & Platforms', 'Fintech & Crypto');
createPerson('satoshi', 'Satoshi Nakamoto', 2008, 1, PersonRole.THEORIST, 'Pseudonymous creator of Bitcoin and blockchain technology.', { primaryRole: 'Creator of Bitcoin' });
createEpisode('bitcoin_whitepaper', 'Bitcoin Whitepaper', 2008, 1, EpisodeRole.MILESTONE, 'Publication of "Bitcoin: A Peer-to-Peer Electronic Cash System".', { eventType: 'Publication', impactScale: 'Crypto Genesis' });

// Ethereum
createTech('ethereum', 'Ethereum', 2015, 1, TechRole.PLATFORM, 'Decentralized blockchain platform enabling smart contracts and DApps.', 'Digital Services & Platforms', 'Fintech & Crypto');
createPerson('vitalik', 'Vitalik Buterin', 2015, 1, PersonRole.VISIONARY, 'Proposed Ethereum, enabling smart contracts and decentralized applications.', { primaryRole: 'Co-founder of Ethereum', birthYear: 1994 });
createEpisode('the_merge', 'The Merge', 2022, 2, EpisodeRole.MILESTONE, 'Major upgrade shifting Ethereum to Proof-of-Stake, slashing energy use.', { eventType: 'Upgrade', impactScale: '99% Energy Cut' });

// 3. DeFi & Applications
// 3. DeFi & Applications
// Removed DeFi nodes as per request

// 4. Centralized Powerhouses (CeFi)
// Removed Coinbase as per request
createCompany('binance', 'Binance', 2017, 2, CompanyRole.PLATFORM, 'World\'s largest cryptocurrency exchange by trading volume.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: 'Private (~$30B)', peak: 'Private (~$100B)' } });
createPerson('cz', 'Changpeng Zhao', 2017, 2, PersonRole.VISIONARY, 'Built Binance into the world\'s largest cryptocurrency exchange ecosystem.', { primaryRole: 'Founder of Binance', birthYear: 1977 });
createEpisode('ftx_collapse', 'FTX Collapse', 2022, 1, EpisodeRole.CRISIS, 'Collapse of major exchange due to fraud, shaking industry confidence.', { eventType: 'Crisis', impactScale: '$32B Collapse' });

// Connections
linkCreated('satoshi', 'bitcoin');
linkPartOf('bitcoin_whitepaper', 'bitcoin');
linkBasedOn('bitcoin', 'blockchain');

linkCreated('vitalik', 'ethereum');
linkPartOf('the_merge', 'ethereum');
linkBasedOn('ethereum', 'blockchain');
linkCreated('ethereum', 'smart_contracts');
linkInfluenced('bitcoin', 'ethereum'); // Bitcoin inspired Ethereum

linkPartOf('cz', 'binance');
linkCreated('binance', 'bitcoin');
linkCreated('binance', 'ethereum');

linkInfluenced('ftx_collapse', 'binance'); // Binance triggered the run
linkInfluenced('ftx_collapse', 'bitcoin');
linkInfluenced('bitcoin', 'stablecoin');
linkBasedOn('defi', 'stablecoin');

// 3. Asian FinTech
createTech('paypay', 'PayPay', 2018, 2, TechRole.PRODUCT, 'Dominant QR payment service in Japan.', 'Digital Services & Platforms', 'Digital Platforms');
linkCreated('softbank', 'paypay'); // Joint venture, but SoftBank is the parent in our graph
// linkCreated('yahoo_japan', 'paypay'); // Yahoo Japan not in graph

// Zoom
createCompany('zoom', 'Zoom', 2011, 1, CompanyRole.PLATFORM, 'Leader in modern enterprise video communications and collaboration.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$20B', peak: '$160B' } });
createEpisode('zoom_boom', 'The Zoom Boom', 2020, 1, EpisodeRole.MILESTONE, 'COVID-19 pandemic drives massive global adoption of video conferencing.', { eventType: 'Adoption', impactScale: '30x User Growth' });

// Early IBM Technologies
createTech('punch_card', 'Punch Card', 1928, 3, TechRole.STANDARD, 'Early storage medium using punched holes to represent digital data.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('ibm_system_360', 'IBM System/360', 1964, 2, TechRole.PRODUCT, 'Revolutionary mainframe family introducing the concept of backward compatibility.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('pos_system', 'Point of Sale System', 1973, 3, TechRole.PRODUCT, 'Computerized system managing sales, inventory, and payments at checkout.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('upc_barcode', 'UPC Barcode', 1974, 3, TechRole.STANDARD, 'Standard unique sequence of numbers and bars for tracking trade items.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('dram', 'DRAM', 1968, 2, TechRole.CORE, 'Most common type of volatile computer memory used in modern electronics.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('risc', 'RISC Architecture', 1980, 2, TechRole.CORE, 'CPU design philosophy simplifying instructions for higher performance.', 'Fundamental Concepts', 'Theories & Architectures');

// IBM PC Era
createTech('ibm_pc', 'IBM PC', 1981, 1, TechRole.PRODUCT, 'First personal computer to gain widespread adoption, setting industry standards.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('powerpc', 'PowerPC', 1991, 2, TechRole.PRODUCT, 'RISC architecture alliance between Apple, IBM, and Motorola.', 'Hardware & Infrastructure', 'Processors & Compute');

// Modern IBM Era
createTech('watson_super', 'Watson', 2011, 2, TechRole.PRODUCT, 'Question-answering computer system capable of answering questions in natural language.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('ibm_quantum', 'IBM Quantum (Eagle)', 2021, 2, TechRole.PRODUCT, 'Advanced superconducting quantum processor pushing the limits of computation.', 'Hardware & Infrastructure', 'Processors & Compute');

// IBM Episodes
createEpisode('ibm_loss_1993', 'IBM\'s $8B Loss', 1993, 2, EpisodeRole.CRISIS, 'Record $8B annual loss forcing a massive corporate restructuring.', { eventType: 'Crisis', impactScale: '-$8B Loss' });
createEpisode('lenovo_acquisition', 'Lenovo Acquires IBM PC', 2005, 2, EpisodeRole.DEAL, 'Sale of IBM\'s PC division, marking its exit from consumer hardware.', { eventType: 'Acquisition', impactScale: '$1.75B Deal' });

// IBM Technology Links
linkCreated('ibm', 'punch_card');
linkCreated('ibm', 'ibm_system_360');
linkCreated('ibm', 'pos_system');
linkCreated('ibm', 'upc_barcode');
linkCreated('ibm', 'dram');
linkCreated('ibm', 'risc');
linkCreated('ibm', 'ibm_pc');
linkCreated('ibm', 'powerpc');
linkCreated('ibm', 'watson_super');
linkCreated('ibm', 'ibm_quantum');

// IBM System/360 to Mainframe connection
linkInfluenced('ibm_system_360', 'mainframe', 0.9);
linkBasedOn('mainframe', 'ibm_system_360');

// PowerPC connections to Apple
linkBasedOn('apple', 'powerpc'); // Apple used PowerPC in Macs from 1994-2006
linkInfluenced('powerpc', 'apple_silicon', 0.4); // PowerPC influenced Apple's later silicon strategy

// IBM PC influence on Wintel Alliance
linkInfluenced('ibm_pc', 'wintel_alliance', 0.9);
linkPartOf('wintel_alliance', 'ibm');

// RISC influence on modern architectures
linkInfluenced('risc', 'powerpc', 0.9);
linkInfluenced('risc', 'arm_arch', 0.7);

// IBM Episodes
linkPartOf('ibm_loss_1993', 'ibm');
linkPartOf('lenovo_acquisition', 'ibm');


// ==========================================
// MAJOR WEB PLATFORMS & SOCIAL GIANTS
// ==========================================

// 1. Social Media Giants

// YouTube
createTech('youtube', 'YouTube', 2005, 1, TechRole.PRODUCT, 'World\'s largest video-sharing platform, revolutionizing media consumption.', 'Digital Services & Platforms', 'Social & Media');
createPerson('chad_hurley', 'Chad Hurley', 2005, 2, PersonRole.VISIONARY, 'Design-focused co-founder who helped shape YouTube\'s user experience.', { primaryRole: 'Co-founder of YouTube', birthYear: 1977 });
createPerson('steve_chen', 'Steve Chen', 2005, 2, PersonRole.BUILDER, 'Engineering lead who built the scalable video infrastructure for YouTube.', { primaryRole: 'Co-founder of YouTube', birthYear: 1978 });

linkCreated('google', 'youtube'); // Acquired by Google
linkPartOf('chad_hurley', 'youtube');
linkPartOf('chad_hurley', 'paypal');
linkPartOf('steve_chen', 'youtube');
linkPartOf('steve_chen', 'paypal');
linkPartOf('chad_hurley', 'paypal_mafia');
linkPartOf('steve_chen', 'paypal_mafia');

// Meta Ecosystem (Facebook, Instagram, WhatsApp)
createCompany('meta', 'Meta', 2004, 1, CompanyRole.PLATFORM, 'Technology conglomerate connecting billions; parent of Facebook, Instagram, WhatsApp.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$1.5T', peak: '$1.5T' } });
createTech('sns', 'SNS', 2004, 1, TechRole.STANDARD, 'Platform enabling users to build social networks and share content.', 'Digital Services & Platforms', 'Social & Media');

createTech('facebook_app', 'Facebook App', 2004, 1, TechRole.PRODUCT, 'Social network that pioneered the modern era of digital social connection.', 'Digital Services & Platforms', 'Social & Media');
createTech('instagram', 'Instagram', 2010, 1, TechRole.PRODUCT, 'Photo and video sharing app focused on visual storytelling and filters.', 'Digital Services & Platforms', 'Social & Media');
createTech('whatsapp', 'WhatsApp', 2009, 1, TechRole.PRODUCT, 'Cross-platform centralized instant messaging and voice-over-IP service.', 'Digital Services & Platforms', 'Social & Media');

linkBasedOn('facebook_app', 'sns');
linkBasedOn('instagram', 'sns');
linkBasedOn('whatsapp', 'sns');
linkBasedOn('twitter', 'sns');
linkBasedOn('linkedin', 'sns');
linkBasedOn('youtube', 'sns');
linkBasedOn('tiktok', 'sns');
linkBasedOn('douyin', 'sns');
linkBasedOn('wechat', 'sns');

createPerson('zuckerberg', 'Mark Zuckerberg', 2004, 1, PersonRole.VISIONARY, 'Connected the world through Facebook and pivoted to the Metaverse.', { primaryRole: 'CEO of Meta', birthYear: 1984 });
createPerson('kevin_systrom', 'Kevin Systrom', 2010, 2, PersonRole.VISIONARY, 'Co-founded Instagram with a focus on simple, beautiful photo sharing.', { primaryRole: 'Founder of Instagram', birthYear: 1983 });
createPerson('jan_koum', 'Jan Koum', 2009, 2, PersonRole.VISIONARY, 'Privacy advocate who co-founded WhatsApp to provide secure messaging.', { primaryRole: 'Co-founder of WhatsApp', birthYear: 1976 });

linkCreated('zuckerberg', 'meta');
linkCreated('meta', 'facebook_app');
linkCreated('meta', 'instagram');
linkCreated('meta', 'whatsapp');
linkPartOf('kevin_systrom', 'instagram');
linkPartOf('jan_koum', 'whatsapp');

// Meta AI & History
createPerson('lecun', 'Yann LeCun', 2013, 1, PersonRole.THEORIST, 'AI pioneer known for developing Convolutional Neural Networks (CNNs).', { primaryRole: 'Chief AI Scientist at Meta', secondaryRole: 'Godfather of CNN', birthYear: 1960 });
createTech('pytorch', 'PyTorch', 2016, 2, TechRole.STANDARD, 'Open-source machine learning library widely used for deep learning apps.', 'System Software', 'Development & Languages');
createEpisode('cambridge_analytica', 'Cambridge Analytica', 2018, 2, EpisodeRole.CRISIS, 'Major data scandal revealing misuse of Facebook user data for politics.', { eventType: 'Crisis', impactScale: 'Data Privacy Scandal' });

linkPartOf('lecun', 'meta');
linkCreated('meta', 'pytorch');
linkPartOf('cambridge_analytica', 'meta');

// Twitter / X
createTech('twitter', 'Twitter / X', 2006, 2, TechRole.PLATFORM, 'Microblogging service serving as a global real-time information network.', 'Digital Services & Platforms', 'Social & Media');
createPerson('jack_dorsey', 'Jack Dorsey', 2006, 2, PersonRole.VISIONARY, 'Co-creator of Twitter and Square, influencing social media and payments.', { primaryRole: 'Co-founder of Twitter', secondaryRole: 'Co-founder of Block', birthYear: 1976 });

linkCreated('jack_dorsey', 'twitter');
linkPartOf('twitter', 'musk'); // Owned by Musk

// LinkedIn
createTech('linkedin', 'LinkedIn', 2002, 2, TechRole.PLATFORM, 'World\'s largest professional network, focused on career development.', 'Digital Services & Platforms', 'Social & Media');
createPerson('reid_hoffman', 'Reid Hoffman', 2002, 2, PersonRole.VISIONARY, 'LinkedIn founder and master networker of the Silicon Valley ecosystem.', { primaryRole: 'Co-founder of LinkedIn', secondaryRole: 'Partner at Greylock', birthYear: 1967 });
linkPartOf('reid_hoffman', 'paypal');

linkCreated('reid_hoffman', 'linkedin');
linkPartOf('reid_hoffman', 'paypal_mafia');
linkPartOf('linkedin', 'microsoft'); // Acquired by Microsoft

// 2. Service & Content Platforms

// Uber
createCompany('uber', 'Uber', 2009, 2, CompanyRole.PLATFORM, 'Mobility service provider that revolutionized urban transportation globally.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$140B', peak: '$150B' } });
createPerson('travis_kalanick', 'Travis Kalanick', 2009, 2, PersonRole.VISIONARY, 'Aggressively expanded Uber to disrupt global transportation.', { primaryRole: 'Co-founder of Uber', birthYear: 1976 });
createTech('gig_economy', 'Gig Economy', 2009, 2, TechRole.STANDARD, 'Labor market characterized by short-term contracts and freelance work.', 'Digital Services & Platforms', 'Digital Platforms');

linkCreated('travis_kalanick', 'uber');
linkCreated('uber', 'gig_economy');
linkCreated('uber', 'sharing_economy');

// Airbnb
createCompany('airbnb', 'Airbnb', 2008, 2, CompanyRole.PLATFORM, 'Online marketplace for lodging, homestays, and vacation rentals.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$90B', peak: '$115B' } });
createPerson('brian_chesky', 'Brian Chesky', 2008, 2, PersonRole.VISIONARY, 'Reimagined hospitality by enabling anyone to rent out their space.', { primaryRole: 'CEO of Airbnb', birthYear: 1981 });
createTech('sharing_economy', 'Sharing Economy', 2008, 2, TechRole.STANDARD, 'Economic model based on peer-to-peer acquiring and providing of access.', 'Digital Services & Platforms', 'Digital Platforms');

linkCreated('brian_chesky', 'airbnb');
linkCreated('airbnb', 'sharing_economy');



// Wikipedia
createCompany('wikimedia', 'Wikimedia Foundation', 2003, 1, CompanyRole.PLATFORM, 'Non-profit organization hosting Wikipedia and other free knowledge projects.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: 'Non-profit', peak: 'Non-profit' } });
createTech('wikipedia', 'Wikipedia', 2001, 1, TechRole.PRODUCT, 'Free, multilingual open-collaborative online encyclopedia.', 'Digital Services & Platforms', 'Search & Information');
createPerson('jimmy_wales', 'Jimmy Wales', 2001, 2, PersonRole.VISIONARY, 'Democratized knowledge by founding the free, open encyclopedia Wikipedia.', { primaryRole: 'Founder of Wikipedia', birthYear: 1966 });


linkCreated('jimmy_wales', 'wikimedia');
linkCreated('wikimedia', 'wikipedia');
linkCreated('jimmy_wales', 'wikipedia');



// ==========================================
// DEVELOPER PLATFORMS & INFRASTRUCTURE
// ==========================================

// 1. Code & Collaboration

// GitHub
createTech('github', 'GitHub', 2008, 2, TechRole.PLATFORM, 'World\'s largest platform for software development and version control.', 'Digital Services & Platforms', 'Digital Platforms');
createPerson('chris_wanstrath', 'Chris Wanstrath', 2008, 2, PersonRole.BUILDER, 'Made coding social by co-founding GitHub, the home of open source.', { primaryRole: 'Co-founder of GitHub', birthYear: 1985 });
createTech('git', 'Git', 2005, 1, TechRole.STANDARD, 'Distributed version control system tracking changes in source code.', 'System Software', 'Development & Languages');

linkCreated('chris_wanstrath', 'github');
linkCreated('linus', 'git'); // Linus created Git
linkBasedOn('github', 'git'); // GitHub is built on Git
linkPartOf('github', 'microsoft'); // Acquired by Microsoft



// 2. Modern Web & AI Infrastructure

// Stripe - Payments Infrastructure
createCompany('stripe', 'Stripe', 2010, 2, CompanyRole.PLATFORM, 'Financial infrastructure platform for the internet.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$70B', peak: '$95B' } });
createPerson('patrick_collison', 'Patrick Collison', 2010, 2, PersonRole.VISIONARY, 'Empowered internet businesses with Stripe\'s developer-first payment tools.', { primaryRole: 'Co-founder of Stripe', birthYear: 1988 });
createPerson('john_collison', 'John Collison', 2010, 2, PersonRole.VISIONARY, 'Co-founded Stripe, simplifying online economic infrastructure globally.', { primaryRole: 'Co-founder of Stripe', birthYear: 1990 });
createTech('api_economy', 'API Economy', 2010, 2, TechRole.STANDARD, 'Economic ecosystem where value is exchanged via Application Programming Interfaces.', 'Digital Services & Platforms', 'Digital Platforms');

linkCreated('patrick_collison', 'stripe');
linkCreated('john_collison', 'stripe');
linkCreated('stripe', 'api_economy');
linkBasedOn('stripe', 'saas');

// Spotify - Music Streaming
createCompany('spotify', 'Spotify', 2006, 1, CompanyRole.PLATFORM, 'Digital music service giving access to millions of songs and podcasts.', CompanyCategory.MEDIA_CONTENT, { marketCap: { current: '$80B', peak: '$90B' } });
createPerson('daniel_ek', 'Daniel Ek', 2006, 2, PersonRole.VISIONARY, 'Savior of the music industry through the legal streaming model of Spotify.', { primaryRole: 'CEO of Spotify', birthYear: 1983 });
createTech('music_streaming', 'Music Streaming', 2006, 2, TechRole.PRODUCT, 'Real-time delivery of audio content over the internet without downloading.', 'Digital Services & Platforms', 'Social & Media');

linkCreated('daniel_ek', 'spotify');
linkCreated('spotify', 'music_streaming');
linkBasedOn('spotify', 'cloud_computing');

// Reddit - Community Platform
createCompany('reddit', 'Reddit', 2005, 2, CompanyRole.PLATFORM, 'Social news aggregation, content rating, and discussion website.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$15B', peak: '$15B' } });
createPerson('steve_huffman', 'Steve Huffman', 2005, 2, PersonRole.VISIONARY, 'Built Reddit into "The Front Page of the Internet," a hub for communities.', { primaryRole: 'CEO of Reddit', birthYear: 1983 });
createPerson('alexis_ohanian', 'Alexis Ohanian', 2005, 2, PersonRole.VISIONARY, 'Community builder who co-founded Reddit and champions startup culture.', { primaryRole: 'Co-founder of Reddit', secondaryRole: 'Founder of Seven Seven Six', birthYear: 1983 });

linkCreated('steve_huffman', 'reddit');
linkCreated('alexis_ohanian', 'reddit');
linkPartOf('steve_huffman', 'y_combinator'); // YC alumni
linkPartOf('alexis_ohanian', 'y_combinator'); // YC alumni
linkBasedOn('reddit', 'sns');

// Stack Overflow - Developer Knowledge
createCompany('stack_overflow', 'Stack Overflow', 2008, 2, CompanyRole.PLATFORM, 'Question and answer website for professional and enthusiast programmers.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$1.8B', peak: '$1.8B' } });
createPerson('joel_spolsky', 'Joel Spolsky', 2008, 2, PersonRole.VISIONARY, 'Influential blogger and founder who shaped developer culture.', { primaryRole: 'Co-founder of Stack Overflow', secondaryRole: 'Creator of Trello', birthYear: 1965 });
createPerson('jeff_atwood', 'Jeff Atwood', 2008, 2, PersonRole.BUILDER, 'Co-created Stack Overflow to give developers a better Q&A platform.', { primaryRole: 'Co-founder of Stack Overflow', birthYear: 1970 });

linkCreated('joel_spolsky', 'stack_overflow');
linkCreated('jeff_atwood', 'stack_overflow');
linkBasedOn('stack_overflow', 'www');

// Vercel - Next.js & Frontend Cloud
createCompany('vercel', 'Vercel', 2015, 2, CompanyRole.PLATFORM, 'Cloud platform for static sites and serverless functions; creator of Next.js.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$3B', peak: '$3B' } });
createPerson('guillermo_rauch', 'Guillermo Rauch', 2015, 2, PersonRole.VISIONARY, 'Revolutionizing frontend development with Next.js and Vercel.', { primaryRole: 'CEO of Vercel', birthYear: 1988 });
createTech('nextjs', 'Next.js', 2016, 2, TechRole.PLATFORM, 'React framework enabling server-side rendering and static web generation.', 'System Software', 'Development & Languages');

linkCreated('guillermo_rauch', 'vercel');
linkCreated('vercel', 'nextjs');
linkBasedOn('nextjs', 'javascript');
linkBasedOn('vercel', 'cloud_computing');

// Hugging Face - AI Model Hub
createCompany('huggingface', 'Hugging Face', 2016, 2, CompanyRole.PLATFORM, 'Collaboration platform for the machine learning community.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: '$4.5B', peak: '$4.5B' } });
createPerson('clement_delangue', 'Clément Delangue', 2016, 2, PersonRole.VISIONARY, 'Democratizing AI by building the collaborative hub for open models.', { primaryRole: 'CEO of Hugging Face', birthYear: 1989 });
createTech('transformers_lib', 'Transformers Library', 2018, 2, TechRole.PLATFORM, 'Open-source library for state-of-the-art natural language processing.', 'AI & Physical Systems', 'Artificial Intelligence');

linkCreated('clement_delangue', 'huggingface');
linkCreated('huggingface', 'transformers_lib');
linkBasedOn('transformers_lib', 'transformer'); // Based on Transformer architecture
linkBasedOn('transformers_lib', 'pytorch'); // Built on PyTorch
linkBasedOn('huggingface', 'github'); // Model hosting similar to code hosting


// 수동 추가 노드 
createTech('turing_test', 'Turing Test (Imitation Game)', 1950, 1, TechRole.CORE, 'A test of a machine\'s ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human.', 'Fundamental Concepts', 'Theories & Architectures');
linkCreated('turing', 'turing_test');

export const INITIAL_DATA: GraphData = { nodes, links };
