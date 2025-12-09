/**
 * extract-links.ts
 * 
 * Extracts link story data from constants.ts and generates locales/en/links.json
 * 
 * Usage: npm run i18n:extract-links
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LinkTranslation {
    story: string;
}

interface LinksJson {
    [linkKey: string]: LinkTranslation;
}

// Configuration
const CONFIG = {
    constantsPath: path.join(__dirname, '../constants.ts'),
    outputPath: path.join(__dirname, '../locales/en/links.json'),
};

/**
 * Generate a unique key for a link based on source and target
 */
function generateLinkKey(source: string, target: string): string {
    return `${source}__${target}`;
}

/**
 * Parse constants.ts and extract link story data
 */
function extractLinksFromConstants(): LinksJson {
    const content = fs.readFileSync(CONFIG.constantsPath, 'utf-8');
    const result: LinksJson = {};

    // Helper: Match string with escaped quotes
    const stringPattern = `'((?:[^'\\\\]|\\\\.)*)'`;

    // Patterns for all link functions:
    // linkCreates('source', 'target', 'story', year?)
    // linkPowers('source', 'target', 'story', year?)
    // linkContributes('source', 'target', 'story', year?)
    // linkPartner('source', 'target', 'story', year?)
    // linkRival('source', 'target', 'story', year?)

    const linkFunctions = ['linkCreates', 'linkPowers', 'linkContributes', 'linkPartner', 'linkRival'];

    for (const func of linkFunctions) {
        const regex = new RegExp(
            `${func}\\(\\s*${stringPattern}\\s*,\\s*${stringPattern}\\s*,\\s*${stringPattern}`,
            'g'
        );

        let match;
        while ((match = regex.exec(content)) !== null) {
            const [, source, target, story] = match;
            // Unescape quotes
            const cleanStory = story.replace(/\\'/g, "'").replace(/\\"/g, '"');

            // Only add if story is not empty
            if (cleanStory.trim()) {
                const key = generateLinkKey(source, target);
                result[key] = { story: cleanStory };
            }
        }
    }

    return result;
}

/**
 * Main execution
 */
function main() {
    console.log('🔗 Extracting links from constants.ts...');

    const links = extractLinksFromConstants();
    const linkCount = Object.keys(links).length;

    if (linkCount === 0) {
        console.error('❌ No links extracted. Check regex patterns.');
        process.exit(1);
    }

    // Ensure output directory exists
    const outputDir = path.dirname(CONFIG.outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to JSON file
    fs.writeFileSync(
        CONFIG.outputPath,
        JSON.stringify(links, null, 2),
        'utf-8'
    );

    console.log(`✅ Extracted ${linkCount} links to ${CONFIG.outputPath}`);

    // Show sample
    const sampleKeys = Object.keys(links).slice(0, 3);
    console.log('\n📝 Sample entries:');
    sampleKeys.forEach(key => {
        console.log(`  - ${key}: "${links[key].story.substring(0, 50)}..."`);
    });
}

main();
