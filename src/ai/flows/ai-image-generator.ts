
'use server';

/**
 * @fileOverview Generates images based on text prompts.
 *
 * - generateImage - A function that takes a text prompt and returns a data URI of the generated image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  promptText: z.string().describe('The text prompt to use for image generation.'),
  userId: z.string().describe('The ID of the user generating the image.'),
});

export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});

export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ promptText, userId }) => {
    try {
        const { text } = await ai.generate({
            model: 'googleai/gemini-1.5-flash-latest',
            prompt: `Generate an SVG code for an image based on the following prompt: "${promptText}". The SVG should be creative, visually appealing, and directly represent the user's request. Do not include any explanation, preamble, or markdown formatting like \`\`\`svg. Just provide the raw <svg>...</svg> code. Ensure the SVG has a viewBox and appropriate dimensions.`,
        });

        if (!text) {
            throw new Error('No SVG code was generated. The model may have failed to produce an output.');
        }

        const svgCode = text.trim();
        const base64Svg = Buffer.from(svgCode).toString('base64');
        const imageDataUri = `data:image/svg+xml;base64,${base64Svg}`;
        
        return { imageDataUri };
    } catch (error: any) {
        console.error("AI Image Generation Error:", error);
        throw new Error(error.message || "An unexpected error occurred during image generation.");
    }
  }
);
