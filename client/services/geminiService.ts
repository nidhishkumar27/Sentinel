import { GoogleGenAI, Type } from "@google/genai";
import { RiskAssessment, RiskLevel } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key not found. Make sure VITE_GEMINI_API_KEY is set in .env.local");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export interface CityIntel {
  touristSpots: { name: string; lat: number; lng: number; description: string }[];
  dangerZones: { name: string; lat: number; lng: number; radius: number; reason: string }[];
}

export const scanCity = async (cityName: string): Promise<CityIntel> => {
  const ai = getClient();
  if (!ai) return { touristSpots: [], dangerZones: [] };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Using a faster/smarter model if available, or fall back to standard
      contents: `Generate a safety map data for "${cityName}".
      1. Identify 3 real, popular tourist spots (museums, palaces, parks).
      2. Identify 3 hypothetical or known "cautionary zones" (e.g., busy intersections, isolated parks at night, construction areas).
      3. For each, provide REALISTIC latitude and longitude coordinates that are ACTUALLY inside ${cityName}.
      4. For danger zones, provide a radius in meters (e.g., 200-500).
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            touristSpots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ['name', 'lat', 'lng', 'description']
              }
            },
            dangerZones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  radius: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ['name', 'lat', 'lng', 'radius', 'reason']
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("City Scan Failed:", error);
  }

  return { touristSpots: [], dangerZones: [] };
};

export const analyzeRisk = async (context: string): Promise<RiskAssessment> => {
  const ai = getClient();
  if (!ai) {
    return {
      score: 0,
      level: RiskLevel.LOW,
      summary: "API Key missing. Unable to analyze.",
      precautions: []
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the safety risk for a tourist in the following context/location: "${context}".
      If the input is just a place name (e.g., "Paris", "Mysore"), provide a general safety overview for that specific location.
      If it's a specific scenario (e.g., "Walking alone at night"), analyze that specific risk.
      Consider crime rates, political stability, weather, and common tourist scams.
      Provide a risk score from 0 to 100 (100 being extremely dangerous).
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            level: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
            summary: { type: Type.STRING },
            precautions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['score', 'level', 'summary', 'precautions']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        score: data.score,
        level: data.level as RiskLevel,
        summary: data.summary,
        precautions: data.precautions
      };
    }

    throw new Error("No response text");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      score: 50,
      level: RiskLevel.MEDIUM,
      summary: "AI Analysis currently unavailable. Please exercise caution.",
      precautions: ["Stay in well-lit areas", "Keep valuables hidden"]
    };
  }
};