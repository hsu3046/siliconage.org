/**
 * extract-nodes.ts
 * 
 * Extracts node data from constants.ts and generates locales/en/nodes.json
 * 
 * Usage: npm run i18n:extract
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NodeTranslation {
    label: string;
    description: string;
}

interface NodesJson {
    [nodeId: string]: NodeTranslation;
}

// Configuration
const CONFIG = {
    constantsPath: path.join(__dirname, '../constants.ts'),
    outputPath: path.join(__dirname, '../locales/en/nodes.json'),
};

/**
 * Parse constants.ts and extract node data
 */
function extractNodesFromConstants(): NodesJson {
    const content = fs.readFileSync(CONFIG.constantsPath, 'utf-8');
    const result: NodesJson = {};

    // Regex patterns for createCompany, createPerson, createTech
    // Match: createXxx('id', 'label', year, ..., 'description', ...)

    // Pattern for createCompany: createCompany('id', 'label', year, 'description', ...)
    const companyRegex = /createCompany\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*\d+\s*,\s*['"]([^'"]+)['"]/g;

    // Pattern for createPerson: createPerson('id', 'label', year, PersonRole, 'description', ...)
    const personRegex = /createPerson\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*\d+\s*,\s*\S+\s*,\s*['"]([^'"]+)['"]/g;

    // Pattern for createTech: createTech('id', 'label', year, TechRole, 'description', ...)
    const techRegex = /createTech\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*\d+\s*,\s*\S+\s*,\s*['"]([^'"]+)['"]/g;

    let match;

    // Extract companies
    while ((match = companyRegex.exec(content)) !== null) {
        const [, id, label, description] = match;
        result[id] = { label, description };
    }

    // Extract persons
    while ((match = personRegex.exec(content)) !== null) {
        const [, id, label, description] = match;
        result[id] = { label, description };
    }

    // Extract technologies
    while ((match = techRegex.exec(content)) !== null) {
        const [, id, label, description] = match;
        result[id] = { label, description };
    }

    return result;
}

/**
 * Main execution
 */
function main() {
    console.log('📦 Extracting nodes from constants.ts...');

    const nodes = extractNodesFromConstants();
    const nodeCount = Object.keys(nodes).length;

    if (nodeCount === 0) {
        console.error('❌ No nodes extracted. Check regex patterns.');
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
        JSON.stringify(nodes, null, 2),
        'utf-8'
    );

    console.log(`✅ Extracted ${nodeCount} nodes to ${CONFIG.outputPath}`);

    // Show sample
    const sampleKeys = Object.keys(nodes).slice(0, 3);
    console.log('\n📝 Sample entries:');
    sampleKeys.forEach(key => {
        console.log(`  - ${key}: "${nodes[key].label}"`);
    });
}

main();
