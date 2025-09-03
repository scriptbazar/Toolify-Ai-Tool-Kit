
'use server';

/**
 * @fileOverview Generates images based on text prompts and manages all user media.
 *
 * - generateImage - A function that takes a text prompt and returns a data URI of the generated image.
 * - getUserMedia - A function that fetches all media for a specific user.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 * - UserMedia - The type for user media items.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const GenerateImageInputSchema = z.object({
  promptText: z.string().describe('The text prompt to use for image generation.'),
  userId: z.string().describe('The ID of the user generating the image.'),
});

export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});

export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

const UserMediaSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['ai-generated', 'community-chat', 'ticket-media']),
  mediaUrl: z.string().url(),
  prompt: z.string().optional(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type UserMedia = z.infer<typeof UserMediaSchema>;

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
          createdAt: FieldValue.serverTimestamp(),
          expiresAt: expiresAt,
      });
    }

    return {imageDataUri: media.url};
  }
);


export async function getUserMedia(userId: string): Promise<UserMedia[]> {
    if (!adminDb) {
        console.error('Database not initialized');
        return [];
    }

    try {
        const now = new Date();
        const mediaRef = adminDb.collection('userMedia');

        // Clean up expired media
        const expiredQuery = mediaRef.where('expiresAt', '<=', now);
        const expiredSnapshot = await expiredQuery.get();
        if (!expiredSnapshot.empty) {
            const batch = adminDb.batch();
            expiredSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        // Fetch user's media
        const userMediaQuery = mediaRef.where('userId', '==', userId).orderBy('createdAt', 'desc');
        const userMediaSnapshot = await userMediaQuery.get();
        
        return userMediaSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                type: data.type,
                mediaUrl: data.mediaUrl,
                prompt: data.prompt,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                expiresAt: (data.expiresAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            };
        });
    } catch (error) {
        console.error(`Error fetching media for user ${userId}:`, error);
        return [];
    }
}


const SaveCommunityMediaInputSchema = z.object({
  userId: z.string(),
  mediaUrl: z.string().url(),
  prompt: z.string().optional(),
});

export async function saveCommunityMedia(input: z.infer<typeof SaveCommunityMediaInputSchema>): Promise<{ success: boolean }> {
  if (!adminDb) {
    console.error('Database not initialized, cannot save community media.');
    return { success: false };
  }

  const { userId, mediaUrl, prompt } = SaveCommunityMediaInputSchema.parse(input);

  try {
    const expiresAt = new Date();
    // Community media expires after 2 days
    expiresAt.setDate(expiresAt.getDate() + 2);

    await adminDb.collection('userMedia').add({
      userId,
      type: 'community-chat',
      mediaUrl,
      prompt,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
    });

    return { success: true };
  } catch (error) {
    console.error(`Error saving community media for user ${userId}:`, error);
    return { success: false };
  }
}
