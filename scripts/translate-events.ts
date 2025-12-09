import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/**
 * Translate events.json to ko and ja using Gemini API
 */

const apiKey = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error('❌ VITE_GOOGLE_API_KEY or GOOGLE_API_KEY environment variable is required');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

interface EventTranslation {
    story: string;
}

const TARGET_LANGUAGES = ['ko', 'ja'] as const;
type TargetLang = typeof TARGET_LANGUAGES[number];

const LANGUAGE_NAMES: Record<TargetLang, string> = {
    ko: 'Korean',
    ja: 'Japanese'
};

async function translateBatch(
    entries: [string, EventTranslation][],
    targetLang: TargetLang
): Promise<Record<string, EventTranslation>> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Translate the following event descriptions to ${LANGUAGE_NAMES[targetLang]}.

IMPORTANT RULES:
1. Keep proper nouns (company names, product names, person names) in English
2. Translate naturally while preserving the meaning
3. Keep the translations concise but informative
4. Return ONLY valid JSON, no markdown formatting

Input JSON:
${JSON.stringify(Object.fromEntries(entries), null, 2)}

Return the translated JSON with the same structure.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown formatting
        if (text.startsWith('```json')) {
            text = text.slice(7);
        } else if (text.startsWith('```')) {
            text = text.slice(3);
        }
        if (text.endsWith('```')) {
            text = text.slice(0, -3);
        }

        return JSON.parse(text.trim());
    } catch (error) {
        console.error(`Translation error:`, error);
        throw error;
    }
}

async function translateEvents() {
    const enPath = path.join(__dirname, '../locales/en/events.json');

    if (!fs.existsSync(enPath)) {
        console.error('❌ locales/en/events.json not found. Run npm run i18n:extract-events first.');
        process.exit(1);
    }

    const enEvents: Record<string, EventTranslation> = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const eventIds = Object.keys(enEvents);

    console.log(`📖 Found ${eventIds.length} events in en/events.json`);

    for (const lang of TARGET_LANGUAGES) {
        const outputPath = path.join(__dirname, `../locales/${lang}/events.json`);

        // Load existing translations
        let existingTranslations: Record<string, EventTranslation> = {};
        if (fs.existsSync(outputPath)) {
            existingTranslations = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
        }

        // Find missing translations
        const missingIds = eventIds.filter(id => !existingTranslations[id]);

        if (missingIds.length === 0) {
            console.log(`✅ ${lang}: All events already translated`);
            continue;
        }

        console.log(`🌐 ${lang}: Translating ${missingIds.length} events...`);

        // Batch translate (all at once since there are few events)
        const toTranslate = missingIds.map(id => [id, enEvents[id]] as [string, EventTranslation]);

        try {
            const translated = await translateBatch(toTranslate, lang);

            // Merge with existing
            const merged = { ...existingTranslations, ...translated };

            // Write output
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf-8');

            console.log(`✅ ${lang}: Saved ${Object.keys(merged).length} events to ${outputPath}`);
        } catch (error) {
            console.error(`❌ ${lang}: Translation failed`, error);
        }

        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('🎉 Event translation complete!');
}

translateEvents();
