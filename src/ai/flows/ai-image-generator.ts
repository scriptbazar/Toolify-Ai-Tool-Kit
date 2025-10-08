'use server';

/**
 * @fileOverview An AI agent for generating and managing images.
 * - generateImage - Generates an image from a text prompt.
 * - saveUserMedia - Saves media information to Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, addDoc, collection } from 'firebase-admin/firestore';
import { UserMediaSchema, type UserMedia } from './media-management.types';

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
    const adminDb = getAdminDb();
    if (!adminDb) {
        return { success: false, message: "Database not initialized." };
    }

    try {
        const { userId, type, mediaUrl, prompt } = input;
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (type === 'community-chat' ? 2 : 15)); // 2 days for chat, 15 for others

        await addDoc(collection(adminDb, 'userMedia'), {
            userId,
            type,
            mediaUrl,
            prompt: prompt || '',
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: expiresAt,
        });

        return { success: true, message: "Media saved successfully." };

    } catch (error: any) {
        console.error("Error saving user media:", error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}


export async function generateImage(input: z.infer<typeof GenerateImageInputSchema>): Promise<z.infer<typeof GenerateImageOutputSchema>> {
  const { promptText, userId } = input;
  
  // Placeholder for actual image generation logic
  const response = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: promptText,
  });

  const generatedImage = response.media[0];

  if (!generatedImage) {
    throw new Error('Image generation failed.');
  }

  // Save the generated media to the user's library with a 15-day expiration
  await saveUserMedia({
      userId: userId,
      type: 'ai-generated',
      mediaUrl: generatedImage.url,
      prompt: promptText,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  });
  
  return { imageDataUri: generatedImage.url };
}
