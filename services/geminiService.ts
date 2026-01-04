
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Product, ChatMessage } from "../types";

// Fix: Follow @google/genai guidelines for model initialization and direct content generation
export const getShoppingAdvice = async (
  query: string,
  products: Product[],
  history: ChatMessage[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "I'm sorry, I cannot help right now as the AI service is not configured.";
  }

  // Always use a named parameter for apiKey and use process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Fix: Directly await ai.models.generateContent with model name and prompt
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: `You are the Culinary Assistant for GONGURA FAMILY RESTAURANT MADHIRA. 
        You are friendly, food-loving, and knowledgeable about our authentic Hyderabadi menu.
        Our current menu includes: ${JSON.stringify(products)}.
        Answer questions about dishes, spice levels, or suggest combinations (like Biryani with Chicken 65).
        Keep responses mouth-watering and helpful. Mention our specialty Gongura dishes when appropriate.`,
        temperature: 0.7,
      }
    });

    // Fix: Access .text property directly (not a method)
    return response.text || "I'm not quite sure about that dish. Would you like to try our Hyderabadi Biryani?";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm having a little trouble connecting to our chef. Please try again in a moment.";
  }
};
