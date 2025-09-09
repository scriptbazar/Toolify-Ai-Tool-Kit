
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
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

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
    try {
        const {media} = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: promptText,
        });

        if (!media || !media.url) {
        throw new Error('No image was generated.');
        }
        
        const adminDb = getAdminDb();
        if (adminDb) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Convert data URI to buffer
        const base64Data = media.url.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Upload to Firebase Storage
        const bucket = getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
        const fileName = `userMedia/${userId}/ai-generated/${Date.now()}.png`;
        const file = bucket.file(fileName);

        await file.save(imageBuffer, {
            metadata: {
            contentType: 'image/png',
            },
        });

        // Get the public URL
        const publicUrl = await file.getSignedUrl({
            action: 'read',
            expires: expiresAt,
        });

        await adminDb.collection('userMedia').add({
            userId,
            type: 'ai-generated',
            mediaUrl: publicUrl[0], // getSignedUrl returns an array with one element
            prompt: promptText,
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: expiresAt,
        });
        }

        return {imageDataUri: media.url};
    } catch (error: any) {
        console.error("AI Image Generation Error:", error.message);
        // Check for specific billing error from Imagen
        if (error.message && error.message.includes("Imagen API is only accessible to billed users at this time")) {
            throw new Error("The image generation model requires a billed Google Cloud account. Please set up billing to use this feature.");
        }
        // Throw a generic error for other issues
        throw new Error(error.message || "An unexpected error occurred during image generation.");
    }
  }
);


export async function getUserMedia(userId: string): Promise<UserMedia[]> {
    const adminDb = getAdminDb();
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
  const adminDb = getAdminDb();
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
