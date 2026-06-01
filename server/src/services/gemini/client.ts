import { GoogleGenerativeAI } from '@google/generative-ai';

/** Gemini 2.5 Flash — server-side only; never expose API key to React client */
export const GEMINI_MODEL = 'gemini-2.5-flash';

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'AIzaSyDKmpRKQzz1TSM6Z2H4DooU5aTHNdWZVUk') {
    throw new Error(
      'GEMINI_API_KEY is missing. Copy server/.env.example to server/.env and add your key.'
    );
  }
  return key;
}

export function getGeminiModel() {
  const genAI = new GoogleGenerativeAI(getApiKey());
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
}

export async function generateText(prompt: string): Promise<string> {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}
