/**
 * translate-nodes.ts
 * 
 * Translates locales/en/nodes.json to ko and ja using Gemini API
 * 
 * Usage: npm run i18n:translate
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
config({ path: path.join(__dirname, '../.env') });

// Configuration
interface TranslationConfig {
    maxLabelLength: number;       // 라벨 최대 글자수
    maxDescriptionLength: number; // 설명 최대 글자수
    targetLanguages: string[];    // 번역 대상 언어
    batchSize: number;            // API 호출당 노드 수
    apiDelayMs: number;           // API 호출 간 딜레이 (rate limit 방지)
}

const CONFIG: TranslationConfig = {
    maxLabelLength: 30,
    maxDescriptionLength: 150,
    targetLanguages: ['ko', 'ja'],
    batchSize: 10,
    apiDelayMs: 1000,
};

const PATHS = {
    sourceJson: path.join(__dirname, '../locales/en/nodes.json'),
    localesDir: path.join(__dirname, '../locales'),
};

interface NodeTranslation {
    label: string;
    description: string;
}

interface NodesJson {
    [nodeId: string]: NodeTranslation;
}

const LANGUAGE_NAMES: Record<string, string> = {
    ko: 'Korean',
    ja: 'Japanese',
};

/**
 * Delay helper for rate limiting
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Translate a batch of nodes using Gemini API
 */
async function translateBatch(
    batch: Array<[string, NodeTranslation]>,
    targetLang: string,
    apiKey: string
): Promise<NodesJson> {
    const langName = LANGUAGE_NAMES[targetLang] || targetLang;

    const prompt = `
You are a professional translator specializing in technology and business terminology.

Translate the following tech/company node data from English to ${langName}.

IMPORTANT RULES:
1. Keep famous brand names (Apple, Google, Microsoft) in English
2. Transliterate tech terms phonetically (Transformer → 트랜스포머 for Korean, トランスフォーマー for Japanese)
3. Translate descriptions naturally and concisely
4. Keep label under ${CONFIG.maxLabelLength} characters
5. Keep description under ${CONFIG.maxDescriptionLength} characters
6. Return ONLY a valid JSON object, no extra text

Input nodes (JSON object with node IDs as keys):
${JSON.stringify(Object.fromEntries(batch), null, 2)}

Return ONLY the translated JSON object with the SAME node IDs as keys.
Example format: { "node_id": { "label": "...", "description": "..." }, ... }
`.trim();

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.3,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response text from API');
        }

        return JSON.parse(text) as NodesJson;
    } catch (error) {
        console.error(`❌ Translation error:`, error);
        // Return original on error
        return Object.fromEntries(batch);
    }
}

/**
 * Main translation function
 */
async function translateToLanguage(
    sourceNodes: NodesJson,
    targetLang: string,
    apiKey: string
): Promise<NodesJson> {
    const outputPath = path.join(PATHS.localesDir, targetLang, 'nodes.json');

    // Load existing translations (for incremental updates)
    let existingNodes: NodesJson = {};
    if (fs.existsSync(outputPath)) {
        existingNodes = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    }

    // Find nodes that need translation
    const missingKeys = Object.keys(sourceNodes).filter(key => !existingNodes[key]);

    if (missingKeys.length === 0) {
        console.log(`  ✓ ${targetLang}: All nodes already translated`);
        return existingNodes;
    }

    console.log(`  → ${targetLang}: Translating ${missingKeys.length} new nodes...`);

    // Process in batches
    const result: NodesJson = { ...existingNodes };
    const batches: Array<Array<[string, NodeTranslation]>> = [];

    for (let i = 0; i < missingKeys.length; i += CONFIG.batchSize) {
        const batchKeys = missingKeys.slice(i, i + CONFIG.batchSize);
        const batch = batchKeys.map(key => [key, sourceNodes[key]] as [string, NodeTranslation]);
        batches.push(batch);
    }

    for (let i = 0; i < batches.length; i++) {
        console.log(`    Batch ${i + 1}/${batches.length}...`);
        const translated = await translateBatch(batches[i], targetLang, apiKey);
        Object.assign(result, translated);

        if (i < batches.length - 1) {
            await delay(CONFIG.apiDelayMs);
        }
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write result
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`  ✓ ${targetLang}: Saved ${Object.keys(result).length} nodes`);

    return result;
}

/**
 * Main execution
 */
async function main() {
    console.log('🌐 Translating nodes with Gemini API...\n');

    // Check API key
    const apiKey = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('❌ API key not found. Set VITE_GOOGLE_API_KEY or GOOGLE_API_KEY environment variable.');
        process.exit(1);
    }

    // Load source nodes
    if (!fs.existsSync(PATHS.sourceJson)) {
        console.error('❌ Source file not found. Run "npm run i18n:extract" first.');
        process.exit(1);
    }

    const sourceNodes: NodesJson = JSON.parse(fs.readFileSync(PATHS.sourceJson, 'utf-8'));
    console.log(`📦 Source: ${Object.keys(sourceNodes).length} nodes\n`);

    // Translate to each target language
    for (const lang of CONFIG.targetLanguages) {
        await translateToLanguage(sourceNodes, lang, apiKey);
    }

    console.log('\n✅ Translation complete!');
}

main().catch(console.error);
