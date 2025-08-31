
'use server';

/**
 * @fileOverview Generates images based on text prompts using the Gemini 2.0 Flash experimental image generation model.
 *
 * - generateImage - A function that takes a text prompt and returns a data URI of the generated image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { adminDb } from '@/lib/firebase-admin';

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
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: promptText,
    });

    if (!media || !media.url) {
      throw new Error('No image was generated.');
    }
    
    if (adminDb) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      await adminDb.collection('userMedia').add({
          userId,
          type: 'ai-generated',
          mediaUrl: media.url,
          prompt: promptText,
          createdAt: new Date(),
          expiresAt: expiresAt,
      });
    }

    return {imageDataUri: media.url};
  }
);
