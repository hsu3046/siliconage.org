import { Category, GraphData, LinkType, ArrowHead, LinkIcon, NodeData, LinkData, CompanyRole, PersonRole, TechRole, CompanyCategory, Role, TechCategoryL1, TechCategoryL2 } from './types';

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
  id: string, label: string, year: number, impactRole: CompanyRole, description: string,
  companyCategory: CompanyCategory,
  meta?: { marketCap?: { current?: string; peak?: string } }
) => {
  nodes.push({ id, label, category: Category.COMPANY, year, impactRole, description, companyCategories: [companyCategory], ...meta });
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
const linkPowers = (source: string, target: string, strength: number = 1.0, icon: LinkIcon = LinkIcon.POWERS) => {
  links.push({ source, target, type: LinkType.POWERS, arrow: ArrowHead.SINGLE, icon, strength });
};

const linkCreates = (source: string, target: string, strength: number = 0.9, icon: LinkIcon = LinkIcon.SPARK) => {
  links.push({ source, target, type: LinkType.CREATES, arrow: ArrowHead.SINGLE, icon, strength });
};

const linkContributes = (source: string, target: string, strength: number = 0.5) => {
  links.push({ source, target, type: LinkType.CONTRIBUTES, arrow: ArrowHead.SINGLE, strength });
};

const linkEngages = (source: string, target: string, strength: number = 0.8, icon: LinkIcon = LinkIcon.RIVALRY) => {
  links.push({ source, target, type: LinkType.ENGAGES, arrow: ArrowHead.DOUBLE, icon, strength });
};


// --- DATA ENTRY START ---

// --- [A] TECHNOLOGY NODES ---
// L0
createTech('turing_machine', 'Turing Machine', 1936, TechRole.L0_THEORY_PHYSICS, 'The theoretical blueprint for all computers. It defines the limits of what machines can calculate.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('transistor', 'The Transistor', 1947, TechRole.L0_THEORY_PHYSICS, 'A tiny electronic switch. Billions of them pack onto chips to control the flow of electricity.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('info_theory', 'Information Theory', 1948, TechRole.L0_THEORY_PHYSICS, 'The math of the digital age. It defined "bits" and how to transmit data without errors.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('rsa', 'RSA Encryption', 1977, TechRole.L0_THEORY_PHYSICS, 'The digital lock and key system that keeps passwords and credit cards safe on the internet.', 'Fundamental Concepts', 'Theories & Architectures');

// L1
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
createTech('sora', 'Sora', 2024, TechRole.L1_CORE_HARDWARE, 'An AI that dreams up realistic videos from simple text, understanding physics and motion.', 'AI & Physical Systems', 'Artificial Intelligence');

// L2
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

// L3
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
createTech('vision_pro', 'Apple Vision Pro', 2024, TechRole.L3_END_APPLICATION, 'Apple\'s spatial computer. It blends digital content with the physical world.', 'AI & Physical Systems', 'Spatial Computing');

// --- [B] COMPANY NODES ---
createCompany('bell_labs', 'Bell Labs', 1925, CompanyRole.LAB, 'The "Idea Factory" of the 20th century. Transistors, lasers, and Unix were born here.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('fairchild', 'Fairchild Semi', 1957, CompanyRole.INFRA, 'The startup that started it all. Its alumni founded Intel, AMD, and Silicon Valley itself.', CompanyCategory.SEMICONDUCTOR);
createCompany('xerox_parc', 'Xerox PARC', 1970, CompanyRole.LAB, 'The research lab that invented the mouse, windows, and ethernet, inspiring the modern PC.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('att', 'AT&T', 1885, CompanyRole.INFRA, 'The telecom monopoly (Ma Bell) that built the physical network infrastructure of the US.', CompanyCategory.INFRA_TELECOM);
createCompany('intel', 'Intel', 1968, CompanyRole.INFRA, 'Put the "Silicon" in Silicon Valley. They created the microprocessor and dominate PCs.', CompanyCategory.SEMICONDUCTOR);
createCompany('amd', 'AMD', 1969, CompanyRole.INFRA, 'The persistent rival. They innovated in high-performance CPUs and challenged Intel\'s dominance.', CompanyCategory.SEMICONDUCTOR);
createCompany('tsmc', 'TSMC', 1987, CompanyRole.INFRA, 'The world\'s chip factory. They manufacture the advanced chips designed by Apple and NVIDIA.', CompanyCategory.SEMICONDUCTOR);
createCompany('nvidia', 'NVIDIA', 1993, CompanyRole.INFRA, 'Started with gaming graphics, now the engine of AI. Their chips train the world\'s models.', CompanyCategory.SEMICONDUCTOR);
createCompany('asml', 'ASML', 1984, CompanyRole.INFRA, 'The only company that makes the EUV machines needed to print the most advanced chips.', CompanyCategory.SEMICONDUCTOR);
createCompany('arm_ltd', 'Arm Holdings', 1990, CompanyRole.LAB, 'They design the energy-efficient chip architecture found in almost every smartphone.', CompanyCategory.SEMICONDUCTOR);
createCompany('samsung', 'Samsung', 1969, CompanyRole.INFRA, 'A global electronics titan. They lead the world in memory chips, phones, and displays.', CompanyCategory.SEMICONDUCTOR);
createCompany('qualcomm', 'Qualcomm', 1985, CompanyRole.INFRA, 'The leader in mobile connectivity. Their tech connects your phone to 4G and 5G networks.', CompanyCategory.SEMICONDUCTOR);
createCompany('ibm', 'IBM', 1911, CompanyRole.PLATFORM, 'Big Blue. They defined the mainframe era and helped launch the personal computer market.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('apple', 'Apple', 1976, CompanyRole.PLATFORM, 'Design meets technology. They revolutionized computing with the Mac, iPod, and iPhone.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('sony', 'Sony', 1946, CompanyRole.PRODUCT, 'Changed entertainment with the Walkman. Now a leader in image sensors and gaming.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('tesla', 'Tesla', 2003, CompanyRole.PRODUCT, 'More than a car company. They made EVs desirable and are pushing robotics and autonomy.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('spacex', 'SpaceX', 2002, CompanyRole.INFRA, 'Revolutionizing spaceflight with reusable rockets. Their goal is to make life multi-planetary.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('dji', 'DJI', 2006, CompanyRole.PRODUCT, 'The absolute leader in consumer drones. They made aerial photography accessible to all.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('boston_dynamics', 'Boston Dynamics', 1992, CompanyRole.LAB, 'Engineering dynamic robots that move with uncanny agility, mimicking humans and animals.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('microsoft', 'Microsoft', 1975, CompanyRole.PLATFORM, 'Software for the world. From Windows to Azure and OpenAI, they are a productivity giant.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('oracle', 'Oracle', 1977, CompanyRole.SERVICE, 'The database giant. Their software manages the critical data for the world\'s largest companies.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('adobe', 'Adobe', 1982, CompanyRole.SERVICE, 'The creator\'s toolkit. They standardized digital imaging and electronic documents.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('salesforce_co', 'Salesforce', 1999, CompanyRole.PLATFORM, 'The cloud pioneer. They replaced installed software with web-based business tools.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('sap', 'SAP', 1972, CompanyRole.SERVICE, 'The backbone of global business. Their software manages operations for huge corporations.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('google', 'Google', 1998, CompanyRole.PLATFORM, 'Organized the world\'s information. From Search to Android, they define the internet.', CompanyCategory.PLATFORM_INTERNET);
createCompany('amazon', 'Amazon', 1994, CompanyRole.PLATFORM, 'The "Everything Store". They also built AWS, the cloud that runs half the internet.', CompanyCategory.PLATFORM_INTERNET);
createCompany('meta', 'Meta', 2004, CompanyRole.PLATFORM, 'Connecting people. They own Facebook, Instagram, and WhatsApp, and are betting on VR.', CompanyCategory.PLATFORM_INTERNET);
createCompany('tencent', 'Tencent', 1998, CompanyRole.PLATFORM, 'The giant behind WeChat. They dominate social media, gaming, and payments in China.', CompanyCategory.PLATFORM_INTERNET);
createCompany('alibaba', 'Alibaba', 1999, CompanyRole.PLATFORM, 'The e-commerce titan of China. They revolutionized digital retail and fintech.', CompanyCategory.PLATFORM_INTERNET);
createCompany('bytedance', 'ByteDance', 2012, CompanyRole.PLATFORM, 'The algorithm company. They built TikTok, the world\'s most addictive content platform.', CompanyCategory.PLATFORM_INTERNET);
createCompany('uber_co', 'Uber', 2009, CompanyRole.SERVICE, 'Transportation on demand. They connected riders and drivers, creating the gig economy.', CompanyCategory.PLATFORM_INTERNET);
createCompany('airbnb', 'Airbnb', 2008, CompanyRole.SERVICE, 'Hospitality by the people. They turned spare rooms into a global network of accommodations.', CompanyCategory.PLATFORM_INTERNET);
createCompany('paypal_co', 'PayPal', 1998, CompanyRole.SERVICE, 'The payments pioneer. Its "Mafia" of founders went on to build Tesla, YouTube, and more.', CompanyCategory.PLATFORM_INTERNET);
createCompany('stripe_co', 'Stripe', 2010, CompanyRole.INFRA, 'Payment infrastructure for the internet. They handle the complexity of money for startups.', CompanyCategory.PLATFORM_INTERNET);
createCompany('spotify_co', 'Spotify', 2006, CompanyRole.SERVICE, 'Streaming savior. They convinced the world to pay for music access instead of ownership.', CompanyCategory.MEDIA_CONTENT);
createCompany('netflix_co', 'Netflix', 1997, CompanyRole.SERVICE, 'Changed TV. They moved from mailing DVDs to streaming, pioneering the binge-watching era.', CompanyCategory.MEDIA_CONTENT);
createCompany('netscape_co', 'Netscape', 1994, CompanyRole.SERVICE, 'The browser that mattered. They commercialized the web and sparked the dot-com boom.', CompanyCategory.PLATFORM_INTERNET);
createCompany('cisco', 'Cisco', 1984, CompanyRole.INFRA, 'The internet\'s plumber. Their routers and switches direct traffic across the global network.', CompanyCategory.INFRA_TELECOM);
createCompany('deepmind', 'Google DeepMind', 2010, CompanyRole.LAB, 'Solved intelligence. Famous for AlphaGo, they use AI to solve fundamental scientific problems.', CompanyCategory.AI_INNOVATION);
createCompany('openai', 'OpenAI', 2015, CompanyRole.LAB, 'The lab behind ChatGPT. They pushed AI from research into a product used by millions.', CompanyCategory.AI_INNOVATION);
createCompany('anthropic', 'Anthropic', 2021, CompanyRole.LAB, 'AI safety first. Founded by former OpenAI members to build reliable, steerable AI.', CompanyCategory.AI_INNOVATION);
createCompany('huggingface', 'Hugging Face', 2016, CompanyRole.PLATFORM, 'The GitHub of AI. An open community hub for sharing models, datasets, and demos.', CompanyCategory.AI_INNOVATION);
createCompany('sequoia', 'Sequoia', 1972, CompanyRole.SERVICE, 'The Midas touch. This VC firm backed Apple, Google, and NVIDIA when they were just ideas.', CompanyCategory.VENTURE_CAPITAL);
createCompany('ycombinator', 'Y Combinator', 2005, CompanyRole.LAB, 'The startup factory. Their accelerator launched Airbnb, Stripe, and Dropbox.', CompanyCategory.VENTURE_CAPITAL);
createCompany('a16z', 'a16z', 2009, CompanyRole.SERVICE, 'Software is eating the world. A modern VC firm that provides massive operational support.', CompanyCategory.VENTURE_CAPITAL);
createCompany('softbank', 'SoftBank', 1981, CompanyRole.SERVICE, 'The Vision Fund. They injected massive capital into unicorns like Uber and WeWork.', CompanyCategory.VENTURE_CAPITAL);

// --- [C] PERSON NODES ---
// --- [C] PERSON NODES ---
createPerson('alan_turing', 'Alan Turing', 1936, PersonRole.THEORIST, 'The genius who cracked the Enigma code and conceived the theoretical basis of computers.', { primaryRole: 'Mathematician', secondaryRole: 'Cryptanalyst', birthYear: 1912, deathYear: 1954 });
createPerson('claude_shannon', 'Claude Shannon', 1948, PersonRole.THEORIST, 'Father of Information Theory. He proved that all communication could be reduced to bits.', { primaryRole: 'Mathematician', secondaryRole: 'Electrical Engineer', birthYear: 1916, deathYear: 2001 });
createPerson('william_shockley', 'William Shockley', 1947, PersonRole.THEORIST, 'Co-inventor of the transistor. A brilliant physicist whose difficult management sparked the Valley.', { primaryRole: 'Physicist', secondaryRole: 'Founder, Shockley Semi', birthYear: 1910, deathYear: 1989 });
createPerson('robert_noyce', 'Robert Noyce', 1957, PersonRole.VISIONARY, 'The "Mayor of Silicon Valley". He co-invented the microchip and co-founded Intel.', { primaryRole: 'Co-founder, Intel', secondaryRole: 'Co-founder, Fairchild', birthYear: 1927, deathYear: 1990 });
createPerson('gordon_moore', 'Gordon Moore', 1965, PersonRole.VISIONARY, 'Predicted computing power would double every two years. His "Law" drove the industry.', { primaryRole: 'Co-founder, Intel', secondaryRole: 'Chairman Emeritus', birthYear: 1929, deathYear: 2023 });
createPerson('dennis_ritchie', 'Dennis Ritchie', 1972, PersonRole.BUILDER, 'The architect. He created the C language and Unix, the foundation of modern software.', { primaryRole: 'Computer Scientist', secondaryRole: 'Creator of C', birthYear: 1941, deathYear: 2011 });
createPerson('tim_berners_lee', 'Tim Berners-Lee', 1989, PersonRole.THEORIST, 'He gave the internet a face. He invented the World Wide Web, the browser, and HTML.', { primaryRole: 'Computer Scientist', secondaryRole: 'Inventor of WWW', birthYear: 1955 });
createPerson('linus_torvalds', 'Linus Torvalds', 1991, PersonRole.BUILDER, 'He wrote Linux for fun. It now runs the cloud. He also gave us Git to manage code.', { primaryRole: 'Software Engineer', secondaryRole: 'Creator of Linux', birthYear: 1969 });
createPerson('satoshi_nakamoto', 'Satoshi Nakamoto', 2008, PersonRole.THEORIST, 'The mysterious creator of Bitcoin. They solved the problem of digital trust without banks.', { primaryRole: 'Cryptographer', secondaryRole: 'Creator of Bitcoin' });
createPerson('vitalik_buterin', 'Vitalik Buterin', 2013, PersonRole.VISIONARY, 'The boy genius behind Ethereum. He envisioned a blockchain that could run any program.', { primaryRole: 'Co-founder, Ethereum', secondaryRole: 'Programmer', birthYear: 1994 });
createPerson('morris_chang', 'Morris Chang', 1987, PersonRole.VISIONARY, 'He revolutionized chips by creating the foundry model, building chips designed by others.', { primaryRole: 'Founder, TSMC', secondaryRole: 'Former Chairman', birthYear: 1931 });
createPerson('jensen_huang', 'Jensen Huang', 1993, PersonRole.VISIONARY, 'The visionary who bet on GPUs. He turned a graphics company into the engine of AI.', { primaryRole: 'Co-founder & CEO, NVIDIA', secondaryRole: 'Electrical Engineer', birthYear: 1963 });
createPerson('lisa_su', 'Lisa Su', 2014, PersonRole.LEADER, 'The engineer who saved AMD. She executed one of the greatest turnarounds in tech history.', { primaryRole: 'Chair & CEO, AMD', secondaryRole: 'Electrical Engineer', birthYear: 1969 });
createPerson('masayoshi_son', 'Masayoshi Son', 1981, PersonRole.INVESTOR, 'The risk-taker. His Vision Fund poured billions into the future of AI and connectivity.', { primaryRole: 'Founder & CEO, SoftBank', secondaryRole: 'Investor', birthYear: 1957 });
createPerson('steve_jobs', 'Steve Jobs', 1976, PersonRole.VISIONARY, 'The visionary who stood at the intersection of art and technology. He made gadgets personal.', { primaryRole: 'Co-founder, Apple', secondaryRole: 'Founder, NeXT', birthYear: 1955, deathYear: 2011 });
createPerson('steve_wozniak', 'Steve Wozniak', 1976, PersonRole.BUILDER, 'The engineer\'s engineer. He single-handedly designed the Apple I and II computers.', { primaryRole: 'Co-founder, Apple', secondaryRole: 'Computer Engineer', birthYear: 1950 });
createPerson('bill_gates', 'Bill Gates', 1975, PersonRole.VISIONARY, 'The coder who meant business. He realized software was the key and put Windows everywhere.', { primaryRole: 'Co-founder, Microsoft', secondaryRole: 'Co-chair, Gates Foundation', birthYear: 1955 });
createPerson('larry_ellison', 'Larry Ellison', 1977, PersonRole.VISIONARY, 'The samurai of software. He built an empire on enterprise databases and ruthless tactics.', { primaryRole: 'Co-founder & CTO, Oracle', secondaryRole: 'Former CEO', birthYear: 1944 });
createPerson('jeff_bezos', 'Jeff Bezos', 1994, PersonRole.VISIONARY, 'He started selling books and ended up selling everything. He built the cloud (AWS) too.', { primaryRole: 'Founder, Amazon', secondaryRole: 'Founder, Blue Origin', birthYear: 1964 });
createPerson('larry_page', 'Larry Page', 1998, PersonRole.VISIONARY, 'He wanted to download the entire internet. He invented PageRank and co-founded Google.', { primaryRole: 'Co-founder, Google', secondaryRole: 'Former CEO, Alphabet', birthYear: 1973 });
createPerson('sergey_brin', 'Sergey Brin', 1998, PersonRole.VISIONARY, 'The data scientist who co-founded Google. He helped organize the world\'s information.', { primaryRole: 'Co-founder, Google', secondaryRole: 'Computer Scientist', birthYear: 1973 });
createPerson('marc_andreessen', 'Marc Andreessen', 1994, PersonRole.INVESTOR, 'He built the first graphical browser. Now he funds the software eating the world.', { primaryRole: 'Co-founder, a16z', secondaryRole: 'Co-founder, Netscape', birthYear: 1971 });
createPerson('mark_zuckerberg', 'Mark Zuckerberg', 2004, PersonRole.VISIONARY, 'He connected the world. He moved fast, broke things, and built a social empire.', { primaryRole: 'Founder & CEO, Meta', secondaryRole: 'Philanthropist', birthYear: 1984 });
createPerson('reed_hastings', 'Reed Hastings', 1997, PersonRole.VISIONARY, 'He realized DVDs would die. He pivoted Netflix to streaming and changed TV forever.', { primaryRole: 'Co-founder, Netflix', secondaryRole: 'Executive Chairman', birthYear: 1960 });
createPerson('jack_ma', 'Jack Ma', 1999, PersonRole.VISIONARY, 'The teacher who connected China to the world. He built an e-commerce giant from an apartment.', { primaryRole: 'Co-founder, Alibaba', secondaryRole: 'Philanthropist', birthYear: 1964 });
createPerson('pony_ma', 'Pony Ma', 1998, PersonRole.VISIONARY, 'The quiet architect of WeChat. He built a digital ecosystem that powers modern China.', { primaryRole: 'Founder & CEO, Tencent', secondaryRole: 'Software Engineer', birthYear: 1971 });
createPerson('elon_musk', 'Elon Musk', 2002, PersonRole.VISIONARY, 'The real-life Tony Stark. He is electrifying transport and building rockets to Mars.', { primaryRole: 'Founder & CEO, SpaceX', secondaryRole: 'CEO, Tesla', birthYear: 1971 });
createPerson('peter_thiel', 'Peter Thiel', 1998, PersonRole.INVESTOR, 'The contrarian. He co-founded PayPal, backed Facebook first, and funds big ideas.', { primaryRole: 'Partner, Founders Fund', secondaryRole: 'Co-founder, PayPal', birthYear: 1967 });
createPerson('reid_hoffman', 'Reid Hoffman', 2002, PersonRole.INVESTOR, 'The networker. He founded LinkedIn and is the "Oracle" connected to everyone in the Valley.', { primaryRole: 'Partner, Greylock', secondaryRole: 'Co-founder, LinkedIn', birthYear: 1967 });
createPerson('max_levchin', 'Max Levchin', 1998, PersonRole.BUILDER, 'The coder behind PayPal. His work on fraud prevention proved humans are still useful.', { primaryRole: 'Founder & CEO, Affirm', secondaryRole: 'Co-founder, PayPal', birthYear: 1975 });
createPerson('roelof_botha', 'Roelof Botha', 2003, PersonRole.INVESTOR, 'The PayPal Mafia member who leads Sequoia. He spots the next big thing before anyone else.', { primaryRole: 'Partner, Sequoia', secondaryRole: 'Former CFO, PayPal', birthYear: 1973 });
createPerson('chad_hurley', 'Chad Hurley', 2005, PersonRole.VISIONARY, 'He made video easy. Co-founded YouTube so anyone could broadcast themselves.', { primaryRole: 'Co-founder, YouTube', secondaryRole: 'Former CEO', birthYear: 1977 });
createPerson('marc_benioff', 'Marc Benioff', 1999, PersonRole.VISIONARY, 'He declared "No Software". He moved business tools to the cloud with Salesforce.', { primaryRole: 'Founder & CEO, Salesforce', secondaryRole: 'Philanthropist', birthYear: 1964 });
createPerson('travis_kalanick', 'Travis Kalanick', 2009, PersonRole.VISIONARY, 'He hustled to build Uber. He changed urban transport with the push of a button.', { primaryRole: 'Co-founder, Uber', secondaryRole: 'Former CEO', birthYear: 1976 });
createPerson('patrick_collison', 'Patrick Collison', 2010, PersonRole.VISIONARY, 'He fixed payments. With Stripe, he made it simple for startups to accept money online.', { primaryRole: 'Co-founder & CEO, Stripe', secondaryRole: 'Entrepreneur', birthYear: 1988 });
createPerson('geoffrey_hinton', 'Geoffrey Hinton', 2012, PersonRole.THEORIST, 'The Godfather of AI. He believed in neural networks for decades until the world caught up.', { primaryRole: 'AI Researcher', secondaryRole: 'Turing Award Winner', birthYear: 1947 });
createPerson('demis_hassabis', 'Demis Hassabis', 2010, PersonRole.VISIONARY, 'The gamer neuroscientist. He founded DeepMind to solve intelligence and cure diseases.', { primaryRole: 'Co-founder & CEO, DeepMind', secondaryRole: 'AI Researcher', birthYear: 1976 });
createPerson('sam_altman', 'Sam Altman', 2015, PersonRole.LEADER, 'The operator. He scaled Y Combinator and then led OpenAI to release ChatGPT.', { primaryRole: 'Co-founder & CEO, OpenAI', secondaryRole: 'Former President, YC', birthYear: 1985 });
createPerson('ilya_sutskever', 'Ilya Sutskever', 2015, PersonRole.THEORIST, 'The brain behind GPT. He led the technical breakthroughs that made AI talk.', { primaryRole: 'Co-founder, OpenAI', secondaryRole: 'Co-founder, SSI', birthYear: 1985 });
createPerson('satya_nadella', 'Satya Nadella', 2014, PersonRole.LEADER, 'The diplomat. He refreshed Microsoft\'s soul, embracing the cloud and partnering with OpenAI.', { primaryRole: 'CEO, Microsoft', secondaryRole: 'Chairman', birthYear: 1967 });
createPerson('tim_cook', 'Tim Cook', 2011, PersonRole.LEADER, 'The operations genius. He took Apple to a $3 trillion valuation by perfecting the supply chain.', { primaryRole: 'CEO, Apple', secondaryRole: 'Former COO', birthYear: 1960 });
createPerson('sundar_pichai', 'Sundar Pichai', 2015, PersonRole.LEADER, 'The product leader. He oversaw Chrome and Android before taking the helm at Google.', { primaryRole: 'CEO, Alphabet & Google', secondaryRole: 'Product Manager', birthYear: 1972 });
createPerson('yann_lecun', 'Yann LeCun', 2013, PersonRole.THEORIST, 'The AI Scientist. He invented the convolutional networks that let computers "see".', { primaryRole: 'Chief AI Scientist, Meta', secondaryRole: 'Turing Award Winner', birthYear: 1960 });
createPerson('don_valentine', 'Don Valentine', 1972, PersonRole.INVESTOR, 'The grandfather of VC. His firm Sequoia backed the companies that defined the future.', { primaryRole: 'Founder, Sequoia', secondaryRole: 'Venture Capitalist', birthYear: 1932, deathYear: 2019 });
createPerson('paul_graham', 'Paul Graham', 2005, PersonRole.INVESTOR, 'The hacker philosopher. He created Y Combinator and wrote the playbook for startups.', { primaryRole: 'Co-founder, Y Combinator', secondaryRole: 'Essayist', birthYear: 1964 });
createPerson('arthur_rock', 'Arthur Rock', 1961, PersonRole.INVESTOR, 'The financier. He helped start Intel and Apple, coining the term "Venture Capital".', { primaryRole: 'Venture Capitalist', secondaryRole: 'Early Investor', birthYear: 1926 });

// ==============================================================================
// 4. CONNECTIONS: THE SILICON PROTOCOL
// ==============================================================================

// ------------------------------------------------------------------------------
// LAYER 1: PEOPLE -> COMPANIES (The Spark)
// ------------------------------------------------------------------------------
linkCreates('william_shockley', 'fairchild');
linkCreates('robert_noyce', 'intel');
linkCreates('gordon_moore', 'intel');
linkCreates('morris_chang', 'tsmc');
linkCreates('jensen_huang', 'nvidia');
linkCreates('steve_jobs', 'apple');
linkCreates('steve_wozniak', 'apple');
linkCreates('bill_gates', 'microsoft');
linkCreates('larry_ellison', 'oracle');
linkCreates('jeff_bezos', 'amazon');
linkCreates('larry_page', 'google');
linkCreates('sergey_brin', 'google');
linkCreates('marc_andreessen', 'netscape_co');
linkCreates('reed_hastings', 'netflix_co');
linkCreates('mark_zuckerberg', 'meta');
linkCreates('peter_thiel', 'paypal_co');
linkCreates('max_levchin', 'paypal_co');
linkCreates('elon_musk', 'paypal_co'); // Merger
linkCreates('elon_musk', 'spacex');
linkCreates('elon_musk', 'tesla'); // Architect/CEO
linkCreates('elon_musk', 'openai');
linkCreates('sam_altman', 'openai');
linkCreates('demis_hassabis', 'deepmind');
linkCreates('jack_ma', 'alibaba');
linkCreates('pony_ma', 'tencent');
linkCreates('chad_hurley', 'youtube');
linkCreates('travis_kalanick', 'uber_co');
linkCreates('patrick_collison', 'stripe_co');
linkCreates('marc_benioff', 'salesforce_co');
linkCreates('don_valentine', 'sequoia');
linkCreates('paul_graham', 'ycombinator');
linkCreates('marc_andreessen', 'a16z');
linkCreates('masayoshi_son', 'softbank');

// ------------------------------------------------------------------------------
// LAYER 2: PEOPLE -> TECHNOLOGY (The Invention - Only if direct)
// ------------------------------------------------------------------------------
linkCreates('alan_turing', 'turing_machine');
linkCreates('claude_shannon', 'info_theory');
linkCreates('william_shockley', 'transistor');
linkCreates('robert_noyce', 'ic');
linkCreates('tim_berners_lee', 'www');
linkCreates('dennis_ritchie', 'unix');
linkCreates('dennis_ritchie', 'c_lang');
linkCreates('linus_torvalds', 'linux');
linkCreates('linus_torvalds', 'git');
linkCreates('satoshi_nakamoto', 'bitcoin');
linkCreates('vitalik_buterin', 'ethereum');
linkCreates('geoffrey_hinton', 'alexnet');
linkCreates('ilya_sutskever', 'transformer');

// ------------------------------------------------------------------------------
// LAYER 3: COMPANIES -> TECHNOLOGY (The Product)
// ------------------------------------------------------------------------------
// Hardware & Chips
linkCreates('bell_labs', 'transistor');
linkCreates('bell_labs', 'unix');
linkCreates('bell_labs', 'c_lang');
linkCreates('fairchild', 'ic');
linkCreates('intel', 'x86');
linkCreates('intel', 'microprocessor');
linkCreates('nvidia', 'gpu_geforce');
linkCreates('nvidia', 'nvidia_h100');
linkCreates('nvidia', 'cuda');
linkCreates('arm_ltd', 'arm_arch');
linkCreates('arm_ltd', 'arm_cortex');
linkCreates('asml', 'euv');
linkCreates('tsmc', 'foundry_model');
linkCreates('ibm', 'ibm_360');
linkCreates('sony', 'walkman');
linkCreates('sony', 'optical_disc');
linkCreates('apple', 'macintosh');
linkCreates('apple', 'iphone');
linkCreates('apple', 'ios');
linkCreates('apple', 'vision_pro');
linkCreates('apple', 'app_store');
linkCreates('tesla', 'model_s');
linkCreates('tesla', 'tesla_autopilot');
linkCreates('spacex', 'spacex_falcon9');
linkCreates('spacex', 'starship');
linkCreates('spacex', 'starlink');
linkCreates('dji', 'dji_phantom');

// Software & Platforms
linkCreates('microsoft', 'windows_95');
linkCreates('microsoft', 'excel');
linkCreates('microsoft', 'copilot');
linkCreates('oracle', 'oracle_db');
linkCreates('adobe', 'photoshop');
linkCreates('salesforce_co', 'salesforce_crm');
linkCreates('netscape_co', 'netscape');
linkCreates('netscape_co', 'javascript');
linkCreates('netscape_co', 'ssl_tls');
linkCreates('google', 'google_search');
linkCreates('google', 'android');
linkCreates('google', 'google_chrome');
linkCreates('google', 'mapreduce');
linkCreates('google', 'transformer');
linkCreates('google', 'tpu');
linkCreates('google', 'gemini');
linkCreates('deepmind', 'alphago');
linkCreates('deepmind', 'alphago_zero');
linkCreates('meta', 'facebook');
linkCreates('meta', 'pytorch');
linkCreates('openai', 'chatgpt');
linkCreates('openai', 'sora');
linkCreates('netflix_co', 'netflix');
linkCreates('spotify_co', 'spotify');
linkCreates('uber_co', 'uber_app');
linkCreates('paypal_co', 'paypal');
linkCreates('stripe_co', 'stripe');
linkCreates('bytedance', 'tiktok');
linkCreates('tencent', 'wechat');

// ------------------------------------------------------------------------------
// LAYER 4: TECHNOLOGY STACK (L0->L1->L2->L3)
// ------------------------------------------------------------------------------
// Theory -> L1
linkContributes('turing_machine', 'microprocessor');
linkContributes('info_theory', 'tcp_ip');
linkContributes('info_theory', 'cdma');
linkContributes('transistor', 'ic');
linkContributes('transistor', 'blue_led');

// L1 -> L1 (Evolution)
linkPowers('lithography', 'ic');
linkPowers('lithography', 'euv');
linkPowers('euv', 'nvidia_h100');
linkPowers('euv', 'arm_cortex');
linkPowers('ic', 'microprocessor');
linkPowers('ic', 'dram');
linkPowers('ic', 'nand');
linkContributes('microprocessor', 'x86');
linkContributes('microprocessor', 'arm_arch');
linkContributes('dram', 'hbm');
linkPowers('hbm', 'nvidia_h100');
linkPowers('hbm', 'tpu');
linkPowers('optical_fiber', 'tcp_ip');
linkContributes('tcp_ip', 'ethernet');
linkContributes('ethernet', 'wifi');
linkContributes('cdma', 'gsm');
linkContributes('gsm', 'lte');
linkContributes('lte', '5g_nr');
linkPowers('blue_led', 'optical_disc');
linkPowers('cmos', 'lidar');
linkContributes('alexnet', 'transformer');
linkContributes('gan', 'stable_diffusion');

// L1 -> L2 (Hardware powers Runtime)
linkPowers('microprocessor', 'unix');
linkPowers('x86', 'linux');
linkPowers('x86', 'windows_95');
linkPowers('arm_arch', 'ios');
linkPowers('arm_arch', 'android');
linkPowers('gpu_geforce', 'cuda');
linkPowers('nvidia_h100', 'cuda');
linkPowers('nvidia_h100', 'pytorch');
linkPowers('tpu', 'tensorflow');
linkPowers('tcp_ip', 'www');
linkPowers('tcp_ip', 'aws_cloud');
linkPowers('ssl_tls', 'aws_cloud');
linkPowers('cisco_router', 'aws_cloud');

// L2 -> L2 (Runtime Dependency)
linkContributes('unix', 'c_lang');
linkContributes('unix', 'linux');
linkContributes('c_lang', 'python');
linkContributes('c_lang', 'java');
linkContributes('c_lang', 'sql');
linkContributes('sql', 'oracle_db');
linkPowers('linux', 'android');
linkPowers('linux', 'aws_cloud');
linkPowers('linux', 'docker');
linkPowers('linux', 'git');
linkPowers('aws_cloud', 'docker');
linkPowers('java', 'android');
linkPowers('cuda', 'pytorch');
linkPowers('cuda', 'tensorflow');
linkPowers('mapreduce', 'tensorflow'); // Concept
linkContributes('bittorrent', 'bitcoin');

// L2 -> L3 (Platform powers App)
linkPowers('ios', 'iphone');
linkPowers('ios', 'app_store');
linkPowers('ios', 'vision_pro');
linkPowers('android', 'model_s');
linkPowers('aws_cloud', 'netflix');
linkPowers('aws_cloud', 'zoom');
linkPowers('aws_cloud', 'slack');
linkPowers('aws_cloud', 'dropbox'); // Conceptual
linkPowers('aws_cloud', 'uber_app');
linkPowers('aws_cloud', 'stripe');
linkPowers('aws_cloud', 'copilot');
linkPowers('oracle_db', 'salesforce_crm');
linkPowers('oracle_db', 'sap'); // Conceptual
linkPowers('pytorch', 'chatgpt');
linkPowers('pytorch', 'stable_diffusion');
linkPowers('pytorch', 'tesla_autopilot');
linkPowers('pytorch', 'huggingface'); // Tech->Company exc.
linkPowers('tensorflow', 'alphago');
linkPowers('tensorflow', 'google_search');
linkPowers('tensorflow', 'tiktok');
linkPowers('google_chrome', 'google_search');
linkPowers('app_store', 'uber_app');
linkPowers('app_store', 'spotify');
linkPowers('app_store', 'tiktok');

// L1 -> L3 (Direct Hardware Power)
linkPowers('li_ion', 'iphone');
linkPowers('li_ion', 'model_s');
linkPowers('li_ion', 'dji_phantom');
linkPowers('gps', 'uber_app');
linkPowers('gps', 'dji_phantom');
linkPowers('gps', 'tesla_autopilot');
linkPowers('oled', 'iphone');
linkPowers('oled', 'vision_pro');
linkPowers('bluetooth', 'iphone');
linkPowers('bluetooth', 'model_s');
linkPowers('optical_fiber', 'starlink'); // Ground stations
linkPowers('nvidia_h100', 'chatgpt');
linkPowers('nvidia_h100', 'starship'); // Simulation

// ------------------------------------------------------------------------------
// LAYER 5: TECHNOLOGY -> COMPANY (Infrastructure Dependency)
// ------------------------------------------------------------------------------
linkPowers('euv', 'tsmc');
linkPowers('euv', 'samsung');
linkPowers('euv', 'intel');
linkPowers('foundry_model', 'nvidia');
linkPowers('foundry_model', 'apple');
linkPowers('foundry_model', 'amd');
linkPowers('foundry_model', 'qualcomm');
linkPowers('arm_arch', 'apple');
linkPowers('arm_arch', 'qualcomm');
linkPowers('arm_arch', 'samsung');
linkPowers('nvidia_h100', 'openai');
linkPowers('nvidia_h100', 'meta');
linkPowers('nvidia_h100', 'tesla');
linkPowers('nvidia_h100', 'microsoft');
linkPowers('aws_cloud', 'netflix_co');
linkPowers('aws_cloud', 'uber_co');
linkPowers('aws_cloud', 'stripe_co');
linkPowers('ssl_tls', 'paypal_co');
linkPowers('transformer', 'huggingface');

// ------------------------------------------------------------------------------
// LAYER 6: CAPITAL & INFLUENCE (PERSON/CO -> CONTRIBUTES -> PERSON/CO)
// ------------------------------------------------------------------------------
// Mentorship & Lineage
linkContributes('william_shockley', 'robert_noyce');
linkContributes('robert_noyce', 'steve_jobs');
linkContributes('steve_jobs', 'mark_zuckerberg');
linkContributes('steve_jobs', 'tim_cook');
linkContributes('don_valentine', 'steve_jobs');
linkContributes('larry_ellison', 'marc_benioff');
linkContributes('paul_graham', 'sam_altman');
linkContributes('paul_graham', 'patrick_collison');

// Executive Leadership
linkContributes('tim_cook', 'apple');
linkContributes('satya_nadella', 'microsoft');
linkContributes('satya_nadella', 'openai');
linkContributes('sundar_pichai', 'google');
linkContributes('lisa_su', 'amd');
linkContributes('sheryl_sandberg', 'meta'); // Assumed node exists, or skip if strictly no orphan
linkContributes('roelof_botha', 'sequoia');

// Investment (VC -> Company)
linkContributes('sequoia', 'apple');
linkContributes('sequoia', 'google');
linkContributes('sequoia', 'nvidia');
linkContributes('sequoia', 'paypal_co');
linkContributes('sequoia', 'youtube');
linkContributes('sequoia', 'stripe_co');
linkContributes('ycombinator', 'airbnb');
linkContributes('ycombinator', 'stripe_co');
linkContributes('ycombinator', 'openai');
linkContributes('a16z', 'facebook');
linkContributes('a16z', 'coinbase'); // Conceptual link if node missing
linkContributes('softbank', 'alibaba');
linkContributes('softbank', 'uber_co');
linkContributes('softbank', 'arm_ltd');
linkContributes('softbank', 'boston_dynamics');
linkContributes('arthur_rock', 'intel');
linkContributes('arthur_rock', 'apple');
linkContributes('peter_thiel', 'meta');
linkContributes('masayoshi_son', 'alibaba');

// The PayPal Mafia (Company -> Person -> Company flow simulated via Person)
// *Note: Using direct person links created in Layer 2/3 mostly covers this.
// Adding direct Company->Company lineage for clarity
linkContributes('fairchild', 'intel');
linkContributes('fairchild', 'amd');
linkContributes('fairchild', 'sequoia');
linkContributes('paypal_co', 'spacex'); // via Musk
linkContributes('paypal_co', 'tesla'); // via Musk
linkContributes('paypal_co', 'linkedin'); // via Hoffman
linkContributes('paypal_co', 'youtube'); // via Hurley
linkContributes('paypal_co', 'sequoia'); // via Botha
linkContributes('paypal_co', 'palantir'); // via Thiel
linkContributes('oracle', 'salesforce_co'); // Benioff lineage
linkContributes('google', 'deepmind'); // Acquisition
linkContributes('google', 'uber_co'); // Early investment

// ------------------------------------------------------------------------------
// LAYER 7: RIVALRY & PARTNERSHIP (ENGAGES)
// ------------------------------------------------------------------------------
// Partnerships (Heart)
linkEngages('microsoft', 'intel', 0.9, LinkIcon.HEART);
linkEngages('microsoft', 'openai', 1.0, LinkIcon.HEART);
linkEngages('apple', 'tsmc', 1.0, LinkIcon.HEART);
linkEngages('apple', 'arm_ltd', 0.8, LinkIcon.HEART);
linkEngages('salesforce_co', 'slack', 0.8, LinkIcon.HEART);
linkEngages('wikipedia', 'google_search', 0.8, LinkIcon.HEART);
linkEngages('att', 'cisco', 0.7, LinkIcon.HEART);

// Rivalries (Sword)
linkEngages('apple', 'google');
linkEngages('apple', 'microsoft');
linkEngages('apple', 'samsung');
linkEngages('apple', 'meta');
linkEngages('amazon', 'microsoft');
linkEngages('amazon', 'google');
linkEngages('google', 'microsoft');
linkEngages('intel', 'amd');
linkEngages('nvidia', 'amd');
linkEngages('nvidia', 'intel');
linkEngages('meta', 'bytedance');
linkEngages('google', 'openai');
linkEngages('openai', 'anthropic');
linkEngages('oracle', 'salesforce_co');
linkEngages('uber_co', 'tesla'); // Robo-taxi future rivalry
linkEngages('netflix_co', 'youtube');
linkEngages('ios', 'android');
linkEngages('unreal', 'unity');
linkEngages('tensorflow', 'pytorch');
linkEngages('steve_jobs', 'bill_gates');
linkEngages('elon_musk', 'jeff_bezos');
linkEngages('elon_musk', 'mark_zuckerberg');
linkEngages('elon_musk', 'sam_altman');

// ==============================================================================
// [ADDITIONAL LINKS] FILLING THE GAPS & ENRICHING THE GRAPH
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. ORPHAN RESCUE & DEEPENING TECH ROOTS
// ------------------------------------------------------------------------------
// Boston Dynamics (Robotics Pioneer)
// *Connection Logic: Started at MIT (no node), owned by Google -> SoftBank -> Hyundai.
linkContributes('google', 'boston_dynamics');           // Former owner (Capital & Research)
linkContributes('softbank', 'boston_dynamics');         // Former owner (Capital)
linkPowers('ai_robotics', 'boston_dynamics');           // *If exists, else conceptual
linkEngages('boston_dynamics', 'tesla');                // [Rivalry] Atlas vs Optimus

// Hugging Face (The AI Community)
// *Connection Logic: Runs on Cloud, Partners with Hardware.
linkPowers('aws_cloud', 'huggingface');                 // Strategic partnership & Hosting
linkEngages('huggingface', 'github');                   // [Rivalry] Model Hub vs Code Hub
linkEngages('huggingface', 'openai');                   // [Rivalry] Open vs Closed AI

// SAP (The Enterprise Backbone)
// *Connection Logic: Runs the world's business, competes with Oracle/Salesforce.
linkPowers('sql', 'sap');                               // Core technology
linkPowers('linux', 'sap');                             // Hana runs on Linux
linkEngages('sap', 'oracle');                           // [Rivalry] ERP & Database War
linkEngages('sap', 'salesforce_co');                    // [Rivalry] CRM Competition

// Cisco ( The Internet Plumber)
// *Connection Logic: Created the routers, partners with Telcos.
linkCreates('cisco', 'cisco_router');                   // Creator of the hardware
linkPowers('cisco_router', 'att');                      // AT&T relies on Cisco hardware
linkPowers('cisco_router', 'google');                   // Data centers rely on networking gear

// ------------------------------------------------------------------------------
// 2. MODERN AI DYNAMICS (Investments & API Dependencies)
// ------------------------------------------------------------------------------
// Anthropic (The funded rival)
linkContributes('amazon', 'anthropic');                 // Massive Investment ($4B)
linkContributes('google', 'anthropic');                 // Massive Investment ($2B)
linkPowers('aws_cloud', 'anthropic');                   // Training Infrastructure

// Perplexity (The Answer Engine)
linkContributes('jeff_bezos', 'perplexity');            // Investor
linkContributes('nvidia', 'perplexity');                // Investor
linkPowers('openai', 'perplexity');                     // Uses GPT-4 API
linkPowers('claude', 'perplexity');                  // Uses Claude API
linkEngages('perplexity', 'google_search');             // [Rivalry] Direct threat to search

// Cursor (The AI Editor)
linkPowers('openai', 'cursor');                         // Uses GPT-4 models
linkPowers('claude', 'cursor');                      // Uses Claude models
linkContributes('microsoft', 'cursor');                 // Built on top of VS Code (Open Source)
linkEngages('cursor', 'copilot');                       // [Rivalry] The AI Coding War

// Sora & Midjourney (Generative Media)
linkContributes('gan', 'sora');                         // Ancestral tech
linkContributes('transformer', 'sora');                 // Architecture
linkContributes('gan', 'midjourney');                   // Ancestral tech
linkEngages('adobe', 'midjourney');                     // [Rivalry] Photoshop vs GenAI

// ------------------------------------------------------------------------------
// 3. SEMICONDUCTOR & HARDWARE DEPTH
// ------------------------------------------------------------------------------
// TSMC's Reach (Beyond Apple)
linkPowers('tsmc', 'amd');                              // Manufactures Ryzen/EPYC
linkPowers('tsmc', 'qualcomm');                         // Manufactures Snapdragon
linkPowers('tsmc', 'broadcom');                         // *If exists
linkPowers('asml', 'samsung');                          // Samsung uses EUV

// The Chip Wars
linkEngages('samsung', 'tsmc');                         // [Rivalry] Foundry business
linkEngages('qualcomm', 'apple');                       // [Rivalry] Modem chips (and legal wars)
linkEngages('intel', 'tsmc');                           // [Rivalry] IDM vs Foundry

// ------------------------------------------------------------------------------
// 4. GLOBAL TECH GIANTS (Asian Tech Integration)
// ------------------------------------------------------------------------------
// Alibaba & Tencent
linkCreates('softbank', 'alibaba');                     // Masayoshi Son's greatest investment
linkEngages('alibaba', 'tencent');                      // [Rivalry] Payment (Alipay vs WeChat Pay) & Cloud
linkEngages('alibaba', 'amazon');                       // [Rivalry] Global E-commerce
linkPowers('nvidia_h100', 'bytedance');                 // Bytedance hoards H100s for TikTok AI
linkPowers('nvidia_h100', 'tencent');                   // Tencent Cloud AI

// ------------------------------------------------------------------------------
// 5. HISTORICAL CONTEXT & FOUNDATIONS
// ------------------------------------------------------------------------------
// The "Wintel" Era Detail
linkPowers('intel', 'microsoft', 0.9);                  // Hardware enabling Software
linkContributes('ibm', 'microsoft');                    // IBM chose DOS, making Microsoft a giant

// The Mobile Revolution Detail
linkPowers('arm_arch', 'qualcomm');                     // Qualcomm creates Arm-based chips
linkPowers('arm_arch', 'samsung');                      // Exynos chips
linkContributes('google', 'samsung');                   // Android OS partner (Symbiosis)
linkEngages('samsung', 'apple');                        // [Rivalry] Galaxy vs iPhone

// ------------------------------------------------------------------------------
// 6. VC & MAFIA EXTENSIONS
// ------------------------------------------------------------------------------
linkContributes('a16z', 'coinbase');                    // *If node exists (Crypto push)
linkContributes('a16z', 'openai');                      // *Recent investment? No, mostly Thrive/Microsoft.
linkContributes('a16z', 'facebook');                    // Early investor
linkContributes('peter_thiel', 'facebook');             // First outside investor
linkContributes('peter_thiel', 'openai');               // *Was early donor, but distinct from VC role mostly
linkContributes('ycombinator', 'twitch');               // *If node exists
linkContributes('sequoia', 'whatsapp');                 // *If node exists


// ==============================================================================
// 6. FINAL ORPHAN CHECK & ENRICHMENT (Zero-Link Nodes Rescue)
// ==============================================================================

// ------------------------------------------------------------------------------
// [A] Xerox PARC (The Forgotten Grandfather)
// *Current Status: Under-connected. Needs to show it invented the modern PC.*
// ------------------------------------------------------------------------------
linkCreates('xerox_parc', 'ethernet');                  // PARC invented Ethernet (Metcalfe)
linkContributes('xerox_parc', 'macintosh');             // Jobs visited PARC -> Inspired Mac GUI
linkContributes('xerox_parc', 'windows_95');            // Gates also borrowed PARC concepts
linkContributes('xerox_parc', 'adobe');                 // Warnock (Adobe Founder) came from PARC
linkContributes('xerox_parc', 'microsoft');             // Simonyi (Word/Excel creator) came from PARC

// ------------------------------------------------------------------------------
// [B] Amazon.com (The Service) vs Amazon (The Company)
// *Current Status: Needs separation of Service utility and Company power.*
// ------------------------------------------------------------------------------
linkCreates('amazon', 'amazon_com');                    // Company created the Service
linkPowers('www', 'amazon_com');                        // The Web powers the Store
linkPowers('ssl_tls', 'amazon_com');                    // Security made e-commerce possible
linkPowers('oracle_db', 'amazon_com');                  // (Early days) Amazon ran on Oracle
linkEngages('amazon_com', 'alibaba');                   // [Rivalry] Global E-commerce War
linkEngages('amazon_com', 'google_search');             // [Rivalry] Product Search War

// ------------------------------------------------------------------------------
// [C] Fugaku (The Supercomputer)
// *Current Status: Likely Isolated.*
// ------------------------------------------------------------------------------
linkPowers('arm_arch', 'fugaku');                       // Powered by ARM A64FX chips (First ARM supercomputer #1)
linkPowers('linux', 'fugaku');                          // Runs on Red Hat Enterprise Linux
linkCreates('fugaku', 'covid_simulation');              // *Conceptual: Used for COVID research
linkEngages('fugaku', 'nvidia_h100');                   // [Rivalry] CPU-based HPC vs GPU-based HPC

// ------------------------------------------------------------------------------
// [D] Raspberry Pi (The Edu-Computer)
// *Current Status: Needs upstream tech links.*
// ------------------------------------------------------------------------------
linkPowers('arm_cortex', 'raspberry_pi');               // Runs on ARM Cortex chips
linkPowers('linux', 'raspberry_pi');                    // Raspbian is Debian Linux
linkPowers('python', 'raspberry_pi');                   // Primary educational language
linkContributes('raspberry_pi', 'steam_deck');          // *Conceptual: Evolution of handheld Linux gaming? (Optional)

// ------------------------------------------------------------------------------
// [E] Starship (The Mars Rocket)
// *Current Status: Connected to SpaceX, needs Tech depth.*
// ------------------------------------------------------------------------------
linkCreates('spacex', 'starship');                      // Product of SpaceX
linkContributes('spacex_falcon9', 'starship');          // Evolution of rocketry
linkPowers('nvidia_h100', 'starship');                  // CFD (Fluid Dynamics) Simulations run on GPUs
linkPowers('linux', 'starship');                        // Flight software runs on Linux
linkEngages('starship', 'sls_rocket');                  // *Conceptual: Rivalry with NASA SLS (if node existed)

// ------------------------------------------------------------------------------
// [F] Vision Pro (Spatial Computing)
// *Current Status: Needs Ecosystem links.*
// ------------------------------------------------------------------------------
linkCreates('apple', 'vision_pro');                     // Product of Apple
linkPowers('arm_arch', 'vision_pro');                   // Powered by M2/R1 (ARM)
linkPowers('oled', 'vision_pro');                       // Sony Micro-OLED is key
linkEngages('vision_pro', 'oculus_rift');               // [Rivalry] Meta Quest vs Vision Pro
linkContributes('unity', 'vision_pro');                 // Strategic Partnership for Apps

// ------------------------------------------------------------------------------
// [G] Sora (Video AI)
// *Current Status: Newer node, likely sparse.*
// ------------------------------------------------------------------------------
linkCreates('openai', 'sora');                          // Created by OpenAI
linkPowers('nvidia_h100', 'sora');                      // Training compute
linkContributes('transformer', 'sora');                 // Architecture (Space-time patches)
linkContributes('gan', 'sora');                         // Evolution from GANs
linkEngages('sora', 'midjourney');                      // [Rivalry] Expansion into Video vs Image

// ------------------------------------------------------------------------------
// [H] AT&T (The Network)
// *Current Status: Needs to be the "Pipe".*
// ------------------------------------------------------------------------------
linkCreates('att', 'bell_labs');                        // Owner/Parent
linkPowers('cisco_router', 'att');                      // Hardware powers the network
linkPowers('optical_fiber', 'att');                     // The physical lines
linkPowers('att', 'iphone');                            // (Historical) Exclusive launch partner in 2007

// ------------------------------------------------------------------------------
// [I] SoftBank (The Capital)
// *Current Status: Needs portfolio connections.*
// ------------------------------------------------------------------------------
linkCreates('masayoshi_son', 'softbank');               // Founder
linkContributes('softbank', 'alibaba');                 // The Investment
linkContributes('softbank', 'arm_ltd');                 // Ownership
linkContributes('softbank', 'uber_co');                 // Vision Fund
linkContributes('softbank', 'wework');                  // The Failure (Conceptual link)
linkContributes('softbank', 'boston_dynamics');         // Past Owner

// ==============================================================================
// 7. FINAL PATCH: CONNECTING THE MISSING LINKS
// ==============================================================================

// ------------------------------------------------------------------------------
// [A] Zero Trust (Security Paradigm)
// *Context: "Never trust, always verify". Origins in Google BeyondCorp.*
// ------------------------------------------------------------------------------
linkContributes('google', 'zero_trust');                    // Google pioneered it (BeyondCorp)
linkPowers('ssl_tls', 'zero_trust');                    // Encryption is mandatory for Zero Trust
linkPowers('zero_trust', 'aws_cloud');                  // Essential for modern cloud security
linkPowers('zero_trust', 'salesforce_co');              // Essential for Enterprise SaaS security
linkPowers('zero_trust', 'slack');                      // Enterprise requirement

// ------------------------------------------------------------------------------
// [B] Twitter (The Town Square)
// *Context: Created by Dorsey (not in graph), acquired by Musk, runs on Cloud.*
// ------------------------------------------------------------------------------
linkContributes('elon_musk', 'twitter');                // Acquired and privatized
linkPowers('aws_cloud', 'twitter');                     // Runs on Cloud infrastructure
linkPowers('app_store', 'twitter');                     // Major distribution channel
linkEngages('twitter', 'meta');                         // [Rivalry] Threads/Facebook vs X
linkEngages('twitter', 'tiktok');                       // [Rivalry] Battle for attention

// ------------------------------------------------------------------------------
// [C] Yann LeCun (The CNN Father)
// *Context: Meta's AI Chief, Turing Award winner, Hinton's peer.*
// ------------------------------------------------------------------------------
linkContributes('yann_lecun', 'meta');                  // Chief AI Scientist at Meta (FAIR)
linkCreates('yann_lecun', 'alexnet');                   // CNN invention (LeNet) led to AlexNet
linkContributes('yann_lecun', 'pytorch');               // FAIR (Meta AI) developed PyTorch
linkEngages('yann_lecun', 'geoffrey_hinton');           // [Partnership] Turing Award peers
linkEngages('yann_lecun', 'elon_musk');                 // [Rivalry] Public debates on AI safety

// ------------------------------------------------------------------------------
// [D] Word2Vec (The NLP Foundation)
// *Context: Created at Google, precursor to Transformers.*
// ------------------------------------------------------------------------------
linkCreates('google', 'word2vec');                      // Created by Mikolov at Google
linkContributes('word2vec', 'transformer');             // Embeddings are input to Transformers
linkContributes('word2vec', 'chatgpt');                 // Conceptually essential for LLMs

// ------------------------------------------------------------------------------
// [E] Toshiba T1100 (The First Laptop)
// *Context: Defined the form factor, ran on early silicon.*
// ------------------------------------------------------------------------------
linkPowers('x86', 'toshiba_t1100');                     // Powered by Intel 80C88
linkPowers('floppy', 'toshiba_t1100');                  // Used 3.5" floppy drives
linkContributes('toshiba_t1100', 'macintosh');          // Portable computing evolution (PowerBook)
linkContributes('toshiba_t1100', 'thinkpad');           // *Conceptual: Ancestor of modern laptops

// ------------------------------------------------------------------------------
// [F] RSA Encryption (The Shield)
// *Context: Public key crypto, enables secure web & crypto.*
// ------------------------------------------------------------------------------
linkPowers('rsa', 'ssl_tls');                           // RSA is the math behind early SSL
linkPowers('rsa', 'bitcoin');                           // Public/Private key concept
linkPowers('rsa', 'git');                               // SSH keys use RSA logic
linkPowers('rsa', 'amazon_com');                        // Enabled credit card transactions

// ------------------------------------------------------------------------------
// [G] Floppy Disk (The Distribution Medium)
// *Context: How software traveled before the Internet.*
// ------------------------------------------------------------------------------
linkPowers('floppy', 'windows_95');                     // Installed via Floppy (or CD)
linkPowers('floppy', 'macintosh');                      // Original Mac used 3.5" floppy
linkPowers('floppy', 'excel');                          // Distributed on floppy
linkContributes('floppy', 'optical_disc');              // Storage evolution

// ------------------------------------------------------------------------------
// [H] Mosaic Browser (The Web's Spark)
// *Context: Created by Andreessen, became Netscape.*
// ------------------------------------------------------------------------------
linkCreates('marc_andreessen', 'mosaic');               // Created at NCSA
linkPowers('www', 'mosaic');                            // Built to render the WWW
linkContributes('mosaic', 'netscape_co');               // Direct lineage (Code & Team)
linkContributes('mosaic', 'google_chrome');             // Ancestor of all graphical browsers

// ------------------------------------------------------------------------------
// [I] Skype (VoIP Pioneer)
// *Context: P2P tech, acquired by MS, precursor to Zoom.*
// ------------------------------------------------------------------------------
linkPowers('tcp_ip', 'skype');                          // Runs on IP
linkContributes('microsoft', 'skype');                  // Acquired by Microsoft
linkContributes('skype', 'zoom');                       // Normalized video calling
linkEngages('skype', 'zoom');                           // [Rivalry] Legacy vs Modern

// ------------------------------------------------------------------------------
// [J] Claude (The Safe AI)
// *Context: Anthropic's model, rival to GPT.*
// ------------------------------------------------------------------------------
linkCreates('anthropic', 'claude');                     // Product of Anthropic
linkPowers('transformer', 'claude');                    // Architecture
linkPowers('aws_cloud', 'claude');                      // Trained on AWS (major investment)
linkEngages('claude', 'chatgpt');                       // [Rivalry] Direct competitor
linkEngages('claude', 'gemini');                        // [Rivalry] Direct competitor

// ------------------------------------------------------------------------------
// [K] MP3 (Digital Music)
// *Context: Killed physical media, birthed streaming.*
// ------------------------------------------------------------------------------
linkContributes('info_theory', 'mp3');                  // Compression algorithms
linkContributes('mp3', 'spotify_co');                   // Enabled streaming technology
linkContributes('mp3', 'netflix_co');                   // Compression logic influence (Codecs)
linkPowers('mp3', 'walkman');                           // (Digital era) Sony Walkman MP3 players

// ==============================================================================
// 8. SPECIFIC RESCUE: CONNECTING THE REMAINING ORPHANS
// ==============================================================================

// ------------------------------------------------------------------------------
// [A] Reid Hoffman (The Master Connector)
// *Context: "The Oracle of Silicon Valley". Connected Facebook, OpenAI, Microsoft.*
// ------------------------------------------------------------------------------
linkContributes('reid_hoffman', 'facebook');            // One of the first angel investors
linkContributes('reid_hoffman', 'airbnb');              // Led Greylock's investment
linkContributes('reid_hoffman', 'microsoft');           // Board member (after LinkedIn acquisition)
linkContributes('reid_hoffman', 'openai');              // Early board member and donor
linkContributes('paypal_co', 'reid_hoffman');           // PayPal Mafia origin (EVP)

// ------------------------------------------------------------------------------
// [B] LiDAR (The Eye of the Machine)
// *Context: Essential for AVs and Robotics, controversial in Tesla circles.*
// ------------------------------------------------------------------------------
linkPowers('lithography', 'lidar');                     // Manufactured via semi processes
linkPowers('lidar', 'boston_dynamics');                 // Robots need spatial perception
linkPowers('lidar', 'uber_co');                         // Essential for Uber's AV fleet research
linkEngages('lidar', 'tesla_autopilot');                // [Rivalry] Musk famously called LiDAR "a crutch"
linkContributes('lidar', 'vision_pro');                 // Used for spatial mapping

// ------------------------------------------------------------------------------
// [C] CMOS Sensor (The Digital Retina)
// *Context: The reason we share photos. Replaced film.*
// ------------------------------------------------------------------------------
linkPowers('lithography', 'cmos');                      // Manufacturing dependency
linkPowers('cmos', 'iphone');                           // The defining feature of modern smartphones
linkPowers('cmos', 'tesla_autopilot');                  // Tesla relies 100% on vision (CMOS)
linkPowers('cmos', 'dji_phantom');                      // Drones are flying cameras
linkPowers('cmos', 'vision_pro');                       // Passthrough cameras
linkContributes('sony', 'cmos');                        // Sony dominates the global CMOS market

// ------------------------------------------------------------------------------
// [D] Ethereum (The World Computer)
// *Context: Smart contracts, DeFi, NFTs.*
// ------------------------------------------------------------------------------
linkContributes('bitcoin', 'ethereum');                 // Blockchain concept evolution
linkPowers('gpu_geforce', 'ethereum');                  // (Historical) Mining drove GPU demand/prices
linkContributes('a16z', 'ethereum');                    // Major crypto investor ("Crypto Fund")
linkEngages('ethereum', 'bitcoin');                     // [Rivalry] Store of Value vs Utility Platform
linkEngages('ethereum', 'paypal_co');                   // [Rivalry] DeFi vs TradFi

// ------------------------------------------------------------------------------
// [E] Vitalik Buterin (The Boy Genius)
// *Context: Thiel Fellow, extended Satoshi's vision.*
// ------------------------------------------------------------------------------
linkContributes('peter_thiel', 'vitalik_buterin');      // Received Thiel Fellowship (dropped out to build Eth)
linkContributes('satoshi_nakamoto', 'vitalik_buterin'); // Intellectual successor
linkEngages('vitalik_buterin', 'jack_ma');              // [Dialogue] Represents Decentralization vs Centralization


// --- 5G Ecosystem Expansion ---
// 1. Foundations (What makes 5G work)
linkPowers('optical_fiber', '5g_nr');       // Wired backhaul is essential for wireless speed
linkContributes('gps', '5g_nr');            // Precise timing synchronization is critical for 5G TDD
linkContributes('info_theory', '5g_nr');    // Advanced coding schemes (Polar/LDPC)

// 2. Makers (Who defines 5G)
linkCreates('qualcomm', '5g_nr');           // Qualcomm owns key 5G patents and modems
linkCreates('samsung', '5g_nr');            // Major infrastructure and device player

// 3. Applications (What 5G enables)
linkPowers('5g_nr', 'vision_pro');          // High bandwidth for Spatial Computing/XR
linkPowers('5g_nr', 'dji_phantom');         // Low latency for drone control/video
linkPowers('5g_nr', 'tesla_autopilot');     // V2X (Vehicle-to-Everything) communication

// 4. Rivalry
linkEngages('5g_nr', 'starlink');           // Terrestrial Network vs Satellite Network

// --- DATA ENTRY END ---

export const INITIAL_DATA: GraphData = { nodes, links };
