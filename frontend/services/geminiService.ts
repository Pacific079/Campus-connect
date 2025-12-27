import { GoogleGenAI, Type } from "@google/genai";

// Helper to get client with latest key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMindMapData = async (syllabusText: string) => {
  try {
    const ai = getClient();
    const prompt = `Analyze the following syllabus text and extract the main topics and subtopics into a structured JSON format. 
    Text: "${syllabusText}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Main Topic Title" },
              subtopics: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of subtopics"
              }
            },
            required: ["title", "subtopics"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};