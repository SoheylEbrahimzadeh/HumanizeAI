import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ProcessingMode, ToneStyle } from "../types";

const apiKey = process.env.API_KEY;
// Using the new GenAI SDK pattern
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Model mapping
const MODELS = {
  [ProcessingMode.FAST]: 'gemini-2.5-flash',
  [ProcessingMode.QUALITY]: 'gemini-3-pro-preview',
  CHAT: 'gemini-3-pro-preview'
};

export const humanizeContent = async (
  text: string,
  mode: ProcessingMode,
  tone: ToneStyle
): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const modelName = MODELS[mode];
  
  const systemInstruction = `You are an expert human writer and editor. 
  Your task is to rewrite the provided AI-generated text to make it sound natural, human, and engaging.
  
  Guidelines:
  - Remove robotic phrasing, repetitive sentence structures, and overly buzzword-heavy language.
  - Vary sentence length and rhythm.
  - Inject appropriate emotion and nuance based on the requested tone.
  - Maintain the original meaning and core facts.
  - STRICTLY preserve the original language of the input text. If the input is in German, the output MUST be in German. Do not translate.
  - STRICTLY AVOID using em dashes (—) or double hyphens (--) to separate clauses or thoughts. Use commas, periods, or semicolons instead.
  - Do not add conversational filler like "Here is the rewritten text:". Just output the text.
  
  Target Tone: ${tone}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        temperature: tone === ToneStyle.CREATIVE ? 0.9 : 0.7,
      }
    });
    
    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const createChatSession = () => {
  if (!apiKey) throw new Error("API Key not found");
  
  return ai.chats.create({
    model: MODELS.CHAT,
    config: {
      systemInstruction: "You are a helpful writing assistant embedded in the HumanizeAI app. Your goal is to help the user refine, edit, or critique text. Be concise, helpful, and friendly. Always respond in the same language as the user's input unless asked otherwise.",
    }
  });
};

export const sendChatMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};