import { Category, GraphData, LinkType, ArrowHead, LinkIcon, NodeData, LinkData, CompanyRole, PersonRole, TechRole, EpisodeRole, CompanyCategory, Role, TechCategoryL1, TechCategoryL2 } from './types';

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

const createEpisode = (
  id: string, label: string, year: number, impactRole: EpisodeRole, description: string,
  meta?: { eventType?: string; impactScale?: string }
) => {
  nodes.push({ id, label, category: Category.EPISODE, year, impactRole, description, ...meta });
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
createTech('turing_machine', 'Turing Machine', 1936, TechRole.L0_THEORY_PHYSICS, 'Mathematical model of computation.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('transistor', 'The Transistor', 1947, TechRole.L0_THEORY_PHYSICS, 'Building block of electronics.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('info_theory', 'Information Theory', 1948, TechRole.L0_THEORY_PHYSICS, 'Quantification of information.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('rsa', 'RSA Encryption', 1977, TechRole.L0_THEORY_PHYSICS, 'Public-key cryptosystem.', 'Fundamental Concepts', 'Theories & Architectures');

// L1
createTech('lithography', 'Lithography', 1957, TechRole.L1_CORE_HARDWARE, 'Chip patterning process.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('ic', 'Integrated Circuit', 1959, TechRole.L1_CORE_HARDWARE, 'Multiple transistors on a chip.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('ibm_360', 'IBM System/360', 1964, TechRole.L1_CORE_HARDWARE, 'Mainframe architecture.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('dram', 'DRAM', 1968, TechRole.L1_CORE_HARDWARE, 'Computer memory.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('optical_fiber', 'Optical Fiber', 1970, TechRole.L1_CORE_HARDWARE, 'Light-speed data transmission.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('microprocessor', 'Microprocessor', 1971, TechRole.L1_CORE_HARDWARE, 'CPU on a chip.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('floppy', 'Floppy Disk', 1971, TechRole.L1_CORE_HARDWARE, 'Portable storage.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('ethernet', 'Ethernet', 1973, TechRole.L1_CORE_HARDWARE, 'LAN standard.', 'Network & Connectivity', 'Network Architecture');
createTech('x86', 'x86 Architecture', 1978, TechRole.L1_CORE_HARDWARE, 'PC instruction set.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('gps', 'GPS', 1978, TechRole.L1_CORE_HARDWARE, 'Global Positioning System.', 'Network & Connectivity', 'Telecommunications');
createTech('optical_disc', 'Optical Disc', 1982, TechRole.L1_CORE_HARDWARE, 'CD/DVD format.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('tcp_ip', 'TCP/IP', 1983, TechRole.L1_CORE_HARDWARE, 'Internet protocol suite.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('arm_arch', 'ARM Architecture', 1985, TechRole.L1_CORE_HARDWARE, 'Mobile instruction set.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('cisco_router', 'Cisco Router', 1986, TechRole.L1_CORE_HARDWARE, 'Internet traffic director.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('foundry_model', 'Foundry Model', 1987, TechRole.L1_CORE_HARDWARE, 'Fabless manufacturing.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('nand', 'NAND Flash', 1987, TechRole.L1_CORE_HARDWARE, 'Non-volatile storage.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('cdma', 'CDMA', 1989, TechRole.L1_CORE_HARDWARE, '3G wireless basis.', 'Network & Connectivity', 'Telecommunications');
createTech('gsm', 'GSM', 1991, TechRole.L1_CORE_HARDWARE, '2G digital standard.', 'Network & Connectivity', 'Telecommunications');
createTech('li_ion', 'Li-ion Battery', 1991, TechRole.L1_CORE_HARDWARE, 'Rechargeable power.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('mp3', 'MP3', 1993, TechRole.L1_CORE_HARDWARE, 'Audio compression.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('cmos', 'CMOS Sensor', 1993, TechRole.L1_CORE_HARDWARE, 'Digital camera eye.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('blue_led', 'Blue LED', 1994, TechRole.L1_CORE_HARDWARE, 'White light enabler.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('bluetooth', 'Bluetooth', 1994, TechRole.L1_CORE_HARDWARE, 'Wireless peripheral protocol.', 'Network & Connectivity', 'Telecommunications');
createTech('ssl_tls', 'SSL/TLS', 1995, TechRole.L1_CORE_HARDWARE, 'Secure connection.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('wifi', 'WiFi', 1997, TechRole.L1_CORE_HARDWARE, 'Wireless LAN.', 'Network & Connectivity', 'Telecommunications');
createTech('gpu_geforce', 'GPU (GeForce)', 1999, TechRole.L1_CORE_HARDWARE, 'Graphics/AI unit.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('arm_cortex', 'ARM Cortex', 2004, TechRole.L1_CORE_HARDWARE, 'Mobile processor core.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('lidar', 'LiDAR', 2005, TechRole.L1_CORE_HARDWARE, 'Laser sensing.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('lte', 'LTE (4G)', 2009, TechRole.L1_CORE_HARDWARE, 'Mobile broadband.', 'Network & Connectivity', 'Telecommunications');
createTech('alexnet', 'AlexNet', 2012, TechRole.L1_CORE_HARDWARE, 'Deep learning breakthrough.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('hbm', 'HBM', 2013, TechRole.L1_CORE_HARDWARE, 'High bandwidth memory.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('word2vec', 'Word2Vec', 2013, TechRole.L1_CORE_HARDWARE, 'NLP embeddings.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('gan', 'GAN', 2014, TechRole.L1_CORE_HARDWARE, 'Generative networks.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('tpu', 'Google TPU', 2015, TechRole.L1_CORE_HARDWARE, 'AI ASIC.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('transformer', 'Transformer', 2017, TechRole.L1_CORE_HARDWARE, 'Attention mechanism.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('5g_nr', '5G (New Radio)', 2019, TechRole.L1_CORE_HARDWARE, 'High-speed wireless.', 'Network & Connectivity', 'Telecommunications');
createTech('euv', 'EUV Lithography', 2019, TechRole.L1_CORE_HARDWARE, 'Extreme UV manufacturing.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('stable_diffusion', 'Stable Diffusion', 2022, TechRole.L1_CORE_HARDWARE, 'Image generation model.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('nvidia_h100', 'NVIDIA H100', 2022, TechRole.L1_CORE_HARDWARE, 'AI training engine.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('sora', 'Sora', 2024, TechRole.L1_CORE_HARDWARE, 'Video generation model.', 'AI & Physical Systems', 'Artificial Intelligence');

// L2
createTech('unix', 'Unix', 1969, TechRole.L2_RUNTIME_PLATFORM, 'Portable OS.', 'System Software', 'Operating Systems (OS)');
createTech('c_lang', 'C Language', 1972, TechRole.L2_RUNTIME_PLATFORM, 'System programming.', 'System Software', 'Development & Languages');
createTech('sql', 'SQL', 1974, TechRole.L2_RUNTIME_PLATFORM, 'Database query language.', 'System Software', 'Development & Languages');
createTech('oracle_db', 'Oracle Database', 1979, TechRole.L2_RUNTIME_PLATFORM, 'Relational DB.', 'System Software', 'Development & Languages');
createTech('www', 'World Wide Web', 1989, TechRole.L2_RUNTIME_PLATFORM, 'Hypertext system.', 'Network & Connectivity', 'Network Architecture');
createTech('linux', 'Linux Kernel', 1991, TechRole.L2_RUNTIME_PLATFORM, 'Open source kernel.', 'System Software', 'Operating Systems (OS)');
createTech('python', 'Python', 1991, TechRole.L2_RUNTIME_PLATFORM, 'AI language.', 'System Software', 'Development & Languages');
createTech('windows_95', 'Windows 95', 1995, TechRole.L2_RUNTIME_PLATFORM, 'Consumer GUI OS.', 'System Software', 'Operating Systems (OS)');
createTech('java', 'Java', 1995, TechRole.L2_RUNTIME_PLATFORM, 'Enterprise language.', 'System Software', 'Development & Languages');
createTech('javascript', 'JavaScript', 1995, TechRole.L2_RUNTIME_PLATFORM, 'Web scripting.', 'System Software', 'Development & Languages');
createTech('unreal', 'Unreal Engine', 1998, TechRole.L2_RUNTIME_PLATFORM, '3D engine.', 'System Software', 'Development & Languages');
createTech('bittorrent', 'BitTorrent', 2001, TechRole.L2_RUNTIME_PLATFORM, 'P2P protocol.', 'Network & Connectivity', 'Standards & Protocols');
createTech('mapreduce', 'MapReduce', 2004, TechRole.L2_RUNTIME_PLATFORM, 'Big data processing.', 'System Software', 'Development & Languages');
createTech('git', 'Git', 2005, TechRole.L2_RUNTIME_PLATFORM, 'Version control.', 'System Software', 'Development & Languages');
createTech('unity', 'Unity', 2005, TechRole.L2_RUNTIME_PLATFORM, 'Game engine.', 'System Software', 'Development & Languages');
createTech('aws_cloud', 'AWS Cloud', 2006, TechRole.L2_RUNTIME_PLATFORM, 'Cloud infrastructure.', 'Network & Connectivity', 'Network Architecture');
createTech('cuda', 'CUDA', 2007, TechRole.L2_RUNTIME_PLATFORM, 'GPU computing.', 'System Software', 'Development & Languages');
createTech('ios', 'iOS', 2007, TechRole.L2_RUNTIME_PLATFORM, 'iPhone OS.', 'System Software', 'Operating Systems (OS)');
createTech('android', 'Android', 2008, TechRole.L2_RUNTIME_PLATFORM, 'Mobile OS.', 'System Software', 'Operating Systems (OS)');
createTech('zero_trust', 'Zero Trust', 2010, TechRole.L2_RUNTIME_PLATFORM, 'Security model.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('docker', 'Docker', 2013, TechRole.L2_RUNTIME_PLATFORM, 'Containers.', 'System Software', 'Development & Languages');
createTech('tensorflow', 'TensorFlow', 2015, TechRole.L2_RUNTIME_PLATFORM, 'AI framework.', 'System Software', 'Development & Languages');
createTech('pytorch', 'PyTorch', 2016, TechRole.L2_RUNTIME_PLATFORM, 'AI library.', 'System Software', 'Development & Languages');

// L3
createTech('walkman', 'Sony Walkman', 1979, TechRole.L3_END_APPLICATION, 'Portable audio.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('macintosh', 'Macintosh', 1984, TechRole.L3_END_APPLICATION, 'GUI PC.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('toshiba_t1100', 'Toshiba T1100', 1985, TechRole.L3_END_APPLICATION, 'Laptop.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('excel', 'Microsoft Excel', 1985, TechRole.L3_END_APPLICATION, 'Spreadsheet.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('photoshop', 'Adobe Photoshop', 1990, TechRole.L3_END_APPLICATION, 'Image editing.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('mosaic', 'Mosaic Browser', 1993, TechRole.L3_END_APPLICATION, 'Graphical browser.', 'System Software', 'Development & Languages');
createTech('netscape', 'Netscape Navigator', 1994, TechRole.L3_END_APPLICATION, 'Commercial browser.', 'Digital Services & Platforms', 'Search & Information');
createTech('amazon_com', 'Amazon.com', 1994, TechRole.L3_END_APPLICATION, 'Online store.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('netflix', 'Netflix', 1997, TechRole.L3_END_APPLICATION, 'Streaming service.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('google_search', 'Google Search', 1998, TechRole.L3_END_APPLICATION, 'Search engine.', 'Digital Services & Platforms', 'Search & Information');
createTech('paypal', 'PayPal', 1998, TechRole.L3_END_APPLICATION, 'Online payments.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('salesforce_crm', 'Salesforce CRM', 1999, TechRole.L3_END_APPLICATION, 'Cloud CRM.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('wikipedia', 'Wikipedia', 2001, TechRole.L3_END_APPLICATION, 'Encyclopedia.', 'Digital Services & Platforms', 'Search & Information');
createTech('skype', 'Skype', 2003, TechRole.L3_END_APPLICATION, 'VoIP.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('linkedin', 'LinkedIn', 2003, TechRole.L3_END_APPLICATION, 'Professional network.', 'Digital Services & Platforms', 'Social & Media');
createTech('facebook', 'Facebook', 2004, TechRole.L3_END_APPLICATION, 'Social network.', 'Digital Services & Platforms', 'Social & Media');
createTech('youtube', 'YouTube', 2005, TechRole.L3_END_APPLICATION, 'Video platform.', 'Digital Services & Platforms', 'Social & Media');
createTech('twitter', 'Twitter', 2006, TechRole.L3_END_APPLICATION, 'Microblogging.', 'Digital Services & Platforms', 'Social & Media');
createTech('iphone', 'iPhone', 2007, TechRole.L3_END_APPLICATION, 'Smartphone.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('spotify', 'Spotify', 2008, TechRole.L3_END_APPLICATION, 'Music streaming.', 'Digital Services & Platforms', 'Social & Media');
createTech('app_store', 'App Store', 2008, TechRole.L3_END_APPLICATION, 'App distribution.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('google_chrome', 'Google Chrome', 2008, TechRole.L3_END_APPLICATION, 'Web browser.', 'Digital Services & Platforms', 'Search & Information');
createTech('github', 'GitHub', 2008, TechRole.L3_END_APPLICATION, 'Code hosting.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('bitcoin', 'Bitcoin', 2009, TechRole.L3_END_APPLICATION, 'Cryptocurrency.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('uber_app', 'Uber App', 2010, TechRole.L3_END_APPLICATION, 'Ride hailing.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('stripe', 'Stripe', 2010, TechRole.L3_END_APPLICATION, 'Payments API.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('wechat', 'WeChat', 2011, TechRole.L3_END_APPLICATION, 'Super app.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('zoom', 'Zoom', 2011, TechRole.L3_END_APPLICATION, 'Video calls.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('model_s', 'Tesla Model S', 2012, TechRole.L3_END_APPLICATION, 'Electric car.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('raspberry_pi', 'Raspberry Pi', 2012, TechRole.L3_END_APPLICATION, 'Single-board computer.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('dji_phantom', 'DJI Phantom', 2013, TechRole.L3_END_APPLICATION, 'Camera drone.', 'AI & Physical Systems', 'Robotics');
createTech('slack', 'Slack', 2013, TechRole.L3_END_APPLICATION, 'Work chat.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('tesla_autopilot', 'Tesla Autopilot', 2014, TechRole.L3_END_APPLICATION, 'ADAS.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('ethereum', 'Ethereum', 2015, TechRole.L3_END_APPLICATION, 'Blockchain platform.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('alphago', 'AlphaGo', 2016, TechRole.L3_END_APPLICATION, 'Go AI.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('tiktok', 'TikTok', 2016, TechRole.L3_END_APPLICATION, 'Short video.', 'Digital Services & Platforms', 'Social & Media');
createTech('oculus_rift', 'Oculus Rift', 2016, TechRole.L3_END_APPLICATION, 'VR headset.', 'AI & Physical Systems', 'Spatial Computing');
createTech('alphago_zero', 'AlphaGo Zero', 2017, TechRole.L3_END_APPLICATION, 'Self-learning AI.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('starlink', 'Starlink', 2019, TechRole.L3_END_APPLICATION, 'Satellite internet.', 'Network & Connectivity', 'Telecommunications');
createTech('fugaku', 'Fujitsu Fugaku', 2020, TechRole.L3_END_APPLICATION, 'ARM supercomputer.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('copilot', 'GitHub Copilot', 2021, TechRole.L3_END_APPLICATION, 'AI coder.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('chatgpt', 'ChatGPT', 2022, TechRole.L3_END_APPLICATION, 'AI chatbot.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('midjourney', 'Midjourney', 2022, TechRole.L3_END_APPLICATION, 'AI art.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('perplexity', 'Perplexity', 2022, TechRole.L3_END_APPLICATION, 'AI search.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('spacex_falcon9', 'Falcon 9', 2010, TechRole.L3_END_APPLICATION, 'Reusable rocket.', 'AI & Physical Systems', 'Robotics');
createTech('starship', 'Starship', 2023, TechRole.L3_END_APPLICATION, 'Mars rocket.', 'AI & Physical Systems', 'Robotics');
createTech('gemini', 'Google Gemini', 2023, TechRole.L3_END_APPLICATION, 'Multimodal model.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('claude', 'Claude', 2023, TechRole.L3_END_APPLICATION, 'AI assistant.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('cursor', 'Cursor', 2023, TechRole.L3_END_APPLICATION, 'AI editor.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('vision_pro', 'Apple Vision Pro', 2024, TechRole.L3_END_APPLICATION, 'Spatial computer.', 'AI & Physical Systems', 'Spatial Computing');

// --- [B] COMPANY NODES ---
createCompany('bell_labs', 'Bell Labs', 1925, CompanyRole.LAB, 'Innovation engine.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('fairchild', 'Fairchild Semi', 1957, CompanyRole.INFRA, 'Silicon Valley birth.', CompanyCategory.SEMICONDUCTOR);
createCompany('xerox_parc', 'Xerox PARC', 1970, CompanyRole.LAB, 'GUI creator.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('att', 'AT&T', 1885, CompanyRole.INFRA, 'Telecom giant.', CompanyCategory.INFRA_TELECOM);
createCompany('intel', 'Intel', 1968, CompanyRole.INFRA, 'Chip giant.', CompanyCategory.SEMICONDUCTOR);
createCompany('amd', 'AMD', 1969, CompanyRole.INFRA, 'Chip rival.', CompanyCategory.SEMICONDUCTOR);
createCompany('tsmc', 'TSMC', 1987, CompanyRole.INFRA, 'Chip foundry.', CompanyCategory.SEMICONDUCTOR);
createCompany('nvidia', 'NVIDIA', 1993, CompanyRole.INFRA, 'AI hardware.', CompanyCategory.SEMICONDUCTOR);
createCompany('asml', 'ASML', 1984, CompanyRole.INFRA, 'Lithography leader.', CompanyCategory.SEMICONDUCTOR);
createCompany('arm_ltd', 'Arm Holdings', 1990, CompanyRole.LAB, 'Chip IP.', CompanyCategory.SEMICONDUCTOR);
createCompany('samsung', 'Samsung', 1969, CompanyRole.INFRA, 'Memory leader.', CompanyCategory.SEMICONDUCTOR);
createCompany('qualcomm', 'Qualcomm', 1985, CompanyRole.INFRA, 'Wireless chips.', CompanyCategory.SEMICONDUCTOR);
createCompany('ibm', 'IBM', 1911, CompanyRole.PLATFORM, 'Computing pioneer.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('apple', 'Apple', 1976, CompanyRole.PLATFORM, 'Consumer tech.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('sony', 'Sony', 1946, CompanyRole.PRODUCT, 'Electronics.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('tesla', 'Tesla', 2003, CompanyRole.PRODUCT, 'EVs.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('spacex', 'SpaceX', 2002, CompanyRole.INFRA, 'Space tech.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('dji', 'DJI', 2006, CompanyRole.PRODUCT, 'Drones.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('boston_dynamics', 'Boston Dynamics', 1992, CompanyRole.LAB, 'Robotics.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('microsoft', 'Microsoft', 1975, CompanyRole.PLATFORM, 'Software giant.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('oracle', 'Oracle', 1977, CompanyRole.SERVICE, 'Database.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('adobe', 'Adobe', 1982, CompanyRole.SERVICE, 'Creative software.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('salesforce_co', 'Salesforce', 1999, CompanyRole.PLATFORM, 'Cloud CRM.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('sap', 'SAP', 1972, CompanyRole.SERVICE, 'ERP.', CompanyCategory.ENTERPRISE_SAAS);
createCompany('google', 'Google', 1998, CompanyRole.PLATFORM, 'Search & AI.', CompanyCategory.PLATFORM_INTERNET);
createCompany('amazon', 'Amazon', 1994, CompanyRole.PLATFORM, 'Commerce & Cloud.', CompanyCategory.PLATFORM_INTERNET);
createCompany('meta', 'Meta', 2004, CompanyRole.PLATFORM, 'Social.', CompanyCategory.PLATFORM_INTERNET);
createCompany('tencent', 'Tencent', 1998, CompanyRole.PLATFORM, 'China social.', CompanyCategory.PLATFORM_INTERNET);
createCompany('alibaba', 'Alibaba', 1999, CompanyRole.PLATFORM, 'China commerce.', CompanyCategory.PLATFORM_INTERNET);
createCompany('bytedance', 'ByteDance', 2012, CompanyRole.PLATFORM, 'Media.', CompanyCategory.PLATFORM_INTERNET);
createCompany('uber_co', 'Uber', 2009, CompanyRole.SERVICE, 'Mobility.', CompanyCategory.PLATFORM_INTERNET);
createCompany('airbnb', 'Airbnb', 2008, CompanyRole.SERVICE, 'Hospitality.', CompanyCategory.PLATFORM_INTERNET);
createCompany('paypal_co', 'PayPal', 1998, CompanyRole.SERVICE, 'Payments.', CompanyCategory.PLATFORM_INTERNET);
createCompany('stripe_co', 'Stripe', 2010, CompanyRole.INFRA, 'Payment infra.', CompanyCategory.PLATFORM_INTERNET);
createCompany('spotify_co', 'Spotify', 2006, CompanyRole.SERVICE, 'Music.', CompanyCategory.MEDIA_CONTENT);
createCompany('netflix_co', 'Netflix', 1997, CompanyRole.SERVICE, 'Video.', CompanyCategory.MEDIA_CONTENT);
createCompany('netscape_co', 'Netscape', 1994, CompanyRole.SERVICE, 'Browser.', CompanyCategory.PLATFORM_INTERNET);
createCompany('cisco', 'Cisco', 1984, CompanyRole.INFRA, 'Networking.', CompanyCategory.INFRA_TELECOM);
createCompany('deepmind', 'Google DeepMind', 2010, CompanyRole.LAB, 'AI Lab.', CompanyCategory.AI_INNOVATION);
createCompany('openai', 'OpenAI', 2015, CompanyRole.LAB, 'AI Lab.', CompanyCategory.AI_INNOVATION);
createCompany('anthropic', 'Anthropic', 2021, CompanyRole.LAB, 'AI Lab.', CompanyCategory.AI_INNOVATION);
createCompany('huggingface', 'Hugging Face', 2016, CompanyRole.PLATFORM, 'AI Hub.', CompanyCategory.AI_INNOVATION);
createCompany('sequoia', 'Sequoia', 1972, CompanyRole.SERVICE, 'VC.', CompanyCategory.VENTURE_CAPITAL);
createCompany('ycombinator', 'Y Combinator', 2005, CompanyRole.LAB, 'Accelerator.', CompanyCategory.VENTURE_CAPITAL);
createCompany('a16z', 'a16z', 2009, CompanyRole.SERVICE, 'VC.', CompanyCategory.VENTURE_CAPITAL);
createCompany('softbank', 'SoftBank', 1981, CompanyRole.SERVICE, 'Investment.', CompanyCategory.VENTURE_CAPITAL);

// --- [C] PERSON NODES ---
createPerson('alan_turing', 'Alan Turing', 1936, PersonRole.THEORIST, 'Computing pioneer.', { primaryRole: 'Mathematician' });
createPerson('claude_shannon', 'Claude Shannon', 1948, PersonRole.THEORIST, 'Info Theory.', { primaryRole: 'Mathematician' });
createPerson('william_shockley', 'William Shockley', 1947, PersonRole.THEORIST, 'Transistor.', { primaryRole: 'Physicist' });
createPerson('robert_noyce', 'Robert Noyce', 1957, PersonRole.VISIONARY, 'Intel Founder.', { primaryRole: 'Founder' });
createPerson('gordon_moore', 'Gordon Moore', 1965, PersonRole.VISIONARY, 'Intel Founder.', { primaryRole: 'Founder' });
createPerson('dennis_ritchie', 'Dennis Ritchie', 1972, PersonRole.BUILDER, 'C/Unix.', { primaryRole: 'Scientist' });
createPerson('tim_berners_lee', 'Tim Berners-Lee', 1989, PersonRole.THEORIST, 'Web inventor.', { primaryRole: 'Scientist' });
createPerson('linus_torvalds', 'Linus Torvalds', 1991, PersonRole.BUILDER, 'Linux.', { primaryRole: 'Engineer' });
createPerson('satoshi_nakamoto', 'Satoshi Nakamoto', 2008, PersonRole.THEORIST, 'Bitcoin.', { primaryRole: 'Cryptographer' });
createPerson('vitalik_buterin', 'Vitalik Buterin', 2013, PersonRole.VISIONARY, 'Ethereum.', { primaryRole: 'Founder' });
createPerson('morris_chang', 'Morris Chang', 1987, PersonRole.VISIONARY, 'TSMC.', { primaryRole: 'Founder' });
createPerson('jensen_huang', 'Jensen Huang', 1993, PersonRole.VISIONARY, 'NVIDIA.', { primaryRole: 'CEO' });
createPerson('lisa_su', 'Lisa Su', 2014, PersonRole.LEADER, 'AMD.', { primaryRole: 'CEO' });
createPerson('masayoshi_son', 'Masayoshi Son', 1981, PersonRole.INVESTOR, 'SoftBank.', { primaryRole: 'CEO' });
createPerson('steve_jobs', 'Steve Jobs', 1976, PersonRole.VISIONARY, 'Apple.', { primaryRole: 'Visionary' });
createPerson('steve_wozniak', 'Steve Wozniak', 1976, PersonRole.BUILDER, 'Apple.', { primaryRole: 'Engineer' });
createPerson('bill_gates', 'Bill Gates', 1975, PersonRole.VISIONARY, 'Microsoft.', { primaryRole: 'Founder' });
createPerson('larry_ellison', 'Larry Ellison', 1977, PersonRole.VISIONARY, 'Oracle.', { primaryRole: 'Founder' });
createPerson('jeff_bezos', 'Jeff Bezos', 1994, PersonRole.VISIONARY, 'Amazon.', { primaryRole: 'Founder' });
createPerson('larry_page', 'Larry Page', 1998, PersonRole.VISIONARY, 'Google.', { primaryRole: 'Founder' });
createPerson('sergey_brin', 'Sergey Brin', 1998, PersonRole.VISIONARY, 'Google.', { primaryRole: 'Founder' });
createPerson('marc_andreessen', 'Marc Andreessen', 1994, PersonRole.INVESTOR, 'a16z.', { primaryRole: 'VC' });
createPerson('mark_zuckerberg', 'Mark Zuckerberg', 2004, PersonRole.VISIONARY, 'Meta.', { primaryRole: 'Founder' });
createPerson('reed_hastings', 'Reed Hastings', 1997, PersonRole.VISIONARY, 'Netflix.', { primaryRole: 'Founder' });
createPerson('jack_ma', 'Jack Ma', 1999, PersonRole.VISIONARY, 'Alibaba.', { primaryRole: 'Founder' });
createPerson('pony_ma', 'Pony Ma', 1998, PersonRole.VISIONARY, 'Tencent.', { primaryRole: 'Founder' });
createPerson('elon_musk', 'Elon Musk', 2002, PersonRole.VISIONARY, 'Tesla/SpaceX.', { primaryRole: 'Technoking' });
createPerson('peter_thiel', 'Peter Thiel', 1998, PersonRole.INVESTOR, 'PayPal.', { primaryRole: 'VC' });
createPerson('reid_hoffman', 'Reid Hoffman', 2002, PersonRole.INVESTOR, 'LinkedIn.', { primaryRole: 'VC' });
createPerson('max_levchin', 'Max Levchin', 1998, PersonRole.BUILDER, 'PayPal.', { primaryRole: 'Founder' });
createPerson('roelof_botha', 'Roelof Botha', 2003, PersonRole.INVESTOR, 'Sequoia.', { primaryRole: 'VC' });
createPerson('chad_hurley', 'Chad Hurley', 2005, PersonRole.VISIONARY, 'YouTube.', { primaryRole: 'Founder' });
createPerson('marc_benioff', 'Marc Benioff', 1999, PersonRole.VISIONARY, 'Salesforce.', { primaryRole: 'CEO' });
createPerson('travis_kalanick', 'Travis Kalanick', 2009, PersonRole.VISIONARY, 'Uber.', { primaryRole: 'Founder' });
createPerson('patrick_collison', 'Patrick Collison', 2010, PersonRole.VISIONARY, 'Stripe.', { primaryRole: 'CEO' });
createPerson('geoffrey_hinton', 'Geoffrey Hinton', 2012, PersonRole.THEORIST, 'AI Godfather.', { primaryRole: 'Researcher' });
createPerson('demis_hassabis', 'Demis Hassabis', 2010, PersonRole.VISIONARY, 'DeepMind.', { primaryRole: 'CEO' });
createPerson('sam_altman', 'Sam Altman', 2015, PersonRole.LEADER, 'OpenAI.', { primaryRole: 'CEO' });
createPerson('ilya_sutskever', 'Ilya Sutskever', 2015, PersonRole.THEORIST, 'OpenAI.', { primaryRole: 'Scientist' });
createPerson('satya_nadella', 'Satya Nadella', 2014, PersonRole.LEADER, 'Microsoft.', { primaryRole: 'CEO' });
createPerson('tim_cook', 'Tim Cook', 2011, PersonRole.LEADER, 'Apple.', { primaryRole: 'CEO' });
createPerson('sundar_pichai', 'Sundar Pichai', 2015, PersonRole.LEADER, 'Google.', { primaryRole: 'CEO' });
createPerson('yann_lecun', 'Yann LeCun', 2013, PersonRole.THEORIST, 'Meta AI.', { primaryRole: 'Scientist' });
createPerson('don_valentine', 'Don Valentine', 1972, PersonRole.INVESTOR, 'Sequoia.', { primaryRole: 'VC' });
createPerson('paul_graham', 'Paul Graham', 2005, PersonRole.INVESTOR, 'YC.', { primaryRole: 'Founder' });
createPerson('arthur_rock', 'Arthur Rock', 1961, PersonRole.INVESTOR, 'VC Pioneer.', { primaryRole: 'VC' });


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
linkPowers('google', 'anthropic');                      // TPU usage (partially)

// Perplexity (The Answer Engine)
linkContributes('jeff_bezos', 'perplexity');            // Investor
linkContributes('nvidia', 'perplexity');                // Investor
linkPowers('openai', 'perplexity');                     // Uses GPT-4 API
linkPowers('anthropic', 'perplexity');                  // Uses Claude API
linkEngages('perplexity', 'google_search');             // [Rivalry] Direct threat to search

// Cursor (The AI Editor)
linkPowers('openai', 'cursor');                         // Uses GPT-4 models
linkPowers('anthropic', 'cursor');                      // Uses Claude models
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
linkCreates('google', 'zero_trust');                    // Google pioneered it (BeyondCorp)
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

// --- DATA ENTRY END ---

export const INITIAL_DATA: GraphData = { nodes, links };
