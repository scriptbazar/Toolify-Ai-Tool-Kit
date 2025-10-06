
'use server';

/**
 * @fileOverview A function to save media details to a user's collection and generate AI images.
 * 
 * - saveUserMedia - A function to save media details to a user's collection.
 * - generateImage - A function to generate an image from a text prompt using AI.
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
    SaveMediaInputSchema,
    GenerateImageInputSchema,
    GenerateImageOutputSchema,
    type SaveMediaInput,
    type GenerateImageInput,
    type GenerateImageOutput
} from './media-management.types';


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


export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  const { promptText, userId } = GenerateImageInputSchema.parse(input);
  
  try {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: promptText,
    });
    
    const imageDataUri = media.url;
    if (!imageDataUri) {
      throw new Error('Image generation failed to return a valid image.');
    }
    
    // Save the generated image details to user's media collection
    await saveUserMedia({
      userId: userId,
      type: 'ai-generated',
      mediaUrl: imageDataUri,
      prompt: promptText,
    });

    return { imageDataUri };
  } catch (error: any) {
    console.error("AI Image Generation Error:", error);
    // Provide a more user-friendly error message
    if (error.message.includes('rate limit')) {
        throw new Error('Image generation limit reached for today. Please try again tomorrow.');
    }
    throw new Error('Failed to generate image. The prompt may have been blocked for safety reasons.');
  }
}
