import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, NodeData } from "../types";
import { STATIC_CACHE } from "./staticCache";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  console.error("❌ API Key is missing! Please check Vercel Environment Variables (VITE_GOOGLE_API_KEY).");
}

const ai = new GoogleGenAI({ apiKey: apiKey }); // 키가 없으면 에러가 나겠지만, 일단 변수로 전달

const CACHE_PREFIX = 'silicon_age_ai_cache_';

export const fetchNodeDetails = async (node: NodeData): Promise<AIResponse> => {
  const cacheKey = `${CACHE_PREFIX}${node.id}`;

  // 1. Check Server-Side Static Cache (Fastest, Free)
  if (STATIC_CACHE[node.id]) {
    console.log(`[Static Cache] Serving pre-computed data for ${node.id}`);
    return STATIC_CACHE[node.id];
  }

  // 2. Check Client-Side LocalStorage Cache (Persistence for non-static nodes)
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      console.log(`[Local Cache] Serving local data for ${node.id}`);
      return JSON.parse(cachedData) as AIResponse;
    }
  } catch (e) {
    console.warn("Failed to read from localStorage", e);
  }

  // 3. Fetch from API (Fallback)
  try {
    console.log(`[API Call] Fetching Gemini data for ${node.id}`);
    const prompt = `
      Provide a detailed analysis of "${node.label}" (Category: ${node.category}) in the context of Artificial Intelligence history.
      Focus on its specific contribution, relationships to other key entities, and historical significance.
    `;

    // Use the lightest, fastest model available
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest", 
      contents: prompt,
      config: {
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
      const result = JSON.parse(response.text) as AIResponse;
      
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
    return {
      summary: "Could not fetch details at this time.",
      significance: "AI analysis unavailable (Check API Quota or Connection).",
      keyFacts: ["Rate limit may be exceeded", "Try again in a minute"],
    };
  }
};
