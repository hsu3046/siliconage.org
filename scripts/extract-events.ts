import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Extract events from constants.ts and generate locales/en/events.json
 * New format: addEvent('id', 'story', year, ...)
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const constantsPath = path.join(__dirname, '../constants.ts');
const outputPath = path.join(__dirname, '../locales/en/events.json');

const fileContent = fs.readFileSync(constantsPath, 'utf-8');

// Regex to match addEvent('id', 'story', year, ...) calls
// Group 1: quote type for ID, Group 2: ID, Group 3: quote type for story, Group 4: story
const eventRegex = /addEvent\(\s*(['"`])([a-z_0-9]+)\1\s*,\s*(['"`])((?:[^\\]|\\.)*?)\3\s*,/g;

const events: Record<string, { story: string }> = {};

let match: RegExpExecArray | null;

while ((match = eventRegex.exec(fileContent)) !== null) {
    const eventId = match[2];
    const story = match[4]
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n');

    events[eventId] = { story };
}

// Write output
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(events, null, 2), 'utf-8');

console.log(`✅ Extracted ${Object.keys(events).length} events to ${outputPath}`);
