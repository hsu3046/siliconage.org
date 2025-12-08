import { Category, GraphData, LinkType, ArrowHead, LinkIcon, NodeData, LinkData, PersonRole, TechRole, CompanyCategory, Role, TechCategoryL1, TechCategoryL2, EventData } from './types';

// Visual Colors mapped to categories
export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.COMPANY]: '#ef4444', // Red
  [Category.PERSON]: '#3b82f6',  // Blue
  [Category.TECHNOLOGY]: '#10b981', // Emerald
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
  [CompanyCategory.ACADEMY_LAB]: '#a855f7',       // Purple-500
  [CompanyCategory.MANUFACTURING_SUPPLY]: '#475569', // Slate-600
  [CompanyCategory.CONSUMER_DEVICE]: '#f59e0b',   // Amber-500
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
  [CompanyCategory.ACADEMY_LAB]: 'Academy & Lab',
  [CompanyCategory.MANUFACTURING_SUPPLY]: 'Manufacturing & Supply',
  [CompanyCategory.CONSUMER_DEVICE]: 'Consumer Device',
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
const events: EventData[] = [];

// Event helper function for adding timeline events without creating nodes
const addEvent = (
  story: string,
  year: number,
  endYear?: number,
  relatedNodes?: string[]
) => {
  const id = `event_${events.length}`;
  events.push({ id, story, year, endYear, relatedNodes });
};

// Extended helper with metadata support
const createCompany = (
  id: string, label: string, year: number, description: string,
  companyCategory: CompanyCategory,
  meta?: { marketCap?: { current?: string; peak?: string } }
) => {
  nodes.push({ id, label, category: Category.COMPANY, year, description, companyCategories: [companyCategory], ...meta });
};

const createPerson = (
  id: string, label: string, year: number, impactRole: PersonRole, description: string,
  meta?: { primaryRole?: string; secondaryRole?: string; birthYear?: number; deathYear?: number }
) => {
  nodes.push({ id, label, category: Category.PERSON, year, impactRole, description, ...meta });
};

const createTech = (
  id: string, label: string, year: number, impactRole: TechRole, description: string,
  l1?: TechCategoryL1, l2?: TechCategoryL2,
  meta?: { endYear?: number }
) => {
  nodes.push({ id, label, category: Category.TECHNOLOGY, year, impactRole, description, techCategoryL1: l1, techCategoryL2: l2, ...meta });
};

// Link helper functions with ArrowHead and optional LinkIcon
// All functions support optional: story, startYear, endYear

const linkPowers = (
  source: string,
  target: string,
  story?: string,
  startYear?: number,
  endYear?: number
) => {
  links.push({
    source, target,
    type: LinkType.POWERS,
    arrow: ArrowHead.SINGLE,
    icon: LinkIcon.POWERS,
    strength: 1.0,
    story, startYear, endYear
  });
};

const linkCreates = (
  source: string,
  target: string,
  story?: string,
  startYear?: number,
  endYear?: number
) => {
  links.push({
    source, target,
    type: LinkType.CREATES,
    arrow: ArrowHead.SINGLE,
    icon: LinkIcon.SPARK,
    strength: 0.9,
    story, startYear, endYear
  });
};

const linkContributes = (
  source: string,
  target: string,
  story?: string,
  startYear?: number,
  endYear?: number
) => {
  links.push({
    source, target,
    type: LinkType.CONTRIBUTES,
    arrow: ArrowHead.SINGLE,
    strength: 0.5,
    story, startYear, endYear
  });
};

// ENGAGES 관계 함수 (경쟁/협력)
// linkRival: 경쟁 관계 (예: Apple ↔ Samsung)
const linkRival = (
  source: string,
  target: string,
  story?: string,
  startYear?: number,
  endYear?: number
) => {
  links.push({
    source, target,
    type: LinkType.ENGAGES,
    arrow: ArrowHead.DOUBLE,
    icon: LinkIcon.RIVALRY,
    strength: 0.8,
    story, startYear, endYear
  });
};

// linkPartner: 협력/파트너 관계 (예: Microsoft ↔ OpenAI)
const linkPartner = (
  source: string,
  target: string,
  story?: string,
  startYear?: number,
  endYear?: number
) => {
  links.push({
    source, target,
    type: LinkType.ENGAGES,
    arrow: ArrowHead.DOUBLE,
    icon: LinkIcon.HEART,
    strength: 0.8,
    story, startYear, endYear
  });
};


// --- DATA ENTRY START ---

// ==============================================================================
// 1. TECHNOLOGY NODES [Total: 117]
// ==============================================================================

// [L0] Theoretical Foundations & Physics [Total: 4]
createTech('turing_machine', 'Turing Machine', 1936, TechRole.L0_THEORY_PHYSICS, 'The theoretical blueprint for all computers. It defines the limits of what machines can calculate.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('transistor', 'The Transistor', 1947, TechRole.L0_THEORY_PHYSICS, 'A tiny electronic switch. Billions of them pack onto chips to control the flow of electricity.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('info_theory', 'Information Theory', 1948, TechRole.L0_THEORY_PHYSICS, 'The math of the digital age. It defined "bits" and how to transmit data without errors.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('rsa', 'RSA Encryption', 1977, TechRole.L0_THEORY_PHYSICS, 'The digital lock and key system that keeps passwords and credit cards safe on the internet.', 'Fundamental Concepts', 'Theories & Architectures');

// [L1] Core Hardware & Infrastructure [Total: 40]
createTech('lithography', 'Lithography', 1957, TechRole.L1_CORE_HARDWARE, 'A process using light to print incredibly tiny, complex circuit patterns onto silicon chips.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('ic', 'Integrated Circuit', 1959, TechRole.L1_CORE_HARDWARE, 'Putting many transistors on a single chip. It solved the "tyranny of numbers" and shrank computers.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('ibm_360', 'IBM System/360', 1964, TechRole.L1_CORE_HARDWARE, 'The mainframe that standardized software, allowing companies to upgrade hardware without rewriting code.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('dram', 'DRAM', 1968, TechRole.L1_CORE_HARDWARE, 'The computer\'s short-term memory. It holds the data your apps are using right now.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('optical_fiber', 'Optical Fiber', 1970, TechRole.L1_CORE_HARDWARE, 'Glass strands that send data as pulses of light, forming the high-speed backbone of the internet.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('microprocessor', 'Microprocessor', 1971, TechRole.L1_CORE_HARDWARE, 'The entire brain of a computer compressed onto a single chip. It sparked the PC revolution.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('floppy', 'Floppy Disk', 1971, TechRole.L1_CORE_HARDWARE, 'The save icon in real life. Portable disks that moved software and files before the internet.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('ethernet', 'Ethernet', 1973, TechRole.L1_CORE_HARDWARE, 'The standard cable system for connecting computers together in a local network (LAN).', 'Network & Connectivity', 'Network Architecture');
createTech('x86', 'x86 Architecture', 1978, TechRole.L1_CORE_HARDWARE, 'The dominant language of PC processors. It has defined desktop computing for decades.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('gps', 'GPS', 1978, TechRole.L1_CORE_HARDWARE, 'A satellite network that provides precise location and timing anywhere on Earth.', 'Network & Connectivity', 'Telecommunications');
createTech('optical_disc', 'Optical Disc', 1982, TechRole.L1_CORE_HARDWARE, 'A digital storage format using lasers (CD/DVD), revolutionizing music and software distribution.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('tcp_ip', 'TCP/IP', 1983, TechRole.L1_CORE_HARDWARE, 'The common language of the internet that allows different networks to connect and talk.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('arm_arch', 'ARM Architecture', 1985, TechRole.L1_CORE_HARDWARE, 'A power-efficient chip design. It is the reason your smartphone battery lasts all day.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('cisco_router', 'Cisco Router', 1986, TechRole.L1_CORE_HARDWARE, 'The traffic cop of the internet. It directs data packets to ensure they reach the right destination.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('foundry_model', 'Foundry Model', 1987, TechRole.L1_CORE_HARDWARE, 'A business model separating chip design from manufacturing. It enabled the rise of NVIDIA and AMD.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('nand', 'NAND Flash', 1987, TechRole.L1_CORE_HARDWARE, 'Storage that remembers data without power. It lives inside your USB drives, SSDs, and phone.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('cdma', 'CDMA', 1989, TechRole.L1_CORE_HARDWARE, 'A wireless technology that optimized radio signals, laying the groundwork for 3G networks.', 'Network & Connectivity', 'Telecommunications');
createTech('gsm', 'GSM', 1991, TechRole.L1_CORE_HARDWARE, 'The first global standard for digital mobile phones, enabling SMS and international roaming.', 'Network & Connectivity', 'Telecommunications');
createTech('li_ion', 'Li-ion Battery', 1991, TechRole.L1_CORE_HARDWARE, 'High-energy rechargeable batteries. They make smartphones, laptops, and electric cars possible.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('mp3', 'MP3', 1993, TechRole.L1_CORE_HARDWARE, 'A way to compress audio files. It put a thousand songs in your pocket and disrupted music.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('cmos', 'CMOS Sensor', 1993, TechRole.L1_CORE_HARDWARE, 'The electronic eye. An affordable image sensor that turned every phone into a digital camera.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('blue_led', 'Blue LED', 1994, TechRole.L1_CORE_HARDWARE, 'The breakthrough needed to create white LED light. It made energy-efficient screens possible.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('bluetooth', 'Bluetooth', 1994, TechRole.L1_CORE_HARDWARE, 'A wireless cord. It connects headphones, keyboards, and mice to devices over short distances.', 'Network & Connectivity', 'Telecommunications');
createTech('ssl_tls', 'SSL/TLS', 1995, TechRole.L1_CORE_HARDWARE, 'The security protocol that puts the "S" in HTTPS, protecting online banking and shopping.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('wifi', 'WiFi', 1997, TechRole.L1_CORE_HARDWARE, 'Wireless internet. It cut the ethernet cables and let us get online from the couch.', 'Network & Connectivity', 'Telecommunications');
createTech('gpu_geforce', 'GPU (GeForce)', 1999, TechRole.L1_CORE_HARDWARE, 'Originally for gaming graphics, now the heavy lifter for AI training and deep learning.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('arm_cortex', 'ARM Cortex', 2004, TechRole.L1_CORE_HARDWARE, 'The specific processor cores found inside nearly every modern Android and iPhone.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('lidar', 'LiDAR', 2005, TechRole.L1_CORE_HARDWARE, 'Laser radar. It uses light pulses to create 3D maps, acting as the eyes for self-driving cars.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('lte', 'LTE (4G)', 2009, TechRole.L1_CORE_HARDWARE, 'The 4th gen mobile network that brought true broadband speeds to phones, enabling video streaming.', 'Network & Connectivity', 'Telecommunications');
createTech('alexnet', 'AlexNet', 2012, TechRole.L1_CORE_HARDWARE, 'The AI model that proved deep learning works, winning an image contest and starting the AI boom.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('hbm', 'HBM', 2013, TechRole.L1_CORE_HARDWARE, 'Stacked, ultra-fast memory. It feeds data to AI chips quickly enough to train massive models.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('word2vec', 'Word2Vec', 2013, TechRole.L1_CORE_HARDWARE, 'A technique that teaches computers the meaning of words by analyzing their context.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('gan', 'GAN', 2014, TechRole.L1_CORE_HARDWARE, 'Two AI networks competing against each other to generate realistic fake images.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('tpu', 'Google TPU', 2015, TechRole.L1_CORE_HARDWARE, 'A custom chip built by Google specifically to accelerate machine learning workloads.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('transformer', 'Transformer', 2017, TechRole.L1_CORE_HARDWARE, 'The architecture that pays attention to context. It is the secret sauce behind ChatGPT.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('5g_nr', '5G (New Radio)', 2019, TechRole.L1_CORE_HARDWARE, 'The latest mobile network offering massive speed and capacity for a hyper-connected world.', 'Network & Connectivity', 'Telecommunications');
createTech('euv', 'EUV Lithography', 2019, TechRole.L1_CORE_HARDWARE, 'A manufacturing miracle using extreme UV light to print the world\'s most advanced chips.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('stable_diffusion', 'Stable Diffusion', 2022, TechRole.L1_CORE_HARDWARE, 'An open AI that turns text into images, bringing art generation to personal computers.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('nvidia_h100', 'NVIDIA H100', 2022, TechRole.L1_CORE_HARDWARE, 'The engine of the AI revolution. A massive GPU designed specifically to train smart models.', 'Hardware & Infrastructure', 'Processors & Compute');

// [L2] Runtime, Platforms & Protocols [Total: 23]
createTech('unix', 'Unix', 1969, TechRole.L2_RUNTIME_PLATFORM, 'An operating system philosophy of simplicity. It is the grandfather of Linux and macOS.', 'System Software', 'Operating Systems (OS)');
createTech('c_lang', 'C Language', 1972, TechRole.L2_RUNTIME_PLATFORM, 'The building block of software. It allows code to run fast and close to the hardware.', 'System Software', 'Development & Languages');
createTech('sql', 'SQL', 1974, TechRole.L2_RUNTIME_PLATFORM, 'The standard language for asking questions to databases and managing organized information.', 'System Software', 'Development & Languages');
createTech('oracle_db', 'Oracle Database', 1979, TechRole.L2_RUNTIME_PLATFORM, 'The gold standard for enterprise databases, powering the back-end of global business.', 'System Software', 'Development & Languages');
createTech('www', 'World Wide Web', 1989, TechRole.L2_RUNTIME_PLATFORM, 'The system of interlinked pages accessed via the internet. It made the net usable for everyone.', 'Network & Connectivity', 'Network Architecture');
createTech('linux', 'Linux Kernel', 1991, TechRole.L2_RUNTIME_PLATFORM, 'A free, open-source OS kernel that runs the internet, the cloud, and all Android phones.', 'System Software', 'Operating Systems (OS)');
createTech('python', 'Python', 1991, TechRole.L2_RUNTIME_PLATFORM, 'A readable programming language that became the primary tool for AI and data science.', 'System Software', 'Development & Languages');
createTech('windows_95', 'Windows 95', 1995, TechRole.L2_RUNTIME_PLATFORM, 'The OS that introduced the Start menu and brought easy computing to the masses.', 'System Software', 'Operating Systems (OS)');
createTech('java', 'Java', 1995, TechRole.L2_RUNTIME_PLATFORM, 'A language designed to "write once, run anywhere." It powered the early web and Android.', 'System Software', 'Development & Languages');
createTech('javascript', 'JavaScript', 1995, TechRole.L2_RUNTIME_PLATFORM, 'The language of the web browser. It makes websites interactive instead of just static text.', 'System Software', 'Development & Languages');
createTech('unreal', 'Unreal Engine', 1998, TechRole.L2_RUNTIME_PLATFORM, 'A powerful engine for high-fidelity 3D graphics, used in games and movie production.', 'System Software', 'Development & Languages');
createTech('bittorrent', 'BitTorrent', 2001, TechRole.L2_RUNTIME_PLATFORM, 'A decentralized way to share large files. It proved the power of peer-to-peer networks.', 'Network & Connectivity', 'Standards & Protocols');
createTech('mapreduce', 'MapReduce', 2004, TechRole.L2_RUNTIME_PLATFORM, 'Google\'s method for splitting big tasks across thousands of servers to process data.', 'System Software', 'Development & Languages');
createTech('git', 'Git', 2005, TechRole.L2_RUNTIME_PLATFORM, 'A time machine for code. It helps developers track changes and collaborate on software.', 'System Software', 'Development & Languages');
createTech('unity', 'Unity', 2005, TechRole.L2_RUNTIME_PLATFORM, 'A versatile platform for building games and 3D apps, democratizing game development.', 'System Software', 'Development & Languages');
createTech('aws_cloud', 'AWS Cloud', 2006, TechRole.L2_RUNTIME_PLATFORM, 'Infrastructure as a Service. It lets anyone rent massive computing power over the internet.', 'Network & Connectivity', 'Network Architecture');
createTech('cuda', 'CUDA', 2007, TechRole.L2_RUNTIME_PLATFORM, 'NVIDIA\'s platform that lets graphics cards do general computing, the foundation of AI.', 'System Software', 'Development & Languages');
createTech('ios', 'iOS', 2007, TechRole.L2_RUNTIME_PLATFORM, 'The operating system that powers the iPhone, defining the modern mobile user experience.', 'System Software', 'Operating Systems (OS)');
createTech('android', 'Android', 2008, TechRole.L2_RUNTIME_PLATFORM, 'The open mobile OS that powers the vast majority of the world\'s smartphones.', 'System Software', 'Operating Systems (OS)');
createTech('zero_trust', 'Zero Trust', 2010, TechRole.L2_RUNTIME_PLATFORM, 'A security model that assumes no user or device is safe, verifying every single request.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('docker', 'Docker', 2013, TechRole.L2_RUNTIME_PLATFORM, 'Packages software into shipping containers, so it runs the same on any machine.', 'System Software', 'Development & Languages');
createTech('tensorflow', 'TensorFlow', 2015, TechRole.L2_RUNTIME_PLATFORM, 'Google\'s open-source library for building and training machine learning models.', 'System Software', 'Development & Languages');
createTech('pytorch', 'PyTorch', 2016, TechRole.L2_RUNTIME_PLATFORM, 'Meta\'s AI library. Researchers love it for its flexibility and ease of use.', 'System Software', 'Development & Languages');

// [L3] End Applications, Services & Devices [Total: 50]
createTech('walkman', 'Sony Walkman', 1979, TechRole.L3_END_APPLICATION, 'It allowed people to carry their music with them, changing audio consumption forever.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('macintosh', 'Macintosh', 1984, TechRole.L3_END_APPLICATION, 'The first mass-market computer with a mouse and graphical screen. It made computing friendly.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('toshiba_t1100', 'Toshiba T1100', 1985, TechRole.L3_END_APPLICATION, 'The first commercially successful laptop. It established the clamshell shape we use today.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('excel', 'Microsoft Excel', 1985, TechRole.L3_END_APPLICATION, 'The definitive spreadsheet. It replaced paper ledgers and became the language of business.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('photoshop', 'Adobe Photoshop', 1990, TechRole.L3_END_APPLICATION, 'The verb for editing images. It set the standard for digital creativity.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('mosaic', 'Mosaic Browser', 1993, TechRole.L3_END_APPLICATION, 'The first web browser to display images inline with text, sparking the internet boom.', 'System Software', 'Development & Languages');
createTech('netscape', 'Netscape Navigator', 1994, TechRole.L3_END_APPLICATION, 'The browser that commercialized the web and fought Microsoft in the first browser war.', 'Digital Services & Platforms', 'Search & Information');
createTech('amazon_com', 'Amazon.com', 1994, TechRole.L3_END_APPLICATION, 'Started as a bookstore, became the "Everything Store" and defined online shopping.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('netflix', 'Netflix', 1997, TechRole.L3_END_APPLICATION, 'Shifted from DVD rentals to streaming, changing how the world watches TV.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('google_search', 'Google Search', 1998, TechRole.L3_END_APPLICATION, 'The engine that organized the world\'s information and made it universally accessible.', 'Digital Services & Platforms', 'Search & Information');
createTech('paypal', 'PayPal', 1998, TechRole.L3_END_APPLICATION, 'A safe way to send money online. It spawned the "PayPal Mafia" of tech founders.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('salesforce_crm', 'Salesforce CRM', 1999, TechRole.L3_END_APPLICATION, 'Pioneered "Software as a Service," delivering enterprise tools via the web.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('wikipedia', 'Wikipedia', 2001, TechRole.L3_END_APPLICATION, 'A free encyclopedia written by volunteers. It democratized the world\'s knowledge.', 'Digital Services & Platforms', 'Search & Information');
createTech('skype', 'Skype', 2003, TechRole.L3_END_APPLICATION, 'Popularized free video calls over the internet, making the world feel smaller.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('linkedin', 'LinkedIn', 2003, TechRole.L3_END_APPLICATION, 'The social network for work. It moved the rolodex and resume online.', 'Digital Services & Platforms', 'Social & Media');
createTech('facebook', 'Facebook', 2004, TechRole.L3_END_APPLICATION, 'Connected billions of people. It defined the social media era and the news feed.', 'Digital Services & Platforms', 'Social & Media');
createTech('youtube', 'YouTube', 2005, TechRole.L3_END_APPLICATION, 'Broadcast Yourself. It democratized video creation and entertainment.', 'Digital Services & Platforms', 'Social & Media');
createTech('twitter', 'Twitter', 2006, TechRole.L3_END_APPLICATION, 'The town square of the internet. A real-time feed of news and conversation.', 'Digital Services & Platforms', 'Social & Media');
createTech('iphone', 'iPhone', 2007, TechRole.L3_END_APPLICATION, 'Combined a phone, iPod, and internet communicator. It put the internet in our pockets.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('spotify', 'Spotify', 2008, TechRole.L3_END_APPLICATION, 'Saved the music industry from piracy by offering legal, instant streaming access.', 'Digital Services & Platforms', 'Social & Media');
createTech('app_store', 'App Store', 2008, TechRole.L3_END_APPLICATION, 'A centralized marketplace that made it safe and easy to install software on phones.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('google_chrome', 'Google Chrome', 2008, TechRole.L3_END_APPLICATION, 'A fast, minimalist browser that became the operating system for the modern web.', 'Digital Services & Platforms', 'Search & Information');
createTech('github', 'GitHub', 2008, TechRole.L3_END_APPLICATION, 'Social coding. The home for open-source software and developer collaboration.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('bitcoin', 'Bitcoin', 2009, TechRole.L3_END_APPLICATION, 'Digital gold. The first decentralized currency based on blockchain technology.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('uber_app', 'Uber App', 2010, TechRole.L3_END_APPLICATION, 'Push a button, get a ride. It pioneered the gig economy and on-demand transport.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('stripe', 'Stripe', 2010, TechRole.L3_END_APPLICATION, 'Seven lines of code that let any website accept payments. Infrastructure for the internet.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('wechat', 'WeChat', 2011, TechRole.L3_END_APPLICATION, 'The Chinese super-app. It combines messaging, social media, and payments in one.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('zoom', 'Zoom', 2011, TechRole.L3_END_APPLICATION, 'The video tool that just worked. It became the default for remote work and connection.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('model_s', 'Tesla Model S', 2012, TechRole.L3_END_APPLICATION, 'The car that proved EVs could be fast, beautiful, and have long range.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('raspberry_pi', 'Raspberry Pi', 2012, TechRole.L3_END_APPLICATION, 'A tiny, cheap computer designed to teach coding and power DIY electronics projects.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('dji_phantom', 'DJI Phantom', 2013, TechRole.L3_END_APPLICATION, 'The ready-to-fly drone that popularized aerial photography for everyone.', 'AI & Physical Systems', 'Robotics');
createTech('slack', 'Slack', 2013, TechRole.L3_END_APPLICATION, 'Chat for work. It replaced internal email with channels and instant messaging.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('tesla_autopilot', 'Tesla Autopilot', 2014, TechRole.L3_END_APPLICATION, 'Tesla\'s driver-assistance system. It paved the way for consumer self-driving tech.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('ethereum', 'Ethereum', 2015, TechRole.L3_END_APPLICATION, 'A blockchain that runs code. It enabled smart contracts, DeFi, and NFTs.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('alphago', 'AlphaGo', 2016, TechRole.L3_END_APPLICATION, 'The AI that shocked the world by beating a human champion at the complex game of Go.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('tiktok', 'TikTok', 2016, TechRole.L3_END_APPLICATION, 'Short-form video fed by an uncanny algorithm. It changed how we consume media.', 'Digital Services & Platforms', 'Social & Media');
createTech('oculus_rift', 'Oculus Rift', 2016, TechRole.L3_END_APPLICATION, 'The headset that kickstarted the modern consumer Virtual Reality market.', 'AI & Physical Systems', 'Spatial Computing');
createTech('alphago_zero', 'AlphaGo Zero', 2017, TechRole.L3_END_APPLICATION, 'An AI that learned Go by playing against itself, without learning from human games.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('starlink', 'Starlink', 2019, TechRole.L3_END_APPLICATION, 'A constellation of satellites providing high-speed internet to remote corners of Earth.', 'Network & Connectivity', 'Telecommunications');
createTech('fugaku', 'Fujitsu Fugaku', 2020, TechRole.L3_END_APPLICATION, 'The supercomputer that proved ARM chips could power the world\'s fastest machines.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('copilot', 'GitHub Copilot', 2021, TechRole.L3_END_APPLICATION, 'An AI pair programmer. It helps developers write code faster by suggesting completions.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('chatgpt', 'ChatGPT', 2022, TechRole.L3_END_APPLICATION, 'The chatbot that speaks like a human. It brought AI into the mainstream conversation.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('midjourney', 'Midjourney', 2022, TechRole.L3_END_APPLICATION, 'An AI artist. It creates stunning, photorealistic images from simple text prompts.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('perplexity', 'Perplexity', 2022, TechRole.L3_END_APPLICATION, 'An AI answer engine. It reads the web and gives you summaries with citations.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('spacex_falcon9', 'Falcon 9', 2010, TechRole.L3_END_APPLICATION, 'The rocket that lands. It drastically lowered the cost of going to space.', 'AI & Physical Systems', 'Robotics');
createTech('starship', 'Starship', 2023, TechRole.L3_END_APPLICATION, 'A massive, fully reusable rocket designed to carry humanity to Mars.', 'AI & Physical Systems', 'Robotics');
createTech('gemini', 'Google Gemini', 2023, TechRole.L3_END_APPLICATION, 'Google\'s multimodal AI. It understands text, code, images, and video natively.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('claude', 'Claude', 2023, TechRole.L3_END_APPLICATION, 'An AI assistant built with safety in mind. It excels at reading long documents.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('cursor', 'Cursor', 2023, TechRole.L3_END_APPLICATION, 'A code editor built for the AI era. It integrates LLMs directly into the coding workflow.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('sora', 'Sora', 2024, TechRole.L3_END_APPLICATION, 'An AI that dreams up realistic videos from simple text, understanding physics and motion.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('vision_pro', 'Apple Vision Pro', 2024, TechRole.L3_END_APPLICATION, 'Apple\'s spatial computer. It blends digital content with the physical world.', 'AI & Physical Systems', 'Spatial Computing');

// ==============================================================================
// 2. COMPANY NODES [Total: 46]
// ==============================================================================

// [Semiconductors & Core Infrastructure] Total: 10
createCompany('fairchild', 'Fairchild Semi', 1957, 'The startup that started it all. Its alumni founded Intel, AMD, and Silicon Valley itself.', CompanyCategory.SEMICONDUCTOR);
createCompany('intel', 'Intel', 1968, 'Put the "Silicon" in Silicon Valley. They created the microprocessor and dominate PCs.', CompanyCategory.SEMICONDUCTOR);
createCompany('amd', 'AMD', 1969, 'The persistent rival. They innovated in high-performance CPUs and challenged Intel\'s dominance.', CompanyCategory.SEMICONDUCTOR);
createCompany('nvidia', 'NVIDIA', 1993, 'Started with gaming graphics, now the engine of AI. Their chips train the world\'s models.', CompanyCategory.SEMICONDUCTOR);
createCompany('arm_ltd', 'Arm Holdings', 1990, 'They design the energy-efficient chip architecture found in almost every smartphone.', CompanyCategory.SEMICONDUCTOR);
createCompany('samsung', 'Samsung', 1969, 'A global electronics titan. They lead the world in memory chips, phones, and displays.', CompanyCategory.SEMICONDUCTOR);
createCompany('qualcomm', 'Qualcomm', 1985, 'The leader in mobile connectivity. Their tech connects your phone to 4G and 5G networks.', CompanyCategory.SEMICONDUCTOR);
createCompany('att', 'AT&T', 1885, 'The telecom monopoly (Ma Bell) that built the physical network infrastructure of the US.', CompanyCategory.INFRA_TELECOM);
createCompany('cisco', 'Cisco', 1984, 'The internet\'s plumber. Their routers and switches direct traffic across the global network.', CompanyCategory.INFRA_TELECOM);
createCompany('spacex', 'SpaceX', 2002, 'Revolutionizing spaceflight with reusable rockets. Their goal is to make life multi-planetary.', CompanyCategory.HARDWARE_ROBOTICS);

// [Hardware, Robotics & Devices] Total: 6
createCompany('ibm', 'IBM', 1911, 'Big Blue. They defined the mainframe era and helped launch the personal computer market.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('tesla', 'Tesla', 2003, 'More than a car company. They made EVs desirable and are pushing robotics and autonomy.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('dji', 'DJI', 2006, 'The absolute leader in consumer drones. They made aerial photography accessible to all.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('boston_dynamics', 'Boston Dynamics', 1992, 'Engineering dynamic robots that move with uncanny agility, mimicking humans and animals.', CompanyCategory.HARDWARE_ROBOTICS);

// [Software, SaaS & Enterprise] Total: 5
createCompany('microsoft', 'Microsoft', 1975, 'Software for the world. From Windows to Azure and OpenAI, they are a productivity giant.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('oracle', 'Oracle', 1977, 'The database giant. Their software manages the critical data for the world\'s largest companies.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('adobe', 'Adobe', 1982, 'The creator\'s toolkit. They standardized digital imaging and electronic documents.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('salesforce_co', 'Salesforce', 1999, 'The cloud pioneer. They replaced installed software with web-based business tools.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('sap', 'SAP', 1972, 'The backbone of global business. Their software manages operations for huge corporations.', CompanyCategory.ENTERPRISE_SAAS);

// [Internet, Platform & Consumer Services] Total: 13
createCompany('google', 'Google', 1998, 'Organized the world\'s information. From Search to Android, they define the internet.', CompanyCategory.PLATFORM_INTERNET);
createCompany('amazon', 'Amazon', 1994, 'The "Everything Store". They also built AWS, the cloud that runs half the internet.', CompanyCategory.PLATFORM_INTERNET);
createCompany('meta', 'Meta', 2004, 'Connecting people. They own Facebook, Instagram, and WhatsApp, and are betting on VR.', CompanyCategory.PLATFORM_INTERNET);
createCompany('tencent', 'Tencent', 1998, 'The giant behind WeChat. They dominate social media, gaming, and payments in China.', CompanyCategory.PLATFORM_INTERNET);
createCompany('alibaba', 'Alibaba', 1999, 'The e-commerce titan of China. They revolutionized digital retail and fintech.', CompanyCategory.PLATFORM_INTERNET);
createCompany('bytedance', 'ByteDance', 2012, 'The algorithm company. They built TikTok, the world\'s most addictive content platform.', CompanyCategory.PLATFORM_INTERNET);
createCompany('uber_co', 'Uber', 2009, 'Transportation on demand. They connected riders and drivers, creating the gig economy.', CompanyCategory.PLATFORM_INTERNET);
createCompany('airbnb', 'Airbnb', 2008, 'Hospitality by the people. They turned spare rooms into a global network of accommodations.', CompanyCategory.PLATFORM_INTERNET);
createCompany('paypal_co', 'PayPal', 1998, 'The payments pioneer. Its "Mafia" of founders went on to build Tesla, YouTube, and more.', CompanyCategory.PLATFORM_INTERNET);
createCompany('stripe_co', 'Stripe', 2010, 'Payment infrastructure for the internet. They handle the complexity of money for startups.', CompanyCategory.PLATFORM_INTERNET);
createCompany('netscape_co', 'Netscape', 1994, 'The browser that mattered. They commercialized the web and sparked the dot-com boom.', CompanyCategory.PLATFORM_INTERNET);
createCompany('spotify_co', 'Spotify', 2006, 'Streaming savior. They convinced the world to pay for music access instead of ownership.', CompanyCategory.MEDIA_CONTENT);
createCompany('netflix_co', 'Netflix', 1997, 'Changed TV. They moved from mailing DVDs to streaming, pioneering the binge-watching era.', CompanyCategory.MEDIA_CONTENT);

// [AI Innovation & Labs] Total: 4
createCompany('deepmind', 'Google DeepMind', 2010, 'Solved intelligence. Famous for AlphaGo, they use AI to solve fundamental scientific problems.', CompanyCategory.AI_INNOVATION);
createCompany('openai', 'OpenAI', 2015, 'The lab behind ChatGPT. They pushed AI from research into a product used by millions.', CompanyCategory.AI_INNOVATION);
createCompany('anthropic', 'Anthropic', 2021, 'AI safety first. Founded by former OpenAI members to build reliable, steerable AI.', CompanyCategory.AI_INNOVATION);
createCompany('huggingface', 'Hugging Face', 2016, 'The GitHub of AI. An open community hub for sharing models, datasets, and demos.', CompanyCategory.AI_INNOVATION);

// [Venture Capital & Investment] Total: 4
createCompany('sequoia', 'Sequoia', 1972, 'The Midas touch. This VC firm backed Apple, Google, and NVIDIA when they were just ideas.', CompanyCategory.VENTURE_CAPITAL);
createCompany('ycombinator', 'Y Combinator', 2005, 'The startup factory. Their accelerator launched Airbnb, Stripe, and Dropbox.', CompanyCategory.VENTURE_CAPITAL);
createCompany('a16z', 'a16z', 2009, 'Software is eating the world. A modern VC firm that provides massive operational support.', CompanyCategory.VENTURE_CAPITAL);
createCompany('softbank', 'SoftBank Vision Fund', 2017, 'The world\'s largest technology-focused investment fund. They injected massive capital into unicorns like Uber and WeWork.', CompanyCategory.VENTURE_CAPITAL);

// [Academy & Labs] Total: 2
createCompany('xerox_parc', 'Xerox PARC', 1970, 'The research lab that invented the mouse, windows, and ethernet, inspiring the modern PC.', CompanyCategory.ACADEMY_LAB);
createCompany('bell_labs', 'Bell Labs', 1925, 'The "Idea Factory" of the 20th century. Transistors, lasers, and Unix were born here.', CompanyCategory.ACADEMY_LAB);

// [Manufacturing Supply Chain] Total: 2
createCompany('tsmc', 'TSMC', 1987, 'The world\'s chip factory. They manufacture the advanced chips designed by Apple and NVIDIA.', CompanyCategory.MANUFACTURING_SUPPLY);
createCompany('asml', 'ASML', 1984, 'The only company that makes the EUV machines needed to print the most advanced chips.', CompanyCategory.MANUFACTURING_SUPPLY);

// [Consumer Device] Total: 2
createCompany('apple', 'Apple', 1976, 'Design meets technology. They revolutionized computing with the Mac, iPod, and iPhone.', CompanyCategory.CONSUMER_DEVICE);
createCompany('sony', 'Sony', 1946, 'Changed entertainment with the Walkman. Now a leader in image sensors and gaming.', CompanyCategory.CONSUMER_DEVICE);


// ==============================================================================
// 3. PERSON NODES [Total: 46]
// ==============================================================================

// [The Pioneers & Theorists] Total: 7
createPerson('alan_turing', 'Alan Turing', 1912, PersonRole.THEORIST, 'The genius who cracked the Enigma code and conceived the theoretical basis of computers.', { primaryRole: 'Mathematician', secondaryRole: 'Cryptanalyst', deathYear: 1954 });
createPerson('claude_shannon', 'Claude Shannon', 1916, PersonRole.THEORIST, 'Father of Information Theory. He proved that all communication could be reduced to bits.', { primaryRole: 'Mathematician', secondaryRole: 'Electrical Engineer', deathYear: 2001 });
createPerson('william_shockley', 'William Shockley', 1910, PersonRole.THEORIST, 'Co-inventor of the transistor. A brilliant physicist whose difficult management sparked the Valley.', { primaryRole: 'Physicist', secondaryRole: 'Founder, Shockley Semi', deathYear: 1989 });
createPerson('dennis_ritchie', 'Dennis Ritchie', 1941, PersonRole.BUILDER, 'The architect. He created the C language and Unix, the foundation of modern software.', { primaryRole: 'Computer Scientist', secondaryRole: 'Creator of C', deathYear: 2011 });
createPerson('tim_berners_lee', 'Tim Berners-Lee', 1955, PersonRole.THEORIST, 'He gave the internet a face. He invented the World Wide Web, the browser, and HTML.', { primaryRole: 'Computer Scientist', secondaryRole: 'Inventor of WWW' });
createPerson('geoffrey_hinton', 'Geoffrey Hinton', 1947, PersonRole.THEORIST, 'The Godfather of AI. He believed in neural networks for decades until the world caught up.', { primaryRole: 'AI Researcher', secondaryRole: 'Turing Award Winner' });
createPerson('yann_lecun', 'Yann LeCun', 1960, PersonRole.THEORIST, 'The AI Scientist. He invented the convolutional networks that let computers "see".', { primaryRole: 'Chief AI Scientist, Meta', secondaryRole: 'Turing Award Winner' });

// [The Builders & Visionary Founders] Total: 11
createPerson('robert_noyce', 'Robert Noyce', 1927, PersonRole.VISIONARY, 'The "Mayor of Silicon Valley". He co-invented the microchip and co-founded Intel.', { primaryRole: 'Co-founder, Intel', secondaryRole: 'Co-founder, Fairchild', deathYear: 1990 });
createPerson('gordon_moore', 'Gordon Moore', 1929, PersonRole.VISIONARY, 'Predicted computing power would double every two years. His "Law" drove the industry.', { primaryRole: 'Co-founder, Intel', secondaryRole: 'Chairman Emeritus', deathYear: 2023 });
createPerson('steve_jobs', 'Steve Jobs', 1955, PersonRole.VISIONARY, 'The visionary who stood at the intersection of art and technology. He made gadgets personal.', { primaryRole: 'Co-founder, Apple', secondaryRole: 'Founder, NeXT', deathYear: 2011 });
createPerson('steve_wozniak', 'Steve Wozniak', 1950, PersonRole.BUILDER, 'The engineer\'s engineer. He single-handedly designed the Apple I and II computers.', { primaryRole: 'Co-founder, Apple', secondaryRole: 'Computer Engineer' });
createPerson('bill_gates', 'Bill Gates', 1955, PersonRole.VISIONARY, 'The coder who meant business. He realized software was the key and put Windows everywhere.', { primaryRole: 'Co-founder, Microsoft', secondaryRole: 'Co-chair, Gates Foundation' });
createPerson('larry_ellison', 'Larry Ellison', 1944, PersonRole.VISIONARY, 'The samurai of software. He built an empire on enterprise databases and ruthless tactics.', { primaryRole: 'Co-founder & CTO, Oracle', secondaryRole: 'Former CEO' });
createPerson('morris_chang', 'Morris Chang', 1931, PersonRole.VISIONARY, 'He revolutionized chips by creating the foundry model, building chips designed by others.', { primaryRole: 'Founder, TSMC', secondaryRole: 'Former Chairman' });
createPerson('linus_torvalds', 'Linus Torvalds', 1969, PersonRole.BUILDER, 'He wrote Linux for fun. It now runs the cloud. He also gave us Git to manage code.', { primaryRole: 'Software Engineer', secondaryRole: 'Creator of Linux' });
createPerson('jeff_bezos', 'Jeff Bezos', 1964, PersonRole.VISIONARY, 'He started selling books and ended up selling everything. He built the cloud (AWS) too.', { primaryRole: 'Founder, Amazon', secondaryRole: 'Founder, Blue Origin' });
createPerson('jensen_huang', 'Jensen Huang', 1963, PersonRole.VISIONARY, 'The visionary who bet on GPUs. He turned a graphics company into the engine of AI.', { primaryRole: 'Co-founder & CEO, NVIDIA', secondaryRole: 'Electrical Engineer' });
createPerson('marc_benioff', 'Marc Benioff', 1964, PersonRole.VISIONARY, 'He declared "No Software". He moved business tools to the cloud with Salesforce.', { primaryRole: 'Founder & CEO, Salesforce', secondaryRole: 'Philanthropist' });

// [The Internet Age & Modern Leaders] Total; 19
createPerson('larry_page', 'Larry Page', 1973, PersonRole.VISIONARY, 'He wanted to download the entire internet. He invented PageRank and co-founded Google.', { primaryRole: 'Co-founder, Google', secondaryRole: 'Former CEO, Alphabet' });
createPerson('sergey_brin', 'Sergey Brin', 1973, PersonRole.VISIONARY, 'The data scientist who co-founded Google. He helped organize the world\'s information.', { primaryRole: 'Co-founder, Google', secondaryRole: 'Computer Scientist' });
createPerson('reed_hastings', 'Reed Hastings', 1960, PersonRole.VISIONARY, 'He realized DVDs would die. He pivoted Netflix to streaming and changed TV forever.', { primaryRole: 'Co-founder, Netflix', secondaryRole: 'Executive Chairman' });
createPerson('elon_musk', 'Elon Musk', 1971, PersonRole.VISIONARY, 'The real-life Tony Stark. He is electrifying transport and building rockets to Mars.', { primaryRole: 'Founder & CEO, SpaceX', secondaryRole: 'CEO, Tesla' });
createPerson('mark_zuckerberg', 'Mark Zuckerberg', 1984, PersonRole.VISIONARY, 'He connected the world. He moved fast, broke things, and built a social empire.', { primaryRole: 'Founder & CEO, Meta', secondaryRole: 'Philanthropist' });
createPerson('chad_hurley', 'Chad Hurley', 1977, PersonRole.VISIONARY, 'He made video easy. Co-founded YouTube so anyone could broadcast themselves.', { primaryRole: 'Co-founder, YouTube', secondaryRole: 'Former CEO' });
createPerson('jack_ma', 'Jack Ma', 1964, PersonRole.VISIONARY, 'The teacher who connected China to the world. He built an e-commerce giant from an apartment.', { primaryRole: 'Co-founder, Alibaba', secondaryRole: 'Philanthropist' });
createPerson('pony_ma', 'Pony Ma', 1971, PersonRole.VISIONARY, 'The quiet architect of WeChat. He built a digital ecosystem that powers modern China.', { primaryRole: 'Founder & CEO, Tencent', secondaryRole: 'Software Engineer' });
createPerson('travis_kalanick', 'Travis Kalanick', 1976, PersonRole.VISIONARY, 'He hustled to build Uber. He changed urban transport with the push of a button.', { primaryRole: 'Co-founder, Uber', secondaryRole: 'Former CEO' });
createPerson('patrick_collison', 'Patrick Collison', 1988, PersonRole.VISIONARY, 'He fixed payments. With Stripe, he made it simple for startups to accept money online.', { primaryRole: 'Co-founder & CEO, Stripe', secondaryRole: 'Entrepreneur' });
createPerson('satoshi_nakamoto', 'Satoshi Nakamoto', 1975, PersonRole.THEORIST, 'The mysterious creator of Bitcoin. They solved the problem of digital trust without banks.', { primaryRole: 'Cryptographer', secondaryRole: 'Creator of Bitcoin' });
createPerson('vitalik_buterin', 'Vitalik Buterin', 1994, PersonRole.VISIONARY, 'The boy genius behind Ethereum. He envisioned a blockchain that could run any program.', { primaryRole: 'Co-founder, Ethereum', secondaryRole: 'Programmer' });
createPerson('tim_cook', 'Tim Cook', 1960, PersonRole.LEADER, 'The operations genius. He took Apple to a $3 trillion valuation by perfecting the supply chain.', { primaryRole: 'CEO, Apple', secondaryRole: 'Former COO' });
createPerson('satya_nadella', 'Satya Nadella', 1967, PersonRole.LEADER, 'The diplomat. He refreshed Microsoft\'s soul, embracing the cloud and partnering with OpenAI.', { primaryRole: 'CEO, Microsoft', secondaryRole: 'Chairman' });
createPerson('sundar_pichai', 'Sundar Pichai', 1972, PersonRole.LEADER, 'The product leader. He oversaw Chrome and Android before taking the helm at Google.', { primaryRole: 'CEO, Alphabet & Google', secondaryRole: 'Product Manager' });
createPerson('lisa_su', 'Lisa Su', 1969, PersonRole.LEADER, 'The engineer who saved AMD. She executed one of the greatest turnarounds in tech history.', { primaryRole: 'Chair & CEO, AMD', secondaryRole: 'Electrical Engineer' });
createPerson('demis_hassabis', 'Demis Hassabis', 1976, PersonRole.VISIONARY, 'The gamer neuroscientist. He founded DeepMind to solve intelligence and cure diseases.', { primaryRole: 'Co-founder & CEO, DeepMind', secondaryRole: 'AI Researcher' });
createPerson('sam_altman', 'Sam Altman', 1985, PersonRole.LEADER, 'The operator. He scaled Y Combinator and then led OpenAI to release ChatGPT.', { primaryRole: 'Co-founder & CEO, OpenAI', secondaryRole: 'Former President, YC' });
createPerson('ilya_sutskever', 'Ilya Sutskever', 1985, PersonRole.THEORIST, 'The brain behind GPT. He led the technical breakthroughs that made AI talk.', { primaryRole: 'Co-founder, OpenAI', secondaryRole: 'Co-founder, SSI' });

// [Investors & The PayPal Mafia] Total: 9
createPerson('arthur_rock', 'Arthur Rock', 1926, PersonRole.INVESTOR, 'The financier. He helped start Intel and Apple, coining the term "Venture Capital".', { primaryRole: 'Venture Capitalist', secondaryRole: 'Early Investor' });
createPerson('don_valentine', 'Don Valentine', 1932, PersonRole.INVESTOR, 'The grandfather of VC. His firm Sequoia backed the companies that defined the future.', { primaryRole: 'Founder, Sequoia', secondaryRole: 'Venture Capitalist', deathYear: 2019 });
createPerson('masayoshi_son', 'Masayoshi Son', 1957, PersonRole.INVESTOR, 'The risk-taker. His Vision Fund poured billions into the future of AI and connectivity.', { primaryRole: 'Founder & CEO, SoftBank', secondaryRole: 'Investor' });
createPerson('marc_andreessen', 'Marc Andreessen', 1971, PersonRole.INVESTOR, 'He built the first graphical browser. Now he funds the software eating the world.', { primaryRole: 'Co-founder, a16z', secondaryRole: 'Co-founder, Netscape' });
createPerson('peter_thiel', 'Peter Thiel', 1967, PersonRole.INVESTOR, 'The contrarian. He co-founded PayPal, backed Facebook first, and funds big ideas.', { primaryRole: 'Partner, Founders Fund', secondaryRole: 'Co-founder, PayPal' });
createPerson('reid_hoffman', 'Reid Hoffman', 1967, PersonRole.INVESTOR, 'The networker. He founded LinkedIn and is the "Oracle" connected to everyone in the Valley.', { primaryRole: 'Partner, Greylock', secondaryRole: 'Co-founder, LinkedIn' });
createPerson('paul_graham', 'Paul Graham', 1964, PersonRole.INVESTOR, 'The hacker philosopher. He created Y Combinator and wrote the playbook for startups.', { primaryRole: 'Co-founder, Y Combinator', secondaryRole: 'Essayist' });
createPerson('max_levchin', 'Max Levchin', 1975, PersonRole.BUILDER, 'The coder behind PayPal. His work on fraud prevention proved humans are still useful.', { primaryRole: 'Founder & CEO, Affirm', secondaryRole: 'Co-founder, PayPal' });
createPerson('roelof_botha', 'Roelof Botha', 1973, PersonRole.INVESTOR, 'The PayPal Mafia member who leads Sequoia. He spots the next big thing before anyone else.', { primaryRole: 'Partner, Sequoia', secondaryRole: 'Former CFO, PayPal' });

// ... (Previous code remains unchanged)

// ==============================================================================
// 4. CONNECTIONS: THE SILICON PROTOCOL
// ==============================================================================

// ------------------------------------------------------------------------------
// LAYER 1: THE SPARK (People -> Companies & Tech)
// ------------------------------------------------------------------------------
// Creation of Companies
linkCreates('william_shockley', 'fairchild', 'William Shockley\'s management style led the "Traitorous Eight" to leave and found Fairchild Semiconductor', 1957);
linkCreates('robert_noyce', 'intel', 'Robert Noyce founded NM Electronics, which soon became Intel', 1968);
linkCreates('gordon_moore', 'intel', 'Gordon Moore co-founded Intel to focus on semiconductor memory technologies', 1968);
linkCreates('morris_chang', 'tsmc', 'Morris Chang founded TSMC with support from the Taiwan government', 1987);
linkCreates('jensen_huang', 'nvidia', 'Jensen Huang co-founded NVIDIA to accelerate 3D graphics computing', 1993);
linkCreates('steve_jobs', 'apple', 'Steve Jobs founded Apple in a garage to sell the Apple I computer', 1976);
linkCreates('steve_wozniak', 'apple', 'Steve Wozniak engineered the Apple I and II computers for Apple', 1976);
linkCreates('bill_gates', 'microsoft', 'Bill Gates founded Microsoft to develop BASIC interpreters for the Altair 8800', 1975);
linkCreates('larry_ellison', 'oracle', 'Larry Ellison founded Software Development Laboratories, which became Oracle', 1977);
linkCreates('jeff_bezos', 'amazon', 'Jeff Bezos started Amazon as an online bookstore', 1994);
linkCreates('larry_page', 'google', 'Larry Page founded Google based on his PageRank algorithm', 1998);
linkCreates('sergey_brin', 'google', 'Sergey Brin co-founded Google while researching at Stanford', 1998);
linkCreates('marc_andreessen', 'netscape_co', 'Marc Andreessen co-founded Netscape to commercialize the Mosaic browser', 1994);
linkCreates('reed_hastings', 'netflix_co', 'Reed Hastings co-founded Netflix as a DVD-by-mail service', 1997);
linkCreates('mark_zuckerberg', 'meta', 'Mark Zuckerberg launched Facebook from his Harvard dorm room', 2004);
linkCreates('peter_thiel', 'paypal_co', 'Peter Thiel co-founded Confinity, which later merged into PayPal', 1998);
linkCreates('max_levchin', 'paypal_co', 'Max Levchin developed the fraud prevention systems for PayPal', 1998);
linkCreates('elon_musk', 'paypal_co', 'Elon Musk merged his company X.com with Confinity to form PayPal', 2000);
linkCreates('elon_musk', 'spacex', 'Elon Musk founded SpaceX to reduce space transportation costs', 2002);
linkCreates('elon_musk', 'tesla', 'Elon Musk joined Tesla as a Series A investor and became Chairman', 2004);
linkCreates('elon_musk', 'openai', 'Elon Musk co-founded OpenAI as a non-profit AI research organization', 2015, 2018);
linkCreates('sam_altman', 'openai', 'Sam Altman co-founded OpenAI and later became its CEO', 2015);
linkCreates('demis_hassabis', 'deepmind', 'Demis Hassabis founded DeepMind to solve general intelligence', 2010);
linkCreates('jack_ma', 'alibaba', 'Jack Ma founded Alibaba in his apartment with 17 friends', 1999);
linkCreates('pony_ma', 'tencent', 'Pony Ma founded Tencent to launch the OICQ messaging service', 1998);
linkCreates('chad_hurley', 'youtube', 'Chad Hurley co-founded the YouTube video sharing platform', 2005);
linkCreates('travis_kalanick', 'uber_co', 'Travis Kalanick co-founded Uber as UberCab', 2009);
linkCreates('patrick_collison', 'stripe_co', 'Patrick Collison founded Stripe to simplify online payments', 2010);
linkCreates('marc_benioff', 'salesforce_co', 'Marc Benioff founded Salesforce to deliver software via the cloud', 1999);
linkCreates('don_valentine', 'sequoia', 'Don Valentine founded the venture capital firm Sequoia Capital', 1972);
linkCreates('paul_graham', 'ycombinator', 'Paul Graham co-founded the startup accelerator Y Combinator', 2005);
linkCreates('marc_andreessen', 'a16z', 'Marc Andreessen co-founded the VC firm Andreessen Horowitz', 2009);
linkCreates('masayoshi_son', 'softbank', 'Masayoshi Son founded SoftBank as a software distributor', 1981);
linkCreates('cisco', 'cisco_router', 'Cisco developed the first commercially successful multi-protocol router', 1986);
linkCreates('qualcomm', '5g_nr', 'Qualcomm led the development of global 5G standards', 2019);
linkCreates('samsung', '5g_nr', 'Samsung led the early commercialization of 5G network equipment', 2019);

// Creation of Core Technology (Direct Involvement)
linkCreates('alan_turing', 'turing_machine', 'Alan Turing proposed the mathematical model of computation', 1936);
linkCreates('claude_shannon', 'info_theory', 'Claude Shannon published "A Mathematical Theory of Communication"', 1948);
linkCreates('william_shockley', 'transistor', 'William Shockley co-invented the point-contact transistor', 1947);
linkCreates('robert_noyce', 'ic', 'Robert Noyce invented the monolithic integrated circuit', 1959);
linkCreates('tim_berners_lee', 'www', 'Tim Berners-Lee proposed the World Wide Web project at CERN', 1989);
linkCreates('dennis_ritchie', 'unix', 'Dennis Ritchie co-created the Unix operating system at Bell Labs', 1969);
linkCreates('dennis_ritchie', 'c_lang', 'Dennis Ritchie developed C language for Unix system programming', 1972);
linkCreates('linus_torvalds', 'linux', 'Linus Torvalds released the Linux kernel as free software', 1991);
linkCreates('linus_torvalds', 'git', 'Linus Torvalds created Git for Linux kernel development', 2005);
linkCreates('satoshi_nakamoto', 'bitcoin', 'Satoshi Nakamoto published the whitepaper and mined the genesis block', 2008);
linkCreates('vitalik_buterin', 'ethereum', 'Vitalik Buterin proposed Ethereum as a decentralized application platform', 2013);
linkCreates('geoffrey_hinton', 'alexnet', 'Geoffrey Hinton co-authored the breakthrough paper on Convolutional Neural Networks', 2012);
linkCreates('yann_lecun', 'alexnet', 'Yann LeCun pioneered CNN architectures (LeNet) that led to AlexNet', 1989);
linkCreates('ilya_sutskever', 'transformer', 'Ilya Sutskever co-authored the "Attention Is All You Need" paper', 2017);
linkCreates('google', 'word2vec', 'Google created Word2Vec to efficiently represent words as vectors', 2013);
linkCreates('marc_andreessen', 'mosaic', 'Marc Andreessen co-authored Mosaic, the first popular graphical browser', 1993);
linkCreates('anthropic', 'claude', 'Anthropic released the Claude AI assistant', 2023);
linkCreates('openai', 'sora', 'OpenAI introduced Sora, a text-to-video generative model', 2024);

// ------------------------------------------------------------------------------
// LAYER 2: TECHNOLOGY EVOLUTION (Tech -> Tech)
// ------------------------------------------------------------------------------
// Theoretical foundations leading to Hardware
linkContributes('turing_machine', 'microprocessor', 'The Turing Machine provided the theoretical limit of computation for the Microprocessor');
linkContributes('info_theory', 'tcp_ip', 'Information Theory laid the mathematical foundation for error-free data transmission in TCP/IP');
linkContributes('info_theory', 'cdma', 'Information Theory enabled spread spectrum communications used in CDMA');
linkContributes('info_theory', '5g_nr', 'Information Theory forms the basis for advanced channel coding in 5G');
linkContributes('info_theory', 'mp3', 'Information Theory provided the foundation for MP3 data compression');
linkContributes('transistor', 'ic', 'Integrated Circuits combined billions of Transistors onto a single chip');
linkContributes('transistor', 'blue_led', 'The Transistor established the semiconductor physics foundation for LEDs');

// Hardware Evolution
linkPowers('lithography', 'ic', 'Lithography enables the printing of microscopic circuits on Integrated Circuits');
linkPowers('lithography', 'euv', 'Lithography evolved to use Extreme Ultraviolet light for finer precision');
linkPowers('lithography', 'lidar', 'Lithography enables the micro-fabrication of LiDAR sensors');
linkPowers('lithography', 'cmos', 'Lithography is the essential manufacturing process for CMOS sensors');
linkPowers('euv', 'nvidia_h100', 'EUV Lithography enables the 4nm process node used for the NVIDIA H100', 2022);
linkPowers('euv', 'arm_cortex', 'EUV Lithography enables the manufacturing of advanced ARM Cortex cores');
linkPowers('ic', 'microprocessor', 'Microprocessors are complex Integrated Circuits that function as a CPU');
linkPowers('ic', 'dram', 'DRAM memory is implemented using Integrated Circuits');
linkPowers('ic', 'nand', 'NAND Flash storage is implemented using Integrated Circuits');
linkContributes('microprocessor', 'x86', 'The Microprocessor evolved into the x86 architecture dominant in PCs');
linkContributes('microprocessor', 'arm_arch', 'The Microprocessor concept led to the power-efficient ARM architecture');
linkContributes('dram', 'hbm', 'DRAM evolved into High Bandwidth Memory (HBM) by stacking chips');
linkPowers('hbm', 'nvidia_h100', 'HBM provides the necessary memory bandwidth for NVIDIA H100 training');
linkPowers('hbm', 'tpu', 'HBM provides high-speed memory access for Google TPUs');

// Connectivity Evolution
linkPowers('optical_fiber', 'tcp_ip', 'Optical Fiber serves as the physical layer for global TCP/IP traffic');
linkPowers('optical_fiber', '5g_nr', 'Optical Fiber is required for 5G base station backhaul connections');
linkContributes('tcp_ip', 'ethernet', 'TCP/IP protocols operate on top of the Ethernet networking stack');
linkContributes('ethernet', 'wifi', 'WiFi adapted Ethernet standards for wireless local area networking');
linkContributes('cdma', 'gsm', 'CDMA technologies influenced the evolution of digital cellular standards like GSM');
linkContributes('gsm', 'lte', 'GSM networks evolved into LTE (4G) for higher data speeds');
linkContributes('lte', '5g_nr', 'LTE infrastructure evolved into the high-bandwidth 5G NR standard');
linkContributes('gps', '5g_nr', 'GPS provides critical timing synchronization for 5G networks');
linkPowers('blue_led', 'optical_disc', 'Blue LEDs enable the short wavelength required for high-density Optical Discs');
linkPowers('cmos', 'lidar', 'CMOS technology provides the sensor foundation for LiDAR systems');

// Software & Algorithm Evolution
linkContributes('unix', 'c_lang', 'C Language was created specifically to rewrite the Unix kernel');
linkContributes('unix', 'linux', 'Unix design principles directly inspired the Linux Kernel');
linkContributes('c_lang', 'python', 'The Python interpreter (CPython) is implemented in C Language');
linkContributes('c_lang', 'java', 'Java syntax is derived from C and C++ languages');
linkContributes('c_lang', 'sql', 'Database engines for SQL are primarily written in C/C++');
linkContributes('sql', 'oracle_db', 'Oracle Database commercialized the SQL language standard');
linkContributes('bittorrent', 'bitcoin', 'BitTorrent\'s P2P network concepts influenced Bitcoin\'s design');
linkContributes('bitcoin', 'ethereum', 'Ethereum extended Bitcoin\'s blockchain concept to support smart contracts');
linkContributes('alexnet', 'transformer', 'AlexNet ignited the Deep Learning boom that led to Transformers');
linkContributes('word2vec', 'transformer', 'Word2Vec vector embeddings serve as inputs to Transformer models');
linkContributes('word2vec', 'chatgpt', 'Word2Vec laid the foundation for language understanding in ChatGPT');
linkContributes('gan', 'stable_diffusion', 'GAN concepts evolved into diffusion models for Stable Diffusion');
linkContributes('gan', 'sora', 'GAN generative concepts paved the way for video models like Sora');
linkContributes('gan', 'midjourney', 'GAN concepts paved the way for generative art tools like Midjourney');
linkContributes('transformer', 'sora', 'Sora uses spacetime patches within a Transformer architecture');
linkContributes('floppy', 'optical_disc', 'Floppy Disks evolved into Optical Discs for portable data storage');

// ------------------------------------------------------------------------------
// LAYER 3: PRODUCT RELEASES (Companies -> Tech)
// ------------------------------------------------------------------------------
// Hardware Products
linkCreates('bell_labs', 'transistor', 'Bell Labs researchers invented the first point-contact transistor', 1947);
linkCreates('bell_labs', 'unix', 'Bell Labs developed the Unix operating system', 1969);
linkCreates('bell_labs', 'c_lang', 'Bell Labs developed the C programming language', 1972);
linkCreates('fairchild', 'ic', 'Fairchild created the first commercially viable Integrated Circuit', 1959);
linkCreates('intel', 'x86', 'Intel introduced the x86 architecture with the 8086 processor', 1978);
linkCreates('intel', 'microprocessor', 'Intel released the 4004, the first commercial microprocessor', 1971);
linkCreates('nvidia', 'gpu_geforce', 'NVIDIA coined the term GPU with the release of GeForce 256', 1999);
linkCreates('nvidia', 'nvidia_h100', 'NVIDIA released the H100 GPU for massive AI workloads', 2022);
linkCreates('nvidia', 'cuda', 'NVIDIA released the CUDA parallel computing platform', 2007);
linkCreates('arm_ltd', 'arm_arch', 'Arm Holdings designed the power-efficient RISC architecture', 1985);
linkCreates('arm_ltd', 'arm_cortex', 'Arm Holdings released the Cortex processor family', 2004);
linkCreates('asml', 'euv', 'ASML shipped the first EUV lithography prototype', 2010);
linkCreates('tsmc', 'foundry_model', 'TSMC pioneered the dedicated semiconductor foundry business model', 1987);
linkCreates('ibm', 'ibm_360', 'IBM announced the System/360 mainframe family', 1964);
linkCreates('sony', 'walkman', 'Sony released the TPS-L2 Walkman', 1979);
linkCreates('sony', 'optical_disc', 'Sony co-developed the Compact Disc (CD) with Philips', 1982);
linkCreates('apple', 'macintosh', 'Apple launched the Macintosh with the "1984" Super Bowl ad', 1984);
linkCreates('apple', 'iphone', 'Apple reinvented the phone with the launch of the iPhone', 2007);
linkCreates('apple', 'ios', 'Apple released iPhone OS, which later became iOS', 2007);
linkCreates('apple', 'app_store', 'Apple opened the App Store to third-party developers', 2008);
linkCreates('apple', 'vision_pro', 'Apple unveiled the Vision Pro spatial computer', 2024);
linkCreates('tesla', 'model_s', 'Tesla launched the Model S premium electric sedan', 2012);
linkCreates('tesla', 'tesla_autopilot', 'Tesla introduced Autopilot driver assistance features', 2014);
linkCreates('spacex', 'spacex_falcon9', 'SpaceX achieved the first successful launch of Falcon 9', 2010);
linkCreates('spacex', 'starlink', 'SpaceX began launching Starlink satellites', 2019);
linkCreates('spacex', 'starship', 'SpaceX conducted the first integrated flight test of Starship', 2023);
linkCreates('dji', 'dji_phantom', 'DJI popularized consumer drones with the Phantom series', 2013);
linkCreates('xerox_parc', 'ethernet', 'Xerox PARC invented Ethernet for local area networking', 1973);
linkCreates('att', 'bell_labs', 'AT&T was the parent company of the Bell Labs research center', 1925);

// Software & Platform Products
linkCreates('microsoft', 'windows_95', 'Microsoft released Windows 95 with the Start menu', 1995);
linkCreates('microsoft', 'excel', 'Microsoft released the first graphical version of Excel', 1985);
linkCreates('microsoft', 'copilot', 'Microsoft integrated AI Copilot into Office 365', 2023);
linkCreates('oracle', 'oracle_db', 'Oracle released the first commercial SQL RDBMS', 1979);
linkCreates('adobe', 'photoshop', 'Adobe released Photoshop version 1.0', 1990);
linkCreates('salesforce_co', 'salesforce_crm', 'Salesforce launched the first SaaS CRM platform', 1999);
linkCreates('netscape_co', 'netscape', 'Netscape released the Navigator web browser', 1994);
linkCreates('netscape_co', 'javascript', 'Netscape created JavaScript, developed by Brendan Eich', 1995);
linkCreates('netscape_co', 'ssl_tls', 'Netscape introduced the SSL 2.0 protocol', 1995);
linkCreates('google', 'google_search', 'Google launched its search engine', 1998);
linkCreates('google', 'android', 'Google released Android 1.0', 2008);
linkCreates('google', 'google_chrome', 'Google released the Chrome web browser', 2008);
linkCreates('google', 'mapreduce', 'Google published the MapReduce research paper', 2004);
linkCreates('google', 'transformer', 'Google published "Attention Is All You Need"', 2017);
linkCreates('google', 'tpu', 'Google deployed TPUs in its data centers', 2015);
linkCreates('google', 'gemini', 'Google released the Gemini multimodal AI model', 2023);
linkCreates('deepmind', 'alphago', 'DeepMind\'s AlphaGo defeated Lee Sedol', 2016);
linkCreates('deepmind', 'alphago_zero', 'DeepMind created AlphaGo Zero which mastered Go without human data', 2017);
linkCreates('meta', 'facebook', 'Meta launched "TheFacebook" from Harvard', 2004);
linkCreates('meta', 'pytorch', 'Meta released the PyTorch deep learning framework', 2016);
linkCreates('openai', 'chatgpt', 'OpenAI released ChatGPT as a research preview', 2022);
linkCreates('netflix_co', 'netflix', 'Netflix launched its streaming video service', 2007);
linkCreates('spotify_co', 'spotify', 'Spotify launched its music streaming service', 2008);
linkCreates('uber_co', 'uber_app', 'Uber launched its ride-hailing app in San Francisco', 2010);
linkCreates('paypal_co', 'paypal', 'PayPal launched its money transfer service', 1999);
linkCreates('stripe_co', 'stripe', 'Stripe launched its payments API for developers', 2011);
linkCreates('bytedance', 'tiktok', 'ByteDance launched TikTok as the international version of Douyin', 2017);
linkCreates('tencent', 'wechat', 'Tencent released the WeChat mobile messaging app', 2011);
linkCreates('amazon', 'amazon_com', 'Amazon launched its online bookstore', 1995);
linkCreates('fugaku', 'covid_simulation', 'Fugaku was used for COVID-19 droplet analysis simulations', 2020);

// ------------------------------------------------------------------------------
// LAYER 4: INFRASTRUCTURE & DEPENDENCIES (Tech -> Tech/Company)
// ------------------------------------------------------------------------------
// Hardware driving Software/Runtime
linkPowers('microprocessor', 'unix', 'The Microprocessor provided the hardware platform for Unix to run', 1970);
linkPowers('x86', 'linux', 'The x86 architecture was the initial development platform for Linux', 1991);
linkPowers('x86', 'windows_95', 'The x86 architecture was the dominant platform for Windows 95', 1995);
linkPowers('x86', 'toshiba_t1100', 'The Intel 80C88 x86 processor powered the Toshiba T1100', 1985);
linkPowers('arm_arch', 'ios', 'ARM Architecture forms the basis for Apple Silicon in iOS devices', 2007);
linkPowers('arm_arch', 'android', 'ARM Architecture is the dominant platform for Android devices', 2008);
linkPowers('arm_arch', 'vision_pro', 'ARM Architecture powers the M2 and R1 chips in Vision Pro', 2024);
linkPowers('arm_arch', 'fugaku', 'ARM Architecture powers the A64FX chips in Fugaku', 2020);
linkPowers('gpu_geforce', 'cuda', 'GeForce GPUs provided the hardware for CUDA parallel computing', 2007);
linkPowers('gpu_geforce', 'ethereum', 'GPUs were used for Ethereum Proof-of-Work mining', 2015, 2022);
linkPowers('nvidia_h100', 'cuda', 'NVIDIA H100 is optimized for the latest CUDA architecture', 2022);
linkPowers('nvidia_h100', 'pytorch', 'NVIDIA H100 acts as the acceleration backend for PyTorch', 2022);
linkPowers('nvidia_h100', 'chatgpt', 'NVIDIA H100 provides the hardware for ChatGPT training and inference', 2022);
linkPowers('nvidia_h100', 'bytedance', 'NVIDIA H100 powers ByteDance\'s AI infrastructure', 2023);
linkPowers('nvidia_h100', 'tencent', 'NVIDIA H100 powers Tencent\'s Cloud AI infrastructure', 2023);
linkPowers('nvidia_h100', 'starship', 'NVIDIA H100 powers SpaceX\'s CFD simulations for Starship', 2023);
linkPowers('nvidia_h100', 'sora', 'NVIDIA H100 provides the compute for Sora video generation training', 2024);
linkPowers('tpu', 'tensorflow', 'Google TPU provides custom hardware acceleration for TensorFlow', 2015);
linkPowers('tcp_ip', 'www', 'TCP/IP serves as the underlying transport protocol for the World Wide Web', 1989);
linkPowers('tcp_ip', 'aws_cloud', 'TCP/IP is the networking foundation for AWS Cloud services', 2006);
linkPowers('tcp_ip', 'skype', 'TCP/IP provided the transport layer for Skype VoIP', 2003);
linkPowers('ssl_tls', 'aws_cloud', 'SSL/TLS ensures secure communication for AWS Cloud', 2006);
linkPowers('ssl_tls', 'paypal_co', 'SSL/TLS secures financial transactions on PayPal', 1999);
linkPowers('ssl_tls', 'amazon_com', 'SSL/TLS enables secure e-commerce on Amazon.com', 1995);
linkPowers('ssl_tls', 'zero_trust', 'SSL/TLS encryption is a requirement for Zero Trust architecture', 2010);
linkPowers('rsa', 'ssl_tls', 'RSA provides the key exchange algorithm for SSL/TLS', 1995);
linkPowers('rsa', 'bitcoin', 'RSA principles influenced Bitcoin\'s public key cryptography', 2009);
linkPowers('rsa', 'git', 'RSA is used for SSH authentication in Git', 2005);
linkPowers('rsa', 'amazon_com', 'RSA enables secure checkout on Amazon.com', 1995);
linkPowers('cisco_router', 'aws_cloud', 'Cisco Routers manage data center networking for cloud providers', 2006);
linkPowers('cisco_router', 'att', 'Cisco Routers form the backbone of AT&T\'s network', 1986);
linkPowers('cisco_router', 'google', 'Cisco Routers supported Google\'s early network infrastructure', 1998);
linkPowers('optical_fiber', 'att', 'Optical Fiber serves as the backbone transmission medium for AT&T', 1980);
linkPowers('optical_fiber', 'starlink', 'Optical Fiber connects Starlink ground stations to the internet backbone', 2019);

// Runtime/Cloud driving Apps & Services
linkPowers('linux', 'android', 'The Linux Kernel serves as the core for the Android OS', 2008);
linkPowers('linux', 'aws_cloud', 'Linux is the primary server operating system for AWS Cloud', 2006);
linkPowers('linux', 'docker', 'Linux kernel features like cgroups enabled Docker containers', 2013);
linkPowers('linux', 'git', 'Linux provided the initial development platform for Git', 2005);
linkPowers('linux', 'sap', 'Linux is the operating system for the SAP HANA platform', 2010);
linkPowers('linux', 'fugaku', 'Red Hat Enterprise Linux runs on the Fugaku supercomputer', 2020);
linkPowers('linux', 'starship', 'Linux powers the flight software of SpaceX Starship', 2019);
linkPowers('linux', 'raspberry_pi', 'Raspbian (Linux) is the default OS for Raspberry Pi', 2012);
linkPowers('aws_cloud', 'docker', 'AWS Cloud provides hosting for Docker containers', 2013);
linkPowers('aws_cloud', 'netflix', 'AWS Cloud enabled Netflix to migrate from datacenters', 2008);
linkPowers('aws_cloud', 'zoom', 'AWS Cloud provides video infrastructure for Zoom', 2011);
linkPowers('aws_cloud', 'slack', 'AWS Cloud provides messaging infrastructure for Slack', 2013);
linkPowers('aws_cloud', 'uber_app', 'AWS Cloud provides compute infrastructure for Uber', 2010);
linkPowers('aws_cloud', 'stripe', 'AWS Cloud hosts Stripe\'s payment processing infrastructure', 2010);
linkPowers('aws_cloud', 'copilot', 'AWS Cloud serves the models for GitHub Copilot', 2021);
linkPowers('aws_cloud', 'netflix_co', 'AWS Cloud is the core infrastructure provider for Netflix', 2008);
linkPowers('aws_cloud', 'uber_co', 'AWS Cloud allows Uber to scale globally', 2010);
linkPowers('aws_cloud', 'stripe_co', 'AWS Cloud ensures reliable uptime for Stripe', 2010);
linkPowers('aws_cloud', 'huggingface', 'AWS Cloud hosts the Hugging Face model hub', 2016);
linkPowers('aws_cloud', 'anthropic', 'AWS Cloud provides training infrastructure for Anthropic', 2021);
linkPowers('aws_cloud', 'twitter', 'AWS Cloud supported Twitter\'s partial cloud migration', 2020);
linkPowers('aws_cloud', 'claude', 'AWS Cloud hosts inference for Claude models', 2023);
linkPowers('java', 'android', 'Java is the primary language for Android app development', 2008);
linkPowers('cuda', 'pytorch', 'CUDA enables GPU acceleration for PyTorch', 2016);
linkPowers('cuda', 'tensorflow', 'CUDA enables GPU acceleration for TensorFlow', 2015);
linkPowers('mapreduce', 'tensorflow', 'MapReduce concepts influenced TensorFlow\'s distributed computing', 2015);
linkPowers('sql', 'sap', 'SQL is the query language for SAP databases', 1972);
linkPowers('oracle_db', 'salesforce_crm', 'Oracle Database powers the Salesforce CRM backend', 1999);
linkPowers('oracle_db', 'sap', 'Oracle Database supported SAP ERP systems', 1972);
linkPowers('oracle_db', 'amazon_com', 'Oracle Database was an early dependency for Amazon.com', 1995);
linkPowers('pytorch', 'chatgpt', 'PyTorch is the framework used to train ChatGPT', 2022);
linkPowers('pytorch', 'stable_diffusion', 'PyTorch is the framework used for Stable Diffusion models', 2022);
linkPowers('pytorch', 'tesla_autopilot', 'PyTorch powers Tesla\'s computer vision training', 2016);
linkPowers('pytorch', 'huggingface', 'PyTorch is the primary framework supported by Hugging Face', 2016);
linkPowers('tensorflow', 'alphago', 'TensorFlow powered the deep learning models for AlphaGo', 2016);
linkPowers('tensorflow', 'google_search', 'TensorFlow powers Google\'s RankBrain search algorithm', 2015);
linkPowers('tensorflow', 'tiktok', 'TensorFlow powers TikTok\'s recommendation algorithm', 2016);
linkPowers('google_chrome', 'google_search', 'Google Chrome drives traffic to Google Search', 2008);
linkPowers('app_store', 'uber_app', 'The App Store is the primary distribution channel for the Uber App', 2010);
linkPowers('app_store', 'spotify', 'The App Store enabled mobile distribution for Spotify', 2008);
linkPowers('app_store', 'tiktok', 'The App Store enabled global distribution for TikTok', 2017);
linkPowers('app_store', 'twitter', 'The App Store enabled mobile access for Twitter', 2008);
linkPowers('www', 'amazon_com', 'The World Wide Web enables Amazon\'s e-commerce platform', 1994);
linkPowers('www', 'mosaic', 'The World Wide Web relied on Mosaic for rendering pages', 1993);
linkPowers('zero_trust', 'aws_cloud', 'Zero Trust is the security architecture for AWS access', 2010);
linkPowers('zero_trust', 'salesforce_co', 'Zero Trust protects Salesforce enterprise data', 2010);
linkPowers('zero_trust', 'slack', 'Zero Trust ensures secure access to Slack', 2013);
linkPowers('transformer', 'huggingface', 'Transformers are the foundation of the Hugging Face library', 2017);
linkPowers('transformer', 'claude', 'Transformers are the underlying architecture of Claude', 2023);
linkPowers('openai', 'perplexity', 'OpenAI APIs power Perplexity\'s initial reasoning', 2022);
linkPowers('openai', 'cursor', 'OpenAI GPT-4 powers Cursor\'s code generation', 2023);
linkPowers('claude', 'perplexity', 'Claude 3 models are integrated into Perplexity', 2024);
linkPowers('claude', 'cursor', 'Claude 3 models are integrated into Cursor', 2024);

// Direct Tech Powering Devices/Apps
linkPowers('ios', 'iphone', 'iOS is the Operating System that runs the iPhone', 2007);
linkPowers('ios', 'app_store', 'iOS provides the platform for the App Store', 2008);
linkPowers('ios', 'vision_pro', 'iOS kernel provides the foundation for visionOS', 2024);
linkPowers('android', 'model_s', 'Android/Linux serves as the base for Tesla infotainment', 2012);
linkPowers('li_ion', 'iphone', 'Li-ion Battery energy density enabled the iPhone design', 2007);
linkPowers('li_ion', 'model_s', 'Li-ion 18650 cells power the Tesla Model S battery pack', 2012);
linkPowers('li_ion', 'dji_phantom', 'Li-ion batteries enable flight time for DJI Phantom', 2013);
linkPowers('gps', 'uber_app', 'GPS provides real-time location tracking for Uber', 2010);
linkPowers('gps', 'dji_phantom', 'GPS enables stabilization and Return-to-Home for drones', 2013);
linkPowers('gps', 'tesla_autopilot', 'GPS provides navigation data for Tesla Autopilot', 2014);
linkPowers('bluetooth', 'iphone', 'Bluetooth connects wireless peripherals to the iPhone', 2007);
linkPowers('bluetooth', 'model_s', 'Bluetooth enables phone key and audio in Model S', 2012);
linkPowers('mp3', 'walkman', 'MP3 format support transformed the Walkman into a digital player', 1999);
linkPowers('floppy', 'windows_95', 'Floppy Disks were the installation media for Windows 95', 1995);
linkPowers('floppy', 'macintosh', 'Floppy Disks were the primary storage for the original Macintosh', 1984);
linkPowers('floppy', 'excel', 'Floppy Disks were the distribution media for Excel', 1985);
linkPowers('lidar', 'boston_dynamics', 'LiDAR provides spatial perception for Boston Dynamics robots', 2005);
linkPowers('lidar', 'uber_co', 'LiDAR enabled autonomous vehicle testing for Uber', 2015);
linkPowers('cmos', 'iphone', 'CMOS Sensors enable the iPhone camera', 2007);
linkPowers('cmos', 'tesla_autopilot', 'CMOS Sensors provide vision data for Tesla Autopilot', 2014);
linkPowers('cmos', 'dji_phantom', 'CMOS Sensors enable aerial photography for drones', 2013);
linkPowers('cmos', 'vision_pro', 'CMOS Sensors enable passthrough video for Vision Pro', 2024);
linkPowers('arm_cortex', 'raspberry_pi', 'ARM Cortex serves as the CPU core for Raspberry Pi', 2012);
linkPowers('python', 'raspberry_pi', 'Python is the primary educational language for Raspberry Pi', 2012);
linkPowers('5g_nr', 'vision_pro', '5G provides low latency streaming for Vision Pro', 2024);
linkPowers('5g_nr', 'dji_phantom', '5G tech influences OcuSync video transmission', 2019);
linkPowers('5g_nr', 'tesla_autopilot', '5G enables fast OTA updates and telemetry for Tesla', 2019);

// ------------------------------------------------------------------------------
// LAYER 5: INDUSTRY SUPPLY CHAIN (Tech -> Company)
// ------------------------------------------------------------------------------
linkPowers('euv', 'tsmc', 'EUV Lithography enables TSMC\'s sub-7nm manufacturing', 2019);
linkPowers('euv', 'samsung', 'EUV Lithography enables Samsung\'s advanced foundry nodes', 2019);
linkPowers('euv', 'intel', 'EUV Lithography enables the Intel 4 process node', 2023);
linkPowers('foundry_model', 'nvidia', 'The Foundry Model enables NVIDIA to operate as a fabless company', 1993);
linkPowers('foundry_model', 'apple', 'The Foundry Model enables Apple to produce custom silicon', 2010);
linkPowers('foundry_model', 'amd', 'The Foundry Model enables AMD to focus on chip design', 2009);
linkPowers('foundry_model', 'qualcomm', 'The Foundry Model enables Qualcomm to scale mobile chips', 1985);
linkPowers('arm_arch', 'apple', 'ARM Architecture serves as the basis for Apple A-series and M-series chips', 2010);
linkPowers('arm_arch', 'qualcomm', 'ARM Architecture serves as the basis for Snapdragon processors', 2007);
linkPowers('arm_arch', 'samsung', 'ARM Architecture serves as the basis for Exynos processors', 2010);
linkPowers('nvidia_h100', 'openai', 'NVIDIA H100 accelerates model training at OpenAI', 2022);
linkPowers('nvidia_h100', 'meta', 'NVIDIA H100 powers LLaMA training at Meta', 2023);
linkPowers('nvidia_h100', 'tesla', 'NVIDIA H100 powers Tesla\'s FSD supercomputer cluster', 2023);
linkPowers('nvidia_h100', 'microsoft', 'NVIDIA H100 powers Azure AI infrastructure', 2023);
linkPowers('ai_robotics', 'boston_dynamics', 'AI Robotics tech enables dynamic movement for Boston Dynamics', 1992);

// ------------------------------------------------------------------------------
// LAYER 6: CAPITAL, LINEAGE & INFLUENCE (VC/People -> Company/People)
// ------------------------------------------------------------------------------
// Mentorship & Lineage
linkContributes('william_shockley', 'robert_noyce', 'William Shockley hired Robert Noyce at Shockley Semiconductor', 1956);
linkContributes('robert_noyce', 'steve_jobs', 'Robert Noyce mentored Steve Jobs during Apple\'s early days', 1977);
linkContributes('steve_jobs', 'mark_zuckerberg', 'Steve Jobs advised Mark Zuckerberg on company building', 2008);
linkContributes('steve_jobs', 'tim_cook', 'Steve Jobs recruited Tim Cook as COO', 1998);
linkContributes('don_valentine', 'steve_jobs', 'Don Valentine was an early investor and advisor to Steve Jobs', 1976);
linkContributes('larry_ellison', 'marc_benioff', 'Larry Ellison mentored Marc Benioff at Oracle', 1986);
linkContributes('paul_graham', 'sam_altman', 'Paul Graham appointed Sam Altman as Y Combinator President', 2014);
linkContributes('paul_graham', 'patrick_collison', 'Paul Graham funded Patrick Collison\'s Stripe via Y Combinator', 2010);
linkContributes('peter_thiel', 'vitalik_buterin', 'Peter Thiel awarded a Thiel Fellowship to Vitalik Buterin', 2014);
linkContributes('satoshi_nakamoto', 'vitalik_buterin', 'Satoshi Nakamoto\'s Bitcoin inspired Vitalik Buterin to create Ethereum', 2013);
linkContributes('xerox_parc', 'macintosh', 'Xerox PARC\'s GUI inspired the Macintosh interface', 1979);
linkContributes('xerox_parc', 'windows_95', 'Xerox PARC\'s GUI concepts influenced Windows', 1981);
linkContributes('xerox_parc', 'adobe', 'John Warnock left Xerox PARC to found Adobe', 1982);
linkContributes('xerox_parc', 'microsoft', 'Charles Simonyi brought Word and Excel concepts from Xerox PARC', 1981);
linkContributes('mosaic', 'netscape_co', 'Marc Andreessen led both the Mosaic and Netscape projects', 1994);
linkContributes('mosaic', 'google_chrome', 'Mosaic is the ancestor of all modern graphical browsers including Chrome', 2008);
linkContributes('toshiba_t1100', 'macintosh', 'The Toshiba T1100 defined the laptop form factor for the Macintosh PowerBook', 1985);
linkContributes('spacex_falcon9', 'starship', 'Falcon 9\'s reusable landing tech evolved into Starship', 2019);

// Executive Leadership & Acquisition
linkContributes('tim_cook', 'apple', 'Tim Cook scaled Apple\'s operations and global supply chain', 1998);
linkContributes('satya_nadella', 'microsoft', 'Satya Nadella shifted Microsoft\'s focus to Cloud and AI', 2014);
linkContributes('satya_nadella', 'openai', 'Satya Nadella orchestrated the strategic partnership with OpenAI', 2019);
linkContributes('sundar_pichai', 'google', 'Sundar Pichai led the development of Chrome and Android', 2004);
linkContributes('lisa_su', 'amd', 'Lisa Su led AMD\'s turnaround with the Ryzen processor', 2014);
linkContributes('roelof_botha', 'sequoia', 'Roelof Botha became the Senior Steward of Sequoia', 2003);
linkContributes('elon_musk', 'twitter', 'Elon Musk acquired Twitter and rebranded it to X', 2022);
linkContributes('microsoft', 'skype', 'Microsoft acquired Skype for $8.5B', 2011);
linkContributes('microsoft', 'cursor', 'Cursor is built on Microsoft\'s VS Code open source project', 2023);
linkContributes('google', 'deepmind', 'Google acquired DeepMind for $500M', 2014);
linkContributes('google', 'uber_co', 'Google Ventures invested $258M in Uber', 2013);
linkContributes('google', 'boston_dynamics', 'Google acquired the robotics firm Boston Dynamics', 2013, 2017);
linkContributes('google', 'zero_trust', 'Google pioneered the BeyondCorp Zero Trust model', 2010);
linkContributes('yann_lecun', 'meta', 'Yann LeCun became the Chief AI Scientist at Meta', 2013);
linkContributes('yann_lecun', 'pytorch', 'Yann LeCun led the FAIR team that developed PyTorch', 2016);
linkContributes('reid_hoffman', 'facebook', 'Reid Hoffman was an early angel investor in Facebook', 2004);
linkContributes('reid_hoffman', 'airbnb', 'Reid Hoffman led Greylock\'s Series A investment in Airbnb', 2010);
linkContributes('reid_hoffman', 'microsoft', 'Reid Hoffman became a board member after the LinkedIn acquisition', 2016);
linkContributes('reid_hoffman', 'openai', 'Reid Hoffman was an early board member of OpenAI', 2015);
linkContributes('sony', 'cmos', 'Sony became the global market leader in CMOS image sensors');

// Venture Capital & Investment
linkContributes('sequoia', 'apple', 'Sequoia Capital invested $150k in Apple', 1978);
linkContributes('sequoia', 'google', 'Sequoia Capital invested $12.5M in Google', 1999);
linkContributes('sequoia', 'nvidia', 'Sequoia Capital made an early stage investment in NVIDIA', 1993);
linkContributes('sequoia', 'paypal_co', 'Sequoia Capital made an early stage investment in PayPal', 1999);
linkContributes('sequoia', 'youtube', 'Sequoia Capital invested $11.5M in YouTube', 2005);
linkContributes('sequoia', 'stripe_co', 'Sequoia Capital led Stripe\'s Series A round', 2012);
linkContributes('sequoia', 'whatsapp', 'Sequoia Capital was the sole investor in WhatsApp ($60M total)', 2011);
linkContributes('ycombinator', 'airbnb', 'Y Combinator provided seed funding to Airbnb', 2009);
linkContributes('ycombinator', 'stripe_co', 'Y Combinator provided seed funding to Stripe', 2010);
linkContributes('ycombinator', 'openai', 'Sam Altman led Y Combinator during the founding of OpenAI', 2015);
linkContributes('ycombinator', 'twitch', 'Y Combinator funded Justin.tv which became Twitch', 2007);
linkContributes('a16z', 'meta', 'a16z invested in Meta secondary shares', 2010);
linkContributes('a16z', 'airbnb', 'a16z invested in Airbnb, fueling the sharing economy', 2011);
linkContributes('a16z', 'stripe_co', 'a16z fueled Stripes rise as a payment giant', 2011);
linkContributes('a16z', 'ethereum', 'a16z invested in the Ethereum ecosystem', 2016);
linkContributes('a16z', 'openai', 'a16z invested in OpenAI via tender offer', 2023);
linkContributes('arthur_rock', 'intel', 'Arthur Rock was the first investor and Chairman of Intel', 1968);
linkContributes('arthur_rock', 'apple', 'Arthur Rock was an early investor ($57k) in Apple', 1977);
linkContributes('peter_thiel', 'meta', 'Peter Thiel was the first outside investor ($500k) in Facebook', 2004);
linkContributes('masayoshi_son', 'alibaba', 'Masayoshi Son invested $20M in Alibaba', 2000);
linkContributes('softbank', 'alibaba', 'SoftBank became a major shareholder in Alibaba', 2000);
linkContributes('softbank', 'arm_ltd', 'SoftBank acquired Arm Holdings for $32B', 2016);
linkContributes('softbank', 'uber_co', 'SoftBank became a major investor in Uber via the Vision Fund', 2018);
linkContributes('softbank', 'boston_dynamics', 'SoftBank acquired Boston Dynamics from Google', 2017, 2020);
linkContributes('amazon', 'anthropic', 'Amazon invested $4B in Anthropic', 2023);
linkContributes('google', 'anthropic', 'Google invested $2B in Anthropic', 2023);
linkContributes('jeff_bezos', 'perplexity', 'Jeff Bezos participated in Perplexity\'s Series B', 2024);
linkContributes('nvidia', 'perplexity', 'NVIDIA participated in Perplexity\'s Series B', 2024);

// The PayPal Mafia Lineage
linkContributes('fairchild', 'intel', 'Robert Noyce and Gordon Moore left Fairchild to found Intel', 1968);
linkContributes('fairchild', 'amd', 'Jerry Sanders left Fairchild to found AMD', 1969);
linkContributes('fairchild', 'sequoia', 'Don Valentine was the sales/marketing lead at Fairchild before Sequoia', 1972);
linkContributes('paypal_co', 'spacex', 'Elon Musk used PayPal proceeds to found SpaceX', 2002);
linkContributes('paypal_co', 'tesla', 'Elon Musk used PayPal proceeds to invest in Tesla', 2004);
linkContributes('paypal_co', 'linkedin', 'Reid Hoffman co-founded LinkedIn after PayPal', 2002);
linkContributes('paypal_co', 'youtube', 'Chad Hurley co-founded YouTube after working at PayPal', 2005);
linkContributes('paypal_co', 'sequoia', 'Roelof Botha joined Sequoia Capital after being CFO at PayPal', 2003);
linkContributes('paypal_co', 'palantir', 'Peter Thiel co-founded Palantir after PayPal', 2003);
linkContributes('paypal_co', 'reid_hoffman', 'Reid Hoffman served as Executive VP at PayPal', 2000);
linkContributes('oracle', 'salesforce_co', 'Marc Benioff left Oracle to found Salesforce', 1999);

// ------------------------------------------------------------------------------
// LAYER 7: MARKET DYNAMICS (Rivalry & Partnership)
// ------------------------------------------------------------------------------
// Partnerships (Heart)
linkPartner('microsoft', 'intel', 'Microsoft and Intel formed the "Wintel" alliance that dominated the PC era', 1981);
linkPartner('microsoft', 'openai', 'Microsoft formed a strategic multi-billion dollar partnership with OpenAI', 2019);
linkPartner('apple', 'tsmc', 'Apple partnered with TSMC as the exclusive manufacturer for Apple Silicon', 2014);
linkPartner('apple', 'arm_ltd', 'Apple was a founding partner of ARM', 1990);
linkPartner('salesforce_co', 'slack', 'Salesforce acquired Slack for $27.7B in a strategic move', 2021);
linkPartner('wikipedia', 'google_search', 'Google integrated Wikipedia data into its Knowledge Graph', 2012);
linkPartner('att', 'cisco', 'AT&T partnered with Cisco for major infrastructure deployments', 2000);
linkPartner('yann_lecun', 'geoffrey_hinton', 'Yann LeCun and Geoffrey Hinton collaborated on deep learning and shared the Turing Award', 2018);
linkPartner('steve_jobs', 'steve_wozniak', 'Steve Jobs and Steve Wozniak co-founded Apple', 1976);
linkPartner('larry_page', 'sergey_brin', 'Larry Page and Sergey Brin co-founded Google', 1998);
linkPartner('peter_thiel', 'max_levchin', 'Peter Thiel and Max Levchin were key co-founders of PayPal', 1998);

// Rivalries (Sword) - Tech Giants
linkRival('apple', 'google', 'Apple and Google compete in the mobile OS war (iOS vs Android)', 2008);
linkRival('apple', 'microsoft', 'Apple and Microsoft competed for PC and OS dominance', 1984);
linkRival('apple', 'samsung', 'Apple and Samsung engaged in patent wars over smartphone designs', 2011);
linkRival('apple', 'meta', 'Apple and Meta clashed over privacy policies affecting ad revenue', 2021);
linkRival('amazon', 'microsoft', 'Amazon (AWS) and Microsoft (Azure) compete for cloud dominance', 2010);
linkRival('amazon', 'google', 'Amazon and Google compete in Cloud and Voice AI', 2012);
linkRival('google', 'microsoft', 'Google and Microsoft compete in Search, Browser, and AI', 2009);

// Rivalries - Semiconductors
linkRival('intel', 'amd', 'Intel and AMD have a long-standing war for x86 CPU market share', 1975);
linkRival('nvidia', 'amd', 'NVIDIA and AMD compete in the GPU market', 2000);
linkRival('nvidia', 'intel', 'NVIDIA and Intel compete in AI acceleration and CPU dominance', 2017);
linkRival('intel', 'tsmc', 'Intel competes with TSMC in the foundry process race', 2015);
linkRival('samsung', 'tsmc', 'Samsung competes with TSMC for advanced foundry nodes', 2010);
linkRival('qualcomm', 'apple', 'Qualcomm and Apple engaged in licensing disputes over modem chips', 2017);

// Rivalries - Platforms & Apps
linkRival('meta', 'bytedance', 'Meta (Reels) competes with ByteDance (TikTok) for short-form video', 2020);
linkRival('twitter', 'meta', 'Twitter (X) competes with Meta (Threads) in microblogging', 2023);
linkRival('twitter', 'tiktok', 'Twitter competes with TikTok for user attention', 2018);
linkRival('ios', 'android', 'iOS and Android form the mobile ecosystem duopoly', 2008);
linkRival('netflix_co', 'youtube', 'Netflix and YouTube compete for video entertainment time', 2010);
linkRival('amazon_com', 'alibaba', 'Amazon and Alibaba compete for global e-commerce dominance', 2014);
linkRival('amazon_com', 'google_search', 'Amazon competes with Google as the entry point for product search', 2010);
linkRival('huggingface', 'github', 'Hugging Face competes with GitHub for model hosting vs code hosting', 2020);

// Rivalries - Enterprise
linkRival('oracle', 'salesforce_co', 'Oracle competes with Salesforce in the Database vs Cloud CRM market', 2000);
linkRival('sap', 'oracle', 'SAP and Oracle compete in the ERP software market', 1990);
linkRival('sap', 'salesforce_co', 'SAP competes with Salesforce in enterprise software', 2010);
linkRival('unreal', 'unity', 'Unreal Engine and Unity compete for game engine market share', 2005);
linkRival('skype', 'zoom', 'Skype competes with Zoom for video conferencing dominance', 2019);

// Rivalries - AI & Future Tech
linkRival('google', 'openai', 'Google competes with OpenAI for Generative AI leadership', 2023);
linkRival('openai', 'anthropic', 'OpenAI competes with Anthropic on AI safety and capabilities', 2021);
linkRival('huggingface', 'openai', 'Hugging Face promotes Open models while OpenAI promotes Closed models', 2022);
linkRival('tensorflow', 'pytorch', 'TensorFlow and PyTorch competed for deep learning framework dominance', 2017);
linkRival('perplexity', 'google_search', 'Perplexity competes with Google Search as an AI answer engine', 2023);
linkRival('cursor', 'copilot', 'Cursor competes with GitHub Copilot for AI code editor dominance', 2023);
linkRival('claude', 'chatgpt', 'Claude competes with ChatGPT in LLM performance', 2023);
linkRival('claude', 'gemini', 'Claude competes with Gemini in LLM performance', 2024);
linkRival('sora', 'midjourney', 'Sora competes with Midjourney in generative media', 2024);
linkRival('uber_co', 'tesla', 'Uber competes with Tesla for the future Robotaxi market', 2020);
linkRival('boston_dynamics', 'tesla', 'Boston Dynamics competes with Tesla (Optimus) in humanoid robotics', 2021);
linkRival('lidar', 'tesla_autopilot', 'LiDAR tech competes with Tesla\'s vision-only strategy', 2019);
linkRival('vision_pro', 'oculus_rift', 'Apple Vision Pro competes with Meta Quest (Oculus) in spatial computing', 2024);
linkRival('5g_nr', 'starlink', '5G terrestrial networks compete with Starlink satellite internet', 2020);
linkRival('fugaku', 'nvidia_h100', 'Fugaku competes with NVIDIA H100 clusters in supercomputing', 2022);

// Rivalries - Ideological & Personal
linkRival('steve_jobs', 'bill_gates', 'Steve Jobs clashed with Bill Gates over PC versus Mac philosophy', 1980, 2011);
linkRival('elon_musk', 'jeff_bezos', 'Elon Musk and Jeff Bezos compete in the space race', 2004);
linkRival('elon_musk', 'mark_zuckerberg', 'Elon Musk and Mark Zuckerberg compete in social media and AI', 2016);
linkRival('elon_musk', 'sam_altman', 'Elon Musk clashed with Sam Altman over the direction of OpenAI', 2018);
linkRival('yann_lecun', 'elon_musk', 'Yann LeCun debates Elon Musk on AI safety and capabilities', 2023);
linkRival('ethereum', 'bitcoin', 'Ethereum competes with Bitcoin as a platform vs store of value', 2015);
linkRival('ethereum', 'paypal_co', 'Ethereum DeFi competes with PayPal\'s traditional finance payments', 2017);
linkRival('vitalik_buterin', 'jack_ma', 'Vitalik Buterin represents decentralization versus Jack Ma\'s centralization', 2018);
linkRival('larry_ellison', 'marc_benioff', 'Larry Ellison clashed with Marc Benioff over the vision of cloud computing', 2000);



// New Techs by Hand
createTech('postscript', 'PostScript', 1984, TechRole.L2_RUNTIME_PLATFORM, 'A page description language that sparked the desktop publishing revolution.', 'System Software', 'Development & Languages');
linkCreates('adobe', 'postscript', 'Adobe was founded to develop PostScript, making laser printing possible.', 1984);

createTech('illustrator', 'Adobe Illustrator', 1987, TechRole.L3_END_APPLICATION, 'The industry-standard vector graphics editor.', 'Digital Services & Platforms', 'Digital Platforms');
linkCreates('adobe', 'illustrator', 'Adobe released Illustrator originally for the Apple Macintosh.', 1987);

createTech('premiere_pro', 'Adobe Premiere Pro', 1991, TechRole.L3_END_APPLICATION, 'A timeline-based video editing software application.', 'Digital Services & Platforms', 'Digital Platforms');
linkCreates('adobe', 'premiere_pro', 'Adobe launched Premiere, bringing professional video editing to PCs.', 1991);

createTech('pdf', 'PDF', 1993, TechRole.L2_RUNTIME_PLATFORM, 'Portable Document Format. The global standard for digital document exchange.', 'Fundamental Concepts', 'Standards & Protocols');
linkCreates('adobe', 'pdf', 'Adobe invented PDF to allow documents to be viewed on any system.', 1993);
linkRival('photoshop', 'midjourney', 'Photoshop competes with Midjourney by offering enterprise-safe image generation.', 2023);

createTech('nano_banana', 'Nano Banana', 2025, TechRole.L3_END_APPLICATION, 'The viral AI image model (Gemini 2.5 Flash) famous for its 3D figurine style and text rendering.', 'AI & Physical Systems', 'Artificial Intelligence');
linkCreates('deepmind', 'nano_banana', 'Google DeepMind released the Gemini 2.5 Flash Image model under the codename Nano Banana.', 2025);
linkContributes('gemini', 'nano_banana', 'Nano Banana is built on the multimodal architecture of the Gemini family.', 2025);
linkRival('nano_banana', 'midjourney', 'Nano Banana challenged Midjourney with superior consistency and character retention.', 2025);

// ==============================================================================
// 5. HISTORICAL EVENTS (Timeline Markers)
// ==============================================================================

addEvent('The "Traitorous Eight" left Shockley Semiconductor to found Fairchild, effectively birthing Silicon Valley.', 1957, undefined, ['william_shockley', 'fairchild', 'robert_noyce', 'gordon_moore']);
addEvent('Gordon Moore predicted that the number of transistors on a microchip would double every two years (Moore\'s Law).', 1965, undefined, ['gordon_moore', 'intel', 'transistor', 'ic']);
addEvent('The "AI Winter" period saw reduced funding and interest in artificial intelligence research due to overhyped expectations.', 1974, 1980, ['geoffrey_hinton']);
addEvent('Apple aired the iconic "1984" commercial during the Super Bowl to introduce the Macintosh.', 1984, undefined, ['apple', 'steve_jobs', 'macintosh']);
addEvent('The "Browser Wars" raged between Netscape Navigator and Microsoft Internet Explorer for market dominance.', 1995, 2001, ['microsoft', 'netscape_co', 'marc_andreessen', 'bill_gates']);
addEvent('IBM\'s Deep Blue supercomputer defeated world chess champion Garry Kasparov, a milestone for AI.', 1997, undefined, ['ibm']);
addEvent('United States v. Microsoft Corp. ruled that Microsoft abused its monopoly power on Intel-based PCs.', 1998, 2001, ['microsoft', 'bill_gates', 'intel', 'windows_95']);
addEvent('The Dot-com Bubble burst, causing a massive stock market crash and the collapse of many internet startups.', 2000, 2002, ['amazon', 'cisco', 'softbank', 'google', 'jeff_bezos']);
addEvent('Steve Jobs unveiled the iPhone, combining a widescreen iPod, a revolutionary mobile phone, and a breakthrough internet communicator.', 2007, undefined, ['apple', 'steve_jobs', 'iphone']);
addEvent('Satoshi Nakamoto mined the Genesis Block of Bitcoin amidst the global financial crisis.', 2009, undefined, ['bitcoin', 'satoshi_nakamoto']);
addEvent('Apple and Samsung engaged in a series of high-profile patent lawsuits across multiple countries regarding smartphone designs.', 2011, 2018, ['apple', 'samsung', 'tim_cook']);
addEvent('Edward Snowden\'s leaks prompted tech giants to accelerate the adoption of end-to-end encryption and SSL/TLS.', 2013, undefined, ['google', 'apple', 'meta', 'ssl_tls', 'rsa']);
addEvent('AlphaGo defeated 18-time world champion Lee Sedol in Seoul, demonstrating the power of deep reinforcement learning.', 2016, undefined, ['deepmind', 'alphago', 'google', 'demis_hassabis']);
addEvent('The Cambridge Analytica scandal revealed massive data privacy breaches, leading to increased scrutiny on social media platforms.', 2018, undefined, ['meta', 'mark_zuckerberg']);
addEvent('A global semiconductor shortage disrupted industries from automotive to consumer electronics, highlighting supply chain fragility.', 2020, 2023, ['tsmc', 'samsung', 'intel', 'nvidia', 'apple', 'tesla']);
addEvent('Ethereum completed "The Merge," transitioning from Proof-of-Work to Proof-of-Stake, reducing energy consumption by 99.9%.', 2022, undefined, ['ethereum', 'vitalik_buterin']);
addEvent('OpenAI released ChatGPT, triggering a global generative AI arms race among big tech companies.', 2022, undefined, ['openai', 'chatgpt', 'google', 'microsoft', 'sam_altman']);
addEvent('Sam Altman was abruptly fired and then reinstated as CEO of OpenAI after intense pressure from employees and Microsoft.', 2023, undefined, ['openai', 'sam_altman', 'microsoft', 'satya_nadella', 'ilya_sutskever']);
addEvent('Driven by the AI boom and H100 demand, NVIDIA joined the club of companies with a market cap over $1 trillion.', 2023, undefined, ['nvidia', 'jensen_huang', 'nvidia_h100']);

export const INITIAL_DATA: GraphData = { nodes, links, events };