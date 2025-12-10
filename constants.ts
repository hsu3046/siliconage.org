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
  id: string,
  story: string,
  year: number,
  endYear?: number,
  relatedNodes?: string[]
) => {
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
createTech('turing_machine', 'Turing Machine', 1936, TechRole.L0_THEORY_PHYSICS, 'Alan Turing\'s theoretical blueprint for all computers. It mathematically defines the limits of what machines can calculate, proving some problems are fundamentally unsolvable. Every computer from smartphones to supercomputers operates on these principles.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('transistor', 'The Transistor', 1947, TechRole.L0_THEORY_PHYSICS, 'The tiny electronic switch that replaced vacuum tubes. Invented at Bell Labs by Shockley, Bardeen, and Brattain. Billions of transistors now pack onto fingernail-sized chips, controlling electrical flow to perform calculations at incredible speeds.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('info_theory', 'Information Theory', 1948, TechRole.L0_THEORY_PHYSICS, 'Claude Shannon\'s mathematical framework that defined "bits" as the fundamental unit of information. It established the theoretical limits of data compression and error-free transmission, enabling everything from CDs to Wi-Fi to work reliably.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('rsa', 'RSA Encryption', 1977, TechRole.L0_THEORY_PHYSICS, 'The asymmetric encryption algorithm that secures the internet. Named after creators Rivest, Shamir, and Adleman, it uses the mathematical difficulty of factoring large prime numbers to protect passwords, credit cards, and private communications online.', 'Fundamental Concepts', 'Theories & Architectures');

// [L1] Core Hardware & Infrastructure [Total: 40]
createTech('lithography', 'Lithography', 1957, TechRole.L1_CORE_HARDWARE, 'A photographic process using light to print incredibly tiny circuit patterns onto silicon wafers. Each generation shrinks transistors further, following Moore\'s Law. Modern EUV lithography prints features smaller than the wavelength of visible light.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('ic', 'Integrated Circuit', 1959, TechRole.L1_CORE_HARDWARE, 'Jack Kilby and Robert Noyce independently invented ways to put many transistors on a single chip. It solved the \"tyranny of numbers\" problem and shrank room-sized computers to desktop devices, launching the semiconductor revolution.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('ibm_360', 'IBM System/360', 1964, TechRole.L1_CORE_HARDWARE, 'IBM\'s revolutionary mainframe that standardized software compatibility across a product line. Companies could upgrade hardware without rewriting code. It established backward compatibility as an industry principle and dominated enterprise computing for decades.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('dram', 'DRAM', 1968, TechRole.L1_CORE_HARDWARE, 'Dynamic Random Access Memory invented by Robert Dennard at IBM. The computer\'s short-term memory that holds active data and programs. Must be constantly refreshed, but offers high density and low cost, making it the standard for main memory in all computers.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('optical_fiber', 'Optical Fiber', 1970, TechRole.L1_CORE_HARDWARE, 'Ultra-pure glass strands that transmit data as pulses of light over vast distances with minimal loss. Developed by Corning, they form the high-speed backbone of global internet and telecommunications, carrying 99% of international data traffic.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('microprocessor', 'Microprocessor', 1971, TechRole.L1_CORE_HARDWARE, 'Intel\'s Ted Hoff compressed the entire brain of a computer onto a single chip. The Intel 4004 was the first, followed by the legendary 8080. This invention sparked the personal computer revolution by making computing power affordable and accessible.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('floppy', 'Floppy Disk', 1971, TechRole.L1_CORE_HARDWARE, 'IBM\'s portable magnetic storage that became the universal way to distribute and transfer software before the internet. The 3.5-inch version became iconic as the \"save\" icon in software interfaces. Replaced by USB drives and cloud storage by the 2000s.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('ethernet', 'Ethernet', 1973, TechRole.L1_CORE_HARDWARE, 'Invented by Bob Metcalfe at Xerox PARC, this protocol became the standard for connecting computers in local area networks. Its simple, robust design beat competitors like Token Ring. Still the foundation of wired networking, now reaching 400 Gbps speeds.', 'Network & Connectivity', 'Network Architecture');
createTech('arpanet', 'ARPANET', 1969, TechRole.L1_CORE_HARDWARE, 'The Advanced Research Projects Agency Network, the direct ancestor of the modern internet. Funded by DARPA, it connected universities and research labs using packet switching. The first message sent in 1969 crashed after two letters. This experimental network proved that distributed communication could work and laid the groundwork for TCP/IP and the World Wide Web.', 'Network & Connectivity', 'Network Architecture');
createTech('x86', 'x86 Architecture', 1978, TechRole.L1_CORE_HARDWARE, 'Intel\'s processor instruction set that became the dominant language of personal computing. Starting with the 8086 chip, it maintained backward compatibility through 40+ years. Powers most Windows PCs and servers, though now challenged by ARM.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('gps', 'GPS', 1978, TechRole.L1_CORE_HARDWARE, 'The Global Positioning System, a U.S. military satellite constellation providing precise location and timing anywhere on Earth. Made available for civilian use in 2000. Enables navigation apps, ride-sharing, precision agriculture, and synchronized financial trading.', 'Network & Connectivity', 'Telecommunications');
createTech('optical_disc', 'Optical Disc', 1982, TechRole.L1_CORE_HARDWARE, 'A digital storage format using lasers to read microscopic pits on a spinning disc. The Compact Disc revolutionized music distribution, followed by DVDs for video and Blu-ray for HD content. Peak technology before streaming took over in the 2010s.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('tcp_ip', 'TCP/IP', 1983, TechRole.L1_CORE_HARDWARE, 'The Transmission Control Protocol and Internet Protocol stack that became the common language of the internet. Developed by Vint Cerf and Bob Kahn, it allows different networks to interconnect and ensures data packets reach their destination reliably.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('arm_arch', 'ARM Architecture', 1985, TechRole.L1_CORE_HARDWARE, 'A power-efficient RISC processor design from Cambridge that prioritizes energy efficiency over raw speed. Licensed to chip makers worldwide, ARM powers 99% of smartphones. Apple Silicon brought ARM to laptops and desktops with impressive performance.', 'Fundamental Concepts', 'Theories & Architectures');
createTech('cisco_router', 'Cisco Router', 1986, TechRole.L1_CORE_HARDWARE, 'The traffic cop of the internet. Founded by Stanford couple Len Bosack and Sandy Lerner, Cisco routers direct data packets across networks to their destinations. Their equipment became the essential plumbing infrastructure of the global internet.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('foundry_model', 'Foundry Model', 1987, TechRole.L1_CORE_HARDWARE, 'Morris Chang\'s revolutionary business model separating chip design from manufacturing. TSMC manufactures chips designed by others, eliminating the need for expensive fabs. It enabled fabless companies like NVIDIA, AMD, and Apple to compete with giants.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('nand', 'NAND Flash', 1987, TechRole.L1_CORE_HARDWARE, 'Non-volatile memory invented by Toshiba\'s Fujio Masuoka. Unlike DRAM, it remembers data without power. Lives inside USB drives, SSDs, and smartphones. 3D NAND stacking technology allows terabytes of storage in small packages, replacing hard drives.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('cdma', 'CDMA', 1989, TechRole.L1_CORE_HARDWARE, 'Code Division Multiple Access, Qualcomm\'s wireless technology that allows multiple users to share the same frequency band by encoding transmissions. More spectrum-efficient than competitors, it became the foundation of 3G networks and made Qualcomm dominant.', 'Network & Connectivity', 'Telecommunications');
createTech('gsm', 'GSM', 1991, TechRole.L1_CORE_HARDWARE, 'Global System for Mobile Communications, Europe\'s unified standard for 2G digital cellular networks. Enabled SMS text messaging and international roaming. Became the world\'s most widely used mobile standard, connecting billions before 4G/5G evolution.', 'Network & Connectivity', 'Telecommunications');
createTech('li_ion', 'Li-ion Battery', 1991, TechRole.L1_CORE_HARDWARE, 'Sony commercialized John Goodenough\'s lithium-ion technology, creating high-energy rechargeable batteries. They pack more energy in less weight than predecessors, enabling portable electronics revolution. Now power everything from phones to Tesla cars.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('mp3', 'MP3', 1993, TechRole.L1_CORE_HARDWARE, 'The audio compression format developed by Fraunhofer Institute that shrinks music files to 1/10th their original size. It enabled Napster, iPod, and Spotify by making music portable and shareable. Disrupted the entire recording industry in the 2000s.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('cmos', 'CMOS Sensor', 1993, TechRole.L1_CORE_HARDWARE, 'Complementary Metal-Oxide-Semiconductor image sensors that convert light into digital signals. Invented by Eric Fossum, they replaced CCDs by offering lower power and on-chip processing. CMOS sensors turned every smartphone into a capable camera for billions.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('blue_led', 'Blue LED', 1994, TechRole.L1_CORE_HARDWARE, 'The missing piece for full-color and white LED lighting, invented by Nakamura, Akasaki, and Amano (Nobel Prize 2014). Blue LEDs combine with red and green to create displays, and with phosphors for energy-efficient lighting that now saves billions in electricity.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('bluetooth', 'Bluetooth', 1994, TechRole.L1_CORE_HARDWARE, 'Named after Viking king Harald Bluetooth who united Denmark, this wireless standard unites devices. Developed by Ericsson, it connects headphones, keyboards, mice, and wearables over short distances. Now in billions of devices with Low Energy versions for IoT.', 'Network & Connectivity', 'Telecommunications');
createTech('ssl_tls', 'SSL/TLS', 1995, TechRole.L1_CORE_HARDWARE, 'Secure Sockets Layer and Transport Layer Security protocols that encrypt internet communications. Developed at Netscape, they put the \"S\" in HTTPS and the padlock in browsers. Essential for protecting online banking, shopping, and every login credential.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('wifi', 'WiFi', 1997, TechRole.L1_CORE_HARDWARE, 'Wireless Local Area Networking based on IEEE 802.11 standards. Freed computers from ethernet cables and enabled laptops, smartphones, and IoT devices to connect anywhere. Now essential infrastructure in homes, offices, and public spaces worldwide.', 'Network & Connectivity', 'Telecommunications');
createTech('gpu_geforce', 'GPU (GeForce)', 1999, TechRole.L1_CORE_HARDWARE, 'NVIDIA\'s Graphics Processing Unit that popularized real-time 3D graphics for gaming. Its parallel architecture proved perfect for AI training when CUDA unlocked general computing. Now the H100 and Blackwell generations power the AI revolution\'s data centers.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('arm_cortex', 'ARM Cortex', 2004, TechRole.L1_CORE_HARDWARE, 'ARM\'s standardized processor core families: Cortex-A for applications (smartphones), Cortex-R for real-time, Cortex-M for microcontrollers. These cores run in nearly every Android and iPhone. Apple\'s A-series and M-series are custom Cortex descendants.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('lidar', 'LiDAR', 2005, TechRole.L1_CORE_HARDWARE, 'Light Detection and Ranging uses laser pulses to create precise 3D maps of surroundings. Essential for autonomous vehicles to \"see\" obstacles. iPhone 12 Pro added LiDAR for AR. Originally developed for aerial surveying, now guides robots and self-driving cars.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('lte', 'LTE (4G)', 2009, TechRole.L1_CORE_HARDWARE, 'Long Term Evolution, the 4th generation mobile network bringing true broadband speeds to smartphones. Enabled HD video streaming, video calls, and the app economy explosion. Global deployment made mobile internet a daily necessity for billions of users.', 'Network & Connectivity', 'Telecommunications');
createTech('alexnet', 'AlexNet', 2012, TechRole.L1_CORE_HARDWARE, 'The deep neural network by Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton that won ImageNet 2012 by a massive margin. Proved GPUs plus deep learning works for image recognition. Widely considered the \"big bang\" moment that launched the AI revolution.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('hbm', 'HBM', 2013, TechRole.L1_CORE_HARDWARE, 'High Bandwidth Memory stacks DRAM chips vertically with thousands of connections. Co-developed by AMD and SK Hynix, it feeds data to AI accelerators fast enough to keep GPUs busy. Essential for training large language models where memory bandwidth is the bottleneck.', 'Hardware & Infrastructure', 'Memory & Storage');
createTech('word2vec', 'Word2Vec', 2013, TechRole.L1_CORE_HARDWARE, 'Google\'s technique by Tomas Mikolov that creates word embeddings by analyzing context. It taught machines that \"king - man + woman = queen\". Foundation for natural language processing that led to transformers and ChatGPT\'s understanding of meaning.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('gan', 'GAN', 2014, TechRole.L1_CORE_HARDWARE, 'Generative Adversarial Networks by Ian Goodfellow pit two neural networks against each other. One generates, one judges, both improve. Enabled photorealistic face generation, deepfakes, and inspired the creative AI revolution including Stable Diffusion.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('tpu', 'Google TPU', 2015, TechRole.L1_CORE_HARDWARE, 'Google\'s Tensor Processing Unit, custom silicon optimized for TensorFlow workloads. Designed for inference and training neural networks, TPUs power Google Search, Photos, Translate, and AlphaGo. Now available on Google Cloud, challenging NVIDIA\'s dominance.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('transformer', 'Transformer', 2017, TechRole.L1_CORE_HARDWARE, 'The \"Attention Is All You Need\" architecture from Google that revolutionized AI. Self-attention mechanisms understand context across entire sequences. Powers GPT, BERT, and every modern large language model. The foundation of ChatGPT, Claude, and Gemini.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('5g_nr', '5G (New Radio)', 2019, TechRole.L1_CORE_HARDWARE, 'Fifth generation mobile networks offering up to 20 Gbps speeds and millisecond latency. Enables real-time remote surgery, autonomous vehicles, and massive IoT deployments. Uses mmWave and sub-6GHz bands. Still rolling out globally with mixed coverage.', 'Network & Connectivity', 'Telecommunications');
createTech('euv', 'EUV Lithography', 2019, TechRole.L1_CORE_HARDWARE, 'Extreme Ultraviolet Lithography uses 13.5nm wavelength light to print sub-7nm chip features. ASML\'s monopoly technology required decades of R&D. Without EUV, no one can make the most advanced processors. Each machine costs $200M and requires 3 planes to transport.', 'Hardware & Infrastructure', 'Components & Manufacturing');
createTech('stable_diffusion', 'Stable Diffusion', 2022, TechRole.L1_CORE_HARDWARE, 'Open-source text-to-image AI model by Stability AI that runs on consumer GPUs. Democratized AI art creation by making it free and local. Sparked debates about artist rights and job displacement while enabling unprecedented creative tools for millions.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('nvidia_h100', 'NVIDIA H100', 2022, TechRole.L1_CORE_HARDWARE, 'NVIDIA\'s Hopper architecture GPU with 80 billion transistors, designed for AI training. With Transformer Engine and 3TB/s memory bandwidth, it\'s the most sought-after chip for training large language models. Powers datacenters for OpenAI, Google, and Meta.', 'Hardware & Infrastructure', 'Processors & Compute');

// [L2] Runtime, Platforms & Protocols [Total: 23]
createTech('unix', 'Unix', 1969, TechRole.L2_RUNTIME_PLATFORM, 'The operating system created at Bell Labs by Ken Thompson and Dennis Ritchie. Its philosophy of simple, modular tools connected by pipes influenced all modern OSes. Unix spawned BSD, Solaris, macOS, and inspired Linux. Powers most internet servers today.', 'System Software', 'Operating Systems (OS)');
createTech('c_lang', 'C Language', 1972, TechRole.L2_RUNTIME_PLATFORM, 'Created by Dennis Ritchie at Bell Labs to rewrite Unix portably. C gives low-level hardware access with high-level abstraction. It became the foundation of operating systems, databases, and embedded systems. C++ and many languages descended from it.', 'System Software', 'Development & Languages');
createTech('sql', 'SQL', 1974, TechRole.L2_RUNTIME_PLATFORM, 'Structured Query Language developed at IBM for relational databases. Its English-like syntax democratized data access. SELECT, INSERT, UPDATE became universal commands. Powers Oracle, MySQL, PostgreSQL, and every major database system worldwide.', 'System Software', 'Development & Languages');
createTech('oracle_db', 'Oracle Database', 1979, TechRole.L2_RUNTIME_PLATFORM, 'Larry Ellison\'s relational database that became the enterprise gold standard. Known for reliability and scalability, it powers banks, airlines, and Fortune 500 companies. Oracle\'s aggressive licensing and acquisition strategy made it a $300B empire.', 'System Software', 'Development & Languages');
createTech('www', 'World Wide Web', 1989, TechRole.L2_RUNTIME_PLATFORM, 'Tim Berners-Lee\'s invention at CERN that made the internet accessible. HTML pages, HTTP protocol, and URLs created a universal document system. He gave it away free, enabling the explosion of websites, browsers, and the digital economy.', 'Network & Connectivity', 'Network Architecture');
createTech('linux', 'Linux Kernel', 1991, TechRole.L2_RUNTIME_PLATFORM, 'Linus Torvalds\' free, open-source kernel that powers the infrastructure of the digital world. It runs Android phones, web servers, cloud computing, supercomputers, and embedded devices. The collaborative development model became a template for open source.', 'System Software', 'Operating Systems (OS)');
createTech('python', 'Python', 1991, TechRole.L2_RUNTIME_PLATFORM, 'Guido van Rossum\'s readable programming language prioritizing clarity over cleverness. Its simple syntax made programming accessible to beginners. Libraries like NumPy, Pandas, and TensorFlow made Python the dominant language for AI, data science, and automation.', 'System Software', 'Development & Languages');
createTech('windows_95', 'Windows 95', 1995, TechRole.L2_RUNTIME_PLATFORM, 'Microsoft\'s landmark OS that brought graphical computing to the masses. Introduced the Start menu, taskbar, and long filenames. Sold millions in the first week. Made PCs user-friendly and established Microsoft\'s dominance in personal computing.', 'System Software', 'Operating Systems (OS)');
createTech('java', 'Java', 1995, TechRole.L2_RUNTIME_PLATFORM, 'Sun Microsystems\' \"write once, run anywhere\" language using a virtual machine. Originally for interactive TV, it found success in enterprise servers and Android apps. Despite ownership changes (Oracle), Java remains in the top 3 programming languages.', 'System Software', 'Development & Languages');
createTech('javascript', 'JavaScript', 1995, TechRole.L2_RUNTIME_PLATFORM, 'Brendan Eich created it in 10 days at Netscape to make web pages interactive. Despite its quirks, it became the only language running in all browsers. Node.js brought it server-side. Now one of the world\'s most-used languages, essential for web development.', 'System Software', 'Development & Languages');
createTech('unreal', 'Unreal Engine', 1998, TechRole.L2_RUNTIME_PLATFORM, 'Epic Games\' 3D engine that powers high-fidelity games and virtual production. From Unreal Tournament to Fortnite, it set visual standards. Now used in film (The Mandalorian), architecture, automotive design, and the Metaverse beyond gaming.', 'System Software', 'Development & Languages');
createTech('bittorrent', 'BitTorrent', 2001, TechRole.L2_RUNTIME_PLATFORM, 'Bram Cohen\'s peer-to-peer file sharing protocol where downloaders become uploaders. The more popular a file, the faster it downloads. Proved decentralized distribution works at scale. Used for Linux ISOs, game patches, and unfortunately, piracy.', 'Network & Connectivity', 'Standards & Protocols');
createTech('mapreduce', 'MapReduce', 2004, TechRole.L2_RUNTIME_PLATFORM, 'Google\'s programming model for processing massive datasets across thousands of servers. Split data (Map), process in parallel, combine results (Reduce). Enabled web-scale computing. Inspired Hadoop and the entire big data ecosystem.', 'System Software', 'Development & Languages');
createTech('git', 'Git', 2005, TechRole.L2_RUNTIME_PLATFORM, 'Linus Torvalds created this distributed version control system in 2 weeks when Linux\'s previous tool became unavailable. Every developer has the full history locally. Branches and merges enable collaboration. GitHub made Git the standard for all software.', 'System Software', 'Development & Languages');
createTech('unity', 'Unity', 2005, TechRole.L2_RUNTIME_PLATFORM, 'The game engine that democratized game development. Its accessible tools let indie developers create without large teams. Powers most mobile games and VR experiences. The \"Made with Unity\" splash screen appears in thousands of games across all platforms.', 'System Software', 'Development & Languages');
createTech('aws_cloud', 'AWS Cloud', 2006, TechRole.L2_RUNTIME_PLATFORM, 'Amazon\'s Infrastructure as a Service that invented cloud computing as we know it. Started with S3 and EC2, now offers 200+ services. Enabled startups to scale without data centers. Generates $80B+ annually and dominates the cloud market with 32% share.', 'Network & Connectivity', 'Network Architecture');
createTech('cuda', 'CUDA', 2007, TechRole.L2_RUNTIME_PLATFORM, 'NVIDIA\'s parallel computing platform that unlocked GPUs for general computation. Originally for graphics, CUDA enabled GPUs to train neural networks. This foresight made NVIDIA the foundation of the AI revolution. Without CUDA, modern AI wouldn\'t exist.', 'System Software', 'Development & Languages');
createTech('ios', 'iOS', 2007, TechRole.L2_RUNTIME_PLATFORM, 'Apple\'s mobile operating system that launched with the iPhone and defined modern smartphone UX. Its touch paradigm, App Store ecosystem, and security model set standards. Regular updates and long device support make iOS a premium mobile experience.', 'System Software', 'Operating Systems (OS)');
createTech('android', 'Android', 2008, TechRole.L2_RUNTIME_PLATFORM, 'Google\'s open-source mobile OS that runs on 3 billion devices. Acquired from Andy Rubin in 2005. OEMs from Samsung to Xiaomi customize it. Its openness enabled diverse hardware and price points, connecting the next billion users to the internet.', 'System Software', 'Operating Systems (OS)');
createTech('zero_trust', 'Zero Trust', 2010, TechRole.L2_RUNTIME_PLATFORM, 'The security philosophy that \"never trust, always verify.\" Pioneered by Forrester\'s John Kindervag, it assumes attackers are already inside the network. Every access request must be authenticated. Became essential after remote work exposed traditional perimeter security.', 'Fundamental Concepts', 'Standards & Protocols');
createTech('docker', 'Docker', 2013, TechRole.L2_RUNTIME_PLATFORM, 'Solomon Hykes\' containerization platform packages applications with all dependencies. \"It works on my machine\" became \"it works on every machine.\" Lighter than VMs, faster to deploy. Kubernetes orchestrates Docker containers at massive scale in the cloud.', 'System Software', 'Development & Languages');
createTech('tensorflow', 'TensorFlow', 2015, TechRole.L2_RUNTIME_PLATFORM, 'Google\'s open-source machine learning framework that brought deep learning to developers. Its computational graph model and TensorBoard visualization accelerated AI research. Powers Google Photos, Translate, and thousands of AI applications worldwide.', 'System Software', 'Development & Languages');
createTech('pytorch', 'PyTorch', 2016, TechRole.L2_RUNTIME_PLATFORM, 'Meta\'s deep learning framework that won over researchers with its Pythonic design and dynamic graphs. Easier to debug than TensorFlow v1. Now dominates academic AI research. ChatGPT, Stable Diffusion, and most cutting-edge models are built on PyTorch.', 'System Software', 'Development & Languages');

// [L3] End Applications, Services & Devices [Total: 50]
createTech('walkman', 'Sony Walkman', 1979, TechRole.L3_END_APPLICATION, 'Sony\'s portable cassette player that liberated music from the living room. Created by founder Akio Morita for personal use, it sold 400 million units and created the personal audio category. The ancestor of the iPod that changed how we experience music.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('macintosh', 'Macintosh', 1984, TechRole.L3_END_APPLICATION, 'Apple\'s computer \"for the rest of us\" with graphical interface, mouse, and icons. Inspired by Xerox PARC, refined by Steve Jobs and team. The famous 1984 Super Bowl ad launched it. Set the template for all modern user interfaces we use daily.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('toshiba_t1100', 'Toshiba T1100', 1985, TechRole.L3_END_APPLICATION, 'The first mass-market IBM PC-compatible laptop with clamshell design. Weighed 4kg and ran on batteries. Established the laptop form factor that billons use today. Proved portable computing could be practical for mobile professionals.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('excel', 'Microsoft Excel', 1985, TechRole.L3_END_APPLICATION, 'The spreadsheet that conquered the business world. Originally for Mac, then dominated on Windows. VisiCalc invented the category, Lotus 1-2-3 popularized it, but Excel won with superior features. Still the language of finance and business analytics.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('photoshop', 'Adobe Photoshop', 1990, TechRole.L3_END_APPLICATION, 'Created by Thomas and John Knoll, acquired by Adobe. \"Photoshopping\" became a verb for image editing. Set the standard for digital creativity, photography, and design. Along with Illustrator and InDesign, forms the creative profession\'s essential toolkit.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('mosaic', 'Mosaic Browser', 1993, TechRole.L3_END_APPLICATION, 'The first web browser to display images inline with text, developed at NCSA by Marc Andreessen and Eric Bina. Made the web visual and accessible. Its graphical interface sparked the internet boom. Andreessen later co-founded Netscape based on Mosaic.', 'System Software', 'Development & Languages');
createTech('netscape', 'Netscape Navigator', 1994, TechRole.L3_END_APPLICATION, 'The browser that commercialized the World Wide Web. Its 1995 IPO sparked the dot-com boom. Fought and lost the browser war to Microsoft\'s Internet Explorer. Created JavaScript and SSL. Navigator is gone but its DNA lives in Firefox through Mozilla.', 'Digital Services & Platforms', 'Search & Information');
createTech('amazon_com', 'Amazon.com', 1994, TechRole.L3_END_APPLICATION, 'Jeff Bezos started selling books from his Seattle garage, then became the \"Everything Store.\" One-click ordering, Prime membership, and aggressive expansion disrupted retail worldwide. Now includes AWS, Alexa, and a media empire. The customer obsession company.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('netflix', 'Netflix', 1997, TechRole.L3_END_APPLICATION, 'Reed Hastings\' DVD-by-mail service that pivoted to streaming before anyone else. \"House of Cards\" proved original content worked. Invented binge-watching culture. Now a $250B+ content studio producing in 50 countries, fundamentally changing how the world watches TV.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('google_search', 'Google Search', 1998, TechRole.L3_END_APPLICATION, 'Larry Page and Sergey Brin\'s Stanford project using PageRank to index quality by links. Clean interface and accurate results crushed AltaVista and Yahoo. \"Google it\" became a verb. Search ads generate $150B+ annually. Still handles 8.5 billion searches daily.', 'Digital Services & Platforms', 'Search & Information');
createTech('paypal', 'PayPal', 1998, TechRole.L3_END_APPLICATION, 'The merger of Confinity and Elon Musk\'s X.com that solved online payments. Essential for eBay commerce. The \"PayPal Mafia\" alumni later founded Tesla, LinkedIn, Palantir, YouTube, and Yelp. Became the model for fintech disruption of traditional banking.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('salesforce_crm', 'Salesforce CRM', 1999, TechRole.L3_END_APPLICATION, 'Marc Benioff\'s \"No Software\" campaign pioneered Software as a Service before the term existed. Customer relationship management delivered via browser. Acquired Slack, Tableau, MuleSoft. Proved enterprise software could be cloud-native and subscription-based.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('wikipedia', 'Wikipedia', 2001, TechRole.L3_END_APPLICATION, 'Jimmy Wales and Larry Sanger\'s free encyclopedia written by volunteers. 60+ million articles in 300+ languages. The wiki model proved collective knowledge works. Despite constant predictions of failure, it remains one of the most visited sites in the world.', 'Digital Services & Platforms', 'Search & Information');
createTech('skype', 'Skype', 2003, TechRole.L3_END_APPLICATION, 'The Estonian startup that made free video calls possible between computers. \"Skype me\" became a verb. Peak at 300 million users. eBay acquired it for $2.6B, then sold to Microsoft for $8.5B. Paved the way for Zoom and modern video communication.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('linkedin', 'LinkedIn', 2003, TechRole.L3_END_APPLICATION, 'Reid Hoffman\'s professional social network that digitized the rolodex and resume. 900+ million members worldwide. Microsoft acquired it for $26B. Powers professional networking, recruiting, and B2B marketing. The social network where it\'s okay to talk about work.', 'Digital Services & Platforms', 'Social & Media');
createTech('facebook', 'Facebook', 2004, TechRole.L3_END_APPLICATION, 'Mark Zuckerberg\'s Harvard dorm project that connected the world. 3 billion monthly users. Acquired Instagram and WhatsApp. Pioneered the News Feed, targeted advertising, and social graph. Rebranded to Meta in 2021, betting its future on VR and the metaverse.', 'Digital Services & Platforms', 'Social & Media');
createTech('youtube', 'YouTube', 2005, TechRole.L3_END_APPLICATION, '\"Broadcast Yourself\" platform by Chad Hurley, Steve Chen, and Jawed Karim (ex-PayPal). Google acquired it for $1.65B, now worth $200B+. 2 billion monthly users watch 1 billion hours daily. Created the creator economy and changed entertainment forever.', 'Digital Services & Platforms', 'Social & Media');
createTech('twitter', 'Twitter', 2006, TechRole.L3_END_APPLICATION, 'Jack Dorsey\'s 140-character microblogging platform that became the world\'s real-time news feed. Breaking news, political discourse, and viral moments. Acquired by Elon Musk in 2022 and rebranded to X. The digital town square, for better or worse.', 'Digital Services & Platforms', 'Social & Media');
createTech('iphone', 'iPhone', 2007, TechRole.L3_END_APPLICATION, 'Steve Jobs combined \"an iPod, a phone, and an internet communicator\" into one revolutionary device. Multi-touch screen eliminated keyboards. App Store created a new economy. Sold 2 billion+ units. Defined the smartphone era and put the internet in everyone\'s pocket.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('spotify', 'Spotify', 2008, TechRole.L3_END_APPLICATION, 'Daniel Ek\'s Swedish startup that made streaming legal and convenient enough to beat piracy. 500+ million users, 200+ million paying subscribers. Algorithmic playlists like Discover Weekly changed music discovery. Saved the music industry while reshaping artist economics.', 'Digital Services & Platforms', 'Social & Media');
createTech('app_store', 'App Store', 2008, TechRole.L3_END_APPLICATION, 'Apple\'s curated marketplace launched with iPhone 3G. Safe, one-tap installation replaced complex software distribution. Created app economy worth hundreds of billions. Indie developers could reach millions. The 30% commission became both industry standard and antitrust battleground.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('google_chrome', 'Google Chrome', 2008, TechRole.L3_END_APPLICATION, 'Google\'s fast, minimalist browser built on V8 JavaScript engine. Launched with a comic book explaining its architecture. Gained 70% market share by being faster and auto-updating. Chrome OS extended it to laptops. The browser became the operating system for the modern web.', 'Digital Services & Platforms', 'Search & Information');
createTech('github', 'GitHub', 2008, TechRole.L3_END_APPLICATION, 'The social network for code built around Git. Chris Wanstrath and Tom Preston-Werner made open source collaboration social. 100+ million developers. Microsoft acquired it for $7.5B. Now hosts most of the world\'s software and powers Copilot AI coding assistant.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('bitcoin', 'Bitcoin', 2009, TechRole.L3_END_APPLICATION, 'Satoshi Nakamoto\'s solution to digital money without banks. Blockchain distributed ledger, proof-of-work mining, 21 million coin limit. From $0 to $70K per coin. Spawned thousands of cryptocurrencies and the DeFi movement. Digital gold or speculative mania, still debated.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('uber_app', 'Uber App', 2010, TechRole.L3_END_APPLICATION, 'Travis Kalanick\'s \"push a button, get a ride\" app that disrupted taxi industries worldwide. Created the gig economy model. Expanded into food delivery (Uber Eats), freight, and air taxis. \"Uber for X\" became the template for on-demand services everywhere.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('stripe', 'Stripe', 2010, TechRole.L3_END_APPLICATION, 'Irish brothers Patrick and John Collison built payment infrastructure that developers love. Seven lines of code to accept payments. Powers Amazon, Google, and most internet commerce. Valued at $65B+. The invisible plumbing making internet transactions just work.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('wechat', 'WeChat', 2011, TechRole.L3_END_APPLICATION, 'Tencent\'s super-app combining messaging, social media, mobile payments, mini programs, and more. 1.3 billion monthly users. Pay bills, hail cabs, order food—all without leaving WeChat. The template for everything-apps that Western tech tries to copy.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('zoom', 'Zoom', 2011, TechRole.L3_END_APPLICATION, 'Eric Yuan left Cisco WebEx frustrated by poor quality. Built Zoom to \"just work.\" COVID-19 made it essential—100M daily users to 300M in months. \"You\'re on mute\" entered popular culture. Proved reliable video calls were possible if engineering prioritized it.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('model_s', 'Tesla Model S', 2012, TechRole.L3_END_APPLICATION, 'Tesla\'s luxury sedan that proved electric cars could be fast, beautiful, and practical. 400+ mile range, 0-60 in 2.1 seconds (Plaid). Over-the-air updates kept improving old cars. Forced legacy automakers to take EVs seriously. Made electric vehicles aspirational.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('raspberry_pi', 'Raspberry Pi', 2012, TechRole.L3_END_APPLICATION, 'British charity Raspberry Pi Foundation\'s $35 computer to teach programming. Credit-card sized with GPIO pins for hardware projects. Sold 50+ million units. Powers DIY projects from weather stations to retro gaming consoles. Made physical computing accessible to everyone.', 'Hardware & Infrastructure', 'Devices & Form Factors');
createTech('dji_phantom', 'DJI Phantom', 2013, TechRole.L3_END_APPLICATION, 'Shenzhen-based DJI\'s ready-to-fly drone that put aerial photography in consumer hands. GPS stabilization, camera mounts, and easy controls. DJI now controls 70%+ of consumer drone market. Changed filmmaking, real estate, agriculture, and disaster response industries.', 'AI & Physical Systems', 'Robotics');
createTech('slack', 'Slack', 2013, TechRole.L3_END_APPLICATION, 'Stewart Butterfield\'s \"Searchable Log of All Conversation and Knowledge\" replaced email for teams. Channels, threads, and integrations. Grew to 12M+ daily users. Salesforce acquired it for $27.7B. Pioneered the workplace messaging category that now includes Teams and Discord.', 'Digital Services & Platforms', 'Digital Platforms');
createTech('tesla_autopilot', 'Tesla Autopilot', 2014, TechRole.L3_END_APPLICATION, 'Tesla\'s driver-assistance system using cameras and neural networks. Highway driving, auto-lane-change, and Navigate on Autopilot. Controversy over \"Full Self-Driving\" claims. But millions of miles of real-world data advanced autonomous driving research faster than competitors.', 'AI & Physical Systems', 'Autonomous Mobility');
createTech('ethereum', 'Ethereum', 2015, TechRole.L3_END_APPLICATION, 'Vitalik Buterin\'s programmable blockchain that runs smart contracts—code that executes automatically. Enabled DeFi (decentralized finance), NFTs, and DAOs. The merge to proof-of-stake reduced energy use 99%. The world computer for decentralized applications.', 'AI & Physical Systems', 'Fintech & Crypto');
createTech('alphago', 'AlphaGo', 2016, TechRole.L3_END_APPLICATION, 'DeepMind\'s AI that defeated Go world champion Lee Sedol 4-1 in 2016, a decade ahead of predictions. Combined deep neural networks with Monte Carlo tree search. Move 37 in Game 2 was alien genius. Proved AI could master intuitive games humans thought machines couldn\'t play.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('tiktok', 'TikTok', 2016, TechRole.L3_END_APPLICATION, 'ByteDance\'s short-video app that mastered algorithmic content discovery. The \"For You\" feed learns preferences instantly. 1 billion monthly users. Changed music discovery, creator economy, and attention spans. Western tech struggles to copy its addictive recommendation engine.', 'Digital Services & Platforms', 'Social & Media');
createTech('oculus_rift', 'Oculus Rift', 2016, TechRole.L3_END_APPLICATION, 'Palmer Luckey\'s Kickstarter project that revived consumer VR. Facebook acquired Oculus for $2B before it shipped. Low-latency head tracking and wide field of view solved motion sickness. Quest 2 brought standalone VR to millions. Meta\'s bet on the metaverse future.', 'AI & Physical Systems', 'Spatial Computing');
createTech('alphago_zero', 'AlphaGo Zero', 2017, TechRole.L3_END_APPLICATION, 'DeepMind\'s AI that learned Go from scratch with zero human knowledge—just the rules. Played itself 40 days, became stronger than original AlphaGo. Discovered novel strategies humans never imagined. Proved AI can surpass human knowledge through pure self-play reinforcement learning.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('starlink', 'Starlink', 2019, TechRole.L3_END_APPLICATION, 'SpaceX\'s satellite internet constellation providing broadband to remote areas. 5,000+ satellites in low Earth orbit. 2+ million subscribers in 60 countries. Enabled communication in Ukraine during Russian invasion. Controversial for astronomy light pollution and space debris.', 'Network & Connectivity', 'Telecommunications');
createTech('fugaku', 'Fujitsu Fugaku', 2020, TechRole.L3_END_APPLICATION, 'Japan\'s supercomputer that topped the Top500 list using ARM-based A64FX processors. 442 petaflops peak performance. Proved ARM architecture could compete with x86 at highest performance levels. Used for COVID-19 research, climate modeling, and materials science.', 'Hardware & Infrastructure', 'Processors & Compute');
createTech('copilot', 'GitHub Copilot', 2021, TechRole.L3_END_APPLICATION, 'GitHub and OpenAI\'s AI pair programmer trained on billions of lines of code. Suggests completions, writes functions, explains code. 1M+ paying subscribers. Controversial for training on copyleft code. First successful commercial AI coding assistant, now with competitors from all major players.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('chatgpt', 'ChatGPT', 2022, TechRole.L3_END_APPLICATION, 'OpenAI\'s conversational AI that reached 100M users in 2 months—fastest consumer app adoption ever. GPT-3.5 fine-tuned with RLHF for helpfulness. Can explain concepts, write essays, debug code. Made \"AI\" a household word. Triggered an industry-wide race to ship competing models.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('midjourney', 'Midjourney', 2022, TechRole.L3_END_APPLICATION, 'David Holz\'s text-to-image AI accessed uniquely through Discord. Creates stunning artistic and photorealistic images from descriptions. Won art competition controversy. No mobile app, limited API—yet built a profitable $200M business. Proved AI art has genuine aesthetic appeal.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('perplexity', 'Perplexity', 2022, TechRole.L3_END_APPLICATION, 'The \"answer engine\" that combines search with AI summarization. Reads multiple sources and provides cited responses. Challenges Google\'s search dominance with a conversational interface. Valued at $3B+. Points to a future where AI reads the web so you don\'t have to.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('spacex_falcon9', 'Falcon 9', 2010, TechRole.L3_END_APPLICATION, 'SpaceX\'s workhorse rocket with reusable first stage that lands itself—on land or drone ships. 200+ successful launches. Reduced launch costs 10x. Delivers cargo to ISS, deploys Starlink, and launches commercial satellites. Proved reusability works and transformed space economics.', 'AI & Physical Systems', 'Robotics');
createTech('starship', 'Starship', 2023, TechRole.L3_END_APPLICATION, 'SpaceX\'s fully reusable 400ft rocket designed for Mars colonization. Largest and most powerful rocket ever built. Stainless steel construction, Super Heavy booster with 33 Raptor engines. Catching booster with chopsticks made history. The vehicle Elon Musk designed to reach Mars.', 'AI & Physical Systems', 'Robotics');
createTech('gemini', 'Google Gemini', 2023, TechRole.L3_END_APPLICATION, 'Google DeepMind\'s multimodal AI that natively understands text, code, images, audio, and video together. Built from the ground up as multimodal, not retrofitted. Powers Google products and competes with GPT-4. Represents Google\'s counter to the ChatGPT threat.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('claude', 'Claude', 2023, TechRole.L3_END_APPLICATION, 'Anthropic\'s AI assistant emphasizing safety through Constitutional AI methodology. Excels at reading and analyzing long documents (200K+ token context). Created by former OpenAI researchers focused on AI alignment. The thoughtful alternative prioritizing being helpful, harmless, and honest.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('cursor', 'Cursor', 2023, TechRole.L3_END_APPLICATION, 'AI-first code editor that deeply integrates large language models into the development workflow. Built on VS Code foundation with custom AI features. Edit code through chat, inline completions, and codebase understanding. Part of the wave reimagining programming tools for the AI era.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('sora', 'Sora', 2024, TechRole.L3_END_APPLICATION, 'OpenAI\'s text-to-video model that generates photorealistic videos up to 60 seconds. Understands physics, camera movement, and temporal consistency. Named after Japanese word for \"sky.\" Not yet publicly available but demos shocked the world. May revolutionize filmmaking and advertising.', 'AI & Physical Systems', 'Artificial Intelligence');
createTech('vision_pro', 'Apple Vision Pro', 2024, TechRole.L3_END_APPLICATION, 'Apple\'s $3,500 \"spatial computer\" mixing AR and VR. Personas, eye tracking, hand gestures, and M2+R1 chips. \"The most advanced personal electronics device ever.\" First new product category since Apple Watch. Apple\'s bet on computing\'s spatial future, despite skeptical reception.', 'AI & Physical Systems', 'Spatial Computing');

// ==============================================================================
// 2. COMPANY NODES [Total: 46]
// ==============================================================================

// [Semiconductors & Core Infrastructure] Total: 13
createCompany('fairchild', 'Fairchild Semi', 1957, 'The "Traitorous Eight" left Shockley Semiconductor to found this pioneering chip company. Its alumni, known as "Fairchildren," founded Intel, AMD, and most of Silicon Valley. The original semiconductor startup that defined an industry and a region.', CompanyCategory.SEMICONDUCTOR);
createCompany('intel', 'Intel', 1968, 'Founded by Fairchild refugees Gordon Moore and Robert Noyce. Invented the microprocessor (4004) in 1971, enabling personal computers. Their x86 architecture dominated PCs for decades. "Intel Inside" became synonymous with computing power.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$100B', peak: '$500B' } });
createCompany('amd', 'AMD', 1969, 'Advanced Micro Devices, founded by Jerry Sanders from Fairchild. Survived as Intel\'s underdog for decades, then disrupted with Ryzen CPUs and acquired ATI for graphics. Now powers gaming consoles, PCs, and servers with competitive chips.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$260B', peak: '$320B' } });
createCompany('nvidia', 'NVIDIA', 1993, 'Founded by Jensen Huang to revolutionize graphics. The GeForce GPU conquered gaming, then CUDA unlocked parallel computing. Now the world\'s most valuable semiconductor company, powering AI training with H100 and Blackwell chips. The engine of the AI revolution.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$3.0T', peak: '$3.4T' } });
createCompany('arm_ltd', 'Arm Holdings', 1990, 'Spun out from Acorn Computers in Cambridge, UK. Their RISC architecture prioritizes power efficiency over raw speed. Licensed by Apple, Qualcomm, and Samsung, Arm powers 99% of smartphones. Now expanding into servers and AI Edge devices.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$160B', peak: '$180B' } });
createCompany('samsung', 'Samsung', 1969, 'South Korean conglomerate that evolved from trading to electronics. World leader in DRAM memory, NAND flash, and smartphone displays. Their foundry competes with TSMC. From semiconductors to smartphones, Samsung shapes the digital world.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$300B', peak: '$500B' } });
createCompany('qualcomm', 'Qualcomm', 1985, 'San Diego company that pioneered CDMA mobile technology. Their Snapdragon chips power most Android phones, integrating CPU, GPU, and 5G modem. Collects royalties on nearly every smartphone sold through their essential wireless patents.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$190B', peak: '$220B' } });
createCompany('broadcom', 'Broadcom', 1991, 'Started as a fabless semiconductor company, now a $500B giant. Dominates networking chips, Wi-Fi, and enterprise storage. Acquired VMware, Symantec, and CA Technologies. Their chips connect virtually every device to the internet.', CompanyCategory.SEMICONDUCTOR, { marketCap: { current: '$500B', peak: '$550B' } });
createCompany('hp', 'Hewlett-Packard', 1939, 'The founding company of Silicon Valley, started in a Palo Alto garage by Stanford engineers Bill Hewlett and Dave Packard. Pioneered test equipment, calculators, and printers. HP Labs invented technologies from HP-UX to the inkjet. Split into HP Inc. and HPE in 2015.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('sun_micro', 'Sun Microsystems', 1982, 'Stanford University Network graduates built powerful UNIX workstations. Created Java ("Write once, run anywhere"), NFS, and ZFS. Their SPARC processors powered the internet\'s servers. Acquired by Oracle in 2010, but their open-source legacy lives on.', CompanyCategory.HARDWARE_ROBOTICS);
createCompany('att', 'AT&T', 1885, 'American Telephone & Telegraph, the original "Ma Bell" monopoly. Built America\'s phone network and owned Bell Labs. Broken up in 1984, but their infrastructure legacy—from telephone poles to fiber optics—still connects the nation.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: '$130B', peak: '$250B' } });
createCompany('cisco', 'Cisco', 1984, 'Founded by Stanford couple who wanted their campus networks to talk to each other. Their routers and switches became the internet\'s backbone. At the dot-com peak, briefly the world\'s most valuable company. Still the plumber of the digital world.', CompanyCategory.INFRA_TELECOM, { marketCap: { current: '$230B', peak: '$550B' } });
createCompany('spacex', 'SpaceX', 2002, 'Elon Musk\'s rocket company that proved reusable spacecraft are possible. Falcon 9 lands itself, Starlink blankets Earth with internet, and Starship aims for Mars. Revolutionizing space economics with 10x cost reduction per launch.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$210B (Valuation)', peak: '$210B' } });

// [Hardware, Robotics & Devices] Total: 6
createCompany('ibm', 'IBM', 1911, 'International Business Machines, "Big Blue," invented the punch card and mainframe. Their System/360 defined enterprise computing. Launched the IBM PC in 1981, then pivoted to services and AI with Watson. A century of computing history.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$170B', peak: '$210B' } });
createCompany('tesla', 'Tesla', 2003, 'Elon Musk\'s electric vehicle company that proved EVs could be desirable, not just practical. The Model S, 3, X, Y lineup outsells legacy automakers. Now expanding into energy storage, solar, and humanoid robots with Optimus.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$800B', peak: '$1.2T' } });
createCompany('dji', 'DJI', 2006, 'Da-Jiang Innovations, the Shenzhen company that created the consumer drone industry. Their Phantom and Mavic drones dominate 70% of the market. Made aerial photography accessible to everyone from filmmakers to farmers.', CompanyCategory.HARDWARE_ROBOTICS, { marketCap: { current: '$15B (Valuation)' } });
createCompany('boston_dynamics', 'Boston Dynamics', 1992, 'MIT spinoff famous for mesmerizing robot videos. Spot the robot dog patrols factories, while Atlas performs parkour. Owned by Hyundai after stints with Google and SoftBank. Pushing the physical limits of robotics.', CompanyCategory.HARDWARE_ROBOTICS);

// [Software, SaaS & Enterprise] Total: 5
createCompany('microsoft', 'Microsoft', 1975, 'Bill Gates and Paul Allen\'s software empire. Windows and Office dominated desktops, Azure now rivals AWS, and their OpenAI partnership powers Copilot. From BASIC to AI, Microsoft remains the productivity giant for billions.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$3.2T', peak: '$3.3T' } });
createCompany('oracle', 'Oracle', 1977, 'Larry Ellison\'s database dynasty. Their relational database became the backbone of enterprise data. Expanded into ERP, cloud, and acquired Sun Microsystems for Java. The silent giant managing Fortune 500 data.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$380B', peak: '$400B' } });
createCompany('adobe', 'Adobe', 1982, 'PostScript founders John Warnock and Charles Geschke built the digital creative suite. Photoshop, Illustrator, and Premiere Pro are industry standards. Invented PDF. Pioneered SaaS with Creative Cloud subscription model.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$230B', peak: '$300B' } });
createCompany('salesforce_co', 'Salesforce', 1999, 'Marc Benioff\'s "No Software" crusade pioneered cloud computing before the term existed. Their CRM platform runs sales teams worldwide. Acquired Slack, Tableau, and MuleSoft. Enterprise software delivered via the browser.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$260B', peak: '$310B' } });
createCompany('sap', 'SAP', 1972, 'German enterprise software giant that runs the world\'s supply chains. Their ERP systems manage inventory, finance, and HR for the largest corporations. From SAP R/3 to S/4HANA Cloud, they are the backbone of global business.', CompanyCategory.ENTERPRISE_SAAS, { marketCap: { current: '$220B', peak: '$230B' } });


// [Internet, Platform & Consumer Services] Total: 13
createCompany('google', 'Google', 1998, 'Larry Page and Sergey Brin\'s Stanford project that organized the world\'s information. Pioneered PageRank, AdWords, and YouTube acquisition. Android runs 3 billion devices, Chrome dominates browsers, and DeepMind leads AI research.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$2.1T', peak: '$2.3T' } });
createCompany('amazon', 'Amazon', 1994, 'Jeff Bezos\'s "Everything Store" that started with books and became the everything company. AWS invented public cloud computing. Prime changed consumer expectations. From e-commerce to AI to space, Amazon bets on the long term.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$2.0T', peak: '$2.1T' } });
createCompany('meta', 'Meta', 2004, 'Mark Zuckerberg\'s dorm room project became the world\'s social network. Acquired Instagram and WhatsApp, connecting 3 billion people. Rebranded to Meta in 2021, betting the company on VR/AR with Reality Labs.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$1.3T', peak: '$1.3T' } });
createCompany('tencent', 'Tencent', 1998, 'China\'s social-gaming giant. WeChat is China\'s super-app: messaging, payments, and mini-apps. World\'s largest gaming company, owning stakes in Riot, Epic, and Ubisoft. The gateway to digital China.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$380B', peak: '$900B' } });
createCompany('alibaba', 'Alibaba', 1999, 'Jack Ma\'s e-commerce empire rivaling Amazon in scale. Taobao, Tmall, and Alibaba.com connect manufacturers with the world. Alipay (now Ant) pioneered mobile payments. Singles Day generates more sales than Black Friday and Cyber Monday combined.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$200B', peak: '$850B' } });
createCompany('bytedance', 'ByteDance', 2012, 'Chinese startup that mastered algorithmic content recommendation. TikTok became the fastest-growing app ever, addicting billions with short videos. Their "For You" feed changed how content finds users, not the other way around.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$220B (Valuation)', peak: '$400B' } });
createCompany('uber_co', 'Uber', 2009, 'Travis Kalanick\'s ride-sharing app that disrupted taxis worldwide. Pioneered the gig economy by treating drivers as contractors. Expanded into food delivery (Uber Eats) and freight. The verb "Uber" now means disruption itself.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$160B', peak: '$170B' } });
createCompany('airbnb', 'Airbnb', 2008, 'Air mattresses in a San Francisco apartment became a $100B hospitality network. Brian Chesky\'s platform turned homeowners into hoteliers. Disrupted hotels, transformed travel, and created a new category of "experience" economy.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$100B', peak: '$130B' } });
createCompany('paypal_co', 'PayPal', 1998, 'The original fintech merger of Confinity and X.com. The "PayPal Mafia" includes Musk, Thiel, Levchin, Hoffman, and Chen, who later founded Tesla, Palantir, LinkedIn, and YouTube. Digital payments pioneer that enabled eBay commerce.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$70B', peak: '$360B' } });
createCompany('stripe_co', 'Stripe', 2010, 'Irish brothers Patrick and John Collison built payment infrastructure for developers. "Seven lines of code" to accept payments. Powers Amazon, Google, and Shopify checkouts. The invisible plumbing of internet commerce.', CompanyCategory.PLATFORM_INTERNET, { marketCap: { current: '$65B (Valuation)', peak: '$95B' } });
createCompany('netscape_co', 'Netscape', 1994, 'Jim Clark and Marc Andreessen\'s browser that brought the web to the masses. Their 1995 IPO sparked the dot-com boom. Netscape Navigator\'s "View Source" inspired a generation of developers. Lost the browser war to IE, but won the internet war.', CompanyCategory.PLATFORM_INTERNET);
createCompany('spotify_co', 'Spotify', 2006, 'Swedish startup that saved the music industry by making piracy inconvenient. Daniel Ek convinced labels to stream. 500M+ users now pay for access over ownership. Pioneered podcast acquisitions and personalized playlists.', CompanyCategory.MEDIA_CONTENT, { marketCap: { current: '$70B', peak: '$70B' } });
createCompany('netflix_co', 'Netflix', 1997, 'Reed Hastings\'s DVD-by-mail service pivoted to streaming and changed how the world watches TV. Invented binge-watching with House of Cards. Now a content studio rivaling Hollywood, spending $17B/year on original programming.', CompanyCategory.MEDIA_CONTENT, { marketCap: { current: '$280B', peak: '$300B' } });


// [AI Innovation & Labs] Total: 4
createCompany('deepmind', 'Google DeepMind', 2010, 'London-based AI lab founded by Demis Hassabis. AlphaGo defeated the world Go champion in 2016, a decade ahead of predictions. AlphaFold solved protein folding, revolutionizing biology. Acquired by Google for $500M, now merged with Google Brain.', CompanyCategory.AI_INNOVATION);
createCompany('openai', 'OpenAI', 2015, 'AI research lab founded by Musk, Altman, and others to ensure AGI benefits humanity. GPT-3 and ChatGPT brought AI to mainstream consumers. DALL-E generates images, Whisper transcribes speech. The company that made AI a verb.', CompanyCategory.AI_INNOVATION, { marketCap: { current: '$86B (Valuation)', peak: '$100B' } });
createCompany('anthropic', 'Anthropic', 2021, 'Founded by ex-OpenAI researchers Dario and Daniela Amodei, focused on AI safety. Claude assistant emphasizes being helpful, harmless, and honest. Constitutional AI methodology tries to make models self-correcting. The cautious alternative to OpenAI.', CompanyCategory.AI_INNOVATION, { marketCap: { current: '$18B (Valuation)' } });
createCompany('huggingface', 'Hugging Face', 2016, 'The GitHub of machine learning. French-American startup that democratized AI with open-source Transformers library. Hosts 500K+ models and datasets. Any researcher can share, any company can deploy. Community-driven AI development.', CompanyCategory.AI_INNOVATION, { marketCap: { current: '$4.5B (Valuation)' } });

// [Venture Capital & Investment] Total: 4
createCompany('sequoia', 'Sequoia Capital', 1972, 'The legendary VC firm that backed Apple, Google, Oracle, PayPal, YouTube, Instagram, and NVIDIA. Don Valentine\'s thesis: "Target big markets." Portfolio companies represent over 25% of NASDAQ\'s value. The Midas touch of Silicon Valley.', CompanyCategory.VENTURE_CAPITAL);
createCompany('ycombinator', 'Y Combinator', 2005, 'Paul Graham\'s startup accelerator that industrialized entrepreneurship. $500K for 7% equity, three months of intensive mentorship. Alumni include Airbnb, Dropbox, Stripe, Reddit, and Twitch. "Make something people want."', CompanyCategory.VENTURE_CAPITAL);
createCompany('a16z', 'a16z', 2009, 'Andreessen Horowitz, founded by Marc Andreessen (Netscape) and Ben Horowitz. "Software is eating the world." Provides 100+ operational experts alongside capital. Backed Facebook, GitHub, Coinbase, and Figma. VC as a platform business.', CompanyCategory.VENTURE_CAPITAL);
createCompany('softbank', 'SoftBank Vision Fund', 2017, 'Masayoshi Son\'s $100B mega-fund that rewrote VC rules. Invested in Uber, WeWork, ByteDance, and ARM. Bold bets on AI and the "Singularity." High-profile failures taught that size isn\'t everything, but ambition defines the future.', CompanyCategory.VENTURE_CAPITAL, { marketCap: { current: '$80B (Group)', peak: '$180B' } });

// [Academy & Labs] Total: 6
createCompany('xerox_parc', 'Xerox PARC', 1970, 'The legendary Palo Alto Research Center invented the graphical user interface, mouse, ethernet, and laser printing. Steve Jobs famously visited in 1979, inspiring the Macintosh. Despite creating revolutionary tech, Xerox failed to commercialize it.', CompanyCategory.ACADEMY_LAB);
createCompany('bell_labs', 'Bell Labs', 1925, 'The "Idea Factory" of the 20th century, operated by AT&T. Invented the transistor (1947), information theory, laser, Unix OS, and C language. Nine Nobel Prizes were awarded for work done here. The birthplace of modern computing.', CompanyCategory.ACADEMY_LAB);
createCompany('darpa', 'DARPA', 1958, 'The Defense Advanced Research Projects Agency, created after Sputnik shocked America. Funded ARPANET (the internet\'s ancestor), GPS, stealth aircraft, and autonomous vehicles. Their high-risk, high-reward research model shaped modern technology.', CompanyCategory.ACADEMY_LAB);
createCompany('mit_csail', 'MIT CSAIL', 1959, 'The MIT Computer Science and Artificial Intelligence Laboratory, founded by Minsky and McCarthy. Birthplace of AI as an academic field, hacker culture, and the Free Software movement. Tim Berners-Lee and many AI pioneers worked here.', CompanyCategory.ACADEMY_LAB);
createCompany('stanford_ai_lab', 'Stanford AI Lab', 1962, 'Stanford Artificial Intelligence Laboratory, founded by John McCarthy (who coined "AI"). Pioneered robotics, machine learning, and expert systems. Its alumni founded Google, Sun, and Yahoo. The intellectual heart of Silicon Valley.', CompanyCategory.ACADEMY_LAB);
createCompany('cern', 'CERN', 1954, 'The European Organization for Nuclear Research, home of the Large Hadron Collider. Tim Berners-Lee invented the World Wide Web here in 1989 to share research data. Particle physics meets information technology.', CompanyCategory.ACADEMY_LAB);

// [Manufacturing Supply Chain] Total: 2
createCompany('tsmc', 'TSMC', 1987, 'Taiwan Semiconductor Manufacturing Company, founded by Morris Chang through government initiative. Invented the "pure-play foundry" model—designing nothing, manufacturing everything. Makes chips for Apple, NVIDIA, and AMD. The world depends on their 3nm process.', CompanyCategory.MANUFACTURING_SUPPLY, { marketCap: { current: '$850B', peak: '$900B' } });
createCompany('asml', 'ASML', 1984, 'Dutch company with a global monopoly on EUV lithography machines. Each machine costs $200M and uses plasma to print transistors smaller than a virus. Without ASML, no advanced chips exist. The most important company most people never heard of.', CompanyCategory.MANUFACTURING_SUPPLY, { marketCap: { current: '$350B', peak: '$400B' } });

// [Consumer Device] Total: 2
createCompany('apple', 'Apple', 1976, 'Steve Jobs and Steve Wozniak\'s garage startup became the world\'s most valuable company. The Mac, iPod, iPhone, and iPad defined consumer electronics. Vertical integration from chip design (M-series) to retail stores. Design thinking as a business strategy.', CompanyCategory.CONSUMER_DEVICE, { marketCap: { current: '$3.4T', peak: '$3.6T' } });
createCompany('sony', 'Sony', 1946, 'Post-war Japanese company that exported "Made in Japan" quality. Walkman invented portable personal audio. PlayStation dominates gaming. Image sensors power iPhone cameras. From transistor radios to PS5, Sony bridges hardware and content.', CompanyCategory.CONSUMER_DEVICE, { marketCap: { current: '$110B', peak: '$150B' } });



// ==============================================================================
// 3. PERSON NODES [Total: 48]
// ==============================================================================

// [The Pioneers & Theorists] Total: 9
createPerson('alan_turing', 'Alan Turing', 1912, PersonRole.THEORIST, 'British mathematician who defined computation with the Turing Machine and cracked Nazi Enigma codes at Bletchley Park. His 1950 paper \"Computing Machinery and Intelligence\" asked if machines can think. Prosecuted for homosexuality, he died tragically young. The father of computer science.', { primaryRole: 'Mathematician', secondaryRole: 'Cryptanalyst', deathYear: 1954 });
createPerson('claude_shannon', 'Claude Shannon', 1916, PersonRole.THEORIST, 'Bell Labs mathematician who invented information theory in 1948. Proved all communication could be digitized into bits, defined channel capacity, and invented error-correcting codes. Also built juggling robots and rode unicycles through MIT halls. The Einstein of the information age.', { primaryRole: 'Mathematician', secondaryRole: 'Electrical Engineer', deathYear: 2001 });
createPerson('william_shockley', 'William Shockley', 1910, PersonRole.THEORIST, 'Nobel laureate who co-invented the transistor at Bell Labs with Bardeen and Brattain. His toxic management of Shockley Semiconductor drove the \"Traitorous Eight\" to leave and found Fairchild. Paradoxically, his failure spawned Silicon Valley. Brilliant physicist, terrible boss.', { primaryRole: 'Physicist', secondaryRole: 'Founder, Shockley Semi', deathYear: 1989 });
createPerson('john_mccarthy', 'John McCarthy', 1927, PersonRole.THEORIST, 'The mathematician who coined the term \"Artificial Intelligence\" and organized the 1956 Dartmouth Conference that founded AI as a field. Created LISP, the language of AI research for decades. Founded Stanford AI Lab where students built early robotics and expert systems. His time-sharing concept shaped modern computing.', { primaryRole: 'Computer Scientist', secondaryRole: 'Inventor of LISP', deathYear: 2011 });
createPerson('marvin_minsky', 'Marvin Minsky', 1927, PersonRole.THEORIST, 'MIT pioneer who co-founded the AI Lab and wrote \"The Society of Mind\" exploring how intelligence emerges from simple processes. Built early neural networks, then critiqued their limitations, triggering an AI winter. Advised on \"2001: A Space Odyssey.\" A polymath who saw AI as the path to understanding the human mind itself.', { primaryRole: 'Cognitive Scientist', secondaryRole: 'Co-founder MIT AI Lab', deathYear: 2016 });
createPerson('dennis_ritchie', 'Dennis Ritchie', 1941, PersonRole.BUILDER, 'Bell Labs computer scientist who created the C programming language and co-created Unix with Ken Thompson. C became the mother tongue of systems programming. Unix philosophy shaped all modern operating systems. Died the same week as Steve Jobs but received far less recognition.', { primaryRole: 'Computer Scientist', secondaryRole: 'Creator of C', deathYear: 2011 });
createPerson('tim_berners_lee', 'Tim Berners-Lee', 1955, PersonRole.THEORIST, 'British scientist at CERN who invented the World Wide Web in 1989—HTML, HTTP, and URLs. Crucially, he gave it away free instead of patenting it. Knighted by the Queen, W3C founder. Now advocates for data privacy and fights the web\'s centralization he never intended.', { primaryRole: 'Computer Scientist', secondaryRole: 'Inventor of WWW' });
createPerson('geoffrey_hinton', 'Geoffrey Hinton', 1947, PersonRole.THEORIST, 'The \"Godfather of Deep Learning\" who championed neural networks through decades of AI winters. His students invented AlexNet, transformers, and more. 2024 Nobel Prize in Physics for foundational AI work. Left Google to warn about AI dangers. The conscience of the field he created.', { primaryRole: 'AI Researcher', secondaryRole: 'Turing Award Winner' });
createPerson('yann_lecun', 'Yann LeCun', 1960, PersonRole.THEORIST, 'French AI scientist who invented convolutional neural networks that let computers \"see.\" His LeNet-5 read handwritten checks in the 1990s. Now Meta\'s Chief AI Scientist and Turing Award winner. Outspoken on AI Twitter, pushing for open research versus proprietary models.', { primaryRole: 'Chief AI Scientist, Meta', secondaryRole: 'Turing Award Winner' });

// [The Builders & Visionary Founders] Total: 11
createPerson('robert_noyce', 'Robert Noyce', 1927, PersonRole.VISIONARY, 'The \"Mayor of Silicon Valley\" who co-invented the integrated circuit (with Jack Kilby) and co-founded Fairchild and Intel. Charismatic leader who shaped the egalitarian culture of tech—no reserved parking, no corner offices. Died young at 62 but created the template for tech startups.', { primaryRole: 'Co-founder, Intel', secondaryRole: 'Co-founder, Fairchild', deathYear: 1990 });
createPerson('gordon_moore', 'Gordon Moore', 1929, PersonRole.VISIONARY, 'Intel co-founder who in 1965 predicted transistor density would double roughly every two years—Moore\'s Law. This observation drove chip industry roadmaps for 50 years. Quiet and scholarly, the yin to Noyce\'s yang. Gave away $5B+ to conservation and research through philanthropy.', { primaryRole: 'Co-founder, Intel', secondaryRole: 'Chairman Emeritus', deathYear: 2023 });
createPerson('steve_jobs', 'Steve Jobs', 1955, PersonRole.VISIONARY, 'Apple co-founder who stood at the intersection of technology and liberal arts. Created Macintosh, was fired, bought Pixar, returned, then delivered iMac, iPod, iPhone, and iPad. His obsession with design and user experience redefined consumer electronics. \"One more thing\" that changed the world.', { primaryRole: 'Co-founder, Apple', secondaryRole: 'Founder, NeXT', deathYear: 2011 });
createPerson('steve_wozniak', 'Steve Wozniak', 1950, PersonRole.BUILDER, 'The engineering genius who single-handedly designed the Apple I and II. Woz built the first personal computers that actually worked and that people wanted. Later focused on education and philanthropy. The anti-Jobs—humble, generous, and beloved by engineers. \"Woz\" to everyone.', { primaryRole: 'Co-founder, Apple', secondaryRole: 'Computer Engineer' });
createPerson('bill_gates', 'Bill Gates', 1955, PersonRole.VISIONARY, 'Microsoft co-founder who saw that software, not hardware, would define computing. MS-DOS then Windows dominated PCs for decades. Ruthless competitor, antitrust target, then world\'s richest person. Now spends billions through Gates Foundation on global health and climate. From villain to philanthropist.', { primaryRole: 'Co-founder, Microsoft', secondaryRole: 'Co-chair, Gates Foundation' });
createPerson('larry_ellison', 'Larry Ellison', 1944, PersonRole.VISIONARY, 'Oracle founder who built a database empire through relentless salesmanship and ruthless acquisition. Yachts, fighter jets, and Japanese samurai culture define his style. Became world\'s 5th richest by holding the Fortune 500\'s data hostage. Still CTO at 80. The unforgettable CEO.', { primaryRole: 'Co-founder & CTO, Oracle', secondaryRole: 'Former CEO' });
createPerson('morris_chang', 'Morris Chang', 1931, PersonRole.VISIONARY, 'Texas Instruments veteran who returned to Taiwan and founded TSMC in 1987. His \"foundry model\" let chip designers outsource manufacturing, enabling NVIDIA, Apple, and AMD to exist. Now 93, he built the company on which all advanced chips depend. The most important person most never heard of.', { primaryRole: 'Founder, TSMC', secondaryRole: 'Former Chairman' });
createPerson('linus_torvalds', 'Linus Torvalds', 1969, PersonRole.BUILDER, 'Finnish programmer who wrote Linux as a hobby while a university student. It now runs the internet, Android, and the cloud. Also created Git for version control. Famous for blunt code reviews and profane mailing list posts. Gave software freedom to the world by accident.', { primaryRole: 'Software Engineer', secondaryRole: 'Creator of Linux' });
createPerson('jeff_bezos', 'Jeff Bezos', 1964, PersonRole.VISIONARY, 'Amazon founder who started with books and built the \"Everything Store.\" AWS invented cloud computing and generates most of Amazon\'s profit. Customer obsession, long-term thinking, and controversial labor practices define his legacy. Now focused on Blue Origin spacecraft and buying the Washington Post.', { primaryRole: 'Founder, Amazon', secondaryRole: 'Founder, Blue Origin' });
createPerson('jensen_huang', 'Jensen Huang', 1963, PersonRole.VISIONARY, 'NVIDIA co-founder who bet the company on GPUs for gaming, then AI. The leather jacket, the keynotes, and the kitchen-table founding story are iconic. NVIDIA is now worth $3T+ as the AI revolution\'s infrastructure provider. From Denny\'s booth to world\'s most important chipmaker.', { primaryRole: 'Co-founder & CEO, NVIDIA', secondaryRole: 'Electrical Engineer' });
createPerson('marc_benioff', 'Marc Benioff', 1964, PersonRole.VISIONARY, 'Salesforce founder who declared \"The End of Software\" and pioneered cloud SaaS. 1-1-1 philanthropy model (1% equity, time, product) inspired corporate giving. Bought Slack and Time magazine. Hawaiian shirts, Ohana culture, and activist stances make him tech\'s most unusual CEO.', { primaryRole: 'Founder & CEO, Salesforce', secondaryRole: 'Philanthropist' });

// [The Internet Age & Modern Leaders] Total; 19
createPerson('larry_page', 'Larry Page', 1973, PersonRole.VISIONARY, 'Google co-founder who invented PageRank by treating web links like academic citations. His vision to \"organize the world\'s information\" built a $2T company. Known for \"moonshot\" bets at Alphabet. Reclusive now, flying experimental aircraft. The quiet architect of the information age.', { primaryRole: 'Co-founder, Google', secondaryRole: 'Former CEO, Alphabet' });
createPerson('sergey_brin', 'Sergey Brin', 1973, PersonRole.VISIONARY, 'Google co-founder who emigrated from Russia age 6. His mathematical skills and Page\'s vision created the world\'s best search engine. Led Google X \"moonshots\" like Glass and self-driving cars. Returned from semi-retirement to oversee Google\'s AI response to ChatGPT.', { primaryRole: 'Co-founder, Google', secondaryRole: 'Computer Scientist' });
createPerson('reed_hastings', 'Reed Hastings', 1960, PersonRole.VISIONARY, 'Netflix co-founder who pivoted from DVD-by-mail to streaming before anyone else saw it coming. Built a content empire with \"no rules\" culture of radical transparency. Changed how the world watches TV, introducing binge-watching. \"The future of TV is the internet\" proved prophetic.', { primaryRole: 'Co-founder, Netflix', secondaryRole: 'Executive Chairman' });
createPerson('elon_musk', 'Elon Musk', 1971, PersonRole.VISIONARY, 'Serial founder of PayPal, Tesla, SpaceX, Neuralink, Boring Company, and xAI. Made EVs desirable, landed rockets, and deploys Starlink globally. Bought Twitter/X. World\'s richest person, most controversial tech figure. Either saving humanity or trolling it—often both simultaneously.', { primaryRole: 'Founder & CEO, SpaceX', secondaryRole: 'CEO, Tesla' });
createPerson('mark_zuckerberg', 'Mark Zuckerberg', 1984, PersonRole.VISIONARY, 'Facebook founder who connected 3 billion people from a Harvard dorm room. Acquired Instagram and WhatsApp. \"Move fast and break things\" worked until privacy scandals and disinformation didn\'t. Rebranded to Meta betting on VR/AR metaverse. Reinventing himself and his company at 40.', { primaryRole: 'Founder & CEO, Meta', secondaryRole: 'Philanthropist' });
createPerson('chad_hurley', 'Chad Hurley', 1977, PersonRole.VISIONARY, 'YouTube co-founder who designed PayPal\'s logo and imagined a world where anyone could share video. \"Broadcast Yourself\" launched in 2005. Google bought it 18 months later for $1.65B—one of tech\'s greatest acquisitions. Created the creator economy before the term existed.', { primaryRole: 'Co-founder, YouTube', secondaryRole: 'Former CEO' });
createPerson('jack_ma', 'Jack Ma', 1964, PersonRole.VISIONARY, 'Former English teacher who founded Alibaba in his Hangzhou apartment. Built China\'s answer to Amazon plus eBay. Flamboyant speaker, tai chi enthusiast. Created Singles Day, the world\'s biggest shopping day. Clashed with Chinese government, now rarely seen publicly.', { primaryRole: 'Co-founder, Alibaba', secondaryRole: 'Philanthropist' });
createPerson('pony_ma', 'Pony Ma', 1971, PersonRole.VISIONARY, 'Tencent founder who built WeChat, the super-app that is China\'s digital infrastructure. Messaging, payments, mini-apps, games—all in one platform. Unlike flashy Jack Ma, Pony Ma is quiet and technical. Worth $40B+ while staying out of headlines. The most powerful person in Chinese tech.', { primaryRole: 'Founder & CEO, Tencent', secondaryRole: 'Software Engineer' });
createPerson('travis_kalanick', 'Travis Kalanick', 1976, PersonRole.VISIONARY, 'Uber co-founder whose \"always be hustlin\'\" attitude disrupted global taxi industries. \"Uber\" became a verb meaning disruption itself. Toxic culture scandals forced his 2017 ouster. Still a billionaire, now investing quietly. The cautionary tale of how founder aggression can fail.', { primaryRole: 'Co-founder, Uber', secondaryRole: 'Former CEO' });
createPerson('patrick_collison', 'Patrick Collison', 1988, PersonRole.VISIONARY, 'Irish prodigy who built Stripe with brother John from their MIT dorm. Seven lines of code to accept payments. Built developer-first infrastructure for internet commerce worth $65B+. Also runs research labs in science funding and progress studies. The builder\'s builder.', { primaryRole: 'Co-founder & CEO, Stripe', secondaryRole: 'Entrepreneur' });
createPerson('satoshi_nakamoto', 'Satoshi Nakamoto', 1975, PersonRole.THEORIST, 'Pseudonymous creator of Bitcoin who solved the double-spend problem for digital currency using blockchain. Published the whitepaper October 2008, launched Bitcoin January 2009, disappeared 2011. Identity unknown—individual or group? Owns 1M inactive BTC. The most influential ghost ever.', { primaryRole: 'Cryptographer', secondaryRole: 'Creator of Bitcoin' });
createPerson('vitalik_buterin', 'Vitalik Buterin', 1994, PersonRole.VISIONARY, 'Russian-Canadian programmer who conceived Ethereum at age 19. Built a \"world computer\" where code runs as \"smart contracts.\" Enabled DeFi, NFTs, DAOs. Publicly donates billions. Slim, awkward, brilliant—the philosopher king of crypto. Still coding and writing about coordination problems.', { primaryRole: 'Co-founder, Ethereum', secondaryRole: 'Programmer' });
createPerson('tim_cook', 'Tim Cook', 1960, PersonRole.LEADER, 'Apple CEO who succeeded Steve Jobs and proved the doubters wrong. Tripled revenue, reached $3T valuation. Operations genius who mastered supply chains. Quietly gay CEO of world\'s largest company, uses platform for privacy advocacy. \"The Apple story will continue with Tim\" was right.', { primaryRole: 'CEO, Apple', secondaryRole: 'Former COO' });
createPerson('satya_nadella', 'Satya Nadella', 1967, PersonRole.LEADER, 'Microsoft CEO who transformed the company from Windows-centric to cloud-first. Azure rivals AWS, GitHub powers developers, OpenAI partnership puts AI in everything. \"Growth mindset\" culture replaced Ballmer-era politics. Made Microsoft cool again and added $2T in market value.', { primaryRole: 'CEO, Microsoft', secondaryRole: 'Chairman' });
createPerson('sundar_pichai', 'Sundar Pichai', 1972, PersonRole.LEADER, 'Indian-born CEO of Alphabet and Google. Rose through Chrome and Android leadership. Calm, diplomatic, navigating antitrust suits and AI competition. Pushed Bard/Gemini to compete with ChatGPT. Low-key style contrasts with predecessors. Steering the world\'s information giant through its biggest challenges.', { primaryRole: 'CEO, Alphabet & Google', secondaryRole: 'Product Manager' });
createPerson('lisa_su', 'Lisa Su', 1969, PersonRole.LEADER, 'AMD CEO who orchestrated one of tech\'s greatest turnarounds. Took over a near-bankrupt company, launched Ryzen CPUs and EPYC servers that now rival Intel. First woman to lead a major chip company. MIT PhD. Stock up 40x since 2014. The engineer-CEO who proved execution beats Intel.', { primaryRole: 'Chair & CEO, AMD', secondaryRole: 'Electrical Engineer' });
createPerson('demis_hassabis', 'Demis Hassabis', 1976, PersonRole.VISIONARY, 'DeepMind co-founder, child chess prodigy, and game designer who now leads Google\'s AI research. AlphaGo shocked the world, AlphaFold solved protein folding (50-year-old problem!). 2024 Nobel Prize in Chemistry. Trying to \"solve intelligence\" for humanity\'s benefit. The real-life AI visionary.', { primaryRole: 'Co-founder & CEO, DeepMind', secondaryRole: 'AI Researcher' });
createPerson('sam_altman', 'Sam Altman', 1985, PersonRole.LEADER, 'OpenAI CEO who shipped ChatGPT and triggered the AI race. Previously ran Y Combinator age 28. Briefly fired then rehired in dramatic 2023 board chaos. Fundraising genius courting Microsoft and sovereign wealth. The CEO at the center of AI\'s commercial explosion—for now.', { primaryRole: 'Co-founder & CEO, OpenAI', secondaryRole: 'Former President, YC' });
createPerson('ilya_sutskever', 'Ilya Sutskever', 1985, PersonRole.THEORIST, 'OpenAI co-founder and chief scientist behind GPT models. Student of Hinton who co-created AlexNet. Key figure in the dramatic 2023 board attempt to oust Sam Altman. Left to start Safe Superintelligence Inc. The scientist searching for both capability and alignment in AI.', { primaryRole: 'Co-founder, OpenAI', secondaryRole: 'Co-founder, SSI' });

// [Investors & The PayPal Mafia] Total: 9
createPerson('arthur_rock', 'Arthur Rock', 1926, PersonRole.INVESTOR, 'Coined the term \"venture capital\" and backed Fairchild Semiconductor, Intel, and Apple. The original Silicon Valley VC who funded the dreams of Noyce, Moore, and Jobs. His $57K investment in Apple became $14M. Ruthless board member, legendary returns. The financier who built the Valley.', { primaryRole: 'Venture Capitalist', secondaryRole: 'Early Investor' });
createPerson('don_valentine', 'Don Valentine', 1932, PersonRole.INVESTOR, 'Founded Sequoia Capital in 1972, backing Apple, Cisco, Google, and YouTube. \"Target big markets\" philosophy shaped VC forever. Blunt, fearless mentor who built the most successful venture firm in history. Sequoia\'s red logo adorns tech\'s greatest companies because of Don.', { primaryRole: 'Founder, Sequoia', secondaryRole: 'Venture Capitalist', deathYear: 2019 });
createPerson('masayoshi_son', 'Masayoshi Son', 1957, PersonRole.INVESTOR, 'SoftBank founder who rewrote venture rules with the $100B Vision Fund. Early bet on Alibaba returned $80B+. WeWork and other failures taught that not every bet pays. Believes in the \"Singularity\" and pours billions into AI. The most audacious investor, for better or worse.', { primaryRole: 'Founder & CEO, SoftBank', secondaryRole: 'Investor' });
createPerson('marc_andreessen', 'Marc Andreessen', 1971, PersonRole.INVESTOR, 'Netscape co-founder who made the web visual with Mosaic browser. \"Software is eating the world\" thesis at a16z invested in Facebook, GitHub, Coinbase. Controversial \"Techno-Optimist Manifesto\" advocate. From building browsers to funding the future. Tech\'s loudest voice for progress.', { primaryRole: 'Co-founder, a16z', secondaryRole: 'Co-founder, Netscape' });
createPerson('peter_thiel', 'Peter Thiel', 1967, PersonRole.INVESTOR, 'PayPal co-founder, Facebook\'s first outside investor ($500K for 10%), Palantir founder. \"Zero to One\" philosophy—create new things, don\'t compete. Funds Founders Fund, conservative causes, and anti-aging research. Silicon Valley\'s most iconoclastic mind. The contrarian who is often right.', { primaryRole: 'Partner, Founders Fund', secondaryRole: 'Co-founder, PayPal' });
createPerson('reid_hoffman', 'Reid Hoffman', 1967, PersonRole.INVESTOR, 'LinkedIn co-founder who built the professional social network. PayPal Mafia member, Greylock partner, AI early-adopter. Hosts podcasts, invests in AI startups, wrote \"Blitzscaling.\" Connected to everyone in Valley. \"The Oracle of Silicon Valley\" who sees network effects everywhere.', { primaryRole: 'Partner, Greylock', secondaryRole: 'Co-founder, LinkedIn' });
createPerson('paul_graham', 'Paul Graham', 1964, PersonRole.INVESTOR, 'Y Combinator co-founder who industrialized startup creation. Lisp hacker, essayist, painter. Funded Airbnb, Dropbox, Stripe, Reddit. Essays like \"Do Things That Don\'t Scale\" became startup orthodoxy. $500K for 7%, 3 months of mentorship, launched 4,000 companies. Changed how startups begin.', { primaryRole: 'Co-founder, Y Combinator', secondaryRole: 'Essayist' });
createPerson('max_levchin', 'Max Levchin', 1975, PersonRole.BUILDER, 'PayPal co-founder who built the fraud-detection systems that saved the company. Ukrainian immigrant, cryptography expert, serial founder. Now CEO of Affirm (buy-now-pay-later). The PayPal Mafia technologist who keeps building instead of just investing. Still coding in his 40s.', { primaryRole: 'Founder & CEO, Affirm', secondaryRole: 'Co-founder, PayPal' });
createPerson('roelof_botha', 'Roelof Botha', 1973, PersonRole.INVESTOR, 'South African-born Sequoia partner who went from PayPal CFO to the Valley\'s top VC. Backed YouTube ($8M→$2B), Square, Instagram, MongoDB. Now leads Sequoia. Calm, methodical, and consistently early. The quietest member of the PayPal Mafia with the best investment track record.', { primaryRole: 'Partner, Sequoia', secondaryRole: 'Former CFO, PayPal' });

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
linkContributes('ycombinator', 'airbnb', 'Y Combinator provided seed funding to Airbnb', 2009);
linkContributes('ycombinator', 'stripe_co', 'Y Combinator provided seed funding to Stripe', 2010);
linkContributes('ycombinator', 'openai', 'Sam Altman led Y Combinator during the founding of OpenAI', 2015);
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

// ------------------------------------------------------------------------------
// CONNECTIONS FOR PREVIOUSLY ORPHAN NODES
// ------------------------------------------------------------------------------

// Broadcom connections
linkCreates('broadcom', 'wifi', 'Broadcom became the dominant supplier of WiFi chips for smartphones and routers', 1999);
linkPowers('broadcom', 'cisco', 'Broadcom supplies networking chips for Cisco equipment', 2000);
linkPowers('broadcom', 'apple', 'Broadcom provides WiFi and Bluetooth chips for iPhones', 2007);
linkRival('qualcomm', 'broadcom', 'Qualcomm and Broadcom compete in wireless connectivity chips', 2000);

// Hewlett-Packard connections
linkContributes('hp', 'apple', 'Steve Jobs worked at HP and was inspired by their engineering culture', 1973);
linkContributes('hp', 'xerox_parc', 'HP engineering culture influenced Xerox PARC research approach', 1970);
linkContributes('hp', 'fairchild', 'HP established the garage startup culture that Fairchild followed', 1957);
linkContributes('hp', 'stanford_ai_lab', 'HP partnered with Stanford for research collaborations', 1962);

// Sun Microsystems connections
linkCreates('sun_micro', 'java', 'Sun Microsystems developed Java as a "write once, run anywhere" platform', 1995);
linkContributes('sun_micro', 'unix', 'Sun created Solaris, a commercial Unix variant', 1992);
linkContributes('bell_labs', 'sun_micro', 'Sun licensed Unix from AT&T Bell Labs', 1982);
linkContributes('sun_micro', 'oracle', 'Oracle acquired Sun Microsystems for $7.4B', 2010);
linkRival('sun_micro', 'microsoft', 'Sun and Microsoft competed in enterprise servers and Java', 1996);
linkRival('sun_micro', 'hp', 'Sun and HP competed in the Unix workstation market', 1985);
linkContributes('stanford_ai_lab', 'sun_micro', 'Sun Microsystems was founded by Stanford graduates', 1982);

// DARPA connections
linkCreates('darpa', 'arpanet', 'DARPA funded the development of ARPANET, the internet\'s ancestor', 1969);
linkCreates('darpa', 'gps', 'DARPA initiated the GPS satellite program for military navigation', 1973);
linkContributes('darpa', 'tcp_ip', 'DARPA funded the development of TCP/IP for ARPANET', 1973);
linkContributes('darpa', 'mit_csail', 'DARPA funded early AI research at MIT', 1963);
linkContributes('darpa', 'stanford_ai_lab', 'DARPA provided major funding for Stanford AI Lab', 1963);
linkContributes('darpa', 'www', 'DARPA\'s ARPANET laid the foundation for the World Wide Web', 1969);

// MIT CSAIL connections
linkCreates('marvin_minsky', 'mit_csail', 'Marvin Minsky co-founded the MIT AI Lab, which became CSAIL', 1959);
linkContributes('tim_berners_lee', 'mit_csail', 'Tim Berners-Lee worked at MIT to promote the World Wide Web', 1994);
linkContributes('mit_csail', 'www', 'MIT CSAIL hosted W3C to develop web standards', 1994);
linkContributes('geoffrey_hinton', 'mit_csail', 'Geoffrey Hinton studied under Marvin Minsky at MIT', 1970);
linkContributes('mit_csail', 'linux', 'MIT\'s free software movement influenced Linux development', 1984);

// Stanford AI Lab connections
linkCreates('john_mccarthy', 'stanford_ai_lab', 'John McCarthy founded Stanford AI Lab after coining the term AI', 1962);
linkContributes('stanford_ai_lab', 'google', 'Larry Page and Sergey Brin developed PageRank at Stanford', 1996);
linkContributes('stanford_ai_lab', 'sun_micro', 'Stanford graduates founded Sun Microsystems', 1982);
linkCreates('stanford_ai_lab', 'cisco', 'Stanford couple founded Cisco to network the campus', 1984);

// CERN connections
linkCreates('cern', 'www', 'CERN is where Tim Berners-Lee invented the World Wide Web', 1989);
linkCreates('tim_berners_lee', 'www', 'Tim Berners-Lee created HTML, HTTP, and the first web browser at CERN', 1989);
linkContributes('cern', 'linux', 'CERN adopted Linux for scientific computing infrastructure', 1993);
linkContributes('cern', 'mit_csail', 'CERN and MIT collaborated on open web standards through W3C', 1994);

// ARPANET connections (new technology node)
linkContributes('arpanet', 'tcp_ip', 'ARPANET evolved into the TCP/IP-based internet', 1983);
linkContributes('arpanet', 'www', 'The World Wide Web was built on top of the internet infrastructure from ARPANET', 1989);
linkPowers('arpanet', 'cisco_router', 'ARPANET\'s growth created the need for routing technology', 1969);

// John McCarthy connections (new person node)
linkContributes('john_mccarthy', 'mit_csail', 'John McCarthy co-organized the Dartmouth Conference that founded AI', 1956);
linkContributes('john_mccarthy', 'deepmind', 'John McCarthy\'s AI vision influenced modern AI research at DeepMind', 1956);
linkContributes('john_mccarthy', 'unix', 'John McCarthy\'s time-sharing concept influenced Unix design', 1961);

// Marvin Minsky connections (new person node)
linkContributes('marvin_minsky', 'geoffrey_hinton', 'Marvin Minsky mentored Geoffrey Hinton at MIT', 1970);
linkContributes('marvin_minsky', 'deepmind', 'Marvin Minsky\'s work on neural networks inspired DeepMind\'s research', 1960);
linkPartner('marvin_minsky', 'john_mccarthy', 'Marvin Minsky and John McCarthy co-founded AI as a field', 1956);

// ------------------------------------------------------------------------------
// ADDITIONAL CONNECTIONS FOR LOW-CONNECTIVITY NODES
// ------------------------------------------------------------------------------

// IBM connections
linkCreates('ibm', 'dram', 'IBM researcher Robert Dennard invented DRAM', 1968);
linkCreates('ibm', 'floppy', 'IBM invented the floppy disk for portable storage', 1971);
linkCreates('ibm', 'sql', 'IBM developed SQL for relational database management', 1974);
linkPowers('transistor', 'ibm', 'Transistors enabled IBM to build commercial computers', 1954);
linkPowers('ic', 'ibm', 'Integrated circuits allowed IBM to miniaturize mainframes', 1965);
linkContributes('ibm', 'microsoft', 'IBM chose Microsoft DOS for the IBM PC, launching Microsoft', 1981);
linkContributes('ibm', 'intel', 'IBM PC used Intel processors, establishing x86 dominance', 1981);
linkContributes('ibm', 'oracle_db', 'IBM\'s SQL research inspired Oracle\'s commercial database', 1977);
linkRival('ibm', 'microsoft', 'IBM competed with Microsoft after DOS made them a giant', 1985);
linkRival('ibm', 'apple', 'IBM PC competed with Apple II and Macintosh', 1981);

// IBM System/360 connections
linkContributes('ibm_360', 'oracle_db', 'System/360\'s database concepts influenced Oracle', 1964);
linkContributes('ibm_360', 'unix', 'System/360\'s architecture influenced Unix design philosophy', 1969);
linkContributes('ibm_360', 'microsoft', 'IBM mainframe dominance created the enterprise software market', 1964);
linkPowers('ic', 'ibm_360', 'Integrated circuits made System/360 practical and affordable', 1964);
linkPowers('transistor', 'ibm_360', 'Transistors replaced vacuum tubes in System/360', 1964);

// Unity connections
linkPowers('c_lang', 'unity', 'Unity engine uses C++ core and C# scripting', 2005);
linkPowers('gpu_geforce', 'unity', 'NVIDIA GPUs render Unity games in real-time', 2005);
linkPowers('arm_cortex', 'unity', 'Unity games run on ARM-powered mobile devices', 2008);
linkContributes('unity', 'ios', 'Unity enabled thousands of indie games on iOS', 2008);
linkContributes('unity', 'android', 'Unity became the dominant mobile game engine for Android', 2010);
linkContributes('unity', 'oculus_rift', 'Unity powered most early VR experiences', 2016);
linkContributes('unity', 'vision_pro', 'Unity supports Apple Vision Pro spatial computing', 2024);
linkPartner('unity', 'meta', 'Unity partners with Meta for Quest VR development', 2016);
linkPartner('unity', 'google', 'Unity integrated with Google ARCore for mobile AR', 2018);

// Unreal Engine connections
linkPowers('c_lang', 'unreal', 'Unreal Engine is written entirely in C++', 1998);
linkPowers('gpu_geforce', 'unreal', 'NVIDIA GPUs power Unreal\'s photorealistic rendering', 1999);
linkPowers('nvidia_h100', 'unreal', 'Unreal Engine 5 Nanite uses GPU compute for virtual geometry', 2022);
linkContributes('unreal', 'meta', 'Unreal Engine powers Meta\'s Metaverse vision', 2021);
linkContributes('unreal', 'vision_pro', 'Unreal Engine supports Apple Vision Pro development', 2024);
linkContributes('unreal', 'nvidia', 'Epic and NVIDIA collaborate on real-time ray tracing', 2018);
linkPartner('unreal', 'sony', 'Sony invested in Epic, using Unreal for PS5 games', 2020);
linkPartner('unreal', 'nvidia', 'NVIDIA and Epic collaborate on GPU-accelerated rendering', 2018);



// New Techs by Hand
createTech('postscript', 'PostScript', 1984, TechRole.L2_RUNTIME_PLATFORM, 'Adobe\'s page description language that revolutionized desktop publishing. PostScript told printers exactly how to render text and graphics at any resolution. Combined with Apple\'s LaserWriter and Aldus PageMaker, it gave designers typographic control previously locked in expensive typesetting equipment.', 'System Software', 'Development & Languages');
linkCreates('adobe', 'postscript', 'Adobe was founded to develop PostScript, making laser printing possible.', 1984);

createTech('illustrator', 'Adobe Illustrator', 1987, TechRole.L3_END_APPLICATION, 'The industry-standard vector graphics editor for logos, icons, typography, and illustrations. Unlike Photoshop\'s pixels, Illustrator works with mathematical curves that scale infinitely. Its .AI format became the universal exchange standard for professional designers and illustrators worldwide.', 'Digital Services & Platforms', 'Digital Platforms');
linkCreates('adobe', 'illustrator', 'Adobe released Illustrator originally for the Apple Macintosh.', 1987);

createTech('premiere_pro', 'Adobe Premiere Pro', 1991, TechRole.L3_END_APPLICATION, 'Professional non-linear video editing software that brought Hollywood-quality editing to desktop computers. From indie YouTubers to major film productions, Premiere Pro handles everything from raw footage to final color grading. Deep integration with After Effects and Audition creates a complete post-production ecosystem.', 'Digital Services & Platforms', 'Digital Platforms');
linkCreates('adobe', 'premiere_pro', 'Adobe launched Premiere, bringing professional video editing to PCs.', 1991);

createTech('pdf', 'PDF', 1993, TechRole.L2_RUNTIME_PLATFORM, 'Portable Document Format, Adobe\'s invention that solved the "looks different on every computer" problem. PDF preserves exact formatting, fonts, and layout regardless of software or operating system. Became an ISO open standard in 2008. From tax forms to academic papers, PDF is how the world shares documents.', 'Fundamental Concepts', 'Standards & Protocols');
linkCreates('adobe', 'pdf', 'Adobe invented PDF to allow documents to be viewed on any system.', 1993);
linkRival('photoshop', 'midjourney', 'Photoshop competes with Midjourney by offering enterprise-safe image generation.', 2023);

createTech('nano_banana', 'Nano Banana', 2025, TechRole.L3_END_APPLICATION, 'The viral AI image model built on Google\'s Gemini 2.5 Flash. Famous for generating stunning 3D figurine-style images with precise text rendering that competitors couldn\'t match. The "Nano Banana" codename became a cultural moment as users flooded social media with custom action figures of celebrities and characters', 'AI & Physical Systems', 'Artificial Intelligence');
linkCreates('deepmind', 'nano_banana', 'Google DeepMind released the Gemini 2.5 Flash Image model under the codename Nano Banana', 2025);
linkContributes('gemini', 'nano_banana', 'Nano Banana is built on the multimodal architecture of the Gemini family', 2025);
linkRival('nano_banana', 'midjourney', 'Nano Banana challenged Midjourney with superior consistency and character retention', 2025);

// ==============================================================================
// 5. HISTORICAL EVENTS (Timeline Markers)
// ==============================================================================

addEvent('moores_law', 'Gordon Moore predicted that the number of transistors on a microchip would double every two years (Moore\'s Law).', 1965, undefined, ['gordon_moore', 'intel', 'transistor', 'ic']);
addEvent('ai_winter', 'The "AI Winter" period saw reduced funding and interest in artificial intelligence research due to overhyped expectations.', 1974, 1980, ['geoffrey_hinton']);
addEvent('apple_1984_commercial', 'Apple aired the iconic "1984" commercial during the Super Bowl to introduce the Macintosh.', 1984, undefined, ['apple', 'steve_jobs', 'macintosh']);
addEvent('browser_wars', 'The "Browser Wars" raged between Netscape Navigator and Microsoft Internet Explorer for market dominance.', 1995, 2001, ['microsoft', 'netscape_co', 'marc_andreessen', 'bill_gates']);
addEvent('deep_blue_kasparov', 'IBM\'s Deep Blue supercomputer defeated world chess champion Garry Kasparov, a milestone for AI.', 1997, undefined, ['ibm']);
addEvent('us_v_microsoft', 'United States v. Microsoft Corp. ruled that Microsoft abused its monopoly power on Intel-based PCs.', 1998, 2001, ['microsoft', 'bill_gates', 'intel', 'windows_95']);
addEvent('dotcom_bubble', 'The Dot-com Bubble burst, causing a massive stock market crash and the collapse of many internet startups.', 2000, 2002, ['amazon', 'cisco', 'softbank', 'google', 'jeff_bezos']);
addEvent('iphone_unveil', 'Steve Jobs unveiled the iPhone, combining a widescreen iPod, a revolutionary mobile phone, and a breakthrough internet communicator.', 2007, undefined, ['apple', 'steve_jobs', 'iphone']);
addEvent('bitcoin_genesis', 'Satoshi Nakamoto mined the Genesis Block of Bitcoin amidst the global financial crisis.', 2009, undefined, ['bitcoin', 'satoshi_nakamoto']);
addEvent('apple_samsung_lawsuit', 'Apple and Samsung engaged in a series of high-profile patent lawsuits across multiple countries regarding smartphone designs.', 2011, 2018, ['apple', 'samsung', 'tim_cook']);
addEvent('snowden_leaks', 'Edward Snowden\'s leaks prompted tech giants to accelerate the adoption of end-to-end encryption and SSL/TLS.', 2013, undefined, ['google', 'apple', 'meta', 'ssl_tls', 'rsa']);
addEvent('alphago_lee_sedol', 'AlphaGo defeated 18-time world champion Lee Sedol in Seoul, demonstrating the power of deep reinforcement learning.', 2016, undefined, ['deepmind', 'alphago', 'google', 'demis_hassabis']);
addEvent('cambridge_analytica', 'The Cambridge Analytica scandal revealed massive data privacy breaches, leading to increased scrutiny on social media platforms.', 2018, undefined, ['meta', 'mark_zuckerberg']);
addEvent('chip_shortage', 'A global semiconductor shortage disrupted industries from automotive to consumer electronics, highlighting supply chain fragility.', 2020, 2023, ['tsmc', 'samsung', 'intel', 'nvidia', 'apple', 'tesla']);
addEvent('ethereum_merge', 'Ethereum completed "The Merge," transitioning from Proof-of-Work to Proof-of-Stake, reducing energy consumption by 99.9%.', 2022, undefined, ['ethereum', 'vitalik_buterin']);
addEvent('chatgpt_launch', 'OpenAI released ChatGPT, triggering a global generative AI arms race among big tech companies.', 2022, undefined, ['openai', 'chatgpt', 'google', 'microsoft', 'sam_altman']);
addEvent('altman_firing', 'Sam Altman was abruptly fired and then reinstated as CEO of OpenAI after intense pressure from employees and Microsoft.', 2023, undefined, ['openai', 'sam_altman', 'microsoft', 'satya_nadella', 'ilya_sutskever']);
addEvent('nvidia_trillion', 'Driven by the AI boom and H100 demand, NVIDIA joined the club of companies with a market cap over $1 trillion.', 2023, undefined, ['nvidia', 'jensen_huang', 'nvidia_h100']);
addEvent('fugaku_covid', 'Fugaku was used for COVID-19 droplet analysis simulations', 2020, undefined, ['fugaku']);
addEvent('sequoia_whatsapp', 'Sequoia Capital was the sole investor in WhatsApp ($60M total)', 2011, undefined, ['sequoia']);
addEvent('yc_justintv', 'Y Combinator funded Justin.tv which became Twitch', 2007, undefined, ['ycombinator']);
addEvent('thiel_palantir', 'Peter Thiel co-founded Palantir after PayPal', 2003, undefined, ['paypal_co']);

export const INITIAL_DATA: GraphData = { nodes, links, events };