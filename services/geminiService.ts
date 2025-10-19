
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The catchy name of the recipe." },
    description: { type: Type.STRING, description: "A brief, appetizing description of the dish." },
    ingredients: {
      type: Type.OBJECT,
      properties: {
        used: {
          type: Type.ARRAY,
          description: "Ingredients from the user's provided list that are used in this recipe.",
          items: { type: Type.STRING }
        },
        additional: {
          type: Type.ARRAY,
          description: "Additional ingredients required for the recipe that were not in the user's list.",
          items: { type: Type.STRING }
        }
      },
      required: ['used', 'additional']
    },
    instructions: {
      type: Type.ARRAY,
      description: "Step-by-step cooking instructions.",
      items: { type: Type.STRING }
    },
    prepTime: { type: Type.STRING, description: "Estimated preparation time, e.g., '15 minutes'." },
    cookTime: { type: Type.STRING, description: "Estimated cooking time, e.g., '30 minutes'." },
  },
  required: ['title', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime']
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      description: "A list of 2-3 creative recipes.",
      items: recipeSchema
    }
  },
  required: ['recipes']
};

export const generateRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  if (ingredients.length === 0) {
    return [];
  }

  const prompt = `I have the following ingredients: ${ingredients.join(', ')}. Please generate 3 creative and delicious recipe ideas using these ingredients. You can suggest additional common pantry items if needed.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert chef who creates delicious and easy-to-follow recipes based on a list of available ingredients. Always be creative and suggest appealing dishes.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson.recipes || [];
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Failed to generate recipes. The model might be unable to process the request.");
  }
};
