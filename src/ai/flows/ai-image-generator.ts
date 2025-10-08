'use server';

/**
 * @fileOverview An AI agent for generating and managing images.
 * - generateImage - Generates an image from a text prompt.
 * - saveUserMedia - Saves media information to Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
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
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 15);

  await saveUserMedia({
      userId: userId,
      type: 'ai-generated',
      mediaUrl: generatedImage.url,
      prompt: promptText,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
  });
  
  return { imageDataUri: generatedImage.url };
}


export async function saveUserMedia(mediaData: SaveUserMediaInput): Promise<{ success: boolean; id?: string }> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("Database not initialized.");
    }

    const docRef = await adminDb.collection('userMedia').add({
      ...mediaData,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(mediaData.expiresAt),
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error saving user media:", error);
    return { success: false };
  }
}
