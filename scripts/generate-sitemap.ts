
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONSTANTS_PATH = path.join(__dirname, '../constants.ts');
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://siliconage.org';
const TODAY = new Date().toISOString().split('T')[0];

interface SitemapUrl {
    loc: string;
    lastmod?: string;
    priority?: number;
}

// Static pages
const staticUrls: SitemapUrl[] = [
    { loc: `${BASE_URL}/`, priority: 1.0 },
    { loc: `${BASE_URL}/history`, priority: 0.8 },
    { loc: `${BASE_URL}/cards`, priority: 0.8 },
    { loc: `${BASE_URL}/links`, priority: 0.8 },
    { loc: `${BASE_URL}/about`, priority: 0.5 },
];

function parseNodes(): SitemapUrl[] {
    const content = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
    const urls: SitemapUrl[] = [];
    const processedIds = new Set<string>();

    // Regex patterns to capture IDs from helper function calls
    // createCompany('apple', ...) -> /company/apple
    const companyRegex = /createCompany\s*\(\s*['"]([^'"]+)['"]/g;

    // createPerson('jobs', ...) -> /person/jobs
    const personRegex = /createPerson\s*\(\s*['"]([^'"]+)['"]/g;

    // createTech('transistor', ...) -> /tech/transistor
    const techRegex = /createTech\s*\(\s*['"]([^'"]+)['"]/g;

    let match;

    // Process Companies
    while ((match = companyRegex.exec(content)) !== null) {
        const id = match[1];
        if (!processedIds.has(id)) {
            urls.push({ loc: `${BASE_URL}/company/${id}`, priority: 0.6 });
            processedIds.add(id);
        }
    }

    // Process People
    while ((match = personRegex.exec(content)) !== null) {
        const id = match[1];
        if (!processedIds.has(id)) {
            urls.push({ loc: `${BASE_URL}/person/${id}`, priority: 0.6 });
            processedIds.add(id);
        }
    }

    // Process Tech
    while ((match = techRegex.exec(content)) !== null) {
        const id = match[1];
        if (!processedIds.has(id)) {
            urls.push({ loc: `${BASE_URL}/tech/${id}`, priority: 0.6 });
            processedIds.add(id);
        }
    }

    return urls.sort((a, b) => a.loc.localeCompare(b.loc));
}

function generateSitemap() {
    console.log('Generating sitemap...');

    const nodeUrls = parseNodes();
    const allUrls = [...staticUrls, ...nodeUrls];

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod || TODAY}</lastmod>
    <priority>${url.priority?.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>
`;

    fs.writeFileSync(SITEMAP_PATH, xmlContent);
    console.log(`Sitemap generated with ${allUrls.length} URLs at ${SITEMAP_PATH}`);
}

generateSitemap();
