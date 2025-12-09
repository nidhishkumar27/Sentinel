import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyCUMu76Cr2P5-WKZ5F4FVsLBCnYmIf3a0c";

async function testKey() {
    console.log("Testing API Key connection...");
    const client = new GoogleGenAI({ apiKey: API_KEY });

    try {
        console.log("Attempting generation with 'gemini-1.5-flash'...");
        const response = await client.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: 'Test',
        });
        console.log("✅ SUCCESS with 'gemini-1.5-flash':", response.text);
    } catch (error) {
        console.error("❌ FAILED with 'gemini-1.5-flash':", error.message);
    }

    try {
        console.log("Attempting generation with 'gemini-pro'...");
        const response2 = await client.models.generateContent({
            model: 'gemini-pro',
            contents: 'Test',
        });
        console.log("✅ SUCCESS with 'gemini-pro':", response2.text);
    } catch (err2) {
        console.error("❌ FAILED with 'gemini-pro':", err2.message);
    }
}

testKey();
