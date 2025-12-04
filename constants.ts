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

const createCompany = (id: string, label: string, year: number, importance: number, roleType: CompanyRole, description: string, categories: CompanyCategory[] = []) => {
  nodes.push({ id, label, category: Category.COMPANY, year, importance, roleType, description, companyCategories: categories });
};

const createPerson = (id: string, label: string, year: number, importance: number, roleType: PersonRole, role: string, description: string) => {
  nodes.push({ id, label, category: Category.PERSON, year, importance, roleType, role, description });
};

const createTech = (id: string, label: string, year: number, importance: number, roleType: TechRole, description: string, l1?: TechCategoryL1, l2?: TechCategoryL2) => {
  nodes.push({ id, label, category: Category.TECHNOLOGY, year, importance, roleType, description, techCategoryL1: l1, techCategoryL2: l2 });
};

const createEpisode = (id: string, label: string, year: number, importance: number, roleType: EpisodeRole, description: string) => {
  nodes.push({ id, label, category: Category.EPISODE, year, importance, roleType, description });
};

const linkDependency = (source: string, target: string, strength: number = 1.0) => {
  links.push({ source, target, type: LinkType.DEPENDENCY, direction: LinkDirection.FORWARD, strength });
};

const linkMaker = (source: string, target: string, strength: number = 0.9) => {
  links.push({ source, target, type: LinkType.MAKER, direction: LinkDirection.FORWARD, strength });
};

const linkInfluence = (source: string, target: string, strength: number = 0.5) => {
  links.push({ source, target, type: LinkType.INFLUENCE, direction: LinkDirection.FORWARD, strength });
};

const linkBelonging = (source: string, target: string, strength: number = 0.8) => {
  links.push({ source, target, type: LinkType.BELONGING, direction: LinkDirection.FORWARD, strength });
};


// --- DATA ENTRY START ---

// ==========================================
// ERA 0: FOUNDATIONS
// ==========================================
createPerson('turing', 'Alan Turing', 1936, 1, PersonRole.THEORIST, 'Father of CS', 'Formulated the concept of the universal machine and the Turing Test for AI.');
createPerson('mccarthy', 'John McCarthy', 1956, 1, PersonRole.THEORIST, 'Father of AI', 'Coined the term "Artificial Intelligence" and created Lisp.');
createPerson('von_neumann', 'John von Neumann', 1945, 1, PersonRole.THEORIST, 'Mathematician', 'Defined the architecture used in almost all modern computers.');
createEpisode('dartmouth', 'Dartmouth Workshop', 1956, 2, EpisodeRole.MILESTONE, 'The birth of AI as a field. McCarthy, Minsky, Shannon, and Rochester attended.');

linkBelonging('mccarthy', 'dartmouth');
linkInfluence('turing', 'mccarthy', 0.8);

// ==========================================
// ERA 5: THE AI RACE
// ==========================================

// AMD - The Challenger
createCompany('amd', 'AMD', 1969, 2, CompanyRole.INFRA, 'Intel\'s eternal rival, resurgent under Lisa Su with Ryzen and EPYC processors.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('lisa_su', 'Lisa Su', 2014, 2, PersonRole.VISIONARY, 'CEO', 'Led AMD\'s remarkable turnaround with Ryzen architecture and data center dominance.');
createTech('ryzen', 'AMD Ryzen', 2017, 2, TechRole.PRODUCT, 'High-performance CPUs that challenged Intel\'s dominance.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('epyc', 'AMD EPYC', 2017, 2, TechRole.PRODUCT, 'Server processors that captured data center market share from Intel.', 'Hardware & Infrastructure', 'Processors & Compute');

linkBelonging('lisa_su', 'amd');
linkMaker('amd', 'ryzen');
linkMaker('amd', 'epyc');
// AMD uses TSMC for chip manufacturing - Linked via Products
linkDependency('ryzen', 'tsmc');
linkDependency('epyc', 'tsmc');

// TSMC customer dependencies
// Qualcomm manufactures Snapdragon at TSMC - Linked via Product
linkDependency('snapdragon', 'tsmc');
// Broadcom chips manufactured at TSMC
// linkDependency('broadcom', 'tsmc'); // Removed direct link, need product or leave implicit

// Intel uses TSMC for some products
// linkDependency('intel', 'tsmc'); // Removed direct link

// ==========================================
// ERA 1: THE GENESIS
// ==========================================

createCompany('att', 'AT&T', 1885, 2, CompanyRole.PLATFORM, 'American Telephone & Telegraph - parent company of Bell Labs and telecommunications giant.', [CompanyCategory.TELECOM]);
createPerson('alexander_graham_bell', 'Alexander Graham Bell', 1885, 1, PersonRole.VISIONARY, 'Founder', 'Inventor of the telephone.');
createEpisode('att_breakup', 'The Breakup', 1984, 2, EpisodeRole.MILESTONE, 'Antitrust split of AT&T into Baby Bells, opening telecom innovation.');

linkBelonging('alexander_graham_bell', 'att');
linkBelonging('att_breakup', 'att');

createPerson('shockley', 'William Shockley', 1956, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor. His management style birthed Silicon Valley.');
createPerson('shannon', 'Claude Shannon', 1948, 1, PersonRole.THEORIST, 'Father of Info Theory', 'Defined the bit and the mathematical basis of digital communication.');
createPerson('ritchie', 'Dennis Ritchie', 1972, 1, PersonRole.BUILDER, 'Creator of C', 'Created the C programming language and co-created Unix.');
createPerson('thompson', 'Ken Thompson', 1969, 2, PersonRole.BUILDER, 'Creator of Unix', 'Co-created Unix, B language, and later Go at Google.');
createPerson('bardeen', 'John Bardeen', 1947, 1, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor and superconductivity theory. Only person to win Nobel Prize in Physics twice.');
createPerson('brattain', 'Walter Brattain', 1947, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor with Shockley and Bardeen.');

createTech('transistor', 'The Transistor', 1947, 1, TechRole.CORE, 'The fundamental building block of all modern electronics.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('unix', 'Unix', 1969, 2, TechRole.STANDARD, 'The OS architecture that underpins Linux, macOS, and the internet.', 'System Software', 'Operating Systems (OS)');
createTech('c_language', 'C Language', 1972, 1, TechRole.STANDARD, 'The programming language that shaped modern software development.', 'System Software', 'Development & Languages');
createTech('laser', 'Laser', 1958, 1, TechRole.CORE, 'Light Amplification by Stimulated Emission of Radiation - revolutionized communications, medicine, and manufacturing.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('ccd', 'CCD', 1969, 2, TechRole.CORE, 'Charge-Coupled Device - enabled digital imaging and modern cameras.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('cdma', 'CDMA', 1989, 2, TechRole.STANDARD, 'Code Division Multiple Access - wireless communication standard that enabled modern mobile networks.', 'Network & Connectivity', 'Telecommunications');
createTech('solar_cell', 'Solar Cell', 1954, 2, TechRole.CORE, 'First practical photovoltaic cell, converting sunlight to electricity.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('mosfet', 'MOSFET', 1959, 1, TechRole.CORE, 'Metal-Oxide-Semiconductor Field-Effect Transistor - the most common transistor in modern chips.', 'Hardware & Infrastructure', 'Components & Manufacturing');

// Bell Labs belongs to AT&T
// linkBelonging('bell_labs', 'att'); // Removed direct link

// People at Bell Labs (Linked to AT&T)
linkBelonging('shockley', 'att');
linkBelonging('shannon', 'att');
linkBelonging('ritchie', 'att');
linkBelonging('thompson', 'att');
linkBelonging('bardeen', 'att');
linkBelonging('brattain', 'att');

// Bell Labs innovations (Linked to AT&T now)
linkMaker('att', 'transistor');
linkMaker('att', 'unix');
linkMaker('att', 'c_language');
linkMaker('att', 'laser');
linkMaker('att', 'ccd');
linkMaker('att', 'cdma');
linkMaker('att', 'solar_cell');
linkMaker('att', 'mosfet');

// Individual creators
linkMaker('ritchie', 'unix');
linkMaker('thompson', 'unix');
linkMaker('ritchie', 'c_language');
linkMaker('bardeen', 'transistor');
linkMaker('brattain', 'transistor');
linkMaker('shockley', 'transistor');

// Technology influences
linkDependency('unix', 'c_language'); // Unix rewritten in C
linkInfluence('c_language', 'cpp', 0.9); // C influenced C++
linkInfluence('transistor', 'mosfet', 0.9); // MOSFET is evolution of transistor

// Shannon's influence
linkBelonging('shannon', 'dartmouth');

// Transistor's fundamental influence
linkInfluence('transistor', 'integrated_circuit', 0.95);

createCompany('ibm', 'IBM', 1911, 1, CompanyRole.PLATFORM, 'Big Blue. The dominant force in computing for most of the 20th century.', [CompanyCategory.HARDWARE, CompanyCategory.SOFTWARE]);
createTech('mainframe', 'Mainframe', 1952, 2, TechRole.PRODUCT, 'Big iron computing for enterprise.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('deep_blue', 'Deep Blue', 1997, 2, TechRole.PRODUCT, 'First computer to defeat a world chess champion.', 'AI & Physical Systems', 'Artificial Intelligence');
createEpisode('kasparov_match', 'Kasparov vs Deep Blue', 1997, 2, EpisodeRole.MILESTONE, 'The first time a computer defeated a reigning world chess champion.');

linkMaker('ibm', 'mainframe');
linkMaker('ibm', 'deep_blue');
linkBelonging('deep_blue', 'kasparov_match');
linkBelonging('kasparov_match', 'ibm');
linkInfluence('von_neumann', 'mainframe', 0.6);

createCompany('fairchild', 'Fairchild Semi', 1957, 2, CompanyRole.LAB, 'The incubator of Silicon Valley.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('noyce', 'Robert Noyce', 1957, 1, PersonRole.VISIONARY, 'Mayor of Silicon Valley', 'Co-inventor of the IC and co-founder of Intel.');
createPerson('moore', 'Gordon Moore', 1968, 1, PersonRole.VISIONARY, 'Co-founder', 'Author of Moore\'s Law. Co-founded Intel.');
createEpisode('traitorous_eight', 'The Traitorous Eight', 1957, 2, EpisodeRole.MILESTONE, 'Eight engineers left Shockley to found Fairchild.');
createTech('ic', 'Integrated Circuit', 1959, 1, TechRole.CORE, 'Combining multiple transistors onto a single chip.', 'Hardware & Infrastructure', 'Processors & Compute');

linkBelonging('noyce', 'fairchild');
linkBelonging('moore', 'fairchild');
linkMaker('fairchild', 'ic');
linkInfluence('shockley', 'traitorous_eight');
linkInfluence('traitorous_eight', 'fairchild');

createCompany('ti', 'Texas Instruments', 1930, 2, CompanyRole.INFRA, 'Pioneers of the Integrated Circuit and DSPs.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('kilby', 'Jack Kilby', 1958, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Inventor of the Integrated Circuit (alongside Noyce).');

createTech('ti_calculator', 'Handheld Calculator', 1967, 2, TechRole.PRODUCT, 'First handheld electronic calculator, revolutionizing personal computing.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('dsp', 'DSP Chip', 1982, 2, TechRole.CORE, 'Digital Signal Processor - specialized microprocessor for digital signal processing in audio, video, and communications.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('ttl_logic', 'TTL Logic', 1964, 2, TechRole.STANDARD, 'Transistor-Transistor Logic - became the industry standard for digital logic circuits.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('tms1000', 'TMS1000 Microcontroller', 1974, 2, TechRole.PRODUCT, 'First commercially successful microcontroller, used in appliances and toys.', 'Hardware & Infrastructure', 'Components & Manufacturing');

createEpisode('ic_patent_battle', 'IC Patent Battle', 1966, 2, EpisodeRole.MILESTONE, 'Legal battle between TI (Kilby) and Fairchild (Noyce) over IC invention - both recognized as co-inventors.');

linkBelonging('kilby', 'ti');
linkMaker('ti', 'ic');
linkMaker('kilby', 'ic');
linkMaker('ti', 'ti_calculator');
linkMaker('ti', 'dsp');
linkMaker('ti', 'ttl_logic');
linkMaker('ti', 'tms1000');

// IC Patent Battle
linkBelonging('ic_patent_battle', 'ti');
linkBelonging('ic_patent_battle', 'fairchild');
linkInfluence('ic_patent_battle', 'ic', 0.3);

// Technology influences
linkDependency('ti_calculator', 'ic');
linkDependency('dsp', 'microprocessor', 0.7);
linkInfluence('tms1000', 'microprocessor', 0.5);
linkDependency('ttl_logic', 'transistor');

createCompany('intel', 'Intel', 1968, 1, CompanyRole.INFRA, 'Put the "Silicon" in Silicon Valley. Created the microprocessor.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('andy_grove', 'Andy Grove', 1979, 2, PersonRole.VISIONARY, 'Former CEO', 'The man who drove Intel\'s execution. "Only the Paranoid Survive."');
createPerson('faggin', 'Federico Faggin', 1971, 2, PersonRole.BUILDER, 'Lead Designer', 'Led the design of the first commercial microprocessor.');
createPerson('gelsinger', 'Pat Gelsinger', 2021, 2, PersonRole.VISIONARY, 'CEO', 'Returned to Intel as CEO to restore its manufacturing leadership.');

createTech('microprocessor', 'Microprocessor (4004)', 1971, 1, TechRole.CORE, 'The first general-purpose CPU on a single chip.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('x86', 'x86 Architecture', 1978, 1, TechRole.CORE, 'The instruction set architecture that dominated personal computing for decades.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('pentium', 'Pentium', 1993, 2, TechRole.PRODUCT, 'Intel\'s iconic processor brand that became synonymous with PC performance.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('core_processor', 'Intel Core', 2006, 2, TechRole.PRODUCT, 'Multi-core processor architecture that redefined PC performance.', 'Hardware & Infrastructure', 'Processors & Compute');

createTech('moores_law', 'Moore\'s Law', 1965, 1, TechRole.STANDARD, 'Observation that transistor count doubles every two years - guided semiconductor industry for 50+ years.', 'Hardware & Infrastructure', 'Processors & Compute');

createEpisode('intel_inside', 'Intel Inside Campaign', 1991, 2, EpisodeRole.MILESTONE, 'Revolutionary marketing campaign that made a chip maker a consumer brand.');
createEpisode('pentium_bug', 'Pentium FDIV Bug', 1994, 3, EpisodeRole.CRISIS, 'Floating-point division bug in Pentium processor. Intel initially denied, then recalled $475M worth of chips.');
createEpisode('memory_to_cpu', 'Memory to Microprocessor Pivot', 1985, 2, EpisodeRole.MILESTONE, 'Grove\'s strategic decision to exit DRAM memory business and focus on microprocessors.');
createEpisode('tick_tock', 'Tick-Tock Strategy', 2007, 3, EpisodeRole.MILESTONE, 'Intel\'s manufacturing strategy: alternate between process shrinks (tick) and new architectures (tock).');

linkBelonging('noyce', 'intel');
linkBelonging('moore', 'intel');
linkBelonging('andy_grove', 'intel');
linkBelonging('faggin', 'intel');
linkBelonging('gelsinger', 'intel');

linkMaker('intel', 'microprocessor');
linkMaker('faggin', 'microprocessor');
linkMaker('intel', 'x86');
linkMaker('intel', 'pentium');
linkMaker('intel', 'core_processor');
linkMaker('moore', 'moores_law');

// Technology evolution
linkInfluence('ic', 'microprocessor');
linkInfluence('microprocessor', 'x86', 0.9);
linkDependency('pentium', 'x86');
linkDependency('core_processor', 'x86');
linkInfluence('pentium', 'core_processor', 0.7);

// Episodes
linkBelonging('intel_inside', 'intel');
linkBelonging('pentium_bug', 'intel');
linkBelonging('memory_to_cpu', 'intel');
linkBelonging('tick_tock', 'intel');
linkInfluence('memory_to_cpu', 'microprocessor', 0.5);

// Moore's Law influence on industry
linkInfluence('moores_law', 'ic', 0.8);
linkInfluence('moores_law', 'microprocessor', 0.8);

// ==========================================
// ERA 2: PERSONAL COMPUTING & OS
// ==========================================

createCompany('xerox', 'Xerox PARC', 1970, 2, CompanyRole.LAB, 'Invented the GUI, Mouse, and Ethernet, but failed to commercialize them.', [CompanyCategory.LAB]);
createPerson('kay', 'Alan Kay', 1970, 2, PersonRole.THEORIST, 'Visionary', 'Pioneered OOP (Smalltalk) and the GUI.');
createTech('gui', 'GUI', 1973, 2, TechRole.CORE, 'Graphical User Interface.', 'System Software', 'Operating Systems (OS)');
linkBelonging('kay', 'xerox');
linkMaker('xerox', 'gui');

createCompany('apple', 'Apple', 1976, 1, CompanyRole.PLATFORM, 'Revolutionized personal computing, mobile, and design.', [CompanyCategory.HARDWARE, CompanyCategory.SOFTWARE]);
createPerson('jobs', 'Steve Jobs', 1976, 1, PersonRole.VISIONARY, 'Co-Founder', 'The visionary who made technology beautiful and accessible.');
createPerson('wozniak', 'Steve Wozniak', 1976, 2, PersonRole.BUILDER, 'Co-Founder', 'The engineering genius behind the Apple I and II.');
createPerson('cook', 'Tim Cook', 2011, 2, PersonRole.VISIONARY, 'CEO', 'Master of the supply chain who scaled Apple to a $3T company.');
createTech('macintosh', 'Macintosh', 1984, 2, TechRole.PRODUCT, 'The first mass-market computer with a GUI and mouse.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('iphone', 'iPhone', 2007, 1, TechRole.PRODUCT, 'The device that put the internet in everyone\'s pocket.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createEpisode('gui_visit', 'The PARC Visit', 1979, 3, EpisodeRole.MILESTONE, 'Jobs visits Xerox PARC, sees the GUI, and integrates it into the Mac.');
createEpisode('xerox_investment', 'Xerox Invests in Apple', 1979, 3, EpisodeRole.DEAL, 'Xerox buys 100k shares of Apple pre-IPO in exchange for the PARC tour.');

linkBelonging('jobs', 'apple');
linkBelonging('wozniak', 'apple');
linkBelonging('cook', 'apple');
linkMaker('apple', 'macintosh');
linkMaker('apple', 'iphone');
linkBelonging('gui_visit', 'apple');
linkBelonging('xerox_investment', 'apple');
linkBelonging('xerox_investment', 'xerox');
linkInfluence('xerox_investment', 'apple');
linkInfluence('gui_visit', 'macintosh');

createCompany('microsoft', 'Microsoft', 1975, 1, CompanyRole.PLATFORM, 'PC software monopoly turned Cloud & AI giant.', [CompanyCategory.SOFTWARE, CompanyCategory.INTERNET]);
createPerson('gates', 'Bill Gates', 1975, 1, PersonRole.VISIONARY, 'Co-Founder', 'Dominated the PC era.');
createPerson('nadella', 'Satya Nadella', 2014, 1, PersonRole.VISIONARY, 'CEO', 'Led the Cloud & AI transformation.');
createTech('windows', 'Windows', 1985, 2, TechRole.PRODUCT, 'The OS that runs the world.', 'System Software', 'Operating Systems (OS)');
createEpisode('wintel_alliance', 'Wintel Alliance', 1980, 2, EpisodeRole.DEAL, 'The dominance of Windows running on Intel chips.');
createEpisode('ms_saves_apple', 'Microsoft Saves Apple', 1997, 3, EpisodeRole.DEAL, 'Gates invests $150M in Apple.');

linkBelonging('gates', 'microsoft');
linkBelonging('nadella', 'microsoft');
linkMaker('microsoft', 'windows');
linkBelonging('ms_saves_apple', 'microsoft');
linkInfluence('ms_saves_apple', 'apple');
linkBelonging('wintel_alliance', 'microsoft');
linkBelonging('wintel_alliance', 'intel');

createCompany('oracle', 'Oracle', 1977, 2, CompanyRole.PLATFORM, 'Database giant.', [CompanyCategory.SOFTWARE]);
createPerson('ellison', 'Larry Ellison', 1977, 2, PersonRole.VISIONARY, 'Founder', 'Pioneer of the relational database.');
createPerson('safra_catz', 'Safra Catz', 1999, 2, PersonRole.VISIONARY, 'CEO', 'Led Oracle\'s aggressive acquisition strategy and cloud pivot.');
createTech('oracle_db', 'Oracle Database', 1979, 2, TechRole.STANDARD, 'The gold standard for enterprise relational databases.', 'System Software', 'Development & Languages');
createEpisode('oracle_buys_sun', 'Oracle Acquires Sun', 2010, 2, EpisodeRole.DEAL, 'Oracle buys Sun Microsystems for Java and Solaris.');

linkBelonging('ellison', 'oracle');
linkBelonging('safra_catz', 'oracle');
linkMaker('oracle', 'oracle_db');
linkBelonging('oracle_buys_sun', 'oracle');

createCompany('sap', 'SAP', 1972, 2, CompanyRole.PLATFORM, 'European software giant.', [CompanyCategory.SOFTWARE]);
createPerson('hasso_plattner', 'Hasso Plattner', 1972, 2, PersonRole.VISIONARY, 'Co-Founder', 'Pioneered ERP software.');
createTech('erp', 'ERP', 1972, 2, TechRole.PRODUCT, 'Enterprise Resource Planning - the software that runs global business.', 'Digital Services & Platforms', 'Digital Platforms');

linkBelonging('hasso_plattner', 'sap');
linkMaker('sap', 'erp');
linkMaker('sap', 'saas');

createCompany('sun', 'Sun Microsystems', 1982, 2, CompanyRole.PLATFORM, 'The dot in .com.', [CompanyCategory.HARDWARE]);
createPerson('scott_mcnealy', 'Scott McNealy', 1982, 2, PersonRole.VISIONARY, 'Co-Founder', 'Aggressive leader who defined the dot-com era.');
createTech('java', 'Java', 1995, 2, TechRole.STANDARD, 'Write once, run anywhere.', 'System Software', 'Development & Languages');
createTech('solaris', 'Solaris', 1992, 2, TechRole.PRODUCT, 'Enterprise Unix standard.', 'System Software', 'Operating Systems (OS)');
createTech('nfs', 'NFS', 1984, 2, TechRole.STANDARD, 'Network File System.', 'Network & Connectivity', 'Network Architecture');

linkBelonging('scott_mcnealy', 'sun');
linkMaker('sun', 'java');
linkMaker('sun', 'solaris');
linkMaker('sun', 'nfs');
linkDependency('oracle', 'oracle_buys_sun');
linkInfluence('oracle_buys_sun', 'sun');

createCompany('adobe', 'Adobe', 1982, 2, CompanyRole.PLATFORM, 'Creative software giant.', [CompanyCategory.SOFTWARE]);
createPerson('john_warnock', 'John Warnock', 1982, 2, PersonRole.VISIONARY, 'Co-Founder', 'Inventor of PostScript and PDF.');
createPerson('charles_geschke', 'Charles Geschke', 1982, 2, PersonRole.VISIONARY, 'Co-Founder', 'Desktop publishing pioneer.');

createTech('postscript', 'PostScript', 1982, 2, TechRole.STANDARD, 'Page description language that enabled desktop publishing.', 'System Software', 'Development & Languages');
createTech('illustrator', 'Illustrator', 1987, 2, TechRole.PRODUCT, 'Vector graphics standard.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('photoshop', 'Photoshop', 1990, 2, TechRole.PRODUCT, 'Digital imaging standard.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('pdf', 'PDF', 1993, 2, TechRole.STANDARD, 'Portable Document Format.', 'Digital Services & Platforms', 'Digital Platforms');

createEpisode('dtp_revolution', 'Desktop Publishing Revolution', 1985, 2, EpisodeRole.MILESTONE, 'Convergence of Mac, LaserWriter, and PostScript revolutionized publishing.');

linkBelonging('john_warnock', 'adobe');
linkBelonging('charles_geschke', 'adobe');
linkBelonging('john_warnock', 'xerox'); // Alumni
linkBelonging('charles_geschke', 'xerox'); // Alumni

linkMaker('adobe', 'postscript');
linkMaker('adobe', 'illustrator');
linkMaker('adobe', 'photoshop');
linkMaker('adobe', 'pdf');

linkBelonging('dtp_revolution', 'adobe');
linkBelonging('dtp_revolution', 'apple');
linkDependency('dtp_revolution', 'postscript');
linkDependency('dtp_revolution', 'macintosh');

createPerson('linus', 'Linus Torvalds', 1991, 1, PersonRole.BUILDER, 'Creator of Linux', 'Created the Linux kernel and Git.');
linkInfluence('unix', 'linus');

// ==========================================
// ERA 3: INTERNET & CLOUD
// ==========================================

createCompany('darpa', 'DARPA', 1958, 1, CompanyRole.LAB, 'Defense Research. Funded Internet & AI.', [CompanyCategory.LAB]);
createTech('gps', 'GPS', 1973, 2, TechRole.CORE, 'Global Positioning System - originally a military project, now essential for global navigation.', 'Network & Connectivity', 'Telecommunications');
createEpisode('darpa_grand_challenge', 'DARPA Grand Challenge', 2004, 2, EpisodeRole.MILESTONE, 'Competition that kickstarted the autonomous vehicle industry.');
createTech('arpanet', 'ARPANET', 1969, 1, TechRole.CORE, 'Precursor to the Internet.', 'Network & Connectivity', 'Network Architecture');
createPerson('cerf', 'Vint Cerf', 1973, 2, PersonRole.THEORIST, 'Father of Internet', 'Co-designer of TCP/IP.');
linkMaker('darpa', 'arpanet');
linkMaker('cerf', 'arpanet');
linkMaker('darpa', 'gps');
linkBelonging('darpa_grand_challenge', 'darpa');

createCompany('cern', 'CERN', 1954, 2, CompanyRole.LAB, 'Birthplace of the Web.', [CompanyCategory.LAB]);
createTech('www', 'World Wide Web', 1989, 1, TechRole.STANDARD, 'HTML, HTTP, URL.', 'Network & Connectivity', 'Network Architecture');
createPerson('berners_lee', 'Tim Berners-Lee', 1989, 2, PersonRole.THEORIST, 'Inventor', 'Invented the Web.');
linkBelonging('berners_lee', 'cern');
linkMaker('cern', 'www');
linkInfluence('arpanet', 'www');

createCompany('netscape', 'Netscape', 1994, 2, CompanyRole.PLATFORM, 'First commercial browser.', [CompanyCategory.INTERNET]);
createPerson('andreessen', 'Marc Andreessen', 1994, 2, PersonRole.BUILDER, 'Co-Founder', 'Created Mosaic/Netscape.');
createTech('javascript', 'JavaScript', 1995, 2, TechRole.STANDARD, 'Language of the web.', 'System Software', 'Development & Languages');
createEpisode('browser_wars', 'Browser Wars', 1995, 2, EpisodeRole.MILESTONE, 'Netscape vs Microsoft (IE).');

linkBelonging('andreessen', 'netscape');
linkMaker('netscape', 'javascript');
linkInfluence('www', 'netscape');
linkBelonging('browser_wars', 'netscape');
linkBelonging('browser_wars', 'microsoft');

createCompany('google', 'Google', 1998, 1, CompanyRole.PLATFORM, 'Organized the world\'s information. AI First company.', [CompanyCategory.INTERNET, CompanyCategory.SOFTWARE]);
createPerson('larry_page', 'Larry Page', 1998, 2, PersonRole.VISIONARY, 'Co-Founder', 'PageRank inventor.');
createPerson('pichai', 'Sundar Pichai', 2015, 2, PersonRole.VISIONARY, 'CEO', 'Led Chrome, Android, and AI pivot.');
createTech('search', 'Google Search', 1998, 1, TechRole.PRODUCT, 'Algorithmic search.', 'Digital Services & Platforms', 'Search & Information');
createTech('android', 'Android', 2008, 2, TechRole.PRODUCT, 'Mobile OS.', 'System Software', 'Operating Systems (OS)'); // Wait, TechRole Platform doesn't exist, using PRODUCT
createTech('tpu', 'TPU', 2015, 2, TechRole.PRODUCT, 'AI ASIC.', 'Hardware & Infrastructure', 'Processors & Compute');

linkBelonging('larry_page', 'google');
linkBelonging('pichai', 'google');
linkBelonging('cerf', 'google');
linkMaker('google', 'search');
linkMaker('google', 'android'); // Note: Android is a Product here
linkMaker('google', 'tpu');
linkInfluence('iphone', 'android');

createCompany('amazon', 'Amazon', 1994, 2, CompanyRole.PLATFORM, 'E-commerce & Cloud.', [CompanyCategory.INTERNET, CompanyCategory.SOFTWARE]);
createPerson('bezos', 'Jeff Bezos', 1994, 2, PersonRole.VISIONARY, 'Founder', 'Cloud computing pioneer.');
createTech('aws', 'AWS', 2006, 1, TechRole.PRODUCT, 'Cloud Infrastructure (IaaS).', 'Digital Services & Platforms', 'Digital Platforms');
linkBelonging('bezos', 'amazon');
linkMaker('amazon', 'aws');

createTech('cloud_computing', 'Cloud Computing', 2006, 1, TechRole.CORE, 'On-demand availability of computer system resources, especially data storage and computing power.', 'Network & Connectivity', 'Network Architecture');
linkMaker('amazon', 'cloud_computing');
linkMaker('microsoft', 'cloud_computing');
createTech('azure', 'Microsoft Azure', 2010, 1, TechRole.PLATFORM, 'Cloud computing service created by Microsoft.', 'Network & Connectivity', 'Network Architecture');
linkMaker('microsoft', 'azure');
linkMaker('google', 'cloud_computing');
createTech('gcp', 'Google Cloud Platform', 2008, 1, TechRole.PLATFORM, 'Suite of cloud computing services offered by Google.', 'Network & Connectivity', 'Network Architecture');
linkMaker('google', 'gcp');
linkMaker('alibaba', 'cloud_computing');
linkDependency('aws', 'cloud_computing');
linkDependency('saas', 'cloud_computing'); // SaaS runs on Cloud

createCompany('salesforce', 'Salesforce', 1999, 2, CompanyRole.PLATFORM, 'SaaS Pioneer.', [CompanyCategory.SOFTWARE]);
createPerson('benioff', 'Marc Benioff', 1999, 2, PersonRole.VISIONARY, 'Founder', 'Former Oracle executive who pioneered SaaS.');
createTech('crm', 'CRM', 1999, 2, TechRole.PRODUCT, 'Customer Relationship Management - the killer app for SaaS.', 'Digital Services & Platforms', 'Digital Platforms');
createEpisode('no_software', 'No Software Campaign', 2000, 2, EpisodeRole.MILESTONE, 'Marketing campaign that launched the Cloud computing era.');

linkBelonging('benioff', 'salesforce');
linkMaker('salesforce', 'crm');
linkBelonging('no_software', 'salesforce');
linkInfluence('oracle', 'benioff');

createTech('saas', 'SaaS', 1999, 1, TechRole.STANDARD, 'Software as a Service - software licensing and delivery model.', 'Digital Services & Platforms', 'Digital Platforms');
linkMaker('salesforce', 'saas');
linkDependency('crm', 'saas');

// createCompany('cisco', 'Cisco', 1984, 2, CompanyRole.INFRA, 'Internet plumbing.'); // Moved to Networking section
// linkDependency('arpanet', 'cisco'); // Moved to Networking section

createCompany('netflix', 'Netflix', 1997, 2, CompanyRole.PLATFORM, 'Streaming & RecSys.', [CompanyCategory.INTERNET]);
createPerson('reed_hastings', 'Reed Hastings', 1997, 2, PersonRole.VISIONARY, 'Founder', 'Pivoted from DVD to Streaming, reinventing TV.');
createTech('chaos_monkey', 'Chaos Monkey', 2011, 2, TechRole.CORE, 'Revolutionized DevOps by randomly terminating instances to test resilience.', 'AI & Physical Systems', 'Artificial Intelligence');
createEpisode('netflix_prize', 'Netflix Prize', 2006, 2, EpisodeRole.MILESTONE, 'Crowdsourced recommendation algorithm contest ($1M prize) that advanced ML field.');
createEpisode('streaming_wars', 'Streaming Wars', 2019, 2, EpisodeRole.MILESTONE, 'Disney, Apple, HBO enter streaming market to challenge Netflix.');

linkBelonging('reed_hastings', 'netflix');
linkMaker('netflix', 'chaos_monkey');
linkBelonging('netflix_prize', 'netflix');
linkBelonging('streaming_wars', 'netflix');
linkDependency('netflix', 'aws');
linkDependency('chaos_monkey', 'aws');



// ==========================================
// ERA 4: HARDWARE & GLOBAL SUPPLY CHAIN
// ==========================================

createCompany('tsmc', 'TSMC', 1987, 1, CompanyRole.INFRA, 'The World\'s Foundry.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('morris_chang', 'Morris Chang', 1987, 2, PersonRole.VISIONARY, 'Founder', 'Invented foundry model.');
createTech('apple_silicon', 'Apple Silicon', 2020, 2, TechRole.PRODUCT, 'Custom ARM chips.', 'Hardware & Infrastructure', 'Processors & Compute');

linkBelonging('morris_chang', 'tsmc');
linkMaker('apple', 'apple_silicon');
// linkDependency('apple', 'tsmc'); // Removed direct link
linkDependency('apple_silicon', 'tsmc');

createCompany('asml', 'ASML', 1984, 1, CompanyRole.INFRA, 'Monopoly on Lithography.', [CompanyCategory.SEMICONDUCTOR]);
createTech('euv', 'EUV Lithography', 2019, 1, TechRole.CORE, 'Extreme UV machines.', 'Hardware & Infrastructure', 'Components & Manufacturing');
linkMaker('asml', 'euv');
// Companies use EUV technology, which is made by ASML
linkDependency('tsmc', 'euv');
linkDependency('intel', 'euv');
// linkDependency('tsmc', 'asml'); // Removed direct link
// linkDependency('intel', 'asml'); // Removed direct link



// ==========================================
// ARM HOLDINGS - RISC REVOLUTION
// ==========================================

createCompany('arm', 'ARM', 1990, 2, CompanyRole.INFRA, 'The architecture that powers mobile computing through licensing model.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('sophie_wilson', 'Sophie Wilson', 1983, 2, PersonRole.THEORIST, 'Architect', 'Designed ARM instruction set at Acorn Computers.');
createPerson('steve_furber', 'Steve Furber', 1983, 2, PersonRole.THEORIST, 'Co-Designer', 'Co-designed the first ARM processor with Sophie Wilson.');

createTech('arm_arch', 'ARM Architecture', 1990, 2, TechRole.STANDARD, 'Power-efficient RISC instruction set that dominates mobile.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('arm_cortex', 'ARM Cortex', 2004, 2, TechRole.PRODUCT, 'Family of ARM processor cores for different performance/power targets.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('arm_neoverse', 'ARM Neoverse', 2018, 2, TechRole.PRODUCT, 'ARM server processors challenging x86 in data centers.', 'Hardware & Infrastructure', 'Processors & Compute');

createEpisode('arm_license_model', 'ARM Licensing Model', 1990, 2, EpisodeRole.MILESTONE, 'Revolutionary business model: license IP instead of manufacturing chips.');
createEpisode('nvidia_arm_fail', 'NVIDIA Failed ARM Bid', 2020, 2, EpisodeRole.DEAL, '$40B acquisition blocked by regulators due to concerns about neutrality.');
// Duplicate softbank_arm removed from here

linkBelonging('sophie_wilson', 'arm');
linkBelonging('steve_furber', 'arm');
linkMaker('arm', 'arm_arch');
linkMaker('sophie_wilson', 'arm_arch');
linkMaker('steve_furber', 'arm_arch');
linkMaker('arm', 'arm_cortex');
linkMaker('arm', 'arm_neoverse');

linkBelonging('arm_license_model', 'arm');
linkBelonging('nvidia_arm_fail', 'nvidia');
linkBelonging('nvidia_arm_fail', 'arm');
// linkBelonging('softbank_arm', 'arm'); // Removed duplicate

// ARM influences
linkDependency('apple_silicon', 'arm_arch');
linkInfluence('arm_cortex', 'apple_silicon', 0.6);

// ==========================================
// QUALCOMM - WIRELESS PIONEER
// ==========================================

createCompany('qualcomm', 'Qualcomm', 1985, 2, CompanyRole.INFRA, 'Mobile chip giant and wireless patent powerhouse.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('irwin_jacobs', 'Irwin Jacobs', 1985, 2, PersonRole.VISIONARY, 'Co-Founder', 'Pioneer of CDMA technology and mobile communications.');
createPerson('paul_jacobs', 'Paul Jacobs', 2005, 2, PersonRole.VISIONARY, 'Former CEO', 'Son of Irwin, led Qualcomm through smartphone era.');

createTech('snapdragon', 'Snapdragon', 2007, 2, TechRole.PRODUCT, 'System-on-chip (SoC) that powers most Android smartphones.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('cdma_tech', 'CDMA Technology', 1989, 2, TechRole.STANDARD, 'Code Division Multiple Access - Qualcomm\'s foundational wireless patent portfolio.', 'Network & Connectivity', 'Telecommunications');
createTech('3g_patents', '3G Patents', 2001, 2, TechRole.STANDARD, 'Critical wireless patents for third-generation mobile networks.', 'Network & Connectivity', 'Telecommunications');
createTech('4g_lte', '4G LTE', 2009, 2, TechRole.STANDARD, 'Long Term Evolution - foundation of modern mobile broadband.', 'Network & Connectivity', 'Telecommunications');
createTech('5g_patents', '5G Patents', 2019, 2, TechRole.STANDARD, 'Essential 5G wireless patents, maintaining Qualcomm\'s licensing dominance.', 'Network & Connectivity', 'Telecommunications');

createEpisode('apple_qcom_war', 'Apple-Qualcomm Patent War', 2017, 2, EpisodeRole.CRISIS, 'Multi-billion dollar legal battle over patent royalties, settled in 2019.');
createEpisode('qcom_licensing', 'Qualcomm Licensing Model', 1990, 2, EpisodeRole.MILESTONE, 'Pioneered charging royalties on entire device price, not just chip cost - highly controversial but lucrative.');

linkBelonging('irwin_jacobs', 'qualcomm');
linkBelonging('paul_jacobs', 'qualcomm');

linkMaker('qualcomm', 'snapdragon');
linkMaker('qualcomm', 'cdma_tech');
linkMaker('irwin_jacobs', 'cdma_tech');
linkMaker('qualcomm', '3g_patents');
linkMaker('qualcomm', '4g_lte');
linkMaker('qualcomm', '5g_patents');

// Patent and technology evolution
linkInfluence('cdma', 'cdma_tech', 0.9); // Bell Labs CDMA influenced Qualcomm's implementation
linkInfluence('cdma_tech', '3g_patents', 0.9);
linkInfluence('3g_patents', '4g_lte', 0.8);
linkInfluence('4g_lte', '5g_patents', 0.8);

// Snapdragon dependencies
linkDependency('snapdragon', 'arm_arch');
linkDependency('snapdragon', '4g_lte');
linkDependency('snapdragon', '5g_patents');

// Episodes
linkBelonging('apple_qcom_war', 'qualcomm');
linkBelonging('apple_qcom_war', 'apple');
linkBelonging('qcom_licensing', 'qualcomm');
linkDependency('android', 'snapdragon');


// ==========================================
// JAPANESE TECH GIANTS
// ==========================================

// SoftBank Group & Vision Fund
createCompany('softbank', 'SoftBank', 1981, 2, CompanyRole.PLATFORM, 'Japanese conglomerate and world\'s largest tech investor through Vision Fund.', [CompanyCategory.VC, CompanyCategory.TELECOM]);
createPerson('masayoshi_son', 'Masayoshi Son', 1981, 1, PersonRole.VISIONARY, 'Founder & CEO', 'Visionary investor who bet big on internet companies and AI revolution.');
createEpisode('vision_fund', 'Vision Fund Launch', 2017, 2, EpisodeRole.DEAL, '$100B fund - largest tech investment fund in history, backed by Saudi Arabia.');
createEpisode('softbank_arm', 'SoftBank Acquires ARM', 2016, 2, EpisodeRole.DEAL, 'SoftBank bought ARM for $32B, largest European tech acquisition.');

linkBelonging('masayoshi_son', 'softbank');
linkBelonging('vision_fund', 'softbank');
linkBelonging('softbank_arm', 'softbank');
linkBelonging('softbank_arm', 'arm');
linkInfluence('vision_fund', 'openai', 0.3); // Vision Fund invested in many AI companies

// NTT - Telecom Pioneer
createCompany('ntt', 'NTT', 1952, 2, CompanyRole.PLATFORM, 'Nippon Telegraph and Telephone - Japan\'s telecom giant and 5G pioneer.', [CompanyCategory.TELECOM]);
createPerson('shigeki_goto', 'Shigeki Goto', 1990, 3, PersonRole.THEORIST, 'Researcher', 'NTT researcher who contributed to internet protocols and networking.');
createTech('ntt_docomo', 'NTT DoCoMo i-mode', 1999, 2, TechRole.PRODUCT, 'World\'s first major mobile internet platform - predated iPhone by 8 years.', 'Digital Services & Platforms', 'Social & Media');
createTech('emoji', 'Emoji', 1999, 2, TechRole.STANDARD, 'Picture characters invented by Shigetaka Kurita at NTT DoCoMo.', 'Digital Services & Platforms', 'Social & Media');
createPerson('kurita', 'Shigetaka Kurita', 1999, 2, PersonRole.VISIONARY, 'Designer', 'Inventor of the Emoji.');
createTech('optical_fiber', 'Optical Fiber Network', 1980, 2, TechRole.CORE, 'High-speed data transmission through light - foundation of modern internet.', 'Network & Connectivity', 'Telecommunications');

linkBelonging('shigeki_goto', 'ntt');
linkMaker('ntt', 'ntt_docomo');
linkMaker('ntt', 'emoji');
linkMaker('kurita', 'emoji');
linkBelonging('kurita', 'ntt');
linkDependency('emoji', 'ntt_docomo');
linkMaker('ntt', 'optical_fiber');
linkInfluence('ntt_docomo', 'iphone', 0.4); // i-mode influenced mobile internet thinking





// Fujitsu - Enterprise Computing
createCompany('fujitsu', 'Fujitsu', 1935, 2, CompanyRole.INFRA, 'Japanese IT giant in enterprise computing and supercomputers.', [CompanyCategory.SEMICONDUCTOR]);
createTech('fugaku', 'Fugaku Supercomputer', 2020, 2, TechRole.PRODUCT, 'World\'s fastest supercomputer (2020-2021) using ARM architecture.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('fm_towns', 'FM Towns', 1989, 2, TechRole.PRODUCT, 'Multimedia PC that pioneered CD-ROM usage in Japan.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('fujitsu_mainframe', 'Fujitsu Mainframe', 1974, 2, TechRole.PRODUCT, 'IBM-compatible mainframes that powered Japanese industry.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('hemt', 'HEMT', 1980, 2, TechRole.CORE, 'High Electron Mobility Transistor - critical for satellite communications and mobile networks.', 'Hardware & Infrastructure', 'Components & Manufacturing');

linkMaker('fujitsu', 'fugaku');
linkMaker('fujitsu', 'fm_towns');
linkMaker('fujitsu', 'fujitsu_mainframe');
linkMaker('fujitsu', 'hemt');
linkDependency('fugaku', 'arm_arch');
linkDependency('fujitsu_mainframe', 'mainframe'); // Compatible with IBM

// ==========================================
// SOUTH KOREAN TECH POWERHOUSES
// ==========================================

// Samsung - Memory & Display Dominance
// Toshiba - Flash Memory Pioneer
createCompany('toshiba', 'Toshiba', 1939, 2, CompanyRole.INFRA, 'Japanese conglomerate and inventor of Flash memory.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('fujio_masuoka', 'Fujio Masuoka', 1980, 2, PersonRole.THEORIST, 'Inventor', 'Invented Flash Memory at Toshiba.');

linkBelonging('fujio_masuoka', 'toshiba');

// Samsung - Memory & Display Dominance
createCompany('samsung', 'Samsung', 1938, 1, CompanyRole.INFRA, 'World leader in memory chips, displays, and smartphones.', [CompanyCategory.HARDWARE]);
createPerson('lee_byung_chul', 'Lee Byung-chul', 1938, 2, PersonRole.VISIONARY, 'Founder', 'Founded Samsung, built it into Korea\'s largest conglomerate.');
createPerson('lee_kun_hee', 'Lee Kun-hee', 1987, 2, PersonRole.VISIONARY, 'Former Chairman', 'Transformed Samsung into global tech leader. "Change everything except your wife and children."');
createPerson('lee_jae_yong', 'Lee Jae-yong', 2014, 2, PersonRole.VISIONARY, 'Vice Chairman', 'Third generation leader, focused on AI and semiconductors.');

createTech('galaxy', 'Samsung Galaxy', 2009, 2, TechRole.PRODUCT, 'Flagship Android smartphone line that competes with iPhone.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('oled_display', 'OLED Display', 2007, 2, TechRole.CORE, 'Organic LED displays - Samsung supplies to Apple, dominating premium display market.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('nand_flash', 'NAND Flash', 1987, 2, TechRole.CORE, 'Non-volatile storage - Invented by Toshiba, popularized by Samsung.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('t1100', 'Toshiba T1100', 1985, 2, TechRole.PRODUCT, 'World\'s first mass-market laptop computer, setting the standard for portable PCs.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('hbm', 'HBM', 2013, 1, TechRole.CORE, 'High Bandwidth Memory for AI chips.', 'Hardware & Infrastructure', 'Memory & Storage');

createEpisode('samsung_memory_bet', 'Samsung Memory Bet', 1983, 2, EpisodeRole.MILESTONE, 'Counter-cyclical investment in memory chips during downturn - established Samsung as memory leader.');
createEpisode('galaxy_launch', 'Galaxy Launch', 2010, 2, EpisodeRole.MILESTONE, 'Samsung Galaxy S launched, beginning rivalry with iPhone.');

linkBelonging('lee_byung_chul', 'samsung');
linkBelonging('lee_kun_hee', 'samsung');
linkBelonging('lee_jae_yong', 'samsung');
linkMaker('samsung', 'galaxy');
linkMaker('samsung', 'oled_display');
linkMaker('samsung', 'nand_flash');
linkMaker('toshiba', 'nand_flash');
linkMaker('toshiba', 't1100');
linkMaker('fujio_masuoka', 'nand_flash');
linkMaker('samsung', 'hbm');
linkBelonging('samsung_memory_bet', 'samsung');
linkBelonging('galaxy_launch', 'samsung');

// Samsung uses EUV for advanced manufacturing
linkDependency('samsung', 'euv');
// linkDependency('samsung', 'asml'); // Removed direct link

// iPhone uses Samsung displays and chips - Linked via Products
// linkDependency('iphone', 'samsung'); // Removed direct link
linkDependency('iphone', 'oled_display');
linkDependency('iphone', 'nand_flash');
linkDependency('galaxy', 'android');
linkDependency('galaxy', 'snapdragon');

// SK Hynix - Memory Specialist
createCompany('sk_hynix', 'SK Hynix', 1983, 2, CompanyRole.INFRA, 'Second-largest memory chip maker, HBM leader for AI chips.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('park_jung_ho', 'Park Jung-ho', 2018, 3, PersonRole.VISIONARY, 'CEO', 'Led SK Hynix\'s dominance in HBM for AI accelerators.');

linkBelonging('park_jung_ho', 'sk_hynix');
linkMaker('sk_hynix', 'hbm');
linkDependency('sk_hynix', 'euv'); // Uses EUV
// linkDependency('sk_hynix', 'asml'); // Removed direct link
// linkDependency('nvidia', 'sk_hynix'); // Removed direct link - GPU depends on HBM

// LG Electronics removed as per request

// Naver and Kakao removed as per request

createCompany('broadcom', 'Broadcom', 1961, 2, CompanyRole.INFRA, 'Connectivity.', [CompanyCategory.SEMICONDUCTOR]);
createPerson('hock_tan', 'Hock Tan', 2006, 2, PersonRole.VISIONARY, 'CEO', 'Architect of semiconductor industry consolidation.');
createEpisode('broadcom_vmware', 'Broadcom Acquires VMware', 2022, 2, EpisodeRole.DEAL, 'Massive $69B acquisition reshaping enterprise software.');

linkBelonging('hock_tan', 'broadcom');
linkBelonging('broadcom_vmware', 'broadcom');
linkDependency('tpu', 'broadcom');

// ==========================================
// FOXCONN - WORLD'S FACTORY
// ==========================================

createCompany('foxconn', 'Foxconn', 1974, 2, CompanyRole.INFRA, 'World\'s largest electronics manufacturer - assembles most of world\'s consumer electronics.', [CompanyCategory.HARDWARE]);
createPerson('terry_gou', 'Terry Gou', 1974, 2, PersonRole.VISIONARY, 'Founder', 'Built Foxconn into world\'s largest contract manufacturer, employing over 1 million workers.');

createEpisode('foxconn_apple_deal', 'Apple-Foxconn Partnership', 2000, 2, EpisodeRole.DEAL, 'Foxconn became Apple\'s primary manufacturer, assembling iPhones, iPads, and Macs.');
createEpisode('foxconn_suicides', 'Foxconn Labor Crisis', 2010, 2, EpisodeRole.CRISIS, 'Series of worker suicides led to scrutiny of labor conditions and installation of safety nets.');
createEpisode('foxconn_automation', 'Foxconn Automation Push', 2016, 3, EpisodeRole.MILESTONE, 'Announced plan to replace workers with 1 million robots - "Foxbots".');

linkBelonging('terry_gou', 'foxconn');
linkBelonging('foxconn_apple_deal', 'foxconn');
linkBelonging('foxconn_apple_deal', 'apple');
linkBelonging('foxconn_suicides', 'foxconn');
linkBelonging('foxconn_automation', 'foxconn');

// Foxconn client dependencies
linkDependency('iphone', 'foxconn');
linkDependency('macintosh', 'foxconn');
// linkDependency('apple', 'foxconn'); // Removed direct link



// Microsoft Xbox manufactured by Foxconn
createTech('xbox', 'Xbox', 2001, 2, TechRole.PRODUCT, 'Microsoft\'s gaming console.', 'Hardware & Infrastructure', 'Devices & Form Factors');
linkMaker('microsoft', 'xbox');
linkDependency('xbox', 'foxconn');
// linkDependency('microsoft', 'foxconn'); // Removed direct link

// ==========================================
// ERA 5: THE AI REVOLUTION
// ==========================================

createCompany('nvidia', 'NVIDIA', 1993, 1, CompanyRole.PLATFORM, 'The Engine of AI.', [CompanyCategory.SEMICONDUCTOR, CompanyCategory.SOFTWARE]);
createPerson('jensen_huang', 'Jensen Huang', 1993, 1, PersonRole.VISIONARY, 'CEO', 'Bet on CUDA.');
createTech('gpu', 'GPU', 1999, 1, TechRole.PRODUCT, 'Parallel compute.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('cuda', 'CUDA', 2007, 1, TechRole.PLATFORM, 'GPGPU Software.', 'System Software', 'Development & Languages'); // Using PLATFORM concept via Product for now or Standard

linkBelonging('jensen_huang', 'nvidia');
linkMaker('nvidia', 'gpu');
linkMaker('nvidia', 'cuda');
// linkDependency('nvidia', 'tsmc'); // Removed direct link - GPU depends on TSMC
linkDependency('gpu', 'tsmc'); // Added explicit link
linkDependency('gpu', 'hbm');

createCompany('openai', 'OpenAI', 2015, 1, CompanyRole.LAB, 'Generative AI Leader.', [CompanyCategory.LAB]);
createPerson('altman', 'Sam Altman', 2015, 1, PersonRole.VISIONARY, 'CEO', 'Face of AI.');
createPerson('ilya', 'Ilya Sutskever', 2015, 2, PersonRole.THEORIST, 'Co-Founder', 'Chief Scientist.');
createTech('gpt', 'GPT-4', 2023, 1, TechRole.PRODUCT, 'LLM with reasoning.', 'AI & Physical Systems', 'Artificial Intelligence');
createEpisode('chatgpt_launch', 'ChatGPT Launch', 2022, 1, EpisodeRole.MILESTONE, 'AI "iPhone Moment".');
createEpisode('openai_coup', 'The Board Coup', 2023, 2, EpisodeRole.CRISIS, 'Altman fired and rehired.');
createEpisode('ms_openai_deal', 'The $10B Partnership', 2023, 1, EpisodeRole.DEAL, 'Microsoft bets on OpenAI.');

linkBelonging('altman', 'openai');
linkBelonging('ilya', 'openai');
linkMaker('openai', 'gpt');
linkBelonging('chatgpt_launch', 'openai');
linkBelonging('openai_coup', 'openai');
linkBelonging('ms_openai_deal', 'microsoft');
linkBelonging('ms_openai_deal', 'openai');
linkDependency('openai', 'gpu');

createPerson('hinton', 'Geoffrey Hinton', 2012, 1, PersonRole.THEORIST, 'Godfather of AI', 'Backpropagation.');
createPerson('hassabis', 'Demis Hassabis', 2010, 2, PersonRole.VISIONARY, 'DeepMind CEO', 'AlphaGo, AlphaFold.');
createPerson('fei_fei_li', 'Fei-Fei Li', 2009, 2, PersonRole.THEORIST, 'Godmother of AI', 'ImageNet.');
createPerson('vaswani', 'Ashish Vaswani', 2017, 2, PersonRole.THEORIST, 'Transformer Author', 'Attention Is All You Need.');

createTech('transformer', 'Transformer', 2017, 1, TechRole.CORE, 'Foundation of LLMs.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('alphafold', 'AlphaFold', 2020, 2, TechRole.PRODUCT, 'Protein folding.', 'AI & Physical Systems', 'Artificial Intelligence');

linkBelonging('hinton', 'google');
linkBelonging('hassabis', 'google');
linkBelonging('vaswani', 'google');
linkMaker('google', 'transformer');
linkMaker('vaswani', 'transformer');
linkMaker('google', 'alphafold');
linkInfluence('transformer', 'gpt');
linkInfluence('gpu', 'fei_fei_li');

createCompany('tesla', 'Tesla', 2003, 1, CompanyRole.PLATFORM, 'AI & Robotics.', [CompanyCategory.ROBOTICS, CompanyCategory.HARDWARE]);
createPerson('musk', 'Elon Musk', 2004, 1, PersonRole.VISIONARY, 'CEO', 'Technoking.');
createTech('autopilot', 'Autopilot', 2014, 2, TechRole.PRODUCT, 'Vision AI.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('optimus', 'Optimus', 2021, 2, TechRole.PRODUCT, 'Humanoid Robot.', 'AI & Physical Systems', 'Robotics');
linkBelonging('musk', 'tesla');
linkBelonging('musk', 'paypal');
linkMaker('tesla', 'autopilot');
linkMaker('tesla', 'optimus');
linkDependency('optimus', 'robotics');
linkMaker('tesla', 'autonomous_driving');
linkDependency('autopilot', 'autonomous_driving');
linkInfluence('musk', 'openai');
linkDependency('tesla', 'gpu');

createCompany('spacex', 'SpaceX', 2002, 1, CompanyRole.INFRA, 'Revolutionizing space technology.', [CompanyCategory.ROBOTICS]);
createPerson('gwynne_shotwell', 'Gwynne Shotwell', 2002, 2, PersonRole.VISIONARY, 'President', 'The operator who built SpaceX into a profitable business.');
createTech('falcon9', 'Falcon 9', 2010, 1, TechRole.PRODUCT, 'First orbital class reusable rocket.', 'AI & Physical Systems', 'Robotics');
createTech('starlink', 'Starlink', 2019, 2, TechRole.PRODUCT, 'Satellite internet constellation.', 'Network & Connectivity', 'Telecommunications');
createTech('starship', 'Starship', 2023, 1, TechRole.PRODUCT, 'Fully reusable super heavy-lift launch vehicle.', 'AI & Physical Systems', 'Robotics');
createEpisode('first_reusable_rocket', 'First Reusable Rocket', 2015, 1, EpisodeRole.MILESTONE, 'Falcon 9 lands after orbital launch, changing space economics forever.');

linkBelonging('musk', 'spacex');
linkBelonging('gwynne_shotwell', 'spacex');
linkMaker('spacex', 'falcon9');
linkMaker('spacex', 'starlink');
linkMaker('spacex', 'starship');
linkBelonging('first_reusable_rocket', 'spacex');

createCompany('palantir', 'Palantir', 2003, 2, CompanyRole.SERVICE, 'Defense AI.', [CompanyCategory.SOFTWARE]);
createCompany('paypal', 'PayPal', 1998, 2, CompanyRole.PLATFORM, 'Online payments system that birthed the PayPal Mafia.', [CompanyCategory.INTERNET]);
createPerson('thiel', 'Peter Thiel', 2003, 2, PersonRole.VISIONARY, 'Co-Founder', 'PayPal Mafia.');
linkBelonging('thiel', 'paypal');
createPerson('alex_karp', 'Alex Karp', 2004, 2, PersonRole.VISIONARY, 'CEO', 'Philosopher-CEO.');

createTech('gotham', 'Gotham', 2008, 2, TechRole.PRODUCT, 'Intel & Defense OS.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('foundry', 'Foundry', 2016, 2, TechRole.PRODUCT, 'Commercial Data OS.', 'AI & Physical Systems', 'Artificial Intelligence');

createEpisode('in_q_tel', 'In-Q-Tel Funding', 2003, 3, EpisodeRole.DEAL, 'CIA investment arm funds Palantir.');
createEpisode('project_maven', 'Project Maven', 2017, 2, EpisodeRole.CRISIS, 'Controversial DoD AI project.');

linkBelonging('thiel', 'palantir');
linkBelonging('alex_karp', 'palantir');
linkMaker('palantir', 'gotham');
linkMaker('palantir', 'foundry');
linkBelonging('in_q_tel', 'darpa');
linkInfluence('in_q_tel', 'palantir');
linkBelonging('project_maven', 'palantir');
linkBelonging('project_maven', 'google'); // Google was also involved initially



// ==========================================
// NETWORKING & INFRASTRUCTURE
// ==========================================

createCompany('cisco', 'Cisco', 1984, 2, CompanyRole.INFRA, 'Internet plumbing.', [CompanyCategory.HARDWARE]);
createPerson('bosack', 'Leonard Bosack', 1984, 2, PersonRole.VISIONARY, 'Co-Founder', 'Stanford computer scientist.');
createPerson('lerner', 'Sandy Lerner', 1984, 2, PersonRole.VISIONARY, 'Co-Founder', 'Pioneered multi-protocol router.');

createTech('router', 'Multi-Protocol Router', 1986, 2, TechRole.PRODUCT, 'Connected disparate networks, enabling the Internet.', 'Network & Connectivity', 'Network Architecture');
createTech('ios_cisco', 'Cisco IOS', 1987, 2, TechRole.PLATFORM, 'Internetwork Operating System.', 'System Software', 'Operating Systems (OS)');

createEpisode('dot_com_bubble', 'Dot-com Bubble Peak', 2000, 2, EpisodeRole.MILESTONE, 'Cisco became most valuable company in the world ($500B+).');

linkBelonging('bosack', 'cisco');
linkBelonging('lerner', 'cisco');
linkMaker('cisco', 'router');
linkMaker('cisco', 'ios_cisco');
linkDependency('router', 'ios_cisco');
linkBelonging('dot_com_bubble', 'cisco');
linkDependency('arpanet', 'router'); // ARPANET evolved into Internet via routers

createCompany('tencent', 'Tencent', 1998, 2, CompanyRole.PLATFORM, 'Chinese Tech Giant.', [CompanyCategory.INTERNET]);
createPerson('pony_ma', 'Pony Ma', 1998, 2, PersonRole.VISIONARY, 'Founder', 'Quiet architect of China\'s digital ecosystem.');
createTech('wechat', 'WeChat', 2011, 1, TechRole.PRODUCT, 'The Super App: Messaging, Payments, OS-within-OS.', 'Digital Services & Platforms', 'Social & Media');

createCompany('alibaba', 'Alibaba', 1999, 2, CompanyRole.PLATFORM, 'Chinese Cloud/AI.', [CompanyCategory.INTERNET]);
createPerson('jack_ma', 'Jack Ma', 1999, 1, PersonRole.VISIONARY, 'Founder', 'Face of Chinese tech entrepreneurship.');
createTech('alipay', 'Alipay', 2004, 2, TechRole.PRODUCT, 'Revolutionized digital payments in China.', 'Digital Services & Platforms', 'Digital Platforms');
createEpisode('ant_group_halt', 'Ant Group IPO Halt', 2020, 2, EpisodeRole.CRISIS, 'Chinese government crackdown on Jack Ma and Big Tech.');

linkBelonging('pony_ma', 'tencent');
linkMaker('tencent', 'wechat');

linkBelonging('jack_ma', 'alibaba');
linkMaker('alibaba', 'alipay');
linkBelonging('ant_group_halt', 'alibaba');
linkBelonging('ant_group_halt', 'jack_ma');

// Baidu removed as per request

// ByteDance - Social Media & AI
createCompany('bytedance', 'ByteDance', 2012, 1, CompanyRole.PLATFORM, 'World\'s most valuable startup, known for its powerful recommendation algorithms.', [CompanyCategory.INTERNET]);
createPerson('zhang_yiming', 'Zhang Yiming', 2012, 2, PersonRole.VISIONARY, 'Founder', 'Engineer-turned-entrepreneur who built a global empire on AI recommendation engines.');
createPerson('shou_zi_chew', 'Shou Zi Chew', 2021, 2, PersonRole.VISIONARY, 'CEO', 'Led TikTok through intense global regulatory scrutiny.');

createTech('tiktok', 'TikTok', 2016, 1, TechRole.PRODUCT, 'Short-form video platform that revolutionized social media consumption.', 'Digital Services & Platforms', 'Social & Media');
createTech('douyin', 'Douyin', 2016, 2, TechRole.PRODUCT, 'Chinese version of TikTok, integrating e-commerce and local services.', 'Digital Services & Platforms', 'Social & Media');
createTech('rec_algo', 'Recommendation Algorithm', 2012, 2, TechRole.CORE, 'AI engine that personalizes content feed with uncanny accuracy.', 'AI & Physical Systems', 'Artificial Intelligence');

createEpisode('tiktok_ban_threat', 'TikTok US Ban Threat', 2020, 2, EpisodeRole.CRISIS, 'US government threatens to ban TikTok over national security concerns.');

linkBelonging('zhang_yiming', 'bytedance');
linkBelonging('shou_zi_chew', 'bytedance');
linkMaker('bytedance', 'tiktok');
linkMaker('bytedance', 'douyin');
linkMaker('bytedance', 'rec_algo');
linkDependency('tiktok', 'rec_algo');
linkDependency('douyin', 'rec_algo');
linkBelonging('tiktok_ban_threat', 'bytedance');

// Huawei - Telecom & Hardware
createCompany('huawei', 'Huawei', 1987, 1, CompanyRole.INFRA, 'Global telecommunications giant and consumer electronics leader.', [CompanyCategory.HARDWARE, CompanyCategory.TELECOM]);
createPerson('ren_zhengfei', 'Ren Zhengfei', 1987, 2, PersonRole.VISIONARY, 'Founder', 'Former PLA engineer who built Huawei into a global tech powerhouse.');

createTech('5g_infra', '5G Infrastructure', 2019, 1, TechRole.CORE, 'Next-generation cellular network equipment dominating global market.', 'Network & Connectivity', 'Telecommunications');
createTech('harmony_os', 'HarmonyOS', 2019, 2, TechRole.PLATFORM, 'Operating system developed to replace Android after US sanctions.', 'System Software', 'Operating Systems (OS)');
createTech('kirin_chip', 'Kirin Chip', 2014, 2, TechRole.PRODUCT, 'High-performance mobile processors designed by HiSilicon (Huawei).');

createEpisode('us_sanctions', 'US Entity List', 2019, 2, EpisodeRole.CRISIS, 'US bans American companies from selling tech to Huawei, crippling its smartphone business.');
createEpisode('meng_wanzhou', 'Meng Wanzhou Arrest', 2018, 2, EpisodeRole.CRISIS, 'Huawei CFO arrested in Canada on US fraud charges, sparking diplomatic crisis.');

linkBelonging('ren_zhengfei', 'huawei');
linkMaker('huawei', '5g_infra');
linkMaker('huawei', 'harmony_os');
linkMaker('huawei', 'kirin_chip');
linkBelonging('us_sanctions', 'huawei');
linkBelonging('meng_wanzhou', 'huawei');

// Dependencies
linkDependency('harmony_os', 'android'); // Forked/Compatible
linkDependency('kirin_chip', 'arm_arch'); // Uses ARM architecture
linkDependency('5g_infra', '5g_patents'); // Relies on global standards (Qualcomm etc)

// ==========================================
// DRONE INDUSTRY & AUTONOMOUS FLIGHT
// ==========================================

// DJI - Drone Market Leader
createCompany('dji', 'DJI', 2006, 2, CompanyRole.PLATFORM, 'World\'s largest drone manufacturer with 70%+ market share.', [CompanyCategory.HARDWARE]);
createPerson('frank_wang', 'Frank Wang (Wang Tao)', 2006, 2, PersonRole.VISIONARY, 'Founder & CEO', 'Built DJI into drone industry giant, revolutionizing aerial photography and videography.');

createTech('quadcopter', 'Consumer Quadcopter', 2010, 2, TechRole.PRODUCT, 'Four-rotor drone design that enabled stable consumer drones.');
createTech('gimbal_stabilization', 'Gimbal Stabilization', 2012, 2, TechRole.CORE, '3-axis camera stabilization for smooth aerial footage.');
createTech('autonomous_flight', 'Autonomous Flight', 2015, 2, TechRole.CORE, 'Computer vision and GPS-based autonomous navigation for drones.');
createTech('fpv_drone', 'FPV Drone', 2016, 2, TechRole.PRODUCT, 'First-Person View racing drones with immersive piloting experience.');

createEpisode('phantom_launch', 'DJI Phantom Launch', 2013, 2, EpisodeRole.MILESTONE, 'DJI Phantom democratized aerial photography and created consumer drone market.');
createEpisode('faa_drone_rules', 'FAA Drone Regulations', 2016, 2, EpisodeRole.MILESTONE, 'US FAA established Part 107 commercial drone rules, legitimizing drone industry.');

linkBelonging('frank_wang', 'dji');
linkMaker('dji', 'quadcopter');
linkMaker('dji', 'gimbal_stabilization');
linkMaker('dji', 'autonomous_flight');
linkDependency('autonomous_flight', 'drone');
linkMaker('dji', 'fpv_drone');
linkDependency('fpv_drone', 'drone');
linkDependency('quadcopter', 'drone');
linkBelonging('phantom_launch', 'dji');
linkBelonging('faa_drone_rules', 'dji');

// ==========================================
// VIDEO COMMUNICATION & REMOTE WORK
// ==========================================

createTech('voip', 'VoIP', 1995, 2, TechRole.STANDARD, 'Voice over IP protocol.', 'Network & Connectivity', 'Telecommunications');
createTech('webrtc', 'WebRTC', 2011, 2, TechRole.STANDARD, 'Real-time communication standard.', 'Network & Connectivity', 'Network Architecture');

// Skype (Microsoft Product)
createTech('skype', 'Skype', 2003, 2, TechRole.PRODUCT, 'Pioneering video call software.', 'Digital Services & Platforms', 'Digital Platforms');
createEpisode('ms_skype_deal', 'Microsoft Acquires Skype', 2011, 2, EpisodeRole.DEAL, 'Microsoft buys Skype for $8.5B to dominate enterprise comms.');

linkMaker('microsoft', 'skype');
linkDependency('skype', 'voip');
linkBelonging('ms_skype_deal', 'microsoft');
linkBelonging('ms_skype_deal', 'skype');

// ==========================================
// ROBOTICS & AUTONOMOUS SYSTEMS
// ==========================================

// 1. Autonomous Driving
// Waymo removed as per request, linked directly to Google
createTech('self_driving_car', 'Self-Driving Car', 2009, 1, TechRole.PRODUCT, 'Autonomous vehicles capable of sensing their environment and navigating without human input.', 'AI & Physical Systems', 'Autonomous Mobility');
createCompany('mobileye', 'Mobileye', 1999, 2, CompanyRole.INFRA, 'Pioneer in ADAS and computer vision for automotive.', [CompanyCategory.ROBOTICS]);
createTech('adas', 'ADAS', 1999, 2, TechRole.STANDARD, 'Advanced Driver Assistance Systems - electronic systems that assist drivers.', 'AI & Physical Systems', 'Autonomous Mobility');

linkMaker('google', 'self_driving_car'); // Waymo (formerly Google Self-Driving Car Project)
linkInfluence('darpa_grand_challenge', 'self_driving_car'); // Origins
linkMaker('mobileye', 'adas');
linkBelonging('mobileye', 'intel'); // Acquired by Intel

// 2. Robotics
createCompany('boston_dynamics', 'Boston Dynamics', 1992, 2, CompanyRole.LAB, 'The world\'s most dynamic humanoid and quadruped robots.', [CompanyCategory.LAB, CompanyCategory.ROBOTICS]);
createPerson('marc_raibert', 'Marc Raibert', 1992, 2, PersonRole.VISIONARY, 'Founder', 'Father of dynamic robots.');
createTech('spot', 'Spot', 2016, 2, TechRole.PRODUCT, 'Agile mobile robot that navigates terrain with unprecedented mobility.', 'AI & Physical Systems', 'Robotics');
createTech('atlas', 'Atlas', 2013, 2, TechRole.PRODUCT, 'Bipedal humanoid robot capable of parkour and complex manipulation.', 'AI & Physical Systems', 'Robotics');
createEpisode('hyundai_bd_deal', 'Hyundai Acquires Boston Dynamics', 2020, 2, EpisodeRole.DEAL, 'Hyundai Motor Group acquires controlling interest in Boston Dynamics.');

createCompany('irobot', 'iRobot', 1990, 2, CompanyRole.PRODUCT, 'Consumer robot company known for Roomba.', [CompanyCategory.ROBOTICS]);
createTech('roomba', 'Roomba', 2002, 2, TechRole.PRODUCT, 'Autonomous robotic vacuum cleaner.', 'AI & Physical Systems', 'Robotics');

linkBelonging('marc_raibert', 'boston_dynamics');
linkMaker('boston_dynamics', 'spot');
linkMaker('boston_dynamics', 'atlas');
linkBelonging('hyundai_bd_deal', 'boston_dynamics');
linkMaker('irobot', 'roomba');

// 3. Core Technologies
createTech('robotics', 'Robotics', 1961, 1, TechRole.CORE, 'The branch of technology that deals with the design, construction, operation, and application of robots.', 'AI & Physical Systems', 'Robotics');
createTech('autonomous_driving', 'Autonomous Driving', 2004, 1, TechRole.CORE, 'Self-driving technology enabling vehicles to navigate without human input.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('drone', 'Drone', 2010, 1, TechRole.CORE, 'Unmanned Aerial Vehicles (UAVs) for consumer and industrial use.', 'AI & Physical Systems', 'Robotics');

createTech('ros', 'ROS', 2007, 2, TechRole.STANDARD, 'Robot Operating System - flexible framework for writing robot software.', 'System Software', 'Operating Systems (OS)');
createTech('lidar', 'LiDAR', 2005, 2, TechRole.CORE, 'Light Detection and Ranging - essential sensor for 3D mapping and autonomy.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('computer_vision', 'Computer Vision', 2012, 1, TechRole.CORE, 'Field of AI that enables computers to derive meaningful information from digital images.', 'AI & Physical Systems', 'Artificial Intelligence');

// Interconnections (The Trinity)
linkDependency('autonomous_driving', 'robotics');
linkDependency('drone', 'robotics');
linkInfluence('autonomous_driving', 'drone'); // Shared autonomy tech

// Robotics Ecosystem
linkDependency('spot', 'robotics');
linkDependency('atlas', 'robotics');
linkDependency('roomba', 'robotics');
linkDependency('ros', 'robotics');
linkMaker('boston_dynamics', 'robotics');
linkMaker('irobot', 'robotics');

// Autonomous Driving Ecosystem
linkDependency('self_driving_car', 'autonomous_driving');
linkDependency('adas', 'autonomous_driving');
linkMaker('google', 'autonomous_driving');
linkMaker('mobileye', 'autonomous_driving');

// Drone Ecosystem
// linkDependency('quadcopter', 'drone'); // defined earlier
// linkDependency('fpv_drone', 'drone'); // defined earlier
// linkDependency('autonomous_flight', 'drone'); // defined earlier
linkMaker('dji', 'drone');

linkDependency('self_driving_car', 'lidar');
linkDependency('self_driving_car', 'computer_vision');
linkDependency('adas', 'computer_vision');
linkDependency('spot', 'ros');
linkDependency('atlas', 'ros');
linkDependency('roomba', 'ros');
linkMaker('nvidia', 'computer_vision'); // Major enabler via GPU

linkMaker('dji', 'drone');

linkDependency('self_driving_car', 'lidar');
linkDependency('self_driving_car', 'computer_vision');
linkDependency('adas', 'computer_vision');
linkDependency('spot', 'ros');
linkDependency('atlas', 'ros');
linkDependency('roomba', 'ros');
linkMaker('nvidia', 'computer_vision'); // Major enabler via GPU

// ==========================================
// FRONTIER TECHNOLOGIES
// ==========================================

// 1. Internet of Things (IoT)
createTech('iot', 'IoT', 1999, 1, TechRole.CORE, 'Internet of Things - network of physical objects embedded with sensors and software.', 'Network & Connectivity', 'Network Architecture');
createTech('raspberry_pi', 'Raspberry Pi', 2012, 2, TechRole.PRODUCT, 'Low-cost, credit-card-sized computer that fueled the Maker movement and IoT prototyping.', 'Hardware & Infrastructure', 'Devices & Form Factors');

linkDependency('iot', '5g_patents'); // Connectivity
linkDependency('iot', 'arm'); // Powering 90%+ of IoT
linkMaker('raspberry_pi', 'iot');
linkDependency('raspberry_pi', 'arm');

// 2. Metaverse & Spatial Computing
createTech('metaverse', 'Metaverse', 1992, 2, TechRole.STANDARD, 'A collective virtual shared space, created by the convergence of virtually enhanced physical reality and physically persistent virtual space.', 'Digital Services & Platforms', 'Spatial Computing');
createTech('vr', 'Virtual Reality', 1968, 2, TechRole.CORE, 'Immersive digital environments.', 'AI & Physical Systems', 'Spatial Computing');
createTech('ar', 'Augmented Reality', 1990, 2, TechRole.CORE, 'Digital overlays on the real world.', 'AI & Physical Systems', 'Spatial Computing');

createTech('oculus', 'Oculus', 2012, 2, TechRole.PRODUCT, 'VR headset line kickstarted by Palmer Luckey, acquired by Meta.', 'AI & Physical Systems', 'Spatial Computing');
createPerson('palmer_luckey', 'Palmer Luckey', 2012, 2, PersonRole.VISIONARY, 'Founder', 'Creator of the Oculus Rift.');

linkBelonging('palmer_luckey', 'oculus');
linkMaker('meta', 'oculus'); // Acquired by Meta
linkDependency('oculus', 'vr');
linkDependency('metaverse', 'vr');
linkDependency('metaverse', 'ar');
linkMaker('nvidia', 'metaverse'); // Omniverse / GPU power

// 3. Quantum Computing
createTech('quantum_computing', 'Quantum Computing', 1980, 1, TechRole.CORE, 'Computing using quantum-mechanical phenomena, such as superposition and entanglement.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('qubit', 'Qubit', 1995, 2, TechRole.CORE, 'The basic unit of quantum information.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('sycamore', 'Sycamore', 2019, 2, TechRole.PRODUCT, 'Google\'s quantum processor that claimed "Quantum Supremacy".', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('ibm_q', 'IBM Q System One', 2019, 2, TechRole.PRODUCT, 'First circuit-based commercial quantum computer.', 'Hardware & Infrastructure', 'Processors & Compute');

linkDependency('quantum_computing', 'qubit');
linkMaker('google', 'sycamore');
linkDependency('sycamore', 'quantum_computing');
linkMaker('ibm', 'ibm_q');
linkDependency('ibm_q', 'quantum_computing');

// ==========================================
// VENTURE CAPITAL & INVESTORS
// ==========================================

// 1. The Sand Hill Road Giants
createCompany('sequoia', 'Sequoia Capital', 1972, 2, CompanyRole.INFRA, 'The gold standard of Venture Capital.', [CompanyCategory.VC]);
createPerson('don_valentine', 'Don Valentine', 1972, 2, PersonRole.VISIONARY, 'Founder', 'The grandfather of Silicon Valley VC.');

createCompany('kpcb', 'Kleiner Perkins', 1972, 2, CompanyRole.INFRA, 'The other titan of Sand Hill Road.', [CompanyCategory.VC]);
createPerson('john_doerr', 'John Doerr', 1980, 2, PersonRole.VISIONARY, 'Partner', 'Legendary investor who backed Google and Amazon.');

createCompany('a16z', 'Andreessen Horowitz', 2009, 2, CompanyRole.INFRA, 'Software is eating the world.', [CompanyCategory.VC]);
// Marc Andreessen already exists

// 2. The Accelerators
createCompany('y_combinator', 'Y Combinator', 2005, 2, CompanyRole.INFRA, 'The startup factory that launched Airbnb, Dropbox, and Stripe.', [CompanyCategory.VC]);
createPerson('paul_graham', 'Paul Graham', 2005, 2, PersonRole.VISIONARY, 'Founder', 'Hacker, painter, and startup mentor.');

// Connections
linkBelonging('don_valentine', 'sequoia');
linkBelonging('john_doerr', 'kpcb');
linkBelonging('andreessen', 'a16z'); // Marc Andreessen
linkBelonging('paul_graham', 'y_combinator');

// Sequoia Portfolio - via Investment Episodes
createEpisode('sequoia_apple', 'Sequoia invests in Apple', 1978, 3, EpisodeRole.DEAL, 'Don Valentine made the crucial early investment in Apple.');
createEpisode('sequoia_google', 'Sequoia invests in Google', 1999, 2, EpisodeRole.DEAL, 'Sequoia backed Google in its Series A round.');
createEpisode('sequoia_oracle', 'Sequoia invests in Oracle', 1977, 3, EpisodeRole.DEAL, 'Early investment in database giant.');
createEpisode('sequoia_nvidia', 'Sequoia invests in NVIDIA', 1993, 2, EpisodeRole.DEAL, 'Sequoia backed the GPU pioneer.');
createEpisode('sequoia_paypal', 'Sequoia invests in PayPal', 1999, 2, EpisodeRole.DEAL, 'Sequoia backed the payments revolution.');
createEpisode('sequoia_youtube', 'Sequoia invests in YouTube', 2005, 2, EpisodeRole.DEAL, 'Sequoia backed the video platform.');
createEpisode('sequoia_whatsapp', 'Sequoia invests in WhatsApp', 2011, 2, EpisodeRole.DEAL, 'Sequoia was the sole institutional investor.');

linkBelonging('sequoia_apple', 'sequoia');
linkBelonging('sequoia_google', 'sequoia');
linkBelonging('sequoia_oracle', 'sequoia');
linkBelonging('sequoia_nvidia', 'sequoia');
linkBelonging('sequoia_paypal', 'sequoia');
linkBelonging('sequoia_youtube', 'sequoia');
linkBelonging('sequoia_whatsapp', 'sequoia');

linkInfluence('sequoia_apple', 'apple');
linkInfluence('sequoia_google', 'google');
linkInfluence('sequoia_oracle', 'oracle');
linkInfluence('sequoia_nvidia', 'nvidia');
linkInfluence('sequoia_paypal', 'paypal');
linkInfluence('sequoia_youtube', 'youtube');
linkInfluence('sequoia_whatsapp', 'whatsapp');

// Kleiner Perkins Portfolio - via Investment Episodes
createEpisode('kpcb_amazon', 'Kleiner Perkins invests in Amazon', 1996, 2, EpisodeRole.DEAL, 'John Doerr backed Amazon early.');
createEpisode('kpcb_google', 'Kleiner Perkins invests in Google', 1999, 2, EpisodeRole.DEAL, 'Kleiner Perkins co-led Google Series A.');
createEpisode('kpcb_netscape', 'Kleiner Perkins invests in Netscape', 1994, 2, EpisodeRole.DEAL, 'Kleiner Perkins backed the browser pioneer.');
createEpisode('kpcb_sun', 'Kleiner Perkins invests in Sun', 1982, 3, EpisodeRole.DEAL, 'Early investment in Sun Microsystems.');

linkBelonging('kpcb_amazon', 'kpcb');
linkBelonging('kpcb_google', 'kpcb');
linkBelonging('kpcb_netscape', 'kpcb');
linkBelonging('kpcb_sun', 'kpcb');

linkInfluence('kpcb_amazon', 'amazon');
linkInfluence('kpcb_google', 'google');
linkInfluence('kpcb_netscape', 'netscape');
linkInfluence('kpcb_sun', 'sun');

// a16z Portfolio - via Investment Episodes
createEpisode('a16z_facebook', 'a16z invests in Facebook', 2010, 2, EpisodeRole.DEAL, 'Andreessen Horowitz backed the social giant.');
createEpisode('a16z_twitter', 'a16z invests in Twitter', 2011, 2, EpisodeRole.DEAL, 'a16z invested in the microblogging platform.');
createEpisode('a16z_airbnb', 'a16z invests in Airbnb', 2011, 2, EpisodeRole.DEAL, 'a16z backed the sharing economy pioneer.');
createEpisode('a16z_github', 'a16z invests in GitHub', 2012, 2, EpisodeRole.DEAL, 'a16z led GitHub Series A.');
createEpisode('a16z_skype', 'a16z invests in Skype', 2009, 2, EpisodeRole.DEAL, 'a16z backed the VoIP pioneer.');

linkBelonging('a16z_facebook', 'a16z');
linkBelonging('a16z_twitter', 'a16z');
linkBelonging('a16z_airbnb', 'a16z');
linkBelonging('a16z_github', 'a16z');
linkBelonging('a16z_skype', 'a16z');

linkInfluence('a16z_facebook', 'meta');
linkInfluence('a16z_twitter', 'twitter');
linkInfluence('a16z_airbnb', 'airbnb');
linkInfluence('a16z_github', 'github');
linkInfluence('a16z_skype', 'skype');

// Y Combinator Portfolio - via Investment Episodes
createEpisode('yc_airbnb', 'Y Combinator funds Airbnb', 2009, 2, EpisodeRole.DEAL, 'YC backed Airbnb in its earliest days.');
linkBelonging('yc_airbnb', 'y_combinator');
linkInfluence('yc_airbnb', 'airbnb');

// SoftBank Investments - via Investment Episodes
createEpisode('softbank_uber', 'SoftBank invests in Uber', 2018, 2, EpisodeRole.DEAL, 'Vision Fund led massive investment in Uber.');
createEpisode('softbank_nvidia', 'SoftBank invests in NVIDIA', 2017, 2, EpisodeRole.DEAL, 'SoftBank bought $4B stake in NVIDIA.');

linkBelonging('softbank_uber', 'softbank');
linkBelonging('softbank_nvidia', 'softbank');

linkInfluence('softbank_uber', 'uber');
linkInfluence('softbank_nvidia', 'nvidia');

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
createPerson('satoshi', 'Satoshi Nakamoto', 2008, 1, PersonRole.VISIONARY, 'Founder', 'Pseudonymous creator of Bitcoin.');
createEpisode('bitcoin_whitepaper', 'Bitcoin Whitepaper', 2008, 1, EpisodeRole.MILESTONE, 'Publication of "Bitcoin: A Peer-to-Peer Electronic Cash System".');

// Ethereum
createTech('ethereum', 'Ethereum', 2015, 1, TechRole.PLATFORM, 'The world computer - pioneered smart contracts.', 'Digital Services & Platforms', 'Fintech & Crypto');
createPerson('vitalik', 'Vitalik Buterin', 2015, 1, PersonRole.VISIONARY, 'Founder', 'Co-founder of Ethereum.');
createEpisode('the_merge', 'The Merge', 2022, 2, EpisodeRole.MILESTONE, 'Ethereum transitions to Proof-of-Stake, reducing energy consumption by 99%.');

// 3. DeFi & Applications
// 3. DeFi & Applications
// Removed DeFi nodes as per request

// 4. Centralized Powerhouses (CeFi)
// Removed Coinbase as per request
createCompany('binance', 'Binance', 2017, 2, CompanyRole.PLATFORM, 'World\'s largest cryptocurrency exchange.');
createPerson('cz', 'Changpeng Zhao', 2017, 2, PersonRole.VISIONARY, 'Founder', 'Founder of Binance.');
createEpisode('ftx_collapse', 'FTX Collapse', 2022, 1, EpisodeRole.CRISIS, 'Collapse of major exchange due to fraud, shaking industry confidence.');

// Connections
linkMaker('satoshi', 'bitcoin');
linkBelonging('bitcoin_whitepaper', 'bitcoin');
linkDependency('bitcoin', 'blockchain');

linkMaker('vitalik', 'ethereum');
linkBelonging('the_merge', 'ethereum');
linkDependency('ethereum', 'blockchain');
linkMaker('ethereum', 'smart_contracts');
linkInfluence('bitcoin', 'ethereum'); // Bitcoin inspired Ethereum

linkBelonging('cz', 'binance');
linkMaker('binance', 'bitcoin');
linkMaker('binance', 'ethereum');

linkInfluence('ftx_collapse', 'binance'); // Binance triggered the run
linkInfluence('ftx_collapse', 'bitcoin');
linkInfluence('bitcoin', 'stablecoin');
linkDependency('defi', 'stablecoin');

// 3. Asian FinTech
createTech('paypay', 'PayPay', 2018, 2, TechRole.PRODUCT, 'Dominant QR payment service in Japan.', 'Digital Services & Platforms', 'Digital Platforms');
linkMaker('softbank', 'paypay'); // Joint venture, but SoftBank is the parent in our graph
// linkMaker('yahoo_japan', 'paypay'); // Yahoo Japan not in graph

// Zoom
createCompany('zoom', 'Zoom', 2011, 2, CompanyRole.PLATFORM, 'Video conferencing standard.');
createPerson('eric_yuan', 'Eric Yuan', 2011, 2, PersonRole.VISIONARY, 'Founder', 'Former WebEx engineer who built Zoom.');
createEpisode('zoom_boom', 'The Zoom Boom', 2020, 1, EpisodeRole.MILESTONE, 'Pandemic drives massive global adoption of video conferencing.');

linkBelonging('eric_yuan', 'zoom');
linkBelonging('zoom_boom', 'zoom');
linkDependency('zoom', 'webrtc');
linkDependency('zoom', 'voip');

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
createEpisode('ibm_loss_1993', 'IBM\'s $8B Loss', 1993, 2, EpisodeRole.CRISIS, 'IBM reported an $8 billion loss, the largest in American corporate history at the time.');
createEpisode('lenovo_acquisition', 'Lenovo Acquires IBM PC', 2005, 2, EpisodeRole.DEAL, 'IBM sold its PC division to Lenovo for $1.75 billion, exiting the PC business.');

// IBM Technology Links
linkMaker('ibm', 'punch_card');
linkMaker('ibm', 'ibm_system_360');
linkMaker('ibm', 'pos_system');
linkMaker('ibm', 'upc_barcode');
linkMaker('ibm', 'dram');
linkMaker('ibm', 'risc');
linkMaker('ibm', 'ibm_pc');
linkMaker('ibm', 'powerpc');
linkMaker('ibm', 'watson_super');
linkMaker('ibm', 'ibm_quantum');

// IBM System/360 to Mainframe connection
linkInfluence('ibm_system_360', 'mainframe', 0.9);
linkDependency('mainframe', 'ibm_system_360');

// PowerPC connections to Apple
linkDependency('apple', 'powerpc'); // Apple used PowerPC in Macs from 1994-2006
linkInfluence('powerpc', 'apple_silicon', 0.4); // PowerPC influenced Apple's later silicon strategy

// IBM PC influence on Wintel Alliance
linkInfluence('ibm_pc', 'wintel_alliance', 0.9);
linkBelonging('wintel_alliance', 'ibm');

// RISC influence on modern architectures
linkInfluence('risc', 'powerpc', 0.9);
linkInfluence('risc', 'arm_arch', 0.7);

// IBM Episodes
linkBelonging('ibm_loss_1993', 'ibm');
linkBelonging('lenovo_acquisition', 'ibm');


// ==========================================
// MAJOR WEB PLATFORMS & SOCIAL GIANTS
// ==========================================

// 1. Social Media Giants

// YouTube
createTech('youtube', 'YouTube', 2005, 1, TechRole.PRODUCT, 'The world\'s video platform.', 'Digital Services & Platforms', 'Social & Media');
createPerson('chad_hurley', 'Chad Hurley', 2005, 2, PersonRole.VISIONARY, 'Co-Founder', 'PayPal Mafia alumni who co-founded YouTube.');
createPerson('steve_chen', 'Steve Chen', 2005, 2, PersonRole.BUILDER, 'Co-Founder', 'CTO and co-founder of YouTube.');

linkMaker('google', 'youtube'); // Acquired by Google
linkBelonging('chad_hurley', 'youtube');
linkBelonging('chad_hurley', 'paypal');
linkBelonging('steve_chen', 'youtube');
linkBelonging('steve_chen', 'paypal');
linkBelonging('chad_hurley', 'paypal_mafia');
linkBelonging('steve_chen', 'paypal_mafia');

// Meta Ecosystem (Facebook, Instagram, WhatsApp)
createCompany('meta', 'Meta', 2004, 1, CompanyRole.PLATFORM, 'Social technology company connecting billions.');
createTech('sns', 'SNS', 2004, 1, TechRole.STANDARD, 'Social Networking Service - online platform for people to build social networks or social relations.', 'Digital Services & Platforms', 'Social & Media');

createTech('facebook_app', 'Facebook App', 2004, 1, TechRole.PRODUCT, 'The social network that connected the world.', 'Digital Services & Platforms', 'Social & Media');
createTech('instagram', 'Instagram', 2010, 1, TechRole.PRODUCT, 'Visual storytelling platform.', 'Digital Services & Platforms', 'Social & Media');
createTech('whatsapp', 'WhatsApp', 2009, 1, TechRole.PRODUCT, 'Global messaging standard.', 'Digital Services & Platforms', 'Social & Media');

linkDependency('facebook_app', 'sns');
linkDependency('instagram', 'sns');
linkDependency('whatsapp', 'sns');
linkDependency('twitter', 'sns');
linkDependency('linkedin', 'sns');
linkDependency('youtube', 'sns');
linkDependency('tiktok', 'sns');
linkDependency('douyin', 'sns');
linkDependency('wechat', 'sns');

createPerson('zuckerberg', 'Mark Zuckerberg', 2004, 1, PersonRole.VISIONARY, 'Founder', 'CEO of Meta.');
createPerson('kevin_systrom', 'Kevin Systrom', 2010, 2, PersonRole.VISIONARY, 'Founder', 'Co-founder of Instagram.');
createPerson('jan_koum', 'Jan Koum', 2009, 2, PersonRole.VISIONARY, 'Founder', 'Co-founder of WhatsApp.');

linkBelonging('zuckerberg', 'meta');
linkMaker('meta', 'facebook_app');
linkMaker('meta', 'instagram');
linkMaker('meta', 'whatsapp');
linkBelonging('kevin_systrom', 'instagram');
linkBelonging('jan_koum', 'whatsapp');

// Meta AI & History
createPerson('lecun', 'Yann LeCun', 2013, 1, PersonRole.THEORIST, 'Chief AI Scientist', 'CNN Pioneer who leads Meta AI research.');
createTech('pytorch', 'PyTorch', 2016, 2, TechRole.STANDARD, 'Open source machine learning framework that powers modern AI.', 'System Software', 'Development & Languages');
createEpisode('cambridge_analytica', 'Cambridge Analytica', 2018, 2, EpisodeRole.CRISIS, 'Massive data scandal that triggered global privacy debates.');

linkBelonging('lecun', 'meta');
linkMaker('meta', 'pytorch');
linkBelonging('cambridge_analytica', 'meta');

// Twitter / X
createTech('twitter', 'Twitter / X', 2006, 2, TechRole.PLATFORM, 'The global town square.', 'Digital Services & Platforms', 'Social & Media');
createPerson('jack_dorsey', 'Jack Dorsey', 2006, 2, PersonRole.VISIONARY, 'Co-Founder', 'Creator of Twitter and Square.');

linkMaker('jack_dorsey', 'twitter');
linkBelonging('twitter', 'musk'); // Owned by Musk

// LinkedIn
createTech('linkedin', 'LinkedIn', 2002, 2, TechRole.PLATFORM, 'Professional social network.', 'Digital Services & Platforms', 'Social & Media');
createPerson('reid_hoffman', 'Reid Hoffman', 2002, 2, PersonRole.VISIONARY, 'Co-Founder', 'The networker of Silicon Valley.');
linkBelonging('reid_hoffman', 'paypal');

linkMaker('reid_hoffman', 'linkedin');
linkBelonging('reid_hoffman', 'paypal_mafia');
linkBelonging('linkedin', 'microsoft'); // Acquired by Microsoft

// 2. Service & Content Platforms

// Uber
createCompany('uber', 'Uber', 2009, 2, CompanyRole.PLATFORM, 'Revolutionized mobility with the gig economy.', [CompanyCategory.INTERNET]);
createPerson('travis_kalanick', 'Travis Kalanick', 2009, 2, PersonRole.VISIONARY, 'Co-Founder', 'Aggressive expansionist who built Uber.');
createTech('gig_economy', 'Gig Economy', 2009, 2, TechRole.STANDARD, 'Labor market characterized by short-term contracts or freelance work.', 'Digital Services & Platforms', 'Digital Platforms');

linkBelonging('travis_kalanick', 'uber');
linkMaker('uber', 'gig_economy');
linkMaker('uber', 'sharing_economy');

// Airbnb
createCompany('airbnb', 'Airbnb', 2008, 2, CompanyRole.PLATFORM, 'Community-based marketplace for accommodations.', [CompanyCategory.INTERNET]);
createPerson('brian_chesky', 'Brian Chesky', 2008, 2, PersonRole.VISIONARY, 'Co-Founder', 'Designer-founder who reimagined travel.');
createTech('sharing_economy', 'Sharing Economy', 2008, 2, TechRole.STANDARD, 'Peer-to-peer based activity of acquiring, providing or sharing access to goods and services.', 'Digital Services & Platforms', 'Digital Platforms');

linkBelonging('brian_chesky', 'airbnb');
linkMaker('airbnb', 'sharing_economy');



// Wikipedia
createCompany('wikimedia', 'Wikimedia Foundation', 2003, 2, CompanyRole.PLATFORM, 'Non-profit charitable organization that hosts Wikipedia.');
createTech('wikipedia', 'Wikipedia', 2001, 1, TechRole.PRODUCT, 'The free encyclopedia that anyone can edit.', 'Digital Services & Platforms', 'Search & Information');
createPerson('jimmy_wales', 'Jimmy Wales', 2001, 2, PersonRole.VISIONARY, 'Founder', 'Created the world\'s largest knowledge base.');


linkBelonging('jimmy_wales', 'wikimedia');
linkMaker('wikimedia', 'wikipedia');
linkMaker('jimmy_wales', 'wikipedia');



// ==========================================
// DEVELOPER PLATFORMS & INFRASTRUCTURE
// ==========================================

// 1. Code & Collaboration

// GitHub
createTech('github', 'GitHub', 2008, 2, TechRole.PLATFORM, 'The world\'s largest code host.', 'Digital Services & Platforms', 'Digital Platforms');
createPerson('chris_wanstrath', 'Chris Wanstrath', 2008, 2, PersonRole.VISIONARY, 'Co-Founder', 'CEO who led GitHub to become the home of open source.');
createTech('git', 'Git', 2005, 1, TechRole.STANDARD, 'Distributed version control system.', 'System Software', 'Development & Languages');

linkMaker('chris_wanstrath', 'github');
linkMaker('linus', 'git'); // Linus created Git
linkDependency('github', 'git'); // GitHub is built on Git
linkBelonging('github', 'microsoft'); // Acquired by Microsoft



// 2. Modern Web & AI Infrastructure






export const INITIAL_DATA: GraphData = { nodes, links };
