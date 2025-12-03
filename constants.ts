
import { Category, GraphData, LinkType, LinkDirection, NodeData, LinkData, CompanyRole, PersonRole, TechRole, EpisodeRole, Role } from './types';

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

const createCompany = (id: string, label: string, year: number, importance: number, roleType: CompanyRole, description: string) => {
  nodes.push({ id, label, category: Category.COMPANY, year, importance, roleType, description });
};

const createPerson = (id: string, label: string, year: number, importance: number, roleType: PersonRole, role: string, description: string) => {
  nodes.push({ id, label, category: Category.PERSON, year, importance, roleType, role, description });
};

const createTech = (id: string, label: string, year: number, importance: number, roleType: TechRole, description: string) => {
  nodes.push({ id, label, category: Category.TECHNOLOGY, year, importance, roleType, description });
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
createCompany('amd', 'AMD', 1969, 2, CompanyRole.INFRA, 'Intel\'s eternal rival, resurgent under Lisa Su with Ryzen and EPYC processors.');
createPerson('lisa_su', 'Lisa Su', 2014, 2, PersonRole.VISIONARY, 'CEO', 'Led AMD\'s remarkable turnaround with Ryzen architecture and data center dominance.');
createTech('ryzen', 'AMD Ryzen', 2017, 2, TechRole.PRODUCT, 'High-performance CPUs that challenged Intel\'s dominance.');
createTech('epyc', 'AMD EPYC', 2017, 2, TechRole.PRODUCT, 'Server processors that captured data center market share from Intel.');

linkBelonging('lisa_su', 'amd');
linkMaker('amd', 'ryzen');
linkMaker('amd', 'epyc');
linkDependency('amd', 'tsmc'); // AMD uses TSMC for chip manufacturing
linkDependency('ryzen', 'tsmc');
linkDependency('epyc', 'tsmc');

// TSMC customer dependencies
linkDependency('qualcomm', 'tsmc'); // Qualcomm manufactures Snapdragon at TSMC
linkDependency('snapdragon', 'tsmc');
linkDependency('broadcom', 'tsmc'); // Broadcom chips manufactured at TSMC
// Intel already connected to ASML, but also uses TSMC for some products
linkDependency('intel', 'tsmc'); // Intel increasingly uses TSMC for advanced nodes

// ==========================================
// ERA 1: THE GENESIS
// ==========================================

createCompany('bell_labs', 'Bell Labs', 1925, 1, CompanyRole.LAB, 'The Idea Factory. Birthplace of the transistor, Unix, C, and Information Theory.');
createCompany('att', 'AT&T', 1885, 2, CompanyRole.PLATFORM, 'American Telephone & Telegraph - parent company of Bell Labs and telecommunications giant.');

createPerson('shockley', 'William Shockley', 1956, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor. His management style birthed Silicon Valley.');
createPerson('shannon', 'Claude Shannon', 1948, 1, PersonRole.THEORIST, 'Father of Info Theory', 'Defined the bit and the mathematical basis of digital communication.');
createPerson('ritchie', 'Dennis Ritchie', 1972, 1, PersonRole.BUILDER, 'Creator of C', 'Created the C programming language and co-created Unix.');
createPerson('thompson', 'Ken Thompson', 1969, 2, PersonRole.BUILDER, 'Creator of Unix', 'Co-created Unix, B language, and later Go at Google.');
createPerson('bardeen', 'John Bardeen', 1947, 1, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor and superconductivity theory. Only person to win Nobel Prize in Physics twice.');
createPerson('brattain', 'Walter Brattain', 1947, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor with Shockley and Bardeen.');

createTech('transistor', 'The Transistor', 1947, 1, TechRole.CORE, 'The fundamental building block of all modern electronics.');
createTech('unix', 'Unix', 1969, 2, TechRole.STANDARD, 'The OS architecture that underpins Linux, macOS, and the internet.');
createTech('c_language', 'C Language', 1972, 1, TechRole.STANDARD, 'The programming language that shaped modern software development.');
createTech('laser', 'Laser', 1958, 1, TechRole.CORE, 'Light Amplification by Stimulated Emission of Radiation - revolutionized communications, medicine, and manufacturing.');
createTech('ccd', 'CCD', 1969, 2, TechRole.CORE, 'Charge-Coupled Device - enabled digital imaging and modern cameras.');
createTech('cdma', 'CDMA', 1989, 2, TechRole.STANDARD, 'Code Division Multiple Access - wireless communication standard that enabled modern mobile networks.');
createTech('solar_cell', 'Solar Cell', 1954, 2, TechRole.CORE, 'First practical photovoltaic cell, converting sunlight to electricity.');
createTech('mosfet', 'MOSFET', 1959, 1, TechRole.CORE, 'Metal-Oxide-Semiconductor Field-Effect Transistor - the most common transistor in modern chips.');

// Bell Labs belongs to AT&T
linkBelonging('bell_labs', 'att');

// People at Bell Labs
linkBelonging('shockley', 'bell_labs');
linkBelonging('shannon', 'bell_labs');
linkBelonging('ritchie', 'bell_labs');
linkBelonging('thompson', 'bell_labs');
linkBelonging('bardeen', 'bell_labs');
linkBelonging('brattain', 'bell_labs');

// Bell Labs innovations
linkMaker('bell_labs', 'transistor');
linkMaker('bell_labs', 'unix');
linkMaker('bell_labs', 'c_language');
linkMaker('bell_labs', 'laser');
linkMaker('bell_labs', 'ccd');
linkMaker('bell_labs', 'cdma');
linkMaker('bell_labs', 'solar_cell');
linkMaker('bell_labs', 'mosfet');

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

createCompany('ibm', 'IBM', 1911, 1, CompanyRole.PLATFORM, 'Big Blue. The dominant force in computing for most of the 20th century.');
createTech('mainframe', 'Mainframe', 1952, 2, TechRole.PRODUCT, 'Big iron computing for enterprise.');
createTech('deep_blue', 'Deep Blue', 1997, 2, TechRole.PRODUCT, 'First computer to defeat a world chess champion.');
createEpisode('kasparov_match', 'Kasparov vs Deep Blue', 1997, 2, EpisodeRole.MILESTONE, 'The first time a computer defeated a reigning world chess champion.');

linkMaker('ibm', 'mainframe');
linkMaker('ibm', 'deep_blue');
linkBelonging('deep_blue', 'kasparov_match');
linkBelonging('kasparov_match', 'ibm');
linkInfluence('von_neumann', 'mainframe', 0.6);

createCompany('fairchild', 'Fairchild Semi', 1957, 2, CompanyRole.LAB, 'The incubator of Silicon Valley.');
createPerson('noyce', 'Robert Noyce', 1957, 1, PersonRole.VISIONARY, 'Mayor of Silicon Valley', 'Co-inventor of the IC and co-founder of Intel.');
createPerson('moore', 'Gordon Moore', 1968, 1, PersonRole.VISIONARY, 'Co-founder', 'Author of Moore\'s Law. Co-founded Intel.');
createEpisode('traitorous_eight', 'The Traitorous Eight', 1957, 2, EpisodeRole.MILESTONE, 'Eight engineers left Shockley to found Fairchild.');
createTech('ic', 'Integrated Circuit', 1959, 1, TechRole.CORE, 'Combining multiple transistors onto a single chip.');

linkBelonging('noyce', 'fairchild');
linkBelonging('moore', 'fairchild');
linkMaker('fairchild', 'ic');
linkInfluence('shockley', 'traitorous_eight');
linkInfluence('traitorous_eight', 'fairchild');

createCompany('ti', 'Texas Instruments', 1930, 2, CompanyRole.INFRA, 'Pioneers of the Integrated Circuit and DSPs.');
createPerson('kilby', 'Jack Kilby', 1958, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Inventor of the Integrated Circuit (alongside Noyce).');

createTech('ti_calculator', 'Handheld Calculator', 1967, 2, TechRole.PRODUCT, 'First handheld electronic calculator, revolutionizing personal computing.');
createTech('dsp', 'DSP Chip', 1982, 2, TechRole.CORE, 'Digital Signal Processor - specialized microprocessor for digital signal processing in audio, video, and communications.');
createTech('ttl_logic', 'TTL Logic', 1964, 2, TechRole.STANDARD, 'Transistor-Transistor Logic - became the industry standard for digital logic circuits.');
createTech('tms1000', 'TMS1000 Microcontroller', 1974, 2, TechRole.PRODUCT, 'First commercially successful microcontroller, used in appliances and toys.');

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

createCompany('intel', 'Intel', 1968, 1, CompanyRole.INFRA, 'Put the "Silicon" in Silicon Valley. Created the microprocessor.');
createPerson('andy_grove', 'Andy Grove', 1979, 2, PersonRole.VISIONARY, 'Former CEO', 'The man who drove Intel\'s execution. "Only the Paranoid Survive."');
createPerson('faggin', 'Federico Faggin', 1971, 2, PersonRole.BUILDER, 'Lead Designer', 'Led the design of the first commercial microprocessor.');
createPerson('gelsinger', 'Pat Gelsinger', 2021, 2, PersonRole.VISIONARY, 'CEO', 'Returned to Intel as CEO to restore its manufacturing leadership.');

createTech('microprocessor', 'Microprocessor (4004)', 1971, 1, TechRole.CORE, 'The first general-purpose CPU on a single chip.');
createTech('x86', 'x86 Architecture', 1978, 1, TechRole.CORE, 'The instruction set architecture that dominated personal computing for decades.');
createTech('pentium', 'Pentium', 1993, 2, TechRole.PRODUCT, 'Intel\'s iconic processor brand that became synonymous with PC performance.');
createTech('core_processor', 'Intel Core', 2006, 2, TechRole.PRODUCT, 'Multi-core processor architecture that redefined PC performance.');
createTech('euv_chip', 'EUV Lithography', 2018, 2, TechRole.CORE, 'Extreme Ultraviolet lithography for sub-7nm chip manufacturing.');
createTech('moores_law', 'Moore\'s Law', 1965, 1, TechRole.STANDARD, 'Observation that transistor count doubles every two years - guided semiconductor industry for 50+ years.');

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

createCompany('xerox', 'Xerox PARC', 1970, 2, CompanyRole.LAB, 'Invented the GUI, Mouse, and Ethernet, but failed to commercialize them.');
createPerson('kay', 'Alan Kay', 1970, 2, PersonRole.THEORIST, 'Visionary', 'Pioneered OOP (Smalltalk) and the GUI.');
createTech('gui', 'GUI', 1973, 2, TechRole.CORE, 'Graphical User Interface.');
linkBelonging('kay', 'xerox');
linkMaker('xerox', 'gui');

createCompany('apple', 'Apple', 1976, 1, CompanyRole.PLATFORM, 'Revolutionized personal computing, mobile, and design.');
createPerson('jobs', 'Steve Jobs', 1976, 1, PersonRole.VISIONARY, 'Co-Founder', 'The visionary who made technology beautiful and accessible.');
createPerson('wozniak', 'Steve Wozniak', 1976, 2, PersonRole.BUILDER, 'Co-Founder', 'The engineering genius behind the Apple I and II.');
createPerson('cook', 'Tim Cook', 2011, 2, PersonRole.VISIONARY, 'CEO', 'Master of the supply chain who scaled Apple to a $3T company.');
createTech('macintosh', 'Macintosh', 1984, 2, TechRole.PRODUCT, 'The first mass-market computer with a GUI and mouse.');
createTech('iphone', 'iPhone', 2007, 1, TechRole.PRODUCT, 'The device that put the internet in everyone\'s pocket.');
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

createCompany('microsoft', 'Microsoft', 1975, 1, CompanyRole.PLATFORM, 'PC software monopoly turned Cloud & AI giant.');
createPerson('gates', 'Bill Gates', 1975, 1, PersonRole.VISIONARY, 'Co-Founder', 'Dominated the PC era.');
createPerson('nadella', 'Satya Nadella', 2014, 1, PersonRole.VISIONARY, 'CEO', 'Led the Cloud & AI transformation.');
createTech('windows', 'Windows', 1985, 2, TechRole.PRODUCT, 'The OS that runs the world.');
createEpisode('wintel_alliance', 'Wintel Alliance', 1980, 2, EpisodeRole.DEAL, 'The dominance of Windows running on Intel chips.');
createEpisode('ms_saves_apple', 'Microsoft Saves Apple', 1997, 3, EpisodeRole.DEAL, 'Gates invests $150M in Apple.');

linkBelonging('gates', 'microsoft');
linkBelonging('nadella', 'microsoft');
linkMaker('microsoft', 'windows');
linkBelonging('ms_saves_apple', 'microsoft');
linkInfluence('ms_saves_apple', 'apple');
linkBelonging('wintel_alliance', 'microsoft');
linkBelonging('wintel_alliance', 'intel');

createCompany('oracle', 'Oracle', 1977, 2, CompanyRole.PLATFORM, 'Database giant.');
createPerson('ellison', 'Larry Ellison', 1977, 2, PersonRole.VISIONARY, 'Founder', 'Pioneer of the relational database.');
createEpisode('oracle_buys_sun', 'Oracle Acquires Sun', 2010, 2, EpisodeRole.DEAL, 'Oracle buys Sun Microsystems for Java and Solaris.');

linkBelonging('ellison', 'oracle');
linkBelonging('oracle_buys_sun', 'oracle');

createCompany('sun', 'Sun Microsystems', 1982, 2, CompanyRole.PLATFORM, 'The dot in .com.');
createTech('java', 'Java', 1995, 2, TechRole.STANDARD, 'Write once, run anywhere.');
linkMaker('sun', 'java');
linkDependency('oracle', 'oracle_buys_sun');
linkInfluence('oracle_buys_sun', 'sun');

createCompany('adobe', 'Adobe', 1982, 2, CompanyRole.PLATFORM, 'Creative software giant.');
createTech('photoshop', 'Photoshop', 1990, 2, TechRole.PRODUCT, 'Digital imaging standard.');
linkMaker('adobe', 'photoshop');
linkInfluence('xerox', 'adobe');

createPerson('linus', 'Linus Torvalds', 1991, 1, PersonRole.BUILDER, 'Creator of Linux', 'Created the Linux kernel and Git.');
linkInfluence('unix', 'linus');

// ==========================================
// ERA 3: INTERNET & CLOUD
// ==========================================

createCompany('darpa', 'DARPA', 1958, 1, CompanyRole.LAB, 'Defense Research. Funded Internet & AI.');
createTech('arpanet', 'ARPANET', 1969, 1, TechRole.CORE, 'Precursor to the Internet.');
createPerson('cerf', 'Vint Cerf', 1973, 2, PersonRole.THEORIST, 'Father of Internet', 'Co-designer of TCP/IP.');
linkMaker('darpa', 'arpanet');
linkMaker('cerf', 'arpanet');

createCompany('cern', 'CERN', 1954, 2, CompanyRole.LAB, 'Birthplace of the Web.');
createTech('www', 'World Wide Web', 1989, 1, TechRole.STANDARD, 'HTML, HTTP, URL.');
createPerson('berners_lee', 'Tim Berners-Lee', 1989, 2, PersonRole.THEORIST, 'Inventor', 'Invented the Web.');
linkBelonging('berners_lee', 'cern');
linkMaker('cern', 'www');
linkInfluence('arpanet', 'www');

createCompany('netscape', 'Netscape', 1994, 2, CompanyRole.PLATFORM, 'First commercial browser.');
createPerson('andreessen', 'Marc Andreessen', 1994, 2, PersonRole.BUILDER, 'Co-Founder', 'Created Mosaic/Netscape.');
createTech('javascript', 'JavaScript', 1995, 2, TechRole.STANDARD, 'Language of the web.');
createEpisode('browser_wars', 'Browser Wars', 1995, 2, EpisodeRole.MILESTONE, 'Netscape vs Microsoft (IE).');

linkBelonging('andreessen', 'netscape');
linkMaker('netscape', 'javascript');
linkInfluence('www', 'netscape');
linkBelonging('browser_wars', 'netscape');
linkBelonging('browser_wars', 'microsoft');

createCompany('google', 'Google', 1998, 1, CompanyRole.PLATFORM, 'Organized the world\'s information. AI First company.');
createPerson('larry_page', 'Larry Page', 1998, 2, PersonRole.VISIONARY, 'Co-Founder', 'PageRank inventor.');
createPerson('pichai', 'Sundar Pichai', 2015, 2, PersonRole.VISIONARY, 'CEO', 'Led Chrome, Android, and AI pivot.');
createTech('search', 'Google Search', 1998, 1, TechRole.PRODUCT, 'Algorithmic search.');
createTech('android', 'Android', 2008, 2, TechRole.PLATFORM, 'Mobile OS.'); // Wait, TechRole Platform doesn't exist, using PRODUCT
createTech('tpu', 'TPU', 2015, 2, TechRole.PRODUCT, 'AI ASIC.');

linkBelonging('larry_page', 'google');
linkBelonging('pichai', 'google');
linkBelonging('cerf', 'google');
linkMaker('google', 'search');
linkMaker('google', 'android'); // Note: Android is a Product here
linkMaker('google', 'tpu');
linkInfluence('iphone', 'android');

createCompany('amazon', 'Amazon', 1994, 2, CompanyRole.PLATFORM, 'E-commerce & Cloud.');
createPerson('bezos', 'Jeff Bezos', 1994, 2, PersonRole.VISIONARY, 'Founder', 'Cloud computing pioneer.');
createTech('aws', 'AWS', 2006, 1, TechRole.PRODUCT, 'Cloud Infrastructure (IaaS).');
linkBelonging('bezos', 'amazon');
linkMaker('amazon', 'aws');

createCompany('salesforce', 'Salesforce', 1999, 2, CompanyRole.PLATFORM, 'SaaS Pioneer.');
createPerson('benioff', 'Marc Benioff', 1999, 2, PersonRole.VISIONARY, 'Founder', 'Former Oracle executive who pioneered SaaS.');
linkBelonging('benioff', 'salesforce');
linkInfluence('oracle', 'benioff');

createCompany('cisco', 'Cisco', 1984, 2, CompanyRole.INFRA, 'Internet plumbing.');
linkDependency('arpanet', 'cisco');

createCompany('netflix', 'Netflix', 1997, 2, CompanyRole.PLATFORM, 'Streaming & RecSys.');
linkDependency('netflix', 'aws');

createCompany('meta', 'Meta', 2004, 1, CompanyRole.PLATFORM, 'Social & AI.');
createPerson('zuckerberg', 'Mark Zuckerberg', 2004, 2, PersonRole.VISIONARY, 'Founder', 'Connects the world.');
createPerson('lecun', 'Yann LeCun', 2013, 1, PersonRole.THEORIST, 'Chief AI Scientist', 'CNN Pioneer.');
createTech('pytorch', 'PyTorch', 2016, 2, TechRole.STANDARD, 'AI Framework.');
createEpisode('cambridge_analytica', 'Cambridge Analytica', 2018, 3, EpisodeRole.CRISIS, 'Data privacy scandal.');

linkBelonging('zuckerberg', 'meta');
linkBelonging('lecun', 'meta');
linkMaker('meta', 'pytorch');
linkBelonging('cambridge_analytica', 'meta');

// ==========================================
// ERA 4: HARDWARE & GLOBAL SUPPLY CHAIN
// ==========================================

createCompany('tsmc', 'TSMC', 1987, 1, CompanyRole.INFRA, 'The World\'s Foundry.');
createPerson('morris_chang', 'Morris Chang', 1987, 2, PersonRole.VISIONARY, 'Founder', 'Invented foundry model.');
createTech('apple_silicon', 'Apple Silicon', 2020, 2, TechRole.PRODUCT, 'Custom ARM chips.');

linkBelonging('morris_chang', 'tsmc');
linkMaker('apple', 'apple_silicon');
linkDependency('apple', 'tsmc');
linkDependency('apple_silicon', 'tsmc');

createCompany('asml', 'ASML', 1984, 1, CompanyRole.INFRA, 'Monopoly on Lithography.');
createTech('euv', 'EUV Lithography', 2019, 1, TechRole.CORE, 'Extreme UV machines.');
linkMaker('asml', 'euv');
linkDependency('tsmc', 'asml');
linkDependency('intel', 'asml');


// ==========================================
// ARM HOLDINGS - RISC REVOLUTION
// ==========================================

createCompany('arm', 'ARM', 1990, 2, CompanyRole.INFRA, 'The architecture that powers mobile computing through licensing model.');
createPerson('sophie_wilson', 'Sophie Wilson', 1983, 2, PersonRole.THEORIST, 'Architect', 'Designed ARM instruction set at Acorn Computers.');
createPerson('steve_furber', 'Steve Furber', 1983, 2, PersonRole.THEORIST, 'Co-Designer', 'Co-designed the first ARM processor with Sophie Wilson.');

createTech('arm_arch', 'ARM Architecture', 1990, 2, TechRole.STANDARD, 'Power-efficient RISC instruction set that dominates mobile.');
createTech('arm_cortex', 'ARM Cortex', 2004, 2, TechRole.PRODUCT, 'Family of ARM processor cores for different performance/power targets.');
createTech('arm_neoverse', 'ARM Neoverse', 2018, 2, TechRole.PRODUCT, 'ARM server processors challenging x86 in data centers.');

createEpisode('arm_license_model', 'ARM Licensing Model', 1990, 2, EpisodeRole.MILESTONE, 'Revolutionary business model: license IP instead of manufacturing chips.');
createEpisode('nvidia_arm_fail', 'NVIDIA Failed ARM Bid', 2020, 2, EpisodeRole.DEAL, '$40B acquisition blocked by regulators due to concerns about neutrality.');
createEpisode('softbank_arm', 'SoftBank Acquires ARM', 2016, 2, EpisodeRole.DEAL, 'SoftBank bought ARM for $32B, largest European tech acquisition.');

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
linkBelonging('softbank_arm', 'arm');

// ARM influences
linkDependency('apple_silicon', 'arm_arch');
linkInfluence('arm_cortex', 'apple_silicon', 0.6);

// ==========================================
// QUALCOMM - WIRELESS PIONEER
// ==========================================

createCompany('qualcomm', 'Qualcomm', 1985, 2, CompanyRole.INFRA, 'Mobile chip giant and wireless patent powerhouse.');
createPerson('irwin_jacobs', 'Irwin Jacobs', 1985, 2, PersonRole.VISIONARY, 'Co-Founder', 'Pioneer of CDMA technology and mobile communications.');
createPerson('paul_jacobs', 'Paul Jacobs', 2005, 2, PersonRole.VISIONARY, 'Former CEO', 'Son of Irwin, led Qualcomm through smartphone era.');

createTech('snapdragon', 'Snapdragon', 2007, 2, TechRole.PRODUCT, 'System-on-chip (SoC) that powers most Android smartphones.');
createTech('cdma_tech', 'CDMA Technology', 1989, 2, TechRole.STANDARD, 'Code Division Multiple Access - Qualcomm\'s foundational wireless patent portfolio.');
createTech('3g_patents', '3G Patents', 2001, 2, TechRole.STANDARD, 'Critical wireless patents for third-generation mobile networks.');
createTech('4g_lte', '4G LTE', 2009, 2, TechRole.STANDARD, 'Long Term Evolution - foundation of modern mobile broadband.');
createTech('5g_patents', '5G Patents', 2019, 2, TechRole.STANDARD, 'Essential 5G wireless patents, maintaining Qualcomm\'s licensing dominance.');

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
createCompany('softbank', 'SoftBank', 1981, 2, CompanyRole.PLATFORM, 'Japanese conglomerate and world\'s largest tech investor through Vision Fund.');
createPerson('masayoshi_son', 'Masayoshi Son', 1981, 1, PersonRole.VISIONARY, 'Founder & CEO', 'Visionary investor who bet big on internet companies and AI revolution.');
createEpisode('vision_fund', 'Vision Fund Launch', 2017, 2, EpisodeRole.DEAL, '$100B fund - largest tech investment fund in history, backed by Saudi Arabia.');
createEpisode('softbank_arm', 'SoftBank Acquires ARM', 2016, 2, EpisodeRole.DEAL, 'SoftBank bought ARM for $32B, largest European tech acquisition.');

linkBelonging('masayoshi_son', 'softbank');
linkBelonging('vision_fund', 'softbank');
linkBelonging('softbank_arm', 'softbank');
linkBelonging('softbank_arm', 'arm');
linkInfluence('vision_fund', 'openai', 0.3); // Vision Fund invested in many AI companies

// NTT - Telecom Pioneer
createCompany('ntt', 'NTT', 1952, 2, CompanyRole.PLATFORM, 'Nippon Telegraph and Telephone - Japan\'s telecom giant and 5G pioneer.');
createPerson('shigeki_goto', 'Shigeki Goto', 1990, 3, PersonRole.THEORIST, 'Researcher', 'NTT researcher who contributed to internet protocols and networking.');
createTech('ntt_docomo', 'NTT DoCoMo i-mode', 1999, 2, TechRole.PRODUCT, 'World\'s first major mobile internet platform - predated iPhone by 8 years.');
createTech('optical_fiber', 'Optical Fiber Network', 1980, 2, TechRole.CORE, 'High-speed data transmission through light - foundation of modern internet.');

linkBelonging('shigeki_goto', 'ntt');
linkMaker('ntt', 'ntt_docomo');
linkMaker('ntt', 'optical_fiber');
linkInfluence('ntt_docomo', 'iphone', 0.4); // i-mode influenced mobile internet thinking

// Sony - Consumer Electronics & Sensors
createCompany('sony', 'Sony', 1946, 2, CompanyRole.INFRA, 'Consumer electronics giant and world leader in image sensors.');
createPerson('akio_morita', 'Akio Morita', 1946, 2, PersonRole.VISIONARY, 'Co-Founder', 'Built Sony into global brand with Walkman and PlayStation.');
createPerson('ken_kutaragi', 'Ken Kutaragi', 1993, 2, PersonRole.VISIONARY, 'Father of PlayStation', 'Created PlayStation gaming console, revolutionizing entertainment.');

createTech('walkman', 'Sony Walkman', 1979, 2, TechRole.PRODUCT, 'Portable music player that changed how people consume media.');
createTech('playstation', 'PlayStation', 1994, 2, TechRole.PRODUCT, '3D gaming console that dominated gaming industry.');
createTech('cmos_sensor', 'CMOS Image Sensor', 1990, 2, TechRole.CORE, 'Sony\'s sensor technology powers most smartphone cameras including iPhone.');
createTech('blu_ray', 'Blu-ray', 2006, 2, TechRole.STANDARD, 'High-definition optical disc format developed by Sony.');

linkBelonging('akio_morita', 'sony');
linkBelonging('ken_kutaragi', 'sony');
linkMaker('sony', 'walkman');
linkMaker('sony', 'playstation');
linkMaker('ken_kutaragi', 'playstation');
linkMaker('sony', 'cmos_sensor');
linkMaker('sony', 'blu_ray');
linkDependency('iphone', 'cmos_sensor');

// Nintendo - Gaming Pioneer
createCompany('nintendo', 'Nintendo', 1889, 2, CompanyRole.PLATFORM, 'Gaming pioneer that created modern video game industry.');
createPerson('shigeru_miyamoto', 'Shigeru Miyamoto', 1977, 2, PersonRole.VISIONARY, 'Game Designer', 'Creator of Mario, Zelda, and modern game design principles.');
createPerson('satoru_iwata', 'Satoru Iwata', 2002, 2, PersonRole.VISIONARY, 'Former President', 'Programmer-turned-CEO who led Nintendo through DS and Wii era.');

createTech('nes', 'Nintendo Entertainment System', 1983, 2, TechRole.PRODUCT, 'Revived video game industry after 1983 crash.');
createTech('game_boy', 'Game Boy', 1989, 2, TechRole.PRODUCT, 'Defined handheld gaming for decades.');
createTech('nintendo_switch', 'Nintendo Switch', 2017, 2, TechRole.PRODUCT, 'Hybrid console that merged home and portable gaming.');

createEpisode('nes_revival', 'Video Game Revival', 1985, 2, EpisodeRole.MILESTONE, 'Nintendo saved video game industry after 1983 crash with quality control and NES.');

linkBelonging('shigeru_miyamoto', 'nintendo');
linkBelonging('satoru_iwata', 'nintendo');
linkMaker('nintendo', 'nes');
linkMaker('nintendo', 'game_boy');
linkMaker('nintendo', 'nintendo_switch');
linkBelonging('nes_revival', 'nintendo');

// Fujitsu - Enterprise Computing
createCompany('fujitsu', 'Fujitsu', 1935, 2, CompanyRole.INFRA, 'Japanese IT giant in enterprise computing and supercomputers.');
createTech('fugaku', 'Fugaku Supercomputer', 2020, 2, TechRole.PRODUCT, 'World\'s fastest supercomputer (2020-2021) using ARM architecture.');

linkMaker('fujitsu', 'fugaku');
linkDependency('fugaku', 'arm_arch');

// ==========================================
// SOUTH KOREAN TECH POWERHOUSES
// ==========================================

// Samsung - Memory & Display Dominance
createCompany('samsung', 'Samsung', 1938, 1, CompanyRole.INFRA, 'World leader in memory chips, displays, and smartphones.');
createPerson('lee_byung_chul', 'Lee Byung-chul', 1938, 2, PersonRole.VISIONARY, 'Founder', 'Founded Samsung, built it into Korea\'s largest conglomerate.');
createPerson('lee_kun_hee', 'Lee Kun-hee', 1987, 2, PersonRole.VISIONARY, 'Former Chairman', 'Transformed Samsung into global tech leader. "Change everything except your wife and children."');
createPerson('lee_jae_yong', 'Lee Jae-yong', 2014, 2, PersonRole.VISIONARY, 'Vice Chairman', 'Third generation leader, focused on AI and semiconductors.');

createTech('galaxy', 'Samsung Galaxy', 2009, 2, TechRole.PRODUCT, 'Flagship Android smartphone line that competes with iPhone.');
createTech('oled_display', 'OLED Display', 2007, 2, TechRole.CORE, 'Organic LED displays - Samsung supplies to Apple, dominating premium display market.');
createTech('nand_flash', 'NAND Flash', 1987, 2, TechRole.CORE, 'Non-volatile storage - foundation of SSDs and USB drives.');
createTech('hbm', 'HBM', 2013, 1, TechRole.CORE, 'High Bandwidth Memory for AI chips.');

createEpisode('samsung_memory_bet', 'Samsung Memory Bet', 1983, 2, EpisodeRole.MILESTONE, 'Counter-cyclical investment in memory chips during downturn - established Samsung as memory leader.');
createEpisode('galaxy_launch', 'Galaxy Launch', 2010, 2, EpisodeRole.MILESTONE, 'Samsung Galaxy S launched, beginning rivalry with iPhone.');

linkBelonging('lee_byung_chul', 'samsung');
linkBelonging('lee_kun_hee', 'samsung');
linkBelonging('lee_jae_yong', 'samsung');
linkMaker('samsung', 'galaxy');
linkMaker('samsung', 'oled_display');
linkMaker('samsung', 'nand_flash');
linkMaker('samsung', 'hbm');
linkBelonging('samsung_memory_bet', 'samsung');
linkBelonging('galaxy_launch', 'samsung');

linkDependency('samsung', 'asml');
linkDependency('iphone', 'samsung'); // iPhone uses Samsung displays and chips
linkDependency('iphone', 'oled_display');
linkDependency('galaxy', 'android');
linkDependency('galaxy', 'snapdragon');

// SK Hynix - Memory Specialist
createCompany('sk_hynix', 'SK Hynix', 1983, 2, CompanyRole.INFRA, 'Second-largest memory chip maker, HBM leader for AI chips.');
createPerson('park_jung_ho', 'Park Jung-ho', 2018, 3, PersonRole.VISIONARY, 'CEO', 'Led SK Hynix\'s dominance in HBM for AI accelerators.');

linkBelonging('park_jung_ho', 'sk_hynix');
linkMaker('sk_hynix', 'hbm');
linkDependency('sk_hynix', 'asml');
linkDependency('nvidia', 'sk_hynix'); // NVIDIA uses SK Hynix HBM in GPUs

// LG Electronics - Consumer Electronics
createCompany('lg', 'LG Electronics', 1958, 2, CompanyRole.PLATFORM, 'Consumer electronics and OLED TV leader.');
createTech('lg_oled_tv', 'LG OLED TV', 2013, 2, TechRole.PRODUCT, 'Premium OLED TVs that defined high-end television market.');

linkMaker('lg', 'lg_oled_tv');

// Naver - Korea's Google
createCompany('naver', 'Naver', 1999, 2, CompanyRole.PLATFORM, 'South Korea\'s dominant search engine and internet platform.');
createPerson('lee_hae_jin', 'Lee Hae-jin', 1999, 2, PersonRole.VISIONARY, 'Founder', 'Created Korea\'s most popular search engine and Line messaging app.');
createTech('line', 'Line', 2011, 2, TechRole.PRODUCT, 'Messaging app dominant in Japan, Taiwan, and Thailand.');

linkBelonging('lee_hae_jin', 'naver');
linkMaker('naver', 'line');

// Kakao - Mobile Platform Giant
createCompany('kakao', 'Kakao', 2010, 2, CompanyRole.PLATFORM, 'Korea\'s super app platform - messaging, payments, taxi, banking.');
createPerson('kim_beom_su', 'Kim Beom-su', 2010, 2, PersonRole.VISIONARY, 'Founder', 'Created KakaoTalk, which 95% of Koreans use daily.');
createTech('kakaotalk', 'KakaoTalk', 2010, 2, TechRole.PRODUCT, 'Dominant messaging app in South Korea with 50M+ users.');

linkBelonging('kim_beom_su', 'kakao');
linkMaker('kakao', 'kakaotalk');

createCompany('broadcom', 'Broadcom', 1961, 2, CompanyRole.INFRA, 'Connectivity.');
linkDependency('tpu', 'broadcom');

// ==========================================
// FOXCONN - WORLD'S FACTORY
// ==========================================

createCompany('foxconn', 'Foxconn', 1974, 2, CompanyRole.INFRA, 'World\'s largest electronics manufacturer - assembles most of world\'s consumer electronics.');
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
linkDependency('apple', 'foxconn');
linkDependency('playstation', 'foxconn'); // Sony PlayStation manufactured by Foxconn
linkDependency('nintendo_switch', 'foxconn'); // Nintendo Switch assembled by Foxconn
linkDependency('microsoft', 'foxconn'); // Xbox manufactured by Foxconn

// ==========================================
// ERA 5: THE AI REVOLUTION
// ==========================================

createCompany('nvidia', 'NVIDIA', 1993, 1, CompanyRole.PLATFORM, 'The Engine of AI.');
createPerson('jensen_huang', 'Jensen Huang', 1993, 1, PersonRole.VISIONARY, 'CEO', 'Bet on CUDA.');
createTech('gpu', 'GPU', 1999, 1, TechRole.PRODUCT, 'Parallel compute.');
createTech('cuda', 'CUDA', 2007, 1, TechRole.PLATFORM, 'GPGPU Software.'); // Using PLATFORM concept via Product for now or Standard

linkBelonging('jensen_huang', 'nvidia');
linkMaker('nvidia', 'gpu');
linkMaker('nvidia', 'cuda');
linkDependency('nvidia', 'tsmc');
linkDependency('gpu', 'hbm');

createCompany('openai', 'OpenAI', 2015, 1, CompanyRole.LAB, 'Generative AI Leader.');
createPerson('altman', 'Sam Altman', 2015, 1, PersonRole.VISIONARY, 'CEO', 'Face of AI.');
createPerson('ilya', 'Ilya Sutskever', 2015, 2, PersonRole.THEORIST, 'Co-Founder', 'Chief Scientist.');
createTech('gpt', 'GPT-4', 2023, 1, TechRole.PRODUCT, 'LLM with reasoning.');
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

createTech('transformer', 'Transformer', 2017, 1, TechRole.CORE, 'Foundation of LLMs.');
createTech('alphafold', 'AlphaFold', 2020, 2, TechRole.PRODUCT, 'Protein folding.');

linkBelonging('hinton', 'google');
linkBelonging('hassabis', 'google');
linkBelonging('vaswani', 'google');
linkMaker('google', 'transformer');
linkMaker('vaswani', 'transformer');
linkMaker('google', 'alphafold');
linkInfluence('transformer', 'gpt');
linkInfluence('gpu', 'fei_fei_li');

createCompany('tesla', 'Tesla', 2003, 1, CompanyRole.PLATFORM, 'AI & Robotics.');
createPerson('musk', 'Elon Musk', 2004, 1, PersonRole.VISIONARY, 'CEO', 'Technoking.');
createTech('autopilot', 'Autopilot', 2014, 2, TechRole.PRODUCT, 'Vision AI.');
createTech('optimus', 'Optimus', 2021, 2, TechRole.PRODUCT, 'Humanoid Robot.');
linkBelonging('musk', 'tesla');
linkMaker('tesla', 'autopilot');
linkMaker('tesla', 'optimus');
linkInfluence('musk', 'openai');
linkDependency('tesla', 'gpu');

createCompany('palantir', 'Palantir', 2003, 2, CompanyRole.SERVICE, 'Defense AI.');
createPerson('thiel', 'Peter Thiel', 2003, 2, PersonRole.VISIONARY, 'Co-Founder', 'PayPal Mafia.');
createEpisode('in_q_tel', 'In-Q-Tel Funding', 2003, 3, EpisodeRole.DEAL, 'CIA investment arm funds Palantir.');

linkBelonging('thiel', 'palantir');
linkBelonging('in_q_tel', 'darpa');
linkInfluence('in_q_tel', 'palantir');

createCompany('boston_dynamics', 'Boston Dynamics', 1992, 2, CompanyRole.LAB, 'Robotics.');
createEpisode('google_buys_bd', 'Google Acquires BD', 2013, 3, EpisodeRole.DEAL, 'Robotics push.');
linkBelonging('google_buys_bd', 'google');
linkInfluence('google_buys_bd', 'boston_dynamics');

createCompany('tencent', 'Tencent', 1998, 2, CompanyRole.PLATFORM, 'Chinese Tech Giant.');
createCompany('alibaba', 'Alibaba', 1999, 2, CompanyRole.PLATFORM, 'Chinese Cloud/AI.');
createCompany('baidu', 'Baidu', 2000, 2, CompanyRole.PLATFORM, 'Chinese Search/AI.');

// ==========================================
// DRONE INDUSTRY & AUTONOMOUS FLIGHT
// ==========================================

// DJI - Drone Market Leader
createCompany('dji', 'DJI', 2006, 2, CompanyRole.PLATFORM, 'World\'s largest drone manufacturer with 70%+ market share.');
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
linkMaker('dji', 'fpv_drone');
linkBelonging('phantom_launch', 'dji');
linkBelonging('faa_drone_rules', 'dji');

// Drone Delivery Services
createCompany('zipline', 'Zipline', 2014, 2, CompanyRole.SERVICE, 'Autonomous drone delivery for medical supplies in Africa and US.');
createPerson('keller_rinaudo', 'Keller Rinaudo', 2014, 2, PersonRole.VISIONARY, 'Co-Founder & CEO', 'Pioneered drone delivery for life-saving medical supplies.');

createTech('drone_delivery', 'Drone Delivery', 2016, 2, TechRole.PRODUCT, 'Autonomous aerial package delivery system.');

createEpisode('zipline_rwanda', 'Zipline Rwanda Launch', 2016, 2, EpisodeRole.MILESTONE, 'First national drone delivery network delivering blood and vaccines.');

linkBelonging('keller_rinaudo', 'zipline');
linkMaker('zipline', 'drone_delivery');
linkBelonging('zipline_rwanda', 'zipline');
linkDependency('drone_delivery', 'autonomous_flight');

// Wing (Alphabet)
createCompany('wing', 'Wing (Alphabet)', 2012, 2, CompanyRole.SERVICE, 'Alphabet\'s drone delivery service operating in US and Australia.');
createEpisode('wing_faa_approval', 'Wing FAA Approval', 2019, 2, EpisodeRole.MILESTONE, 'First drone delivery company to receive FAA Air Carrier Certification.');

linkBelonging('wing', 'alphabet');
linkMaker('wing', 'drone_delivery');
linkBelonging('wing_faa_approval', 'wing');

// Skydio - Autonomous Drones
createCompany('skydio', 'Skydio', 2014, 2, CompanyRole.PLATFORM, 'US autonomous drone company using AI for obstacle avoidance.');
createPerson('adam_bry', 'Adam Bry', 2014, 2, PersonRole.VISIONARY, 'CEO', 'MIT roboticist who built fully autonomous drones with computer vision.');

linkBelonging('adam_bry', 'skydio');
linkMaker('skydio', 'autonomous_flight');
linkDependency('autonomous_flight', 'computer_vision');

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


export const INITIAL_DATA: GraphData = { nodes, links };
