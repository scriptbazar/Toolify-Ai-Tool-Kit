
'use server';

/**
 * @fileOverview An AI agent that generates images from text prompts and saves them.
 * 
 * - generateImage - A function that generates an image and saves it to Firestore.
 * - saveUserMedia - A function to save media details to a user's collection.
 */

import { ai } from '@/ai/genkit';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';


const GenerateImageInputSchema = z.object({
  promptText: z.string().describe('The text prompt to generate the image from.'),
  userId: z.string().describe('The ID of the user requesting the image.'),
});
type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;


const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  const { promptText, userId } = input;

  const { media } = await ai.generate({
    model: 'googleai/imagen-2.0-fast-generate-001',
    prompt: promptText,
  });
  
  if (!media || !media.url) {
    throw new Error('Image generation failed.');
  }

  // Save the generated media to Firestore with a 7-day expiration
  await saveUserMedia({
      userId,
      type: 'ai-generated',
      mediaUrl: media.url,
      prompt: promptText,
  });

  return {
    imageDataUri: media.url,
  };
}

export const SaveMediaInputSchema = z.object({
    userId: z.string(),
    type: z.enum(['ai-generated', 'community-chat', 'ticket-media']),
    mediaUrl: z.string().url(),
    prompt: z.string().optional(),
});
export type SaveMediaInput = z.infer<typeof SaveMediaInputSchema>;

export async function saveUserMedia(input: SaveMediaInput): Promise<{ success: boolean }> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("Database not initialized, cannot save user media.");
    return { success: false };
  }

  const { userId, type, mediaUrl, prompt } = input;
  const expiresAt = new Date();
  
  // Set expiration based on type
  if (type === 'community-chat') {
    expiresAt.setDate(expiresAt.getDate() + 2); // 2 days
  } else if (type === 'ticket-media') {
    expiresAt.setDate(expiresAt.getDate() + 15); // 15 days for tickets
  } else {
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days for AI images
  }

  try {
    await adminDb.collection('userMedia').add({
      userId,
      type,
      mediaUrl,
      prompt: prompt || 'User-uploaded media',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving user media:", error);
    return { success: false };
  }
}
