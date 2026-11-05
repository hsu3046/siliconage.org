/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, NodeData } from "../types";

const API_KEY_STORAGE_KEY = 'silicon_age_api_key';

// API Key management via localStorage
export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setApiKey = (key: string): void => {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    window.dispatchEvent(new CustomEvent('apiKeyChanged'));
  } catch (e) {
    console.warn("Failed to save API key to localStorage", e);
  }
};

export const removeApiKey = (): void => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('apiKeyChanged'));
  } catch (e) {
    console.warn("Failed to remove API key from localStorage", e);
  }
};

const getAI = (): GoogleGenAI | null => {
  const key = getApiKey();
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

const CACHE_PREFIX = 'silicon_age_ai_cache_';

// Language mapping for Gemini prompts
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
};

// Pre-generated Deep Dives: one small JSON per node × locale, fetched on
// demand so nothing lands in the JS bundle. Unknown paths fall through the SPA
// rewrite and return index.html — treat anything that is not our JSON as absent.
const staticMemo = new Map<string, Promise<AIResponse | null>>();

export const fetchStaticDeepDive = (nodeId: string, locale: string): Promise<AIResponse | null> => {
  const key = `${locale}/${nodeId}`;
  let p = staticMemo.get(key);
  if (!p) {
    p = fetch(`/deepdive/${encodeURIComponent(locale)}/${encodeURIComponent(nodeId)}.json`)
      .then(async res => {
        // 5xx = transient: don't remember the miss, retry on next open.
        if (res.status >= 500) { staticMemo.delete(key); return null; }
        if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) return null;
        const data = await res.json() as AIResponse & { entity?: string };
        if (!data || data.entity !== nodeId || typeof data.summary !== 'string') return null;
        return { ...data, source: 'static' as const };
      })
      .catch(() => { staticMemo.delete(key); return null; });  // network error: retry later
    staticMemo.set(key, p);
  }
  return p;
};

export const fetchNodeDetails = async (node: NodeData, locale: string = 'en'): Promise<AIResponse> => {
  // Include locale in cache key for language-specific caching
  const cacheKey = `${CACHE_PREFIX}${node.id}_${locale}`;
  const langName = LANGUAGE_NAMES[locale] || 'English';

  // 1. Pre-generated, Jev-checked Deep Dive (scripts/generateDeepDive.ts).
  //    Free for every visitor, no key needed.
  const pregenerated = await fetchStaticDeepDive(node.id, locale);
  if (pregenerated) return pregenerated;

  // 2. Check Client-Side LocalStorage Cache (Persistence for non-static nodes)
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return { ...(JSON.parse(cachedData) as AIResponse), source: 'local' };
    }
  } catch (e) {
    console.warn("Failed to read from localStorage", e);
  }

  // 3. Fetch from API with enhanced context
  try {
    const ai = getAI();
    if (!ai) {
      return { summary: '', significance: '', keyFacts: [], source: 'none' };
    }

    console.log(`[API Call] Fetching Gemini data for ${node.id} in ${langName}`);

    // Build rich context from node data
    const contextParts = [
      `Entity: "${node.label}"`,
      `Category: ${node.category}`,
      `Year: ${node.year}`,
      node.description ? `Description: ${node.description}` : null,
      node.primaryRole ? `Primary Role: ${node.primaryRole}` : null,
      node.impactRole ? `Industry Role: ${node.impactRole}` : null,
      node.techCategoryL1 ? `Tech Category: ${node.techCategoryL1}` : null,
      node.marketCap?.current ? `Market Cap: ${node.marketCap.current}` : null,
    ].filter(Boolean).join('\n');

    const prompt = `
You are an expert technology historian. Analyze the following entity in the context of computing and AI history.
**IMPORTANT: Respond entirely in ${langName}.**

${contextParts}

Provide:
1. A concise 2-sentence summary
2. Why this entity is significant in the "Silicon Age" (the era from transistors to AI)
3. 3-5 interesting facts or achievements

Use the latest available information. Be specific with dates, numbers, and achievements.
Remember: Your entire response must be in ${langName}.
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",  // 2026-05 GA fast tier
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],  // Enable Google Search Grounding
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A concise 2-sentence summary of the entity.",
            },
            significance: {
              type: Type.STRING,
              description: "A paragraph explaining why this entity is critical to the 'Silicon Age' of AI.",
            },
            keyFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 bullet points of interesting trivia or specific achievements.",
            },
          },
          required: ["summary", "significance", "keyFacts"],
        },
      },
    });

    if (response.text) {
      const result = { ...(JSON.parse(response.text) as AIResponse), source: 'live' as const };

      // Save to Local Cache for future visits
      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (e) {
        console.warn("Failed to save to localStorage", e);
      }

      return result;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { summary: '', significance: '', keyFacts: [], source: 'error' };
  }
};

