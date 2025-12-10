/**
 * translate-roles.ts
 * 
 * Translates only primaryRole and secondaryRole fields
 * and merges them into existing nodes.json files
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

if (!API_KEY) {
    console.error('❌ No API key found');
    process.exit(1);
}

interface RoleData {
    primaryRole?: string;
    secondaryRole?: string;
}

async function translateRoles(
    roles: Record<string, RoleData>,
    lang: string,
    langName: string
): Promise<Record<string, RoleData>> {
    const prompt = `
You are a professional translator specializing in technology and business terminology.

Translate these tech person role titles from English to ${langName}.

RULES:
1. Keep company names (Intel, Apple, Google, Microsoft, NVIDIA, etc.) in English
2. Translate job titles naturally (e.g., "Co-founder" → "공동 창업자" for Korean, "共同創設者" for Japanese)
3. Keep abbreviations like CEO, CTO, CFO in English
4. Return ONLY valid JSON with the EXACT same structure and keys

Input:
${JSON.stringify(roles, null, 2)}

Return ONLY the translated JSON object. No markdown, no explanation.
`.trim();

    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3 },
            }),
        }
    );

    const json = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
}

async function main() {
    // Load English nodes and extract roles
    const enPath = path.join(__dirname, '../locales/en/nodes.json');
    const enNodes = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

    const rolesToTranslate: Record<string, RoleData> = {};
    for (const [id, data] of Object.entries(enNodes) as any[]) {
        if (data.primaryRole || data.secondaryRole) {
            rolesToTranslate[id] = {
                primaryRole: data.primaryRole,
                secondaryRole: data.secondaryRole,
            };
        }
    }

    console.log(`📦 Found ${Object.keys(rolesToTranslate).length} nodes with roles`);

    const languages = [
        { code: 'ko', name: 'Korean' },
        { code: 'ja', name: 'Japanese' },
    ];

    for (const { code, name } of languages) {
        console.log(`\n🌐 Translating roles to ${name}...`);

        try {
            const translated = await translateRoles(rolesToTranslate, code, name);

            // Load and merge with existing nodes
            const targetPath = path.join(__dirname, `../locales/${code}/nodes.json`);
            const existingNodes = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));

            let merged = 0;
            for (const [id, roleData] of Object.entries(translated)) {
                if (existingNodes[id]) {
                    if (roleData.primaryRole) existingNodes[id].primaryRole = roleData.primaryRole;
                    if (roleData.secondaryRole) existingNodes[id].secondaryRole = roleData.secondaryRole;
                    merged++;
                }
            }

            fs.writeFileSync(targetPath, JSON.stringify(existingNodes, null, 2));
            console.log(`✅ ${code}: Merged ${merged} roles`);
        } catch (error) {
            console.error(`❌ ${code}: Failed -`, error);
        }
    }

    console.log('\n🎉 Role translation complete!');
}

main();
