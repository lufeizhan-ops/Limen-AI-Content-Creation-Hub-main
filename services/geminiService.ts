import { GoogleGenAI, Type } from "@google/genai";
import { ProjectStrategy, TitleGenerationResponse, SeoMetadataResponse } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini Client
// NOTE: process.env.API_KEY is guaranteed to be available by the environment rules.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// Helper to format rules
const getRulesContext = (strategy: ProjectStrategy) => {
  if (!strategy.customRules || strategy.customRules.trim() === "") return "";
  return `
    IMPORTANT - STRICTLY FOLLOW THESE CUSTOM RULES:
    ${strategy.customRules}
  `;
};

export const generateTitles = async (strategy: ProjectStrategy): Promise<string[]> => {
  const prompt = `
    Generate 5 to 10 high-impact blog post titles based on the following strategy.
    Topic: ${strategy.topic}
    Target Audience: ${strategy.audience}
    Primary Keywords: ${strategy.keywords}
    Language: ${strategy.language}
    Tone: ${strategy.tone === 'Custom' ? strategy.customTone : strategy.tone}
    ${getRulesContext(strategy)}

    The titles should be optimized for high CTR (Click Through Rate) and SEO.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of optimized blog titles"
            }
          }
        }
      }
    });

    const result = response.text ? JSON.parse(response.text) as TitleGenerationResponse : { titles: [] };
    return result.titles;
  } catch (error) {
    console.error("Error generating titles:", error);
    throw new Error("Failed to generate titles. Please check your input and try again.");
  }
};

export const generateOutline = async (title: string, strategy: ProjectStrategy): Promise<string> => {
  const prompt = `
    Create a comprehensive and detailed blog post outline for the title: "${title}".
    
    Context:
    - Topic: ${strategy.topic}
    - Audience: ${strategy.audience}
    - Keywords: ${strategy.keywords}
    - Language: ${strategy.language}
    - Tone: ${strategy.tone === 'Custom' ? strategy.customTone : strategy.tone}
    ${getRulesContext(strategy)}

    Requirements:
    - Use Markdown format.
    - Include H2 and H3 headers.
    - Under each header, add bullet points explaining the key talking points.
    - Structure the outline for Generative Engine Optimization (GEO) by planning for a "Key Takeaways" section or specific definitions early on.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating outline:", error);
    throw new Error("Failed to generate outline.");
  }
};

export const generateDraft = async (title: string, outline: string, strategy: ProjectStrategy): Promise<string> => {
  const prompt = `
    Write the full blog post based on the provided outline.

    Title: ${title}
    
    Outline:
    ${outline}

    Strategy Details:
    - Language: ${strategy.language}
    - Tone: ${strategy.tone === 'Custom' ? strategy.customTone : strategy.tone}
    - Keywords to include: ${strategy.keywords}
    ${getRulesContext(strategy)}

    GEO (Generative Engine Optimization) Guidelines:
    - Ensure the content is authoritative and in-depth.
    - Use formatting (Bold, Lists, Tables) to make it scannable.
    - If appropriate, include a comparison table or a "pros and cons" list within the text (represented in Markdown).
    - Output strictly in Markdown format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating draft:", error);
    throw new Error("Failed to generate draft.");
  }
};

export const reviseDraft = async (currentDraft: string, instructions: string, strategy: ProjectStrategy): Promise<string> => {
  const prompt = `
    You are editing an existing blog post draft.
    
    Original Draft:
    ${currentDraft}

    User Revision Request:
    "${instructions}"

    Strategy Context:
    - Language: ${strategy.language}
    ${getRulesContext(strategy)}

    Please rewrite the necessary sections of the draft to accommodate the user's request while maintaining the original tone and SEO optimization.
    Return the FULL revised article in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error revising draft:", error);
    throw new Error("Failed to revise draft.");
  }
};

export const generateSeoMetadata = async (draft: string, strategy: ProjectStrategy): Promise<SeoMetadataResponse> => {
  const prompt = `
    Analyze the following blog post draft and generate SEO metadata.
    
    Draft Content (First 1000 words):
    ${draft.substring(0, 5000)}
    
    Strategy Context:
    - Language: ${strategy.language}
    - Keywords: ${strategy.keywords}
    
    Output Requirements:
    1. Slug: URL-friendly version of the title/topic.
    2. Short Text (Excerpt): A compelling 1-2 sentence summary for blog cards.
    3. Intro Text: A powerful opening paragraph or social media hook (approx 50 words) that grabs attention.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slug: { type: Type.STRING, description: "URL friendly slug" },
            shortText: { type: Type.STRING, description: "1-2 sentence summary" },
            introText: { type: Type.STRING, description: "Catchy intro or social hook" }
          }
        }
      }
    });

    return response.text ? JSON.parse(response.text) as SeoMetadataResponse : { slug: '', shortText: '', introText: '' };
  } catch (error) {
    console.error("Error generating metadata:", error);
    throw new Error("Failed to generate metadata.");
  }
};