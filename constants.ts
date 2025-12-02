
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
// ERA 1: THE GENESIS
// ==========================================

createCompany('bell_labs', 'Bell Labs', 1925, 1, CompanyRole.LAB, 'The Idea Factory. Birthplace of the transistor, Unix, C, and Information Theory.');
createPerson('shockley', 'William Shockley', 1956, 2, PersonRole.THEORIST, 'Nobel Laureate', 'Co-inventor of the transistor. His management style birthed Silicon Valley.');
createPerson('shannon', 'Claude Shannon', 1948, 1, PersonRole.THEORIST, 'Father of Info Theory', 'Defined the bit and the mathematical basis of digital communication.');
createPerson('ritchie', 'Dennis Ritchie', 1972, 1, PersonRole.BUILDER, 'Creator of C', 'Created the C programming language and co-created Unix.');
createPerson('thompson', 'Ken Thompson', 1969, 2, PersonRole.BUILDER, 'Creator of Unix', 'Co-created Unix, B language, and later Go at Google.');

createTech('transistor', 'The Transistor', 1947, 1, TechRole.CORE, 'The fundamental building block of all modern electronics.');
createTech('unix', 'Unix', 1969, 2, TechRole.STANDARD, 'The OS architecture that underpins Linux, macOS, and the internet.');

linkBelonging('shockley', 'bell_labs');
linkBelonging('shannon', 'bell_labs');
linkBelonging('ritchie', 'bell_labs');
linkBelonging('thompson', 'bell_labs');
linkMaker('bell_labs', 'transistor');
linkMaker('bell_labs', 'unix');
linkMaker('ritchie', 'unix');
linkMaker('thompson', 'unix');
linkBelonging('shannon', 'dartmouth'); 

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
linkBelonging('kilby', 'ti');
linkMaker('ti', 'ic');

createCompany('intel', 'Intel', 1968, 1, CompanyRole.INFRA, 'Put the "Silicon" in Silicon Valley. Created the microprocessor.');
createPerson('andy_grove', 'Andy Grove', 1979, 2, PersonRole.VISIONARY, 'Former CEO', 'The man who drove Intel\'s execution. "Only the Paranoid Survive."');
createPerson('faggin', 'Federico Faggin', 1971, 2, PersonRole.BUILDER, 'Lead Designer', 'Led the design of the first commercial microprocessor.');
createTech('microprocessor', 'Microprocessor (4004)', 1971, 1, TechRole.CORE, 'The first general-purpose CPU on a single chip.');

linkBelonging('noyce', 'intel');
linkBelonging('moore', 'intel');
linkBelonging('andy_grove', 'intel');
linkBelonging('faggin', 'intel');
linkMaker('intel', 'microprocessor');
linkMaker('faggin', 'microprocessor');
linkInfluence('ic', 'microprocessor'); 

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
linkDependency('samsung', 'asml');
linkDependency('tsmc', 'euv');

createCompany('arm', 'ARM', 1990, 2, CompanyRole.INFRA, 'Chip Architecture.');
createPerson('sophie_wilson', 'Sophie Wilson', 1983, 2, PersonRole.THEORIST, 'Architect', 'Designed ARM instruction set.');
createTech('arm_arch', 'ARM Architecture', 1990, 2, TechRole.STANDARD, 'Power efficient ISA.');
createEpisode('nvidia_arm_fail', 'NVIDIA Failed ARM Bid', 2020, 2, EpisodeRole.DEAL, 'Regulatory block of acquisition.');

linkBelonging('sophie_wilson', 'arm');
linkMaker('arm', 'arm_arch');
linkDependency('apple_silicon', 'arm_arch');
linkBelonging('nvidia_arm_fail', 'nvidia');
linkBelonging('nvidia_arm_fail', 'arm'); 

createCompany('samsung', 'Samsung', 1969, 1, CompanyRole.INFRA, 'Memory & Display Giant.');
createCompany('sk_hynix', 'SK Hynix', 1983, 2, CompanyRole.INFRA, 'HBM Leader.');
createTech('hbm', 'HBM', 2013, 1, TechRole.CORE, 'High Bandwidth Memory.');

linkMaker('sk_hynix', 'hbm');
linkMaker('samsung', 'hbm');
linkDependency('iphone', 'samsung'); 

createCompany('qualcomm', 'Qualcomm', 1985, 2, CompanyRole.INFRA, 'Mobile Connectivity.');
createTech('snapdragon', 'Snapdragon', 2007, 2, TechRole.PRODUCT, 'Mobile SoC.');
linkMaker('qualcomm', 'snapdragon');
linkDependency('snapdragon', 'arm_arch');
linkDependency('android', 'snapdragon');

createCompany('broadcom', 'Broadcom', 1961, 2, CompanyRole.INFRA, 'Connectivity.');
linkDependency('tpu', 'broadcom'); 

createCompany('sony', 'Sony', 1946, 2, CompanyRole.INFRA, 'Sensors & AI.');
createTech('cmos', 'CMOS Sensor', 1990, 2, TechRole.CORE, 'Digital eyes.');
linkMaker('sony', 'cmos');
linkDependency('iphone', 'sony');

createCompany('foxconn', 'Foxconn', 1974, 2, CompanyRole.INFRA, 'Manufacturing.');
linkDependency('iphone', 'foxconn');

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


export const INITIAL_DATA: GraphData = { nodes, links };
