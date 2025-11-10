
'use server';

/**
 * @fileOverview A set of flows for generating and managing media files.
 */
import { ai } from '@/ai/genkit';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

// Schema for generating an image
const GenerateImageInputSchema = z.object({
  promptText: z.string().describe("A descriptive text prompt for image generation."),
  userId: z.string().describe("The ID of the user requesting the image."),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

// Schema for saving media metadata
const SaveMediaInputSchema = z.object({
    userId: z.string(),
    type: z.enum(['ai-generated', 'community-chat', 'ticket-media']),
    mediaUrl: z.string().url(),
    prompt: z.string().optional(),
});
export type SaveMediaInput = z.infer<typeof SaveMediaInputSchema>;

/**
 * Generates an image based on a text prompt and saves its metadata.
 */
export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  const { promptText, userId } = GenerateImageInputSchema.parse(input);

  try {
    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: promptText,
    });
    
    if (!media || !media.url) {
      throw new Error("Image generation failed to return a valid image.");
    }
    
    const imageDataUri = media.url;
    
    // Asynchronously save metadata to Firestore, but don't block the response
    saveUserMedia({
      userId,
      type: 'ai-generated',
      mediaUrl: imageDataUri, // Note: For very large images, storing a URL from a service like Cloud Storage is better.
      prompt: promptText,
    }).catch(console.error);

    return { imageDataUri };

  } catch (error: any) {
    console.error("AI Image Generation Error:", error);
    throw new Error("Sorry, the image could not be generated at this time. Please try again later.");
  }
}

/**
 * Saves a record of user-generated or uploaded media to Firestore.
 */
export async function saveUserMedia(input: SaveMediaInput): Promise<{ success: boolean; message: string }> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("Database not initialized for media logging.");
    }
    
    const validatedInput = SaveMediaInputSchema.parse(input);

    await adminDb.collection('userMedia').add({
      ...validatedInput,
      createdAt: new Date().toISOString(),
      // Set expiration based on media type
      expiresAt: new Date(Date.now() + (input.type === 'community-chat' ? 2 : 15) * 24 * 60 * 60 * 1000).toISOString(),
    });

    return { success: true, message: 'Media record saved.' };
  } catch (error: any) {
    console.error("Error saving user media:", error);
    // This is a background task, so we don't want to throw to the user.
    // Just log the error and return a failure message.
    return { success: false, message: 'Could not save media record.' };
  }
}
