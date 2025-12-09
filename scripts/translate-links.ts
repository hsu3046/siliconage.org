/**
 * translate-links.ts
 * 
 * Translates locales/en/links.json to ko and ja using Gemini API
 * 
 * Usage: npm run i18n:translate-links
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
    maxStoryLength: number;       // story 최대 글자수
    targetLanguages: string[];    // 번역 대상 언어
    batchSize: number;            // API 호출당 링크 수
    apiDelayMs: number;           // API 호출 간 딜레이 (rate limit 방지)
}

const CONFIG: TranslationConfig = {
    maxStoryLength: 150,
    targetLanguages: ['ko', 'ja'],
    batchSize: 15,
    apiDelayMs: 1000,
};

const PATHS = {
    sourceJson: path.join(__dirname, '../locales/en/links.json'),
    localesDir: path.join(__dirname, '../locales'),
};

interface LinkTranslation {
    story: string;
}

interface LinksJson {
    [linkKey: string]: LinkTranslation;
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
 * Translate a batch of links using Gemini API
 */
async function translateBatch(
    batch: Array<[string, LinkTranslation]>,
    targetLang: string,
    apiKey: string
): Promise<LinksJson> {
    const langName = LANGUAGE_NAMES[targetLang] || targetLang;

    const prompt = `
You are a professional translator specializing in technology and business terminology.

Translate the following tech relationship descriptions from English to ${langName}.

IMPORTANT RULES:
1. Keep famous brand names (Apple, Google, Microsoft) in English
2. Translate naturally and concisely
3. Keep translation under ${CONFIG.maxStoryLength} characters
4. Return ONLY a valid JSON object, no extra text

Input (JSON object with link keys as keys):
${JSON.stringify(Object.fromEntries(batch), null, 2)}

Return ONLY the translated JSON object with the SAME keys.
Example format: { "source__target": { "story": "..." }, ... }
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

        return JSON.parse(text) as LinksJson;
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
    sourceLinks: LinksJson,
    targetLang: string,
    apiKey: string
): Promise<LinksJson> {
    const outputPath = path.join(PATHS.localesDir, targetLang, 'links.json');

    // Load existing translations (for incremental updates)
    let existingLinks: LinksJson = {};
    if (fs.existsSync(outputPath)) {
        existingLinks = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    }

    // Find links that need translation
    const missingKeys = Object.keys(sourceLinks).filter(key => !existingLinks[key]);

    if (missingKeys.length === 0) {
        console.log(`  ✓ ${targetLang}: All links already translated`);
        return existingLinks;
    }

    console.log(`  → ${targetLang}: Translating ${missingKeys.length} new links...`);

    // Process in batches
    const result: LinksJson = { ...existingLinks };
    const batches: Array<Array<[string, LinkTranslation]>> = [];

    for (let i = 0; i < missingKeys.length; i += CONFIG.batchSize) {
        const batchKeys = missingKeys.slice(i, i + CONFIG.batchSize);
        const batch = batchKeys.map(key => [key, sourceLinks[key]] as [string, LinkTranslation]);
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
    console.log(`  ✓ ${targetLang}: Saved ${Object.keys(result).length} links`);

    return result;
}

/**
 * Main execution
 */
async function main() {
    console.log('🔗 Translating links with Gemini API...\n');

    // Check API key
    const apiKey = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('❌ API key not found. Set VITE_GOOGLE_API_KEY or GOOGLE_API_KEY environment variable.');
        process.exit(1);
    }

    // Load source links
    if (!fs.existsSync(PATHS.sourceJson)) {
        console.error('❌ Source file not found. Run "npm run i18n:extract-links" first.');
        process.exit(1);
    }

    const sourceLinks: LinksJson = JSON.parse(fs.readFileSync(PATHS.sourceJson, 'utf-8'));
    console.log(`📦 Source: ${Object.keys(sourceLinks).length} links\n`);

    // Translate to each target language
    for (const lang of CONFIG.targetLanguages) {
        await translateToLanguage(sourceLinks, lang, apiKey);
    }

    console.log('\n✅ Link translation complete!');
}

main().catch(console.error);
