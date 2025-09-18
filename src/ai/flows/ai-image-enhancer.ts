
'use server';

/**
 * @fileOverview Upscales and enhances images using an AI model.
 */

import { ai } from '@/ai/genkit';
import { 
    EnhanceImageInputSchema,
    EnhanceImageOutputSchema,
    type EnhanceImageInput,
    type EnhanceImageOutput
} from './ai-image-enhancer.types';
import { saveUserMedia } from './ai-image-generator';

export async function enhanceImageQuality(input: EnhanceImageInput): Promise<EnhanceImageOutput> {
  return enhanceImageQualityFlow(input);
}

const enhanceImageQualityFlow = ai.defineFlow(
  {
    name: 'enhanceImageQualityFlow',
    inputSchema: EnhanceImageInputSchema,
    outputSchema: EnhanceImageOutputSchema,
  },
  async ({ imageDataUri, userId, upscaleFactor }) => {
     try {
        const promptText = `Upscale this image to ${upscaleFactor} its original resolution. Enhance details, sharpness, and overall quality. Re-draw it to be photorealistic and high-definition.`;
        
        const prompt = [
            { text: promptText },
            { media: { url: imageDataUri } }
        ];

        const { media } = await ai.generate({
          model: 'googleai/gemini-pro-vision',
          prompt,
          config: {
            responseModalities: ['IMAGE'],
          }
        });

        if (!media || !media.url) {
             throw new Error('The model did not return any image content.');
        }

        await saveUserMedia({
            userId,
            type: 'ai-generated',
            mediaUrl: media.url,
            prompt: `Enhanced image (${upscaleFactor})`,
        });
        
        return { imageDataUri: media.url };

    } catch (error: any) {
        console.error("AI Image Enhancement Error:", error);
        if (error.message && error.message.includes('billing')) {
            throw new Error("Image enhancement failed. This feature requires a billing-enabled Google Cloud project.");
        }
        throw new Error(error.message || "An unexpected error occurred during image enhancement.");
    }
  }
);
