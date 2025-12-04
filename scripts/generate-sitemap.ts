// Script to generate sitemap.xml with all node URLs
// Run with: npx ts-node scripts/generate-sitemap.ts

import * as fs from 'fs';
import * as path from 'path';

// Import node data
import { INITIAL_DATA } from '../constants';

const BASE_URL = 'https://siliconage.org';
const TODAY = new Date().toISOString().split('T')[0];

function generateSitemap(): string {
    const staticUrls = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/#map', priority: '0.9', changefreq: 'weekly' },
        { loc: '/#history', priority: '0.9', changefreq: 'weekly' },
        { loc: '/#list', priority: '0.8', changefreq: 'weekly' },
        { loc: '/#about', priority: '0.5', changefreq: 'monthly' },
    ];

    // Generate node URLs
    const nodeUrls = INITIAL_DATA.nodes.map(node => ({
        loc: `/?node=${encodeURIComponent(node.id)}`,
        priority: node.importance === 1 ? '0.7' : node.importance === 2 ? '0.6' : '0.5',
        changefreq: 'monthly'
    }));

    const allUrls = [...staticUrls, ...nodeUrls];

    const urlEntries = allUrls.map(url => `  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// Generate and write sitemap
const sitemap = generateSitemap();
const outputPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf-8');

console.log(`✅ Sitemap generated with ${INITIAL_DATA.nodes.length + 5} URLs`);
console.log(`📁 Saved to: ${outputPath}`);
