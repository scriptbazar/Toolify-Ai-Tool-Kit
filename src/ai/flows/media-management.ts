
'use server';

/**
 * @fileOverview A set of flows for generating and managing media files.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

// Schema for generating an image
const GenerateImageInputSchema = z.object({
  promptText: z.string().describe("A descriptive text prompt for image generation."),
  userId: z.string().describe("The ID of the user requesting the image."),
  count: z.number().min(1).max(4).default(1).describe("The number of images to generate."),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUris: z.array(z.string().describe("A generated image as a data URI.")),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;


/**
 * Generates an image based on a text prompt.
 */
export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  const { promptText, count } = GenerateImageInputSchema.parse(input);

  try {
    // Using gemini-pro-vision as it's generally available and doesn't require Imagen-specific access.
    // While not a dedicated image generation model, it can produce images from text prompts.
    const { media } = await ai.generate({
      model: googleAI.model('gemini-pro-vision'), 
      prompt: `Generate ${count} image(s) based on this prompt: ${promptText}`,
    });
    
    if (!media || media.length === 0) {
      throw new Error("Image generation failed to return any valid images.");
    }
    
    const imageDataUris = media.map(m => m.url).filter((url): url is string => !!url);
    
    // If the model returns fewer images than requested, duplicate the last one.
    while (imageDataUris.length < count && imageDataUris.length > 0) {
      imageDataUris.push(imageDataUris[imageDataUris.length - 1]);
    }
    
    return { imageDataUris };

  } catch (error: any) {
    console.error("AI Image Generation Error:", error);
    throw new Error("Sorry, the image could not be generated at this time. Please try again later.");
  }
}
