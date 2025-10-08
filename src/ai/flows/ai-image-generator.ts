'use server';

/**
 * @fileOverview An AI agent for generating and managing images.
 * - generateImage - Generates an image from a text prompt.
 * - saveUserMedia - Saves media information to Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { UserMediaSchema, type UserMedia } from './media-management.types';
import { db } from '@/lib/firebase';

const GenerateImageInputSchema = z.object({
  promptText: z.string().describe('The text prompt to generate an image from.'),
  userId: z.string().describe('The ID of the user requesting the image.'),
});

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a Base64 encoded data URI."),
});

const SaveUserMediaInputSchema = UserMediaSchema.omit({ id: true });
type SaveUserMediaInput = z.infer<typeof SaveUserMediaInputSchema>;

export async function saveUserMedia(input: SaveUserMediaInput): Promise<{ success: boolean; message: string }> {
    try {
        const { userId, type, mediaUrl, prompt, expiresAt } = input;
        
        await addDoc(collection(db, 'userMedia'), {
            userId,
            type,
            mediaUrl,
            prompt: prompt || '',
            createdAt: serverTimestamp(),
            expiresAt: new Date(expiresAt),
        });

        return { success: true, message: "Media saved successfully." };

    } catch (error: any) {
        console.error("Error saving user media:", error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}


export async function generateImage(input: z.infer<typeof GenerateImageInputSchema>): Promise<z.infer<typeof GenerateImageOutputSchema>> {
  const { promptText, userId } = input;
  
  const response = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: promptText,
  });

  const generatedImage = response.media[0];

  if (!generatedImage) {
    throw new Error('Image generation failed.');
  }

  // The media saving logic is now moved to the client-side component that calls this.
  
  return { imageDataUri: generatedImage.url };
}
