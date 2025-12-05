import { Category, GraphData, LinkType, LinkDirection, NodeData, LinkData, CompanyRole, PersonRole, TechRole, EpisodeRole, CompanyCategory, Role, TechCategoryL1, TechCategoryL2 } from './types';

// Visual Colors mapped to categories
export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.COMPANY]: '#ef4444', // Red
  [Category.PERSON]: '#3b82f6',  // Blue
  [Category.TECHNOLOGY]: '#10b981', // Emerald
  [Category.EPISODE]: '#8b5cf6', // Violet
};

// --- DATA BUILDER HELPERS ---

const nodes: NodeData[] = [];
const links: LinkData[] = [];

// Extended helper with metadata support
const createCompany = (
  id: string, label: string, year: number, importance: number, impactRole: CompanyRole, description: string,
  categories: CompanyCategory[] = [],
  meta?: { marketCap?: { current?: string; peak?: string } }
) => {
  nodes.push({ id, label, category: Category.COMPANY, year, importance, impactRole, description, companyCategories: categories, ...meta });
};

const createPerson = (
  id: string, label: string, year: number, importance: number, impactRole: PersonRole, role: string, description: string,
  meta?: { primaryRole?: string; secondaryRole?: string; birthYear?: number; deathYear?: number }
) => {
  nodes.push({ id, label, category: Category.PERSON, year, importance, impactRole, role, description, ...meta });
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

const linkTriggered = (source: string, target: string, strength: number = 0.5) => {
  links.push({ source, target, type: LinkType.TRIGGERED, direction: LinkDirection.FORWARD, strength });
};


// --- DATA ENTRY START ---

// ==========================================
// ERA 0: FOUNDATIONS
// ==========================================
createPerson('turing', 'Alan Turing', 1936, 1, PersonRole.THEORIST, 'Father of CS', 'Formulated the concept of the universal machine and the Turing Test for AI.', { primaryRole: 'Father of Computer Science', birthYear: 1912, deathYear: 1954 });
createPerson('mccarthy', 'John McCarthy', 1956, 1, PersonRole.THEORIST, 'Father of AI', 'Coined the term "Artificial Intelligence" and created Lisp.', { primaryRole: 'Father of Artificial Intelligence', birthYear: 1927, deathYear: 2011 });
createPerson('von_neumann', 'John von Neumann', 1945, 1, PersonRole.THEORIST, 'Mathematician', 'Defined the architecture used in almost all modern computers.', { primaryRole: 'Mathematician & Computer Scientist', birthYear: 1903, deathYear: 1957 });
createEpisode('dartmouth', 'Dartmouth Workshop', 1956, 2, EpisodeRole.MILESTONE, 'The birth of AI as a field. McCarthy, Minsky, Shannon, and Rochester attended.', { eventType: 'Conference', impactScale: 'Birth of AI Field' });

linkPartOf('mccarthy', 'dartmouth');
linkTriggered('turing', 'mccarthy', 0.8);

// ==========================================
// ERA 5: THE AI RACE
// ==========================================

// AMD - The Challenger
createCompany('amd', 'AMD', 1969, 1, CompanyRole.INFRA, 'Intel\'s eternal rival, resurgent under Lisa Su with Ryzen and EPYC processors.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$220B', peak: '$260B' } });
createPerson('lisa_su', 'Lisa Su', 2014, 2, PersonRole.VISIONARY, 'CEO', 'Led AMD\'s remarkable turnaround with Ryzen architecture and data center dominance.', { primaryRole: 'CEO of AMD', birthYear: 1969 });
createTech('ryzen', 'AMD Ryzen', 2017, 2, TechRole.PRODUCT, 'High-performance CPUs that challenged Intel\'s dominance.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('epyc', 'AMD EPYC', 2017, 2, TechRole.PRODUCT, 'Server processors that captured data center market share from Intel.', 'Hardware & Infrastructure', 'Processors & Compute');

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

createCompany('att', 'AT&T', 1885, 2, CompanyRole.PLATFORM, 'American Telephone & Telegraph - parent company of Bell Labs and telecommunications giant.', [CompanyCategory.TELECOM], { marketCap: { current: '$140B', peak: '$310B' } });
createPerson('alexander_graham_bell', 'Alexander Graham Bell', 1885, 1, PersonRole.VISIONARY, 'Founder', 'Inventor of the telephone.', { primaryRole: 'Inventor of Telephone', birthYear: 1847, deathYear: 1922 });
createEpisode('att_breakup', 'The Breakup', 1984, 2, EpisodeRole.MILESTONE, 'Antitrust split of AT&T into Baby Bells, opening telecom innovation.', { eventType: 'Antitrust', impactScale: 'Industry Restructure' });

linkPartOf('alexander_graham_bell', 'att');
linkPartOf('att_breakup', 'att');

createPerson('shockley', 'William Shockley', 1956, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor. His management style birthed Silicon Valley.', { primaryRole: 'Nobel Laureate (Physics)', birthYear: 1910, deathYear: 1989 });
createPerson('shannon', 'Claude Shannon', 1948, 1, PersonRole.THEORIST, 'Father of Info Theory', 'Defined the bit and the mathematical basis of digital communication.', { primaryRole: 'Father of Information Theory', birthYear: 1916, deathYear: 2001 });
createPerson('ritchie', 'Dennis Ritchie', 1972, 1, PersonRole.BUILDER, 'Creator of C', 'Created the C programming language and co-created Unix.', { primaryRole: 'Creator of C Language', secondaryRole: 'Co-creator of Unix', birthYear: 1941, deathYear: 2011 });
createPerson('thompson', 'Ken Thompson', 1969, 2, PersonRole.BUILDER, 'Creator of Unix', 'Co-created Unix, B language, and later Go at Google.', { primaryRole: 'Co-creator of Unix', secondaryRole: 'Creator of Go', birthYear: 1943 });
createPerson('bardeen', 'John Bardeen', 1947, 1, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor and superconductivity theory. Only person to win Nobel Prize in Physics twice.', { primaryRole: '2x Nobel Laureate (Physics)', birthYear: 1908, deathYear: 1991 });
createPerson('brattain', 'Walter Brattain', 1947, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor with Shockley and Bardeen.', { primaryRole: 'Nobel Laureate (Physics)', birthYear: 1902, deathYear: 1987 });

createTech('transistor', 'The Transistor', 1947, 1, TechRole.CORE, 'The fundamental building block of all modern electronics.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('unix', 'Unix', 1969, 2, TechRole.STANDARD, 'The OS architecture that underpins Linux, macOS, and the internet.', 'System Software', 'Operating Systems (OS)');
createTech('c_language', 'C Language', 1972, 1, TechRole.STANDARD, 'The programming language that shaped modern software development.', 'System Software', 'Development & Languages');
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
linkTriggered('c_language', 'cpp', 0.9); // C influenced C++
linkTriggered('transistor', 'mosfet', 0.9); // MOSFET is evolution of transistor

// Shannon's influence
linkPartOf('shannon', 'dartmouth');

// Transistor's fundamental influence
linkTriggered('transistor', 'integrated_circuit', 0.95);

createCompany('ibm', 'IBM', 1911, 1, CompanyRole.PLATFORM, 'Big Blue. The dominant force in computing for most of the 20th century.', [CompanyCategory.HARDWARE, CompanyCategory.SOFTWARE], { marketCap: { current: '$200B', peak: '$260B' } });
createTech('mainframe', 'Mainframe', 1952, 2, TechRole.PRODUCT, 'Big iron computing for enterprise.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('deep_blue', 'Deep Blue', 1997, 2, TechRole.PRODUCT, 'First computer to defeat a world chess champion.', 'AI & Physical Systems', 'Artificial Intelligence');
createEpisode('kasparov_match', 'Kasparov vs Deep Blue', 1997, 2, EpisodeRole.MILESTONE, 'The first time a computer defeated a reigning world chess champion.', { eventType: 'Competition', impactScale: 'AI Milestone' });

linkCreated('ibm', 'mainframe');
linkCreated('ibm', 'deep_blue');
linkPartOf('deep_blue', 'kasparov_match');
linkPartOf('kasparov_match', 'ibm');
linkTriggered('von_neumann', 'mainframe', 0.6);

createCompany('fairchild', 'Fairchild Semi', 1957, 2, CompanyRole.LAB, 'The incubator of Silicon Valley.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: 'Acquired', peak: '$2.4B' } });
createPerson('noyce', 'Robert Noyce', 1957, 1, PersonRole.VISIONARY, 'Mayor of Silicon Valley', 'Co-inventor of the IC and co-founder of Intel.', { primaryRole: 'Co-inventor of IC', secondaryRole: 'Co-founder of Intel', birthYear: 1927, deathYear: 1990 });
createPerson('moore', 'Gordon Moore', 1968, 1, PersonRole.VISIONARY, 'Co-founder', 'Author of Moore\'s Law. Co-founded Intel.', { primaryRole: 'Co-founder of Intel', secondaryRole: "Author of Moore's Law", birthYear: 1929, deathYear: 2023 });
createEpisode('traitorous_eight', 'The Traitorous Eight', 1957, 2, EpisodeRole.MILESTONE, 'Eight engineers left Shockley to found Fairchild.', { eventType: 'Spinoff', impactScale: 'Birth of Silicon Valley' });
createTech('ic', 'Integrated Circuit', 1959, 1, TechRole.CORE, 'Combining multiple transistors onto a single chip.', 'Hardware & Infrastructure', 'Processors & Compute');

linkCreated('noyce', 'fairchild');
linkCreated('moore', 'fairchild');
linkCreated('fairchild', 'ic');
linkTriggered('shockley', 'traitorous_eight');
linkTriggered('traitorous_eight', 'fairchild');

createCompany('ti', 'Texas Instruments', 1930, 2, CompanyRole.INFRA, 'Pioneers of the Integrated Circuit and DSPs.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$180B', peak: '$200B' } });
createPerson('kilby', 'Jack Kilby', 1958, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Inventor of the Integrated Circuit (alongside Noyce).', { primaryRole: 'Nobel Laureate (Physics)', secondaryRole: 'Inventor of IC', birthYear: 1923, deathYear: 2005 });

createTech('ti_calculator', 'Handheld Calculator', 1967, 2, TechRole.PRODUCT, 'First handheld electronic calculator, revolutionizing personal computing.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('dsp', 'DSP Chip', 1982, 2, TechRole.CORE, 'Digital Signal Processor - specialized microprocessor for digital signal processing in audio, video, and communications.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('ttl_logic', 'TTL Logic', 1964, 2, TechRole.STANDARD, 'Transistor-Transistor Logic - became the industry standard for digital logic circuits.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('tms1000', 'TMS1000 Microcontroller', 1974, 2, TechRole.PRODUCT, 'First commercially successful microcontroller, used in appliances and toys.', 'Hardware & Infrastructure', 'Components & Manufacturing');

createEpisode('ic_patent_battle', 'IC Patent Battle', 1966, 2, EpisodeRole.MILESTONE, 'Legal battle between TI (Kilby) and Fairchild (Noyce) over IC invention - both recognized as co-inventors.', { eventType: 'Lawsuit', impactScale: 'Patent Precedent' });

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
linkTriggered('ic_patent_battle', 'ic', 0.3);

// Technology influences
linkBasedOn('ti_calculator', 'ic');
linkBasedOn('dsp', 'microprocessor', 0.7);
linkTriggered('tms1000', 'microprocessor', 0.5);
linkBasedOn('ttl_logic', 'transistor');

createCompany('intel', 'Intel', 1968, 1, CompanyRole.INFRA, 'Put the "Silicon" in Silicon Valley. Created the microprocessor.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$110B', peak: '$290B' } });
createPerson('andy_grove', 'Andy Grove', 1979, 2, PersonRole.VISIONARY, 'Former CEO', 'The man who drove Intel\'s execution. "Only the Paranoid Survive."', { primaryRole: 'Former CEO of Intel', birthYear: 1936, deathYear: 2016 });
createPerson('faggin', 'Federico Faggin', 1971, 2, PersonRole.BUILDER, 'Lead Designer', 'Led the design of the first commercial microprocessor.', { primaryRole: 'Designer of Intel 4004', birthYear: 1941 });
createPerson('gelsinger', 'Pat Gelsinger', 2021, 1, PersonRole.VISIONARY, 'CEO', 'Returned to Intel as CEO to restore its manufacturing leadership.', { primaryRole: 'CEO of Intel', birthYear: 1961 });

createTech('microprocessor', 'Microprocessor (4004)', 1971, 1, TechRole.CORE, 'The first general-purpose CPU on a single chip.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('x86', 'x86 Architecture', 1978, 1, TechRole.CORE, 'The instruction set architecture that dominated personal computing for decades.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('pentium', 'Pentium', 1993, 2, TechRole.PRODUCT, 'Intel\'s iconic processor brand that became synonymous with PC performance.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('core_processor', 'Intel Core', 2006, 2, TechRole.PRODUCT, 'Multi-core processor architecture that redefined PC performance.', 'Hardware & Infrastructure', 'Processors & Compute');

createTech('moores_law', 'Moore\'s Law', 1965, 1, TechRole.STANDARD, 'Observation that transistor count doubles every two years - guided semiconductor industry for 50+ years.', 'Hardware & Infrastructure', 'Processors & Compute');

createEpisode('intel_inside', 'Intel Inside Campaign', 1991, 2, EpisodeRole.MILESTONE, 'Revolutionary marketing campaign that made a chip maker a consumer brand.', { eventType: 'Marketing', impactScale: 'Brand Revolution' });
createEpisode('pentium_bug', 'Pentium FDIV Bug', 1994, 3, EpisodeRole.CRISIS, 'Floating-point division bug in Pentium processor. Intel initially denied, then recalled $475M worth of chips.', { eventType: 'Crisis', impactScale: '$475M Recall' });
createEpisode('memory_to_cpu', 'Memory to Microprocessor Pivot', 1985, 2, EpisodeRole.MILESTONE, 'Grove\'s strategic decision to exit DRAM memory business and focus on microprocessors.', { eventType: 'Pivot', impactScale: 'Strategic Shift' });
createEpisode('tick_tock', 'Tick-Tock Strategy', 2007, 3, EpisodeRole.MILESTONE, 'Intel\'s manufacturing strategy: alternate between process shrinks (tick) and new architectures (tock).', { eventType: 'Strategy', impactScale: 'Manufacturing Model' });

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
linkTriggered('ic', 'microprocessor');
linkTriggered('microprocessor', 'x86', 0.9);
linkBasedOn('pentium', 'x86');
linkBasedOn('core_processor', 'x86');
linkTriggered('pentium', 'core_processor', 0.7);

// Episodes - Intel initiated these
linkTriggered('intel', 'intel_inside'); // Intel's marketing campaign
linkTriggered('intel', 'pentium_bug'); // Intel caused the bug
linkTriggered('intel', 'memory_to_cpu'); // Intel's strategic pivot
linkTriggered('intel', 'tick_tock'); // Intel's manufacturing strategy
linkTriggered('memory_to_cpu', 'microprocessor', 0.5);

// Moore's Law influence on industry
linkTriggered('moores_law', 'ic', 0.8);
linkTriggered('moores_law', 'microprocessor', 0.8);

// ==========================================
// ERA 2: PERSONAL COMPUTING & OS
// ==========================================

createCompany('xerox', 'Xerox PARC', 1970, 2, CompanyRole.LAB, 'Invented the GUI, Mouse, and Ethernet, but failed to commercialize them.', [CompanyCategory.LAB], { marketCap: { current: '$1.6B', peak: '$150B' } });
createPerson('kay', 'Alan Kay', 1970, 2, PersonRole.THEORIST, 'Visionary', 'Pioneered OOP (Smalltalk) and the GUI.', { primaryRole: 'Father of OOP', secondaryRole: 'Pioneer of GUI', birthYear: 1940 });
createTech('gui', 'GUI', 1973, 2, TechRole.CORE, 'Graphical User Interface.', 'System Software', 'Operating Systems (OS)');
linkPartOf('kay', 'xerox');
linkCreated('xerox', 'gui');

createCompany('apple', 'Apple', 1976, 1, CompanyRole.PLATFORM, 'Revolutionized personal computing, mobile, and design.', [CompanyCategory.HARDWARE, CompanyCategory.SOFTWARE], { marketCap: { current: '$3.5T', peak: '$3.5T' } });
createPerson('jobs', 'Steve Jobs', 1976, 1, PersonRole.VISIONARY, 'Co-Founder', 'The visionary who made technology beautiful and accessible.', { primaryRole: 'Co-founder of Apple', secondaryRole: 'CEO of Pixar', birthYear: 1955, deathYear: 2011 });
createPerson('wozniak', 'Steve Wozniak', 1976, 2, PersonRole.BUILDER, 'Co-Founder', 'The engineering genius behind the Apple I and II.', { primaryRole: 'Co-founder of Apple', birthYear: 1950 });
createPerson('cook', 'Tim Cook', 2011, 2, PersonRole.VISIONARY, 'CEO', 'Master of the supply chain who scaled Apple to a $3T company.', { primaryRole: 'CEO of Apple', birthYear: 1960 });
createTech('macintosh', 'Macintosh', 1984, 2, TechRole.PRODUCT, 'The first mass-market computer with a GUI and mouse.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('iphone', 'iPhone', 2007, 1, TechRole.PRODUCT, 'The device that put the internet in everyone\'s pocket.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createEpisode('gui_visit', 'The PARC Visit', 1979, 3, EpisodeRole.MILESTONE, 'Jobs visits Xerox PARC, sees the GUI, and integrates it into the Mac.', { eventType: 'Deal', impactScale: 'GUI Revolution' });
createEpisode('xerox_investment', 'Xerox Invests in Apple', 1979, 3, EpisodeRole.DEAL, 'Xerox buys 100k shares of Apple pre-IPO in exchange for the PARC tour.', { eventType: 'Investment', impactScale: '$1M Pre-IPO' });

linkCreated('jobs', 'apple');
linkCreated('wozniak', 'apple');
linkPartOf('cook', 'apple');
linkCreated('apple', 'macintosh');
linkCreated('apple', 'iphone');
linkTriggered('jobs', 'gui_visit'); // Jobs initiated the PARC visit
linkPartOf('xerox_investment', 'apple');
linkPartOf('xerox_investment', 'xerox');
linkTriggered('xerox_investment', 'apple');
linkTriggered('gui_visit', 'macintosh');

createCompany('microsoft', 'Microsoft', 1975, 1, CompanyRole.PLATFORM, 'PC software monopoly turned Cloud & AI giant.', [CompanyCategory.SOFTWARE, CompanyCategory.INTERNET], { marketCap: { current: '$3.1T', peak: '$3.1T' } });
createPerson('gates', 'Bill Gates', 1975, 1, PersonRole.VISIONARY, 'Co-Founder', 'Dominated the PC era.', { primaryRole: 'Co-founder of Microsoft', secondaryRole: 'Philanthropist', birthYear: 1955 });
createPerson('nadella', 'Satya Nadella', 2014, 1, PersonRole.VISIONARY, 'CEO', 'Led the Cloud & AI transformation.', { primaryRole: 'CEO of Microsoft', birthYear: 1967 });
createTech('windows', 'Windows', 1985, 1, TechRole.PRODUCT, 'The OS that runs the world.', 'System Software', 'Operating Systems (OS)');
createEpisode('wintel_alliance', 'Wintel Alliance', 1980, 2, EpisodeRole.DEAL, 'The dominance of Windows running on Intel chips.', { eventType: 'Partnership', impactScale: 'PC Duopoly' });
createEpisode('ms_saves_apple', 'Microsoft Saves Apple', 1997, 3, EpisodeRole.DEAL, 'Gates invests $150M in Apple.', { eventType: 'Investment', impactScale: '$150M Bailout' });

linkCreated('gates', 'microsoft');
linkPartOf('nadella', 'microsoft');
linkCreated('microsoft', 'windows');
linkPartOf('ms_saves_apple', 'microsoft');
linkTriggered('ms_saves_apple', 'apple');
linkPartOf('wintel_alliance', 'microsoft');
linkPartOf('wintel_alliance', 'intel');

createCompany('oracle', 'Oracle', 1977, 1, CompanyRole.PLATFORM, 'Database giant.', [CompanyCategory.SOFTWARE], { marketCap: { current: '$450B', peak: '$450B' } });
createPerson('ellison', 'Larry Ellison', 1977, 2, PersonRole.VISIONARY, 'Founder', 'Pioneer of the relational database.', { primaryRole: 'Co-founder of Oracle', birthYear: 1944 });
createPerson('safra_catz', 'Safra Catz', 1999, 2, PersonRole.VISIONARY, 'CEO', 'Led Oracle\'s aggressive acquisition strategy and cloud pivot.', { primaryRole: 'CEO of Oracle', birthYear: 1961 });
createTech('oracle_db', 'Oracle Database', 1979, 2, TechRole.STANDARD, 'The gold standard for enterprise relational databases.', 'System Software', 'Development & Languages');
createEpisode('oracle_buys_sun', 'Oracle Acquires Sun', 2010, 2, EpisodeRole.DEAL, 'Oracle buys Sun Microsystems for Java and Solaris.', { eventType: 'Acquisition', impactScale: '$7.4B Deal' });

linkCreated('ellison', 'oracle');
linkPartOf('safra_catz', 'oracle');
linkCreated('oracle', 'oracle_db');
linkPartOf('oracle_buys_sun', 'oracle');

createCompany('sap', 'SAP', 1972, 2, CompanyRole.PLATFORM, 'European software giant.', [CompanyCategory.SOFTWARE], { marketCap: { current: '$280B', peak: '$280B' } });
createPerson('hasso_plattner', 'Hasso Plattner', 1972, 2, PersonRole.VISIONARY, 'Co-Founder', 'Pioneered ERP software.', { primaryRole: 'Co-founder of SAP', birthYear: 1944 });
createTech('erp', 'ERP', 1972, 2, TechRole.PRODUCT, 'Enterprise Resource Planning - the software that runs global business.', 'Digital Services & Platforms', 'Digital Platforms');

linkCreated('hasso_plattner', 'sap');
linkCreated('sap', 'erp');
linkCreated('sap', 'saas');

createCompany('sun', 'Sun Microsystems', 1982, 2, CompanyRole.PLATFORM, 'The dot in .com.', [CompanyCategory.HARDWARE], { marketCap: { current: 'Acquired', peak: '$200B' } });
createPerson('scott_mcnealy', 'Scott McNealy', 1982, 2, PersonRole.VISIONARY, 'Co-Founder', 'Aggressive leader who defined the dot-com era.', { primaryRole: 'Co-founder of Sun', birthYear: 1954 });
createTech('java', 'Java', 1995, 1, TechRole.STANDARD, 'Write once, run anywhere.', 'System Software', 'Development & Languages');
createTech('solaris', 'Solaris', 1992, 2, TechRole.PRODUCT, 'Enterprise Unix standard.', 'System Software', 'Operating Systems (OS)');
createTech('nfs', 'NFS', 1984, 2, TechRole.STANDARD, 'Network File System.', 'Network & Connectivity', 'Network Architecture');

linkCreated('scott_mcnealy', 'sun');
linkCreated('sun', 'java');
linkCreated('sun', 'solaris');
linkCreated('sun', 'nfs');
linkBasedOn('oracle', 'oracle_buys_sun');
linkTriggered('oracle_buys_sun', 'sun');

createCompany('adobe', 'Adobe', 1982, 2, CompanyRole.PLATFORM, 'Creative software giant.', [CompanyCategory.SOFTWARE], { marketCap: { current: '$230B', peak: '$320B' } });
createPerson('john_warnock', 'John Warnock', 1982, 2, PersonRole.VISIONARY, 'Co-Founder', 'Inventor of PostScript and PDF.', { primaryRole: 'Co-founder of Adobe', birthYear: 1940, deathYear: 2023 });
createPerson('charles_geschke', 'Charles Geschke', 1982, 2, PersonRole.VISIONARY, 'Co-Founder', 'Desktop publishing pioneer.', { primaryRole: 'Co-founder of Adobe', birthYear: 1939, deathYear: 2021 });

createTech('postscript', 'PostScript', 1982, 2, TechRole.STANDARD, 'Page description language that enabled desktop publishing.', 'System Software', 'Development & Languages');
createTech('illustrator', 'Illustrator', 1987, 2, TechRole.PRODUCT, 'Vector graphics standard.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('photoshop', 'Photoshop', 1990, 2, TechRole.PRODUCT, 'Digital imaging standard.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('pdf', 'PDF', 1993, 2, TechRole.STANDARD, 'Portable Document Format.', 'Digital Services & Platforms', 'Digital Platforms');

createEpisode('dtp_revolution', 'Desktop Publishing Revolution', 1985, 2, EpisodeRole.MILESTONE, 'Convergence of Mac, LaserWriter, and PostScript revolutionized publishing.', { eventType: 'Revolution', impactScale: 'Industry Disruption' });

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

createPerson('linus', 'Linus Torvalds', 1991, 1, PersonRole.BUILDER, 'Creator of Linux', 'Created the Linux kernel and Git.', { primaryRole: 'Creator of Linux', secondaryRole: 'Creator of Git', birthYear: 1969 });
linkTriggered('unix', 'linus');

// ==========================================
// ERA 3: INTERNET & CLOUD
// ==========================================

createCompany('darpa', 'DARPA', 1958, 1, CompanyRole.LAB, 'Defense Research. Funded Internet & AI.', [CompanyCategory.LAB], { marketCap: { current: 'N/A (Gov)', peak: 'N/A (Gov)' } });
createTech('gps', 'GPS', 1973, 2, TechRole.CORE, 'Global Positioning System - originally a military project, now essential for global navigation.', 'Network & Connectivity', 'Telecommunications');
createEpisode('darpa_grand_challenge', 'DARPA Grand Challenge', 2004, 2, EpisodeRole.MILESTONE, 'Competition that kickstarted the autonomous vehicle industry.', { eventType: 'Competition', impactScale: 'Birth of Self-Driving' });
createTech('arpanet', 'ARPANET', 1969, 1, TechRole.CORE, 'Precursor to the Internet.', 'Network & Connectivity', 'Network Architecture');
createPerson('cerf', 'Vint Cerf', 1973, 2, PersonRole.THEORIST, 'Father of Internet', 'Co-designer of TCP/IP.', { primaryRole: 'Father of the Internet', birthYear: 1943 });
linkCreated('darpa', 'arpanet');
linkCreated('cerf', 'arpanet');
linkCreated('darpa', 'gps');
linkPartOf('darpa_grand_challenge', 'darpa');

createCompany('cern', 'CERN', 1954, 2, CompanyRole.LAB, 'Birthplace of the Web.', [CompanyCategory.LAB], { marketCap: { current: 'N/A (Intl Org)', peak: 'N/A (Intl Org)' } });
createTech('www', 'World Wide Web', 1989, 1, TechRole.STANDARD, 'HTML, HTTP, URL.', 'Network & Connectivity', 'Network Architecture');
createPerson('berners_lee', 'Tim Berners-Lee', 1989, 2, PersonRole.THEORIST, 'Inventor', 'Invented the Web.', { primaryRole: 'Inventor of the Web', birthYear: 1955 });
linkPartOf('berners_lee', 'cern');
linkCreated('cern', 'www');
linkTriggered('arpanet', 'www');

createCompany('netscape', 'Netscape', 1994, 2, CompanyRole.PLATFORM, 'First commercial browser.', [CompanyCategory.INTERNET], { marketCap: { current: 'Acquired', peak: '$10B' } });
createPerson('andreessen', 'Marc Andreessen', 1994, 2, PersonRole.BUILDER, 'Co-Founder', 'Created Mosaic/Netscape.', { primaryRole: 'Co-founder of Netscape', secondaryRole: 'Co-founder of a16z', birthYear: 1971 });
createTech('javascript', 'JavaScript', 1995, 2, TechRole.STANDARD, 'Language of the web.', 'System Software', 'Development & Languages');
createEpisode('browser_wars', 'Browser Wars', 1995, 2, EpisodeRole.MILESTONE, 'Netscape vs Microsoft (IE).', { eventType: 'Competition', impactScale: 'Web Platform Wars' });

linkPartOf('andreessen', 'netscape');
linkCreated('netscape', 'javascript');
linkTriggered('www', 'netscape');
linkPartOf('browser_wars', 'netscape');
linkPartOf('browser_wars', 'microsoft');

createCompany('google', 'Google', 1998, 1, CompanyRole.PLATFORM, 'Organized the world\'s information. AI First company.', [CompanyCategory.INTERNET, CompanyCategory.SOFTWARE], { marketCap: { current: '$2.1T', peak: '$2.1T' } });
createPerson('larry_page', 'Larry Page', 1998, 2, PersonRole.VISIONARY, 'Co-Founder', 'PageRank inventor.', { primaryRole: 'Co-founder of Google', birthYear: 1973 });
createPerson('pichai', 'Sundar Pichai', 2015, 2, PersonRole.VISIONARY, 'CEO', 'Led Chrome, Android, and AI pivot.', { primaryRole: 'CEO of Alphabet/Google', birthYear: 1972 });
createTech('search', 'Google Search', 1998, 1, TechRole.PRODUCT, 'Algorithmic search.', 'Digital Services & Platforms', 'Search & Information');
createTech('android', 'Android', 2008, 2, TechRole.PRODUCT, 'Mobile OS.', 'System Software', 'Operating Systems (OS)');
createTech('tpu', 'TPU', 2015, 2, TechRole.PRODUCT, 'AI ASIC.', 'Hardware & Infrastructure', 'Processors & Compute');

linkCreated('larry_page', 'google');
linkPartOf('pichai', 'google');
linkPartOf('cerf', 'google');
linkCreated('google', 'search');
linkCreated('google', 'android');
linkCreated('google', 'tpu');
linkTriggered('iphone', 'android');

createCompany('amazon', 'Amazon', 1994, 1, CompanyRole.PLATFORM, 'E-commerce & Cloud pioneer.', [CompanyCategory.INTERNET, CompanyCategory.SOFTWARE], { marketCap: { current: '$2.1T', peak: '$2.1T' } });
createPerson('bezos', 'Jeff Bezos', 1994, 1, PersonRole.VISIONARY, 'Founder', 'E-commerce and cloud computing pioneer.', { primaryRole: 'Founder of Amazon', secondaryRole: 'Founder of Blue Origin', birthYear: 1964 });

// Amazon Products
createTech('aws', 'AWS', 2006, 1, TechRole.PRODUCT, 'Cloud Infrastructure (IaaS) that powers a third of the internet.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('alexa', 'Amazon Alexa', 2014, 2, TechRole.PRODUCT, 'AI voice assistant that pioneered smart home speakers.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('kindle', 'Kindle', 2007, 2, TechRole.PRODUCT, 'E-reader that revolutionized book publishing and distribution.', 'Hardware & Infrastructure', 'Devices & Form Factors');

linkCreated('bezos', 'amazon');
linkCreated('amazon', 'aws');
linkCreated('amazon', 'alexa');
linkCreated('amazon', 'kindle');

createTech('cloud_computing', 'Cloud Computing', 2006, 1, TechRole.CORE, 'On-demand availability of computer system resources, especially data storage and computing power.', 'Network & Connectivity', 'Network Architecture');
linkCreated('amazon', 'cloud_computing');
linkCreated('microsoft', 'cloud_computing');
createTech('azure', 'Microsoft Azure', 2010, 1, TechRole.PLATFORM, 'Cloud computing service created by Microsoft.', 'Network & Connectivity', 'Network Architecture');
linkCreated('microsoft', 'azure');
linkCreated('google', 'cloud_computing');
createTech('gcp', 'Google Cloud Platform', 2008, 1, TechRole.PLATFORM, 'Suite of cloud computing services offered by Google.', 'Network & Connectivity', 'Network Architecture');
linkCreated('google', 'gcp');
linkCreated('alibaba', 'cloud_computing');
linkBasedOn('aws', 'cloud_computing');
linkBasedOn('saas', 'cloud_computing'); // SaaS runs on Cloud

createCompany('salesforce', 'Salesforce', 1999, 2, CompanyRole.PLATFORM, 'SaaS Pioneer.', [CompanyCategory.SOFTWARE], { marketCap: { current: '$270B', peak: '$310B' } });
createPerson('benioff', 'Marc Benioff', 1999, 2, PersonRole.VISIONARY, 'Founder', 'Former Oracle executive who pioneered SaaS.', { primaryRole: 'CEO of Salesforce', birthYear: 1964 });
createTech('crm', 'CRM', 1999, 2, TechRole.PRODUCT, 'Customer Relationship Management - the killer app for SaaS.', 'Digital Services & Platforms', 'Digital Platforms');
createEpisode('no_software', 'No Software Campaign', 2000, 2, EpisodeRole.MILESTONE, 'Marketing campaign that launched the Cloud computing era.', { eventType: 'Marketing', impactScale: 'SaaS Revolution' });

linkCreated('benioff', 'salesforce');
linkCreated('salesforce', 'crm');
linkTriggered('salesforce', 'no_software'); // Salesforce's marketing campaign
linkTriggered('oracle', 'benioff');

createTech('saas', 'SaaS', 1999, 1, TechRole.STANDARD, 'Software as a Service - software licensing and delivery model.', 'Digital Services & Platforms', 'Digital Platforms');
linkCreated('salesforce', 'saas');
linkBasedOn('crm', 'saas');

// createCompany('cisco', 'Cisco', 1984, 2, CompanyRole.INFRA, 'Internet plumbing.'); // Moved to Networking section
// linkBasedOn('arpanet', 'cisco'); // Moved to Networking section

createCompany('netflix', 'Netflix', 1997, 1, CompanyRole.PLATFORM, 'Streaming & RecSys.', [CompanyCategory.MEDIA, CompanyCategory.INTERNET], { marketCap: { current: '$280B', peak: '$310B' } });
createPerson('reed_hastings', 'Reed Hastings', 1997, 2, PersonRole.VISIONARY, 'Founder', 'Pivoted from DVD to Streaming, reinventing TV.', { primaryRole: 'Co-founder of Netflix', birthYear: 1960 });
createTech('chaos_monkey', 'Chaos Monkey', 2011, 2, TechRole.CORE, 'Revolutionized DevOps by randomly terminating instances to test resilience.', 'AI & Physical Systems', 'Artificial Intelligence');
createEpisode('netflix_prize', 'Netflix Prize', 2006, 2, EpisodeRole.MILESTONE, 'Crowdsourced recommendation algorithm contest ($1M prize) that advanced ML field.', { eventType: 'Competition', impactScale: '$1M Prize' });
createEpisode('streaming_wars', 'Streaming Wars', 2019, 2, EpisodeRole.MILESTONE, 'Disney, Apple, HBO enter streaming market to challenge Netflix.', { eventType: 'Competition', impactScale: 'Industry War' });

linkCreated('reed_hastings', 'netflix');
linkCreated('netflix', 'chaos_monkey');
linkPartOf('netflix_prize', 'netflix');
linkPartOf('streaming_wars', 'netflix');
linkBasedOn('netflix', 'aws');
linkBasedOn('chaos_monkey', 'aws');



// ==========================================
// ERA 4: HARDWARE & GLOBAL SUPPLY CHAIN
// ==========================================

createCompany('tsmc', 'TSMC', 1987, 1, CompanyRole.INFRA, 'The World\'s Foundry.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$650B', peak: '$700B' } });
createPerson('morris_chang', 'Morris Chang', 1987, 2, PersonRole.VISIONARY, 'Founder', 'Invented foundry model.', { primaryRole: 'Founder of TSMC', birthYear: 1931 });
createTech('apple_silicon', 'Apple Silicon', 2020, 2, TechRole.PRODUCT, 'Custom ARM chips.', 'Hardware & Infrastructure', 'Processors & Compute');

linkCreated('morris_chang', 'tsmc');
linkCreated('apple', 'apple_silicon');
// linkBasedOn('apple', 'tsmc'); // Removed direct link
linkBasedOn('apple_silicon', 'tsmc');

createCompany('asml', 'ASML', 1984, 1, CompanyRole.INFRA, 'Monopoly on Lithography.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$290B', peak: '$380B' } });
createTech('euv', 'EUV Lithography', 2019, 1, TechRole.CORE, 'Extreme UV machines.', 'Hardware & Infrastructure', 'Components & Manufacturing');
linkCreated('asml', 'euv');
// Companies use EUV technology, which is made by ASML
linkBasedOn('tsmc', 'euv');
linkBasedOn('intel', 'euv');
// linkBasedOn('tsmc', 'asml'); // Removed direct link
// linkBasedOn('intel', 'asml'); // Removed direct link



// ==========================================
// ARM HOLDINGS - RISC REVOLUTION
// ==========================================

createCompany('arm', 'ARM', 1990, 2, CompanyRole.INFRA, 'The architecture that powers mobile computing through licensing model.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$140B', peak: '$170B' } });
createPerson('sophie_wilson', 'Sophie Wilson', 1983, 2, PersonRole.THEORIST, 'Architect', 'Designed ARM instruction set at Acorn Computers.', { primaryRole: 'Designer of ARM ISA', birthYear: 1957 });
createPerson('steve_furber', 'Steve Furber', 1983, 2, PersonRole.THEORIST, 'Co-Designer', 'Co-designed the first ARM processor with Sophie Wilson.', { primaryRole: 'Co-designer of ARM', birthYear: 1953 });

createTech('arm_arch', 'ARM Architecture', 1990, 2, TechRole.STANDARD, 'Power-efficient RISC instruction set that dominates mobile.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('arm_cortex', 'ARM Cortex', 2004, 2, TechRole.PRODUCT, 'Family of ARM processor cores for different performance/power targets.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('arm_neoverse', 'ARM Neoverse', 2018, 2, TechRole.PRODUCT, 'ARM server processors challenging x86 in data centers.', 'Hardware & Infrastructure', 'Processors & Compute');

createEpisode('arm_license_model', 'ARM Licensing Model', 1990, 2, EpisodeRole.MILESTONE, 'Revolutionary business model: license IP instead of manufacturing chips.', { eventType: 'Business Model', impactScale: 'IP Licensing Pioneer' });
createEpisode('nvidia_arm_fail', 'NVIDIA Failed ARM Bid', 2020, 2, EpisodeRole.DEAL, '$40B acquisition blocked by regulators due to concerns about neutrality.', { eventType: 'Failed Acquisition', impactScale: '$40B Blocked' });
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

// ARM influences
linkBasedOn('apple_silicon', 'arm_arch');
linkTriggered('arm_cortex', 'apple_silicon', 0.6);

// ==========================================
// QUALCOMM - WIRELESS PIONEER
// ==========================================

createCompany('qualcomm', 'Qualcomm', 1985, 2, CompanyRole.INFRA, 'Mobile chip giant and wireless patent powerhouse.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$190B', peak: '$220B' } });
createPerson('irwin_jacobs', 'Irwin Jacobs', 1985, 2, PersonRole.VISIONARY, 'Co-Founder', 'Pioneer of CDMA technology and mobile communications.', { primaryRole: 'Co-founder of Qualcomm', birthYear: 1933 });
createPerson('paul_jacobs', 'Paul Jacobs', 2005, 2, PersonRole.VISIONARY, 'Former CEO', 'Son of Irwin, led Qualcomm through smartphone era.', { primaryRole: 'Former CEO of Qualcomm', birthYear: 1962 });

createTech('snapdragon', 'Snapdragon', 2007, 2, TechRole.PRODUCT, 'System-on-chip (SoC) that powers most Android smartphones.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('cdma_tech', 'CDMA Technology', 1989, 2, TechRole.STANDARD, 'Code Division Multiple Access - Qualcomm\'s foundational wireless patent portfolio.', 'Network & Connectivity', 'Telecommunications');
createTech('3g_patents', '3G Patents', 2001, 2, TechRole.STANDARD, 'Critical wireless patents for third-generation mobile networks.', 'Network & Connectivity', 'Telecommunications');
createTech('4g_lte', '4G LTE', 2009, 2, TechRole.STANDARD, 'Long Term Evolution - foundation of modern mobile broadband.', 'Network & Connectivity', 'Telecommunications');
createTech('5g_patents', '5G Patents', 2019, 2, TechRole.STANDARD, 'Essential 5G wireless patents, maintaining Qualcomm\'s licensing dominance.', 'Network & Connectivity', 'Telecommunications');

createEpisode('apple_qcom_war', 'Apple-Qualcomm Patent War', 2017, 2, EpisodeRole.CRISIS, 'Multi-billion dollar legal battle over patent royalties, settled in 2019.', { eventType: 'Lawsuit', impactScale: 'Billions in Dispute' });
createEpisode('qcom_licensing', 'Qualcomm Licensing Model', 1990, 2, EpisodeRole.MILESTONE, 'Pioneered charging royalties on entire device price, not just chip cost - highly controversial but lucrative.', { eventType: 'Business Model', impactScale: 'Patent Licensing' });

linkPartOf('irwin_jacobs', 'qualcomm');
linkPartOf('paul_jacobs', 'qualcomm');

linkCreated('qualcomm', 'snapdragon');
linkCreated('qualcomm', 'cdma_tech');
linkCreated('irwin_jacobs', 'cdma_tech');
linkCreated('qualcomm', '3g_patents');
linkCreated('qualcomm', '4g_lte');
linkCreated('qualcomm', '5g_patents');

// Patent and technology evolution
linkTriggered('cdma', 'cdma_tech', 0.9); // Bell Labs CDMA influenced Qualcomm's implementation
linkTriggered('cdma_tech', '3g_patents', 0.9);
linkTriggered('3g_patents', '4g_lte', 0.8);
linkTriggered('4g_lte', '5g_patents', 0.8);

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
createCompany('softbank', 'SoftBank', 1981, 2, CompanyRole.PLATFORM, 'Japanese conglomerate and world\'s largest tech investor through Vision Fund.', [CompanyCategory.VC, CompanyCategory.TELECOM], { marketCap: { current: '$70B', peak: '$210B' } });
createPerson('masayoshi_son', 'Masayoshi Son', 1981, 1, PersonRole.VISIONARY, 'Founder & CEO', 'Visionary investor who bet big on internet companies and AI revolution.', { primaryRole: 'Founder of SoftBank', birthYear: 1957 });
createEpisode('vision_fund', 'Vision Fund Launch', 2017, 2, EpisodeRole.DEAL, '$100B fund - largest tech investment fund in history, backed by Saudi Arabia.', { eventType: 'Investment', impactScale: '$100B Fund' });
createEpisode('softbank_arm', 'SoftBank Acquires ARM', 2016, 2, EpisodeRole.DEAL, 'SoftBank bought ARM for $32B, largest European tech acquisition.', { eventType: 'Acquisition', impactScale: '$32B Deal' });

linkCreated('masayoshi_son', 'softbank');
linkTriggered('softbank', 'vision_fund'); // SoftBank launched the fund
linkTriggered('softbank', 'softbank_arm'); // SoftBank initiated the acquisition
linkPartOf('softbank_arm', 'arm'); // ARM was the target
linkTriggered('vision_fund', 'openai', 0.3); // Vision Fund invested in many AI companies

// NTT - Telecom Pioneer
createCompany('ntt', 'NTT', 1952, 2, CompanyRole.PLATFORM, 'Nippon Telegraph and Telephone - Japan\'s telecom giant and 5G pioneer.', [CompanyCategory.TELECOM], { marketCap: { current: '$80B', peak: '$330B' } });
createPerson('shigeki_goto', 'Shigeki Goto', 1990, 3, PersonRole.THEORIST, 'Researcher', 'NTT researcher who contributed to internet protocols and networking.', { primaryRole: 'NTT Researcher' });
createTech('ntt_docomo', 'NTT DoCoMo i-mode', 1999, 2, TechRole.PRODUCT, 'World\'s first major mobile internet platform - predated iPhone by 8 years.', 'Digital Services & Platforms', 'Social & Media');
createTech('emoji', 'Emoji', 1999, 2, TechRole.STANDARD, 'Picture characters invented by Shigetaka Kurita at NTT DoCoMo.', 'Digital Services & Platforms', 'Social & Media');
createPerson('kurita', 'Shigetaka Kurita', 1999, 2, PersonRole.VISIONARY, 'Designer', 'Inventor of the Emoji.', { primaryRole: 'Creator of Emoji', birthYear: 1972 });
createTech('optical_fiber', 'Optical Fiber Network', 1980, 2, TechRole.CORE, 'High-speed data transmission through light - foundation of modern internet.', 'Network & Connectivity', 'Telecommunications');

linkPartOf('shigeki_goto', 'ntt');
linkCreated('ntt', 'ntt_docomo');
linkCreated('ntt', 'emoji');
linkCreated('kurita', 'emoji');
linkPartOf('kurita', 'ntt');
linkBasedOn('emoji', 'ntt_docomo');
linkCreated('ntt', 'optical_fiber');
linkTriggered('ntt_docomo', 'iphone', 0.4); // i-mode influenced mobile internet thinking





// Fujitsu - Enterprise Computing
createCompany('fujitsu', 'Fujitsu', 1935, 2, CompanyRole.INFRA, 'Japanese IT giant in enterprise computing and supercomputers.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$35B', peak: '$90B' } });
createTech('fugaku', 'Fugaku Supercomputer', 2020, 2, TechRole.PRODUCT, 'World\'s fastest supercomputer (2020-2021) using ARM architecture.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('fm_towns', 'FM Towns', 1989, 2, TechRole.PRODUCT, 'Multimedia PC that pioneered CD-ROM usage in Japan.', 'Hardware & Infrastructure', 'Devices & Form Factors', { endYear: 1997 });
createTech('fujitsu_mainframe', 'Fujitsu Mainframe', 1974, 2, TechRole.PRODUCT, 'IBM-compatible mainframes that powered Japanese industry.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('hemt', 'HEMT', 1980, 2, TechRole.CORE, 'High Electron Mobility Transistor - critical for satellite communications and mobile networks.', 'Hardware & Infrastructure', 'Components & Manufacturing');

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
createCompany('toshiba', 'Toshiba', 1939, 2, CompanyRole.INFRA, 'Japanese conglomerate and inventor of Flash memory.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$15B', peak: '$40B' } });
createPerson('fujio_masuoka', 'Fujio Masuoka', 1980, 2, PersonRole.THEORIST, 'Inventor', 'Invented Flash Memory at Toshiba.', { primaryRole: 'Inventor of Flash Memory', birthYear: 1943 });

linkPartOf('fujio_masuoka', 'toshiba');

// Samsung - Memory & Display Dominance
createCompany('samsung', 'Samsung', 1938, 1, CompanyRole.INFRA, 'World leader in memory chips, displays, and smartphones.', [CompanyCategory.HARDWARE], { marketCap: { current: '$350B', peak: '$500B' } });
createPerson('lee_byung_chul', 'Lee Byung-chul', 1938, 2, PersonRole.VISIONARY, 'Founder', 'Founded Samsung, built it into Korea\'s largest conglomerate.', { primaryRole: 'Founder of Samsung', birthYear: 1910, deathYear: 1987 });
createPerson('lee_kun_hee', 'Lee Kun-hee', 1987, 2, PersonRole.VISIONARY, 'Former Chairman', 'Transformed Samsung into global tech leader. "Change everything except your wife and children."', { primaryRole: 'Former Chairman of Samsung', birthYear: 1942, deathYear: 2020 });
createPerson('lee_jae_yong', 'Lee Jae-yong', 2014, 2, PersonRole.VISIONARY, 'Vice Chairman', 'Third generation leader, focused on AI and semiconductors.', { primaryRole: 'Vice Chairman of Samsung', birthYear: 1968 });

createTech('galaxy', 'Samsung Galaxy', 2009, 2, TechRole.PRODUCT, 'Flagship Android smartphone line that competes with iPhone.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('oled_display', 'OLED Display', 2007, 2, TechRole.CORE, 'Organic LED displays - Samsung supplies to Apple, dominating premium display market.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('nand_flash', 'NAND Flash', 1987, 2, TechRole.CORE, 'Non-volatile storage - Invented by Toshiba, popularized by Samsung.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('t1100', 'Toshiba T1100', 1985, 2, TechRole.PRODUCT, 'World\'s first mass-market laptop computer, setting the standard for portable PCs.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('hbm', 'HBM', 2013, 1, TechRole.CORE, 'High Bandwidth Memory for AI chips.', 'Hardware & Infrastructure', 'Memory & Storage');

createEpisode('samsung_memory_bet', 'Samsung Memory Bet', 1983, 2, EpisodeRole.MILESTONE, 'Counter-cyclical investment in memory chips during downturn - established Samsung as memory leader.', { eventType: 'Investment', impactScale: 'Industry Dominance' });
createEpisode('galaxy_launch', 'Galaxy Launch', 2010, 2, EpisodeRole.MILESTONE, 'Samsung Galaxy S launched, beginning rivalry with iPhone.', { eventType: 'Product Launch', impactScale: 'Smartphone Wars' });

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
linkTriggered('samsung', 'samsung_memory_bet'); // Samsung's strategic decision
linkTriggered('samsung', 'galaxy_launch'); // Samsung's product launch

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
createCompany('sk_hynix', 'SK Hynix', 1983, 2, CompanyRole.INFRA, 'Second-largest memory chip maker, HBM leader for AI chips.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$90B', peak: '$120B' } });
createPerson('park_jung_ho', 'Park Jung-ho', 2018, 3, PersonRole.VISIONARY, 'CEO', 'Led SK Hynix\'s dominance in HBM for AI accelerators.', { primaryRole: 'CEO of SK Hynix' });

linkPartOf('park_jung_ho', 'sk_hynix');
linkCreated('sk_hynix', 'hbm');
linkBasedOn('sk_hynix', 'euv'); // Uses EUV
// linkBasedOn('sk_hynix', 'asml'); // Removed direct link
// linkBasedOn('nvidia', 'sk_hynix'); // Removed direct link - GPU depends on HBM

// LG Electronics removed as per request

// Naver and Kakao removed as per request

createCompany('broadcom', 'Broadcom', 1961, 2, CompanyRole.INFRA, 'Connectivity.', [CompanyCategory.SEMICONDUCTOR], { marketCap: { current: '$800B', peak: '$800B' } });
createPerson('hock_tan', 'Hock Tan', 2006, 2, PersonRole.VISIONARY, 'CEO', 'Architect of semiconductor industry consolidation.', { primaryRole: 'CEO of Broadcom', birthYear: 1952 });
createEpisode('broadcom_vmware', 'Broadcom Acquires VMware', 2022, 2, EpisodeRole.DEAL, 'Massive $69B acquisition reshaping enterprise software.', { eventType: 'Acquisition', impactScale: '$69B Deal' });

linkPartOf('hock_tan', 'broadcom');
linkPartOf('broadcom_vmware', 'broadcom');
linkBasedOn('tpu', 'broadcom');

// ==========================================
// FOXCONN - WORLD'S FACTORY
// ==========================================

createCompany('foxconn', 'Foxconn', 1974, 2, CompanyRole.INFRA, 'World\'s largest electronics manufacturer - assembles most of world\'s consumer electronics.', [CompanyCategory.HARDWARE], { marketCap: { current: '$50B', peak: '$70B' } });
createPerson('terry_gou', 'Terry Gou', 1974, 2, PersonRole.VISIONARY, 'Founder', 'Built Foxconn into world\'s largest contract manufacturer, employing over 1 million workers.', { primaryRole: 'Founder of Foxconn', birthYear: 1950 });

createEpisode('foxconn_apple_deal', 'Apple-Foxconn Partnership', 2000, 2, EpisodeRole.DEAL, 'Foxconn became Apple\'s primary manufacturer, assembling iPhones, iPads, and Macs.', { eventType: 'Partnership', impactScale: 'Manufacturing Alliance' });
createEpisode('foxconn_suicides', 'Foxconn Labor Crisis', 2010, 2, EpisodeRole.CRISIS, 'Series of worker suicides led to scrutiny of labor conditions and installation of safety nets.', { eventType: 'Crisis', impactScale: 'Labor Reform' });
createEpisode('foxconn_automation', 'Foxconn Automation Push', 2016, 3, EpisodeRole.MILESTONE, 'Announced plan to replace workers with 1 million robots - "Foxbots".', { eventType: 'Strategy', impactScale: 'Manufacturing Evolution' });

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
createTech('xbox', 'Xbox', 2001, 2, TechRole.PRODUCT, 'Microsoft\'s gaming console.', 'Hardware & Infrastructure', 'Devices & Form Factors');
linkCreated('microsoft', 'xbox');
linkBasedOn('xbox', 'foxconn');
// linkBasedOn('microsoft', 'foxconn'); // Removed direct link

// ==========================================
// ERA 5: THE AI REVOLUTION
// ==========================================

createCompany('nvidia', 'NVIDIA', 1993, 1, CompanyRole.PLATFORM, 'The Engine of AI.', [CompanyCategory.SEMICONDUCTOR, CompanyCategory.SOFTWARE], { marketCap: { current: '$3.4T', peak: '$3.4T' } });
createPerson('jensen_huang', 'Jensen Huang', 1993, 1, PersonRole.VISIONARY, 'CEO', 'Bet on CUDA.', { primaryRole: 'CEO of NVIDIA', birthYear: 1963 });
createTech('gpu', 'GPU', 1999, 1, TechRole.PRODUCT, 'Parallel compute.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('cuda', 'CUDA', 2007, 1, TechRole.PLATFORM, 'GPGPU Software.', 'System Software', 'Development & Languages');

linkCreated('jensen_huang', 'nvidia');
linkCreated('nvidia', 'gpu');
linkCreated('nvidia', 'cuda');
// linkBasedOn('nvidia', 'tsmc'); // Removed direct link - GPU depends on TSMC
linkBasedOn('gpu', 'tsmc'); // Added explicit link
linkBasedOn('gpu', 'hbm');

createCompany('openai', 'OpenAI', 2015, 1, CompanyRole.PLATFORM, 'Generative AI Leader.', [CompanyCategory.LAB], { marketCap: { current: '$157B', peak: '$157B' } });
createPerson('altman', 'Sam Altman', 2015, 1, PersonRole.VISIONARY, 'CEO', 'Face of AI.', { primaryRole: 'CEO of OpenAI', birthYear: 1985 });
createPerson('ilya', 'Ilya Sutskever', 2015, 2, PersonRole.THEORIST, 'Co-Founder', 'Chief Scientist.', { primaryRole: 'Co-founder of OpenAI', secondaryRole: 'Founder of SSI', birthYear: 1986 });

// Added Product Nodes to boost Impact Score
createTech('chatgpt', 'ChatGPT', 2022, 1, TechRole.PRODUCT, 'The AI chatbot that started the revolution.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('gpt', 'GPT-4', 2023, 1, TechRole.PRODUCT, 'LLM with reasoning.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('dalle', 'DALL-E', 2021, 2, TechRole.PRODUCT, 'Text-to-Image generation.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('sora', 'Sora', 2024, 2, TechRole.PRODUCT, 'Text-to-Video generation.', 'AI & Physical Systems', 'Artificial Intelligence');

createEpisode('chatgpt_launch', 'ChatGPT Launch', 2022, 1, EpisodeRole.MILESTONE, 'AI "iPhone Moment".', { eventType: 'Product Launch', impactScale: 'AI Revolution' });
createEpisode('openai_coup', 'The Board Coup', 2023, 2, EpisodeRole.CRISIS, 'Altman fired and rehired.', { eventType: 'Crisis', impactScale: 'Leadership Drama' });
createEpisode('ms_openai_deal', 'The $10B Partnership', 2023, 1, EpisodeRole.DEAL, 'Microsoft bets on OpenAI.', { eventType: 'Investment', impactScale: '$10B+ Partnership' });

linkPartOf('altman', 'openai');
linkPartOf('ilya', 'openai');
linkCreated('openai', 'chatgpt');
linkCreated('openai', 'gpt');
linkCreated('openai', 'dalle');
linkCreated('openai', 'sora');

linkTriggered('openai', 'chatgpt_launch'); // OpenAI's product launch
linkPartOf('openai_coup', 'openai'); // Crisis that happened to OpenAI
linkTriggered('microsoft', 'ms_openai_deal'); // Microsoft initiated the investment
linkPartOf('ms_openai_deal', 'openai'); // OpenAI received the investment
linkBasedOn('openai', 'gpu');

createPerson('hinton', 'Geoffrey Hinton', 2012, 1, PersonRole.THEORIST, 'Godfather of AI', 'Backpropagation.', { primaryRole: 'Godfather of Deep Learning', birthYear: 1947 });
createPerson('hassabis', 'Demis Hassabis', 2010, 2, PersonRole.VISIONARY, 'DeepMind CEO', 'AlphaGo, AlphaFold.', { primaryRole: 'CEO of Google DeepMind', birthYear: 1976 });
createPerson('fei_fei_li', 'Fei-Fei Li', 2009, 2, PersonRole.THEORIST, 'Godmother of AI', 'ImageNet.', { primaryRole: 'Creator of ImageNet', secondaryRole: 'Stanford Professor', birthYear: 1976 });
createPerson('vaswani', 'Ashish Vaswani', 2017, 2, PersonRole.THEORIST, 'Transformer Author', 'Attention Is All You Need.', { primaryRole: 'Inventor of Transformer', birthYear: 1983 });

createTech('transformer', 'Transformer', 2017, 1, TechRole.CORE, 'Foundation of LLMs.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('alphafold', 'AlphaFold', 2020, 2, TechRole.PRODUCT, 'Protein folding.', 'AI & Physical Systems', 'Artificial Intelligence');

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
linkTriggered('transformer', 'gpt');
linkTriggered('gpu', 'fei_fei_li');

// Turing's legacy: his work influenced McCarthy and modern AI
linkTriggered('turing', 'transformer');  // Conceptual lineage

createCompany('tesla', 'Tesla', 2003, 1, CompanyRole.PLATFORM, 'AI & Robotics.', [CompanyCategory.MOBILITY, CompanyCategory.ROBOTICS], { marketCap: { current: '$1.1T', peak: '$1.2T' } });
createPerson('musk', 'Elon Musk', 2004, 1, PersonRole.VISIONARY, 'CEO', 'Technoking.', { primaryRole: 'CEO of Tesla & SpaceX', secondaryRole: 'Owner of X', birthYear: 1971 });
createTech('autopilot', 'Autopilot', 2014, 2, TechRole.PRODUCT, 'Vision AI.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('optimus', 'Optimus', 2021, 2, TechRole.PRODUCT, 'Humanoid Robot.', 'AI & Physical Systems', 'Robotics');
linkCreated('musk', 'tesla');
linkPartOf('musk', 'paypal');
linkCreated('tesla', 'autopilot');
linkCreated('tesla', 'optimus');
linkBasedOn('optimus', 'robotics');
linkCreated('tesla', 'autonomous_driving');
linkBasedOn('autopilot', 'autonomous_driving');
linkTriggered('musk', 'openai');
linkBasedOn('tesla', 'gpu');

createCompany('spacex', 'SpaceX', 2002, 1, CompanyRole.INFRA, 'Revolutionizing space technology.', [CompanyCategory.AEROSPACE, CompanyCategory.HARDWARE], { marketCap: { current: '$210B', peak: '$210B' } });
createPerson('gwynne_shotwell', 'Gwynne Shotwell', 2002, 2, PersonRole.VISIONARY, 'President', 'The operator who built SpaceX into a profitable business.', { primaryRole: 'President of SpaceX', birthYear: 1963 });
createTech('falcon9', 'Falcon 9', 2010, 1, TechRole.PRODUCT, 'First orbital class reusable rocket.', 'AI & Physical Systems', 'Robotics');
createTech('starlink', 'Starlink', 2019, 2, TechRole.PRODUCT, 'Satellite internet constellation.', 'Network & Connectivity', 'Telecommunications');
createTech('starship', 'Starship', 2023, 1, TechRole.PRODUCT, 'Fully reusable super heavy-lift launch vehicle.', 'AI & Physical Systems', 'Robotics');
createEpisode('first_reusable_rocket', 'First Reusable Rocket', 2015, 1, EpisodeRole.MILESTONE, 'Falcon 9 lands after orbital launch, changing space economics forever.', { eventType: 'Milestone', impactScale: 'Space Revolution' });

linkCreated('musk', 'spacex');
linkPartOf('gwynne_shotwell', 'spacex');
linkCreated('spacex', 'falcon9');
linkCreated('spacex', 'starlink');
linkCreated('spacex', 'starship');
linkPartOf('first_reusable_rocket', 'spacex');

createCompany('palantir', 'Palantir', 2003, 1, CompanyRole.SERVICE, 'Defense AI.', [CompanyCategory.SOFTWARE], { marketCap: { current: '$150B', peak: '$150B' } });
createCompany('paypal', 'PayPal', 1998, 2, CompanyRole.PLATFORM, 'Online payments system that birthed the PayPal Mafia.', [CompanyCategory.FINTECH, CompanyCategory.INTERNET], { marketCap: { current: '$70B', peak: '$350B' } });
createPerson('thiel', 'Peter Thiel', 2003, 2, PersonRole.VISIONARY, 'Co-Founder', 'PayPal Mafia.', { primaryRole: 'Co-founder of PayPal', secondaryRole: 'Co-founder of Palantir', birthYear: 1967 });
linkCreated('thiel', 'paypal');
createPerson('alex_karp', 'Alex Karp', 2004, 2, PersonRole.VISIONARY, 'CEO', 'Philosopher-CEO.', { primaryRole: 'CEO of Palantir', birthYear: 1967 });

createTech('gotham', 'Gotham', 2008, 2, TechRole.PRODUCT, 'Intel & Defense OS.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('foundry', 'Foundry', 2016, 2, TechRole.PRODUCT, 'Commercial Data OS.', 'AI & Physical Systems', 'Artificial Intelligence');

createEpisode('in_q_tel', 'In-Q-Tel Funding', 2003, 3, EpisodeRole.DEAL, 'CIA investment arm funds Palantir.', { eventType: 'Investment', impactScale: 'Defense AI' });
createEpisode('project_maven', 'Project Maven', 2017, 2, EpisodeRole.CRISIS, 'Controversial DoD AI project.', { eventType: 'Contract', impactScale: 'Defense AI Controversy' });

linkCreated('thiel', 'palantir');
linkPartOf('alex_karp', 'palantir');
linkCreated('palantir', 'gotham');
linkCreated('palantir', 'foundry');
linkPartOf('in_q_tel', 'darpa');
linkTriggered('in_q_tel', 'palantir');
linkPartOf('project_maven', 'palantir');
linkPartOf('project_maven', 'google'); // Google was also involved initially



// ==========================================
// NETWORKING & INFRASTRUCTURE
// ==========================================

createCompany('cisco', 'Cisco', 1984, 1, CompanyRole.INFRA, 'Internet plumbing.', [CompanyCategory.HARDWARE], { marketCap: { current: '$230B', peak: '$555B' } });
createPerson('bosack', 'Leonard Bosack', 1984, 2, PersonRole.VISIONARY, 'Co-Founder', 'Stanford computer scientist.', { primaryRole: 'Co-founder of Cisco', birthYear: 1952 });
createPerson('lerner', 'Sandy Lerner', 1984, 2, PersonRole.VISIONARY, 'Co-Founder', 'Pioneered multi-protocol router.', { primaryRole: 'Co-founder of Cisco', birthYear: 1955 });

createTech('router', 'Multi-Protocol Router', 1986, 2, TechRole.PRODUCT, 'Connected disparate networks, enabling the Internet.', 'Network & Connectivity', 'Network Architecture');
createTech('ios_cisco', 'Cisco IOS', 1987, 2, TechRole.PLATFORM, 'Internetwork Operating System.', 'System Software', 'Operating Systems (OS)');

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

createCompany('tencent', 'Tencent', 1998, 2, CompanyRole.PLATFORM, 'Chinese Tech Giant.', [CompanyCategory.INTERNET], { marketCap: { current: '$450B', peak: '$900B' } });
createPerson('pony_ma', 'Pony Ma', 1998, 2, PersonRole.VISIONARY, 'Founder', 'Quiet architect of China\'s digital ecosystem.', { primaryRole: 'Founder of Tencent', birthYear: 1971 });
createTech('wechat', 'WeChat', 2011, 1, TechRole.PRODUCT, 'The Super App: Messaging, Payments, OS-within-OS.', 'Digital Services & Platforms', 'Social & Media');

createCompany('alibaba', 'Alibaba', 1999, 2, CompanyRole.PLATFORM, 'Chinese Cloud/AI.', [CompanyCategory.INTERNET], { marketCap: { current: '$200B', peak: '$850B' } });
createPerson('jack_ma', 'Jack Ma', 1999, 1, PersonRole.VISIONARY, 'Founder', 'Face of Chinese tech entrepreneurship.', { primaryRole: 'Founder of Alibaba', birthYear: 1964 });
createTech('alipay', 'Alipay', 2004, 2, TechRole.PRODUCT, 'Revolutionized digital payments in China.', 'Digital Services & Platforms', 'Digital Platforms');
createEpisode('ant_group_halt', 'Ant Group IPO Halt', 2020, 2, EpisodeRole.CRISIS, 'Chinese government crackdown on Jack Ma and Big Tech.', { eventType: 'Regulatory', impactScale: '$37B IPO Cancelled' });

linkCreated('pony_ma', 'tencent');
linkCreated('tencent', 'wechat');

linkCreated('jack_ma', 'alibaba');
linkCreated('alibaba', 'alipay');
linkPartOf('ant_group_halt', 'alibaba');
linkPartOf('ant_group_halt', 'jack_ma');

// Baidu removed as per request

// ByteDance - Social Media & AI
createCompany('bytedance', 'ByteDance', 2012, 1, CompanyRole.PLATFORM, 'World\'s most valuable startup, known for its powerful recommendation algorithms.', [CompanyCategory.MEDIA, CompanyCategory.INTERNET], { marketCap: { current: '$300B', peak: '$400B' } });
createPerson('zhang_yiming', 'Zhang Yiming', 2012, 2, PersonRole.VISIONARY, 'Founder', 'Engineer-turned-entrepreneur who built a global empire on AI recommendation engines.', { primaryRole: 'Founder of ByteDance', birthYear: 1983 });
createPerson('shou_zi_chew', 'Shou Zi Chew', 2021, 2, PersonRole.VISIONARY, 'CEO', 'Led TikTok through intense global regulatory scrutiny.', { primaryRole: 'CEO of TikTok', birthYear: 1983 });

// TikTok/Douyin merged into single node (same service, different markets)
createTech('tiktok', 'TikTok', 2016, 1, TechRole.PRODUCT, 'Short-form video platform (TikTok/Douyin) that revolutionized social media consumption globally.', 'Digital Services & Platforms', 'Social & Media');
createTech('rec_algo', 'Recommendation Algorithm', 2012, 2, TechRole.CORE, 'AI engine that personalizes content feed with uncanny accuracy.', 'AI & Physical Systems', 'Artificial Intelligence');

createEpisode('tiktok_ban_threat', 'TikTok US Ban Threat', 2020, 2, EpisodeRole.CRISIS, 'US government threatens to ban TikTok over national security concerns.', { eventType: 'Regulatory', impactScale: 'National Security Concern' });

linkCreated('zhang_yiming', 'bytedance');
linkPartOf('shou_zi_chew', 'bytedance');
linkCreated('bytedance', 'tiktok');
linkCreated('bytedance', 'rec_algo');
linkBasedOn('tiktok', 'rec_algo');
linkPartOf('tiktok_ban_threat', 'bytedance');

// Huawei - Telecom & Hardware
createCompany('huawei', 'Huawei', 1987, 1, CompanyRole.INFRA, 'Global telecommunications giant and consumer electronics leader.', [CompanyCategory.HARDWARE, CompanyCategory.TELECOM], { marketCap: { current: 'Private (~$100B)', peak: 'Private (~$150B)' } });
createPerson('ren_zhengfei', 'Ren Zhengfei', 1987, 2, PersonRole.VISIONARY, 'Founder', 'Former PLA engineer who built Huawei into a global tech powerhouse.', { primaryRole: 'Founder of Huawei', birthYear: 1944 });

createTech('5g_infra', '5G Infrastructure', 2019, 1, TechRole.CORE, 'Next-generation cellular network equipment dominating global market.', 'Network & Connectivity', 'Telecommunications');
createTech('harmony_os', 'HarmonyOS', 2019, 2, TechRole.PLATFORM, 'Operating system developed to replace Android after US sanctions.', 'System Software', 'Operating Systems (OS)');
createTech('kirin_chip', 'Kirin Chip', 2014, 2, TechRole.PRODUCT, 'High-performance mobile processors designed by HiSilicon (Huawei).');

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
createCompany('dji', 'DJI', 2006, 2, CompanyRole.PLATFORM, 'World\'s largest drone manufacturer with 70%+ market share.', [CompanyCategory.AEROSPACE, CompanyCategory.ROBOTICS], { marketCap: { current: 'Private (~$15B)', peak: 'Private (~$16B)' } });
createPerson('frank_wang', 'Frank Wang (Wang Tao)', 2006, 2, PersonRole.VISIONARY, 'Founder & CEO', 'Built DJI into drone industry giant, revolutionizing aerial photography and videography.', { primaryRole: 'Founder of DJI', birthYear: 1980 });

// Core DJI Technologies (reduced to 3)
createTech('quadcopter', 'Consumer Quadcopter', 2010, 2, TechRole.PRODUCT, 'Four-rotor drone design that enabled stable consumer drones.', 'AI & Physical Systems', 'Robotics');
createTech('gimbal_stabilization', 'Gimbal Stabilization', 2012, 2, TechRole.CORE, '3-axis camera stabilization for smooth aerial footage.', 'AI & Physical Systems', 'Robotics');

createEpisode('phantom_launch', 'DJI Phantom Launch', 2013, 2, EpisodeRole.MILESTONE, 'DJI Phantom democratized aerial photography and created consumer drone market.', { eventType: 'Product Launch', impactScale: 'Drone Market Creator' });
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

createTech('voip', 'VoIP', 1995, 2, TechRole.STANDARD, 'Voice over IP protocol.', 'Network & Connectivity', 'Telecommunications');
createTech('webrtc', 'WebRTC', 2011, 2, TechRole.STANDARD, 'Real-time communication standard.', 'Network & Connectivity', 'Network Architecture');

// Skype (Microsoft Product)
createTech('skype', 'Skype', 2003, 2, TechRole.PRODUCT, 'Pioneering video call software.', 'Digital Services & Platforms', 'Digital Platforms');
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
createTech('self_driving_car', 'Self-Driving Car', 2009, 1, TechRole.PRODUCT, 'Autonomous vehicles capable of sensing their environment and navigating without human input.', 'AI & Physical Systems', 'Autonomous Mobility');
createCompany('mobileye', 'Mobileye', 1999, 2, CompanyRole.INFRA, 'Pioneer in ADAS and computer vision for automotive.', [CompanyCategory.ROBOTICS], { marketCap: { current: '$20B', peak: '$50B' } });
createTech('adas', 'ADAS', 1999, 2, TechRole.STANDARD, 'Advanced Driver Assistance Systems - electronic systems that assist drivers.', 'AI & Physical Systems', 'Autonomous Mobility');

linkCreated('google', 'self_driving_car'); // Waymo (formerly Google Self-Driving Car Project)
linkTriggered('darpa_grand_challenge', 'self_driving_car'); // Origins
linkCreated('mobileye', 'adas');
linkPartOf('mobileye', 'intel'); // Acquired by Intel

// 2. Robotics
createCompany('boston_dynamics', 'Boston Dynamics', 1992, 2, CompanyRole.LAB, 'The world\'s most dynamic humanoid and quadruped robots.', [CompanyCategory.LAB, CompanyCategory.ROBOTICS], { marketCap: { current: '$1.1B', peak: '$1.5B' } });
createPerson('marc_raibert', 'Marc Raibert', 1992, 2, PersonRole.VISIONARY, 'Founder', 'Father of dynamic robots.', { primaryRole: 'Founder of Boston Dynamics', birthYear: 1949 });
createTech('spot', 'Spot', 2016, 2, TechRole.PRODUCT, 'Agile mobile robot that navigates terrain with unprecedented mobility.', 'AI & Physical Systems', 'Robotics');
createTech('atlas', 'Atlas', 2013, 2, TechRole.PRODUCT, 'Bipedal humanoid robot capable of parkour and complex manipulation.', 'AI & Physical Systems', 'Robotics');
createEpisode('hyundai_bd_deal', 'Hyundai Acquires Boston Dynamics', 2020, 2, EpisodeRole.DEAL, 'Hyundai Motor Group acquires controlling interest in Boston Dynamics.', { eventType: 'Acquisition', impactScale: '$1.1B Deal' });

createCompany('irobot', 'iRobot', 1990, 2, CompanyRole.PRODUCT, 'Consumer robot company known for Roomba.', [CompanyCategory.ROBOTICS], { marketCap: { current: '$1.4B', peak: '$10B' } });
createTech('roomba', 'Roomba', 2002, 2, TechRole.PRODUCT, 'Autonomous robotic vacuum cleaner.', 'AI & Physical Systems', 'Robotics');

linkCreated('marc_raibert', 'boston_dynamics');
linkCreated('boston_dynamics', 'spot');
linkCreated('boston_dynamics', 'atlas');
linkPartOf('hyundai_bd_deal', 'boston_dynamics');
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
linkTriggered('autonomous_driving', 'drone'); // Shared autonomy tech

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
createTech('iot', 'IoT', 1999, 1, TechRole.CORE, 'Internet of Things - network of physical objects embedded with sensors and software.', 'Network & Connectivity', 'Network Architecture');
createTech('raspberry_pi', 'Raspberry Pi', 2012, 2, TechRole.PRODUCT, 'Low-cost, credit-card-sized computer that fueled the Maker movement and IoT prototyping.', 'Hardware & Infrastructure', 'Devices & Form Factors');

linkBasedOn('iot', '5g_patents'); // Connectivity
linkBasedOn('iot', 'arm'); // Powering 90%+ of IoT
linkCreated('raspberry_pi', 'iot');
linkBasedOn('raspberry_pi', 'arm');

// 2. Metaverse & Spatial Computing
createTech('metaverse', 'Metaverse', 1992, 2, TechRole.STANDARD, 'A collective virtual shared space, created by the convergence of virtually enhanced physical reality and physically persistent virtual space.', 'Digital Services & Platforms', 'Spatial Computing');
createTech('vr', 'Virtual Reality', 1968, 2, TechRole.CORE, 'Immersive digital environments.', 'AI & Physical Systems', 'Spatial Computing');
createTech('ar', 'Augmented Reality', 1990, 2, TechRole.CORE, 'Digital overlays on the real world.', 'AI & Physical Systems', 'Spatial Computing');

createTech('oculus', 'Oculus', 2012, 2, TechRole.PRODUCT, 'VR headset line kickstarted by Palmer Luckey, acquired by Meta.', 'AI & Physical Systems', 'Spatial Computing');
createPerson('palmer_luckey', 'Palmer Luckey', 2012, 2, PersonRole.VISIONARY, 'Founder', 'Creator of the Oculus Rift.', { primaryRole: 'Founder of Oculus', secondaryRole: 'Founder of Anduril', birthYear: 1992 });

linkPartOf('palmer_luckey', 'oculus');
linkCreated('meta', 'oculus'); // Acquired by Meta
linkBasedOn('oculus', 'vr');
linkBasedOn('metaverse', 'vr');
linkBasedOn('metaverse', 'ar');
linkCreated('nvidia', 'metaverse'); // Omniverse / GPU power

// 3. Quantum Computing
createTech('quantum_computing', 'Quantum Computing', 1980, 1, TechRole.CORE, 'Computing using quantum-mechanical phenomena, such as superposition and entanglement.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('qubit', 'Qubit', 1995, 2, TechRole.CORE, 'The basic unit of quantum information.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('sycamore', 'Sycamore', 2019, 2, TechRole.PRODUCT, 'Google\'s quantum processor that claimed "Quantum Supremacy".', 'Hardware & Infrastructure', 'Processors & Compute');
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
createCompany('sequoia', 'Sequoia Capital', 1972, 2, CompanyRole.INFRA, 'The gold standard of Venture Capital.', [CompanyCategory.VC], { marketCap: { current: 'AUM ~$85B', peak: 'AUM ~$85B' } });
createPerson('don_valentine', 'Don Valentine', 1972, 2, PersonRole.VISIONARY, 'Founder', 'The grandfather of Silicon Valley VC.', { primaryRole: 'Founder of Sequoia', birthYear: 1932, deathYear: 2019 });

createCompany('kpcb', 'Kleiner Perkins', 1972, 2, CompanyRole.INFRA, 'The other titan of Sand Hill Road.', [CompanyCategory.VC], { marketCap: { current: 'AUM ~$18B', peak: 'AUM ~$18B' } });
createPerson('john_doerr', 'John Doerr', 1980, 2, PersonRole.VISIONARY, 'Partner', 'Legendary investor who backed Google and Amazon.', { primaryRole: 'Chairman of Kleiner Perkins', birthYear: 1951 });

createCompany('a16z', 'Andreessen Horowitz', 2009, 2, CompanyRole.INFRA, 'Software is eating the world.', [CompanyCategory.VC], { marketCap: { current: 'AUM ~$35B', peak: 'AUM ~$35B' } });
// Marc Andreessen already exists

// 2. The Accelerators
createCompany('y_combinator', 'Y Combinator', 2005, 2, CompanyRole.INFRA, 'The startup factory that launched Airbnb, Dropbox, and Stripe.', [CompanyCategory.VC], { marketCap: { current: 'AUM ~$600M', peak: 'AUM ~$600M' } });
createPerson('paul_graham', 'Paul Graham', 2005, 2, PersonRole.VISIONARY, 'Founder', 'Hacker, painter, and startup mentor.', { primaryRole: 'Co-founder of Y Combinator', birthYear: 1964 });

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
linkTriggered('sequoia', 'sequoia_apple');
linkTriggered('sequoia', 'sequoia_google');
linkTriggered('sequoia', 'sequoia_oracle');
linkTriggered('sequoia', 'sequoia_nvidia');
linkTriggered('sequoia', 'sequoia_paypal');
linkTriggered('sequoia', 'sequoia_youtube');
linkTriggered('sequoia', 'sequoia_whatsapp');

linkTriggered('sequoia_apple', 'apple');
linkTriggered('sequoia_google', 'google');
linkTriggered('sequoia_oracle', 'oracle');
linkTriggered('sequoia_nvidia', 'nvidia');
linkTriggered('sequoia_paypal', 'paypal');
linkTriggered('sequoia_youtube', 'youtube');
linkTriggered('sequoia_whatsapp', 'whatsapp');

// Kleiner Perkins Portfolio - via Investment Episodes
createEpisode('kpcb_amazon', 'Kleiner Perkins invests in Amazon', 1996, 2, EpisodeRole.DEAL, 'John Doerr backed Amazon early.', { eventType: 'Investment', impactScale: 'Early Stage' });
createEpisode('kpcb_google', 'Kleiner Perkins invests in Google', 1999, 2, EpisodeRole.DEAL, 'Kleiner Perkins co-led Google Series A.', { eventType: 'Investment', impactScale: 'Series A' });
createEpisode('kpcb_netscape', 'Kleiner Perkins invests in Netscape', 1994, 2, EpisodeRole.DEAL, 'Kleiner Perkins backed the browser pioneer.', { eventType: 'Investment', impactScale: 'Early Stage' });
createEpisode('kpcb_sun', 'Kleiner Perkins invests in Sun', 1982, 3, EpisodeRole.DEAL, 'Early investment in Sun Microsystems.', { eventType: 'Investment', impactScale: 'Early Stage' });

// KPCB triggered these investments
linkTriggered('kpcb', 'kpcb_amazon');
linkTriggered('kpcb', 'kpcb_google');
linkTriggered('kpcb', 'kpcb_netscape');
linkTriggered('kpcb', 'kpcb_sun');

linkTriggered('kpcb_amazon', 'amazon');
linkTriggered('kpcb_google', 'google');
linkTriggered('kpcb_netscape', 'netscape');
linkTriggered('kpcb_sun', 'sun');

// a16z Portfolio - via Investment Episodes
createEpisode('a16z_facebook', 'a16z invests in Facebook', 2010, 2, EpisodeRole.DEAL, 'Andreessen Horowitz backed the social giant.', { eventType: 'Investment', impactScale: 'Late Stage' });
createEpisode('a16z_twitter', 'a16z invests in Twitter', 2011, 2, EpisodeRole.DEAL, 'a16z invested in the microblogging platform.', { eventType: 'Investment', impactScale: 'Growth Stage' });
createEpisode('a16z_airbnb', 'a16z invests in Airbnb', 2011, 2, EpisodeRole.DEAL, 'a16z backed the sharing economy pioneer.', { eventType: 'Investment', impactScale: 'Series A' });
createEpisode('a16z_github', 'a16z invests in GitHub', 2012, 2, EpisodeRole.DEAL, 'a16z led GitHub Series A.', { eventType: 'Investment', impactScale: 'Series A' });
createEpisode('a16z_skype', 'a16z invests in Skype', 2009, 2, EpisodeRole.DEAL, 'a16z backed the VoIP pioneer.', { eventType: 'Investment', impactScale: 'Growth Stage' });

// a16z triggered these investments
linkTriggered('a16z', 'a16z_facebook');
linkTriggered('a16z', 'a16z_twitter');
linkTriggered('a16z', 'a16z_airbnb');
linkTriggered('a16z', 'a16z_github');
linkTriggered('a16z', 'a16z_skype');

linkTriggered('a16z_facebook', 'meta');
linkTriggered('a16z_twitter', 'twitter');
linkTriggered('a16z_airbnb', 'airbnb');
linkTriggered('a16z_github', 'github');
linkTriggered('a16z_skype', 'skype');

// Y Combinator Portfolio - via Investment Episodes
createEpisode('yc_airbnb', 'Y Combinator funds Airbnb', 2009, 2, EpisodeRole.DEAL, 'YC backed Airbnb in its earliest days.', { eventType: 'Investment', impactScale: 'Seed Stage' });
linkTriggered('y_combinator', 'yc_airbnb'); // YC triggered the investment
linkTriggered('yc_airbnb', 'airbnb');

// SoftBank Investments - via Investment Episodes
createEpisode('softbank_uber', 'SoftBank invests in Uber', 2018, 2, EpisodeRole.DEAL, 'Vision Fund led massive investment in Uber.', { eventType: 'Investment', impactScale: '$7.7B Investment' });
createEpisode('softbank_nvidia', 'SoftBank invests in NVIDIA', 2017, 2, EpisodeRole.DEAL, 'SoftBank bought $4B stake in NVIDIA.', { eventType: 'Investment', impactScale: '$4B Stake' });

linkPartOf('softbank_uber', 'softbank');
linkPartOf('softbank_nvidia', 'softbank');

linkTriggered('softbank_uber', 'uber');
linkTriggered('softbank_nvidia', 'nvidia');

// ==========================================
// FINTECH & CRYPTOCURRENCY
// ==========================================

// 1. Core Technologies
createTech('blockchain', 'Blockchain', 2008, 1, TechRole.CORE, 'Distributed ledger technology - the foundation of trustless systems.', 'Digital Services & Platforms', 'Fintech & Crypto');
createTech('smart_contracts', 'Smart Contracts', 2015, 2, TechRole.STANDARD, 'Self-executing contracts with the terms directly written into code.', 'System Software', 'Development & Languages');
createTech('defi', 'DeFi', 2017, 2, TechRole.STANDARD, 'Decentralized Finance - financial services on public blockchains.', 'Digital Services & Platforms', 'Fintech & Crypto');
createTech('stablecoin', 'Stablecoin', 2014, 2, TechRole.STANDARD, 'Cryptocurrencies pegged to stable assets like USD.', 'Digital Services & Platforms', 'Fintech & Crypto');

// 2. Major Platforms & Cryptocurrencies
// Bitcoin
createTech('bitcoin', 'Bitcoin', 2009, 1, TechRole.PRODUCT, 'The first decentralized cryptocurrency.', 'Digital Services & Platforms', 'Fintech & Crypto');
createPerson('satoshi', 'Satoshi Nakamoto', 2008, 1, PersonRole.VISIONARY, 'Founder', 'Pseudonymous creator of Bitcoin.', { primaryRole: 'Creator of Bitcoin' });
createEpisode('bitcoin_whitepaper', 'Bitcoin Whitepaper', 2008, 1, EpisodeRole.MILESTONE, 'Publication of "Bitcoin: A Peer-to-Peer Electronic Cash System".', { eventType: 'Publication', impactScale: 'Crypto Genesis' });

// Ethereum
createTech('ethereum', 'Ethereum', 2015, 1, TechRole.PLATFORM, 'The world computer - pioneered smart contracts.', 'Digital Services & Platforms', 'Fintech & Crypto');
createPerson('vitalik', 'Vitalik Buterin', 2015, 1, PersonRole.VISIONARY, 'Founder', 'Co-founder of Ethereum.', { primaryRole: 'Co-founder of Ethereum', birthYear: 1994 });
createEpisode('the_merge', 'The Merge', 2022, 2, EpisodeRole.MILESTONE, 'Ethereum transitions to Proof-of-Stake, reducing energy consumption by 99%.', { eventType: 'Upgrade', impactScale: '99% Energy Cut' });

// 3. DeFi & Applications
// 3. DeFi & Applications
// Removed DeFi nodes as per request

// 4. Centralized Powerhouses (CeFi)
// Removed Coinbase as per request
createCompany('binance', 'Binance', 2017, 2, CompanyRole.PLATFORM, 'World\'s largest cryptocurrency exchange.', [CompanyCategory.INTERNET], { marketCap: { current: 'Private (~$30B)', peak: 'Private (~$100B)' } });
createPerson('cz', 'Changpeng Zhao', 2017, 2, PersonRole.VISIONARY, 'Founder', 'Founder of Binance.', { primaryRole: 'Founder of Binance', birthYear: 1977 });
createEpisode('ftx_collapse', 'FTX Collapse', 2022, 1, EpisodeRole.CRISIS, 'Collapse of major exchange due to fraud, shaking industry confidence.', { eventType: 'Crisis', impactScale: '$32B Collapse' });

// Connections
linkCreated('satoshi', 'bitcoin');
linkPartOf('bitcoin_whitepaper', 'bitcoin');
linkBasedOn('bitcoin', 'blockchain');

linkCreated('vitalik', 'ethereum');
linkPartOf('the_merge', 'ethereum');
linkBasedOn('ethereum', 'blockchain');
linkCreated('ethereum', 'smart_contracts');
linkTriggered('bitcoin', 'ethereum'); // Bitcoin inspired Ethereum

linkPartOf('cz', 'binance');
linkCreated('binance', 'bitcoin');
linkCreated('binance', 'ethereum');

linkTriggered('ftx_collapse', 'binance'); // Binance triggered the run
linkTriggered('ftx_collapse', 'bitcoin');
linkTriggered('bitcoin', 'stablecoin');
linkBasedOn('defi', 'stablecoin');

// 3. Asian FinTech
createTech('paypay', 'PayPay', 2018, 2, TechRole.PRODUCT, 'Dominant QR payment service in Japan.', 'Digital Services & Platforms', 'Digital Platforms');
linkCreated('softbank', 'paypay'); // Joint venture, but SoftBank is the parent in our graph
// linkCreated('yahoo_japan', 'paypay'); // Yahoo Japan not in graph

// Zoom
createCompany('zoom', 'Zoom', 2011, 1, CompanyRole.PLATFORM, 'Video conferencing standard.', [CompanyCategory.INTERNET], { marketCap: { current: '$20B', peak: '$160B' } });
createPerson('eric_yuan', 'Eric Yuan', 2011, 2, PersonRole.VISIONARY, 'Founder', 'Former WebEx engineer who built Zoom.', { primaryRole: 'CEO of Zoom', birthYear: 1970 });
createEpisode('zoom_boom', 'The Zoom Boom', 2020, 1, EpisodeRole.MILESTONE, 'Pandemic drives massive global adoption of video conferencing.', { eventType: 'Adoption', impactScale: '30x User Growth' });

linkCreated('eric_yuan', 'zoom');
linkPartOf('zoom_boom', 'zoom');
linkBasedOn('zoom', 'webrtc');
linkBasedOn('zoom', 'voip');

// ==========================================
// IBM TECHNOLOGIES & HISTORY
// ==========================================

// Early IBM Technologies
createTech('punch_card', 'Punch Card', 1928, 3, TechRole.STANDARD, 'Paper cards with punched holes used for data processing.');
createTech('ibm_system_360', 'IBM System/360', 1964, 2, TechRole.PRODUCT, 'Revolutionary mainframe family that standardized computing.');
createTech('pos_system', 'Point of Sale System', 1973, 3, TechRole.PRODUCT, 'Automated retail checkout systems.');
createTech('upc_barcode', 'UPC Barcode', 1974, 3, TechRole.STANDARD, 'Universal Product Code revolutionized retail.');
createTech('dram', 'DRAM', 1968, 2, TechRole.CORE, 'Dynamic Random Access Memory - the foundation of modern computer memory.');
createTech('risc', 'RISC Architecture', 1980, 2, TechRole.CORE, 'Reduced Instruction Set Computing - simplified CPU architecture for higher performance.');

// IBM PC Era
createTech('ibm_pc', 'IBM PC', 1981, 1, TechRole.PRODUCT, 'Standardized personal computing and created the PC industry.');
createTech('powerpc', 'PowerPC', 1991, 2, TechRole.PRODUCT, 'RISC-based processor architecture developed by IBM, Apple, and Motorola.');

// Modern IBM Era
createTech('watson_super', 'Watson', 2011, 2, TechRole.PRODUCT, 'AI supercomputer that won Jeopardy! and pioneered natural language processing.');
createTech('ibm_quantum', 'IBM Quantum (Eagle)', 2021, 2, TechRole.PRODUCT, '127-qubit quantum processor advancing quantum computing.');

// IBM Episodes
createEpisode('ibm_loss_1993', 'IBM\'s $8B Loss', 1993, 2, EpisodeRole.CRISIS, 'IBM reported an $8 billion loss, the largest in American corporate history at the time.', { eventType: 'Crisis', impactScale: '-$8B Loss' });
createEpisode('lenovo_acquisition', 'Lenovo Acquires IBM PC', 2005, 2, EpisodeRole.DEAL, 'IBM sold its PC division to Lenovo for $1.75 billion, exiting the PC business.', { eventType: 'Acquisition', impactScale: '$1.75B Deal' });

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
linkTriggered('ibm_system_360', 'mainframe', 0.9);
linkBasedOn('mainframe', 'ibm_system_360');

// PowerPC connections to Apple
linkBasedOn('apple', 'powerpc'); // Apple used PowerPC in Macs from 1994-2006
linkTriggered('powerpc', 'apple_silicon', 0.4); // PowerPC influenced Apple's later silicon strategy

// IBM PC influence on Wintel Alliance
linkTriggered('ibm_pc', 'wintel_alliance', 0.9);
linkPartOf('wintel_alliance', 'ibm');

// RISC influence on modern architectures
linkTriggered('risc', 'powerpc', 0.9);
linkTriggered('risc', 'arm_arch', 0.7);

// IBM Episodes
linkPartOf('ibm_loss_1993', 'ibm');
linkPartOf('lenovo_acquisition', 'ibm');


// ==========================================
// MAJOR WEB PLATFORMS & SOCIAL GIANTS
// ==========================================

// 1. Social Media Giants

// YouTube
createTech('youtube', 'YouTube', 2005, 1, TechRole.PRODUCT, 'The world\'s video platform.', 'Digital Services & Platforms', 'Social & Media');
createPerson('chad_hurley', 'Chad Hurley', 2005, 2, PersonRole.VISIONARY, 'Co-Founder', 'PayPal Mafia alumni who co-founded YouTube.', { primaryRole: 'Co-founder of YouTube', birthYear: 1977 });
createPerson('steve_chen', 'Steve Chen', 2005, 2, PersonRole.BUILDER, 'Co-Founder', 'CTO and co-founder of YouTube.', { primaryRole: 'Co-founder of YouTube', birthYear: 1978 });

linkCreated('google', 'youtube'); // Acquired by Google
linkPartOf('chad_hurley', 'youtube');
linkPartOf('chad_hurley', 'paypal');
linkPartOf('steve_chen', 'youtube');
linkPartOf('steve_chen', 'paypal');
linkPartOf('chad_hurley', 'paypal_mafia');
linkPartOf('steve_chen', 'paypal_mafia');

// Meta Ecosystem (Facebook, Instagram, WhatsApp)
createCompany('meta', 'Meta', 2004, 1, CompanyRole.PLATFORM, 'Social technology company connecting billions.', [CompanyCategory.INTERNET, CompanyCategory.SOFTWARE], { marketCap: { current: '$1.5T', peak: '$1.5T' } });
createTech('sns', 'SNS', 2004, 1, TechRole.STANDARD, 'Social Networking Service - online platform for people to build social networks or social relations.', 'Digital Services & Platforms', 'Social & Media');

createTech('facebook_app', 'Facebook App', 2004, 1, TechRole.PRODUCT, 'The social network that connected the world.', 'Digital Services & Platforms', 'Social & Media');
createTech('instagram', 'Instagram', 2010, 1, TechRole.PRODUCT, 'Visual storytelling platform.', 'Digital Services & Platforms', 'Social & Media');
createTech('whatsapp', 'WhatsApp', 2009, 1, TechRole.PRODUCT, 'Global messaging standard.', 'Digital Services & Platforms', 'Social & Media');

linkBasedOn('facebook_app', 'sns');
linkBasedOn('instagram', 'sns');
linkBasedOn('whatsapp', 'sns');
linkBasedOn('twitter', 'sns');
linkBasedOn('linkedin', 'sns');
linkBasedOn('youtube', 'sns');
linkBasedOn('tiktok', 'sns');
linkBasedOn('douyin', 'sns');
linkBasedOn('wechat', 'sns');

createPerson('zuckerberg', 'Mark Zuckerberg', 2004, 1, PersonRole.VISIONARY, 'Founder', 'CEO of Meta.', { primaryRole: 'CEO of Meta', birthYear: 1984 });
createPerson('kevin_systrom', 'Kevin Systrom', 2010, 2, PersonRole.VISIONARY, 'Founder', 'Co-founder of Instagram.', { primaryRole: 'Founder of Instagram', birthYear: 1983 });
createPerson('jan_koum', 'Jan Koum', 2009, 2, PersonRole.VISIONARY, 'Founder', 'Co-founder of WhatsApp.', { primaryRole: 'Co-founder of WhatsApp', birthYear: 1976 });

linkCreated('zuckerberg', 'meta');
linkCreated('meta', 'facebook_app');
linkCreated('meta', 'instagram');
linkCreated('meta', 'whatsapp');
linkPartOf('kevin_systrom', 'instagram');
linkPartOf('jan_koum', 'whatsapp');

// Meta AI & History
createPerson('lecun', 'Yann LeCun', 2013, 1, PersonRole.THEORIST, 'Chief AI Scientist', 'CNN Pioneer who leads Meta AI research.', { primaryRole: 'Chief AI Scientist at Meta', secondaryRole: 'Godfather of CNN', birthYear: 1960 });
createTech('pytorch', 'PyTorch', 2016, 2, TechRole.STANDARD, 'Open source machine learning framework that powers modern AI.', 'System Software', 'Development & Languages');
createEpisode('cambridge_analytica', 'Cambridge Analytica', 2018, 2, EpisodeRole.CRISIS, 'Massive data scandal that triggered global privacy debates.', { eventType: 'Crisis', impactScale: 'Data Privacy Scandal' });

linkPartOf('lecun', 'meta');
linkCreated('meta', 'pytorch');
linkPartOf('cambridge_analytica', 'meta');

// Twitter / X
createTech('twitter', 'Twitter / X', 2006, 2, TechRole.PLATFORM, 'The global town square.', 'Digital Services & Platforms', 'Social & Media');
createPerson('jack_dorsey', 'Jack Dorsey', 2006, 2, PersonRole.VISIONARY, 'Co-Founder', 'Creator of Twitter and Square.', { primaryRole: 'Co-founder of Twitter', secondaryRole: 'Co-founder of Block', birthYear: 1976 });

linkCreated('jack_dorsey', 'twitter');
linkPartOf('twitter', 'musk'); // Owned by Musk

// LinkedIn
createTech('linkedin', 'LinkedIn', 2002, 2, TechRole.PLATFORM, 'Professional social network.', 'Digital Services & Platforms', 'Social & Media');
createPerson('reid_hoffman', 'Reid Hoffman', 2002, 2, PersonRole.VISIONARY, 'Co-Founder', 'The networker of Silicon Valley.', { primaryRole: 'Co-founder of LinkedIn', secondaryRole: 'Partner at Greylock', birthYear: 1967 });
linkPartOf('reid_hoffman', 'paypal');

linkCreated('reid_hoffman', 'linkedin');
linkPartOf('reid_hoffman', 'paypal_mafia');
linkPartOf('linkedin', 'microsoft'); // Acquired by Microsoft

// 2. Service & Content Platforms

// Uber
createCompany('uber', 'Uber', 2009, 2, CompanyRole.PLATFORM, 'Revolutionized mobility with the gig economy.', [CompanyCategory.MOBILITY, CompanyCategory.INTERNET], { marketCap: { current: '$140B', peak: '$150B' } });
createPerson('travis_kalanick', 'Travis Kalanick', 2009, 2, PersonRole.VISIONARY, 'Co-Founder', 'Aggressive expansionist who built Uber.', { primaryRole: 'Co-founder of Uber', birthYear: 1976 });
createTech('gig_economy', 'Gig Economy', 2009, 2, TechRole.STANDARD, 'Labor market characterized by short-term contracts or freelance work.', 'Digital Services & Platforms', 'Digital Platforms');

linkCreated('travis_kalanick', 'uber');
linkCreated('uber', 'gig_economy');
linkCreated('uber', 'sharing_economy');

// Airbnb
createCompany('airbnb', 'Airbnb', 2008, 2, CompanyRole.PLATFORM, 'Community-based marketplace for accommodations.', [CompanyCategory.INTERNET], { marketCap: { current: '$90B', peak: '$115B' } });
createPerson('brian_chesky', 'Brian Chesky', 2008, 2, PersonRole.VISIONARY, 'Co-Founder', 'Designer-founder who reimagined travel.', { primaryRole: 'CEO of Airbnb', birthYear: 1981 });
createTech('sharing_economy', 'Sharing Economy', 2008, 2, TechRole.STANDARD, 'Peer-to-peer based activity of acquiring, providing or sharing access to goods and services.', 'Digital Services & Platforms', 'Digital Platforms');

linkCreated('brian_chesky', 'airbnb');
linkCreated('airbnb', 'sharing_economy');



// Wikipedia
createCompany('wikimedia', 'Wikimedia Foundation', 2003, 1, CompanyRole.PLATFORM, 'Non-profit charitable organization that hosts Wikipedia.', [CompanyCategory.INTERNET], { marketCap: { current: 'Non-profit', peak: 'Non-profit' } });
createTech('wikipedia', 'Wikipedia', 2001, 1, TechRole.PRODUCT, 'The free encyclopedia that anyone can edit.', 'Digital Services & Platforms', 'Search & Information');
createPerson('jimmy_wales', 'Jimmy Wales', 2001, 2, PersonRole.VISIONARY, 'Founder', 'Created the world\'s largest knowledge base.', { primaryRole: 'Founder of Wikipedia', birthYear: 1966 });


linkCreated('jimmy_wales', 'wikimedia');
linkCreated('wikimedia', 'wikipedia');
linkCreated('jimmy_wales', 'wikipedia');



// ==========================================
// DEVELOPER PLATFORMS & INFRASTRUCTURE
// ==========================================

// 1. Code & Collaboration

// GitHub
createTech('github', 'GitHub', 2008, 2, TechRole.PLATFORM, 'The world\'s largest code host.', 'Digital Services & Platforms', 'Digital Platforms');
createPerson('chris_wanstrath', 'Chris Wanstrath', 2008, 2, PersonRole.VISIONARY, 'Co-Founder', 'CEO who led GitHub to become the home of open source.', { primaryRole: 'Co-founder of GitHub', birthYear: 1985 });
createTech('git', 'Git', 2005, 1, TechRole.STANDARD, 'Distributed version control system.', 'System Software', 'Development & Languages');

linkCreated('chris_wanstrath', 'github');
linkCreated('linus', 'git'); // Linus created Git
linkBasedOn('github', 'git'); // GitHub is built on Git
linkPartOf('github', 'microsoft'); // Acquired by Microsoft



// 2. Modern Web & AI Infrastructure

// Stripe - Payments Infrastructure
createCompany('stripe', 'Stripe', 2010, 2, CompanyRole.PLATFORM, 'Payment infrastructure for the internet, powering millions of businesses.', [CompanyCategory.FINTECH, CompanyCategory.INTERNET], { marketCap: { current: '$70B', peak: '$95B' } });
createPerson('patrick_collison', 'Patrick Collison', 2010, 2, PersonRole.VISIONARY, 'Co-Founder & CEO', 'Built the most developer-friendly payments platform.', { primaryRole: 'Co-founder of Stripe', birthYear: 1988 });
createPerson('john_collison', 'John Collison', 2010, 2, PersonRole.VISIONARY, 'Co-Founder', 'Youngest self-made billionaire (at 26).', { primaryRole: 'Co-founder of Stripe', birthYear: 1990 });
createTech('api_economy', 'API Economy', 2010, 2, TechRole.STANDARD, 'Business model based on providing APIs as products.', 'Digital Services & Platforms', 'Digital Platforms');

linkCreated('patrick_collison', 'stripe');
linkCreated('john_collison', 'stripe');
linkCreated('stripe', 'api_economy');
linkBasedOn('stripe', 'saas');

// Spotify - Music Streaming
createCompany('spotify', 'Spotify', 2006, 1, CompanyRole.PLATFORM, 'World\'s largest music streaming service with 600M+ users.', [CompanyCategory.MEDIA, CompanyCategory.INTERNET], { marketCap: { current: '$80B', peak: '$90B' } });
createPerson('daniel_ek', 'Daniel Ek', 2006, 2, PersonRole.VISIONARY, 'Co-Founder & CEO', 'Transformed music industry from piracy to streaming.', { primaryRole: 'CEO of Spotify', birthYear: 1983 });
createTech('music_streaming', 'Music Streaming', 2006, 2, TechRole.PRODUCT, 'On-demand music delivery service model.', 'Digital Services & Platforms', 'Social & Media');

linkCreated('daniel_ek', 'spotify');
linkCreated('spotify', 'music_streaming');
linkBasedOn('spotify', 'cloud_computing');

// Reddit - Community Platform
createCompany('reddit', 'Reddit', 2005, 2, CompanyRole.PLATFORM, 'The front page of the internet - community-driven content platform.', [CompanyCategory.INTERNET], { marketCap: { current: '$15B', peak: '$15B' } });
createPerson('steve_huffman', 'Steve Huffman', 2005, 2, PersonRole.VISIONARY, 'Co-Founder & CEO', 'Built Reddit into one of the most visited sites on the web.', { primaryRole: 'CEO of Reddit', birthYear: 1983 });
createPerson('alexis_ohanian', 'Alexis Ohanian', 2005, 2, PersonRole.VISIONARY, 'Co-Founder', 'Startup evangelist and investor.', { primaryRole: 'Co-founder of Reddit', secondaryRole: 'Founder of Seven Seven Six', birthYear: 1983 });

linkCreated('steve_huffman', 'reddit');
linkCreated('alexis_ohanian', 'reddit');
linkPartOf('steve_huffman', 'y_combinator'); // YC alumni
linkPartOf('alexis_ohanian', 'y_combinator'); // YC alumni
linkBasedOn('reddit', 'sns');

// Stack Overflow - Developer Knowledge
createCompany('stack_overflow', 'Stack Overflow', 2008, 2, CompanyRole.PLATFORM, 'Largest Q&A site for developers, powering developer knowledge worldwide.', [CompanyCategory.INTERNET], { marketCap: { current: '$1.8B', peak: '$1.8B' } });
createPerson('joel_spolsky', 'Joel Spolsky', 2008, 2, PersonRole.VISIONARY, 'Co-Founder', 'Influential blogger who shaped developer culture.', { primaryRole: 'Co-founder of Stack Overflow', secondaryRole: 'Creator of Trello', birthYear: 1965 });
createPerson('jeff_atwood', 'Jeff Atwood', 2008, 2, PersonRole.VISIONARY, 'Co-Founder', 'Developer advocate and Coding Horror blogger.', { primaryRole: 'Co-founder of Stack Overflow', birthYear: 1970 });

linkCreated('joel_spolsky', 'stack_overflow');
linkCreated('jeff_atwood', 'stack_overflow');
linkBasedOn('stack_overflow', 'www');

// Vercel - Next.js & Frontend Cloud
createCompany('vercel', 'Vercel', 2015, 2, CompanyRole.PLATFORM, 'Frontend cloud platform, creator of Next.js.', [CompanyCategory.SOFTWARE], { marketCap: { current: '$3B', peak: '$3B' } });
createPerson('guillermo_rauch', 'Guillermo Rauch', 2015, 2, PersonRole.VISIONARY, 'Founder & CEO', 'Creator of Socket.io and Next.js ecosystem.', { primaryRole: 'CEO of Vercel', birthYear: 1988 });
createTech('nextjs', 'Next.js', 2016, 2, TechRole.PLATFORM, 'React framework for production, enabling SSR and static generation.', 'System Software', 'Development & Languages');

linkCreated('guillermo_rauch', 'vercel');
linkCreated('vercel', 'nextjs');
linkBasedOn('nextjs', 'javascript');
linkBasedOn('vercel', 'cloud_computing');

// Hugging Face - AI Model Hub
createCompany('huggingface', 'Hugging Face', 2016, 2, CompanyRole.PLATFORM, 'The GitHub for machine learning models and datasets.', [CompanyCategory.LAB], { marketCap: { current: '$4.5B', peak: '$4.5B' } });
createPerson('clement_delangue', 'Clément Delangue', 2016, 2, PersonRole.VISIONARY, 'Co-Founder & CEO', 'Democratizing AI through open-source models.', { primaryRole: 'CEO of Hugging Face', birthYear: 1989 });
createTech('transformers_lib', 'Transformers Library', 2018, 2, TechRole.PLATFORM, 'State-of-the-art NLP library used by 50,000+ organizations.', 'AI & Physical Systems', 'Artificial Intelligence');

linkCreated('clement_delangue', 'huggingface');
linkCreated('huggingface', 'transformers_lib');
linkBasedOn('transformers_lib', 'transformer'); // Based on Transformer architecture
linkBasedOn('transformers_lib', 'pytorch'); // Built on PyTorch
linkBasedOn('huggingface', 'github'); // Model hosting similar to code hosting



export const INITIAL_DATA: GraphData = { nodes, links };
