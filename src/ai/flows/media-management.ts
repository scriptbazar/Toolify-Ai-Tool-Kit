
'use server';

/**
 * @fileOverview A set of flows for generating and managing media files.
 */
import { ai } from '@/ai/genkit';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
});
export type SaveMediaInput = z.infer<typeof SaveMediaInputSchema>;

/**
 * Generates an image based on a text prompt.
 */
export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  const { promptText } = GenerateImageInputSchema.parse(input);

  try {
    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: promptText,
    });
    
    if (!media || !media.url) {
      throw new Error("Image generation failed to return a valid image.");
    }
    
    const imageDataUri = media.url;
    
    // IMPORTANT: Return the generated image data. The saving is handled client-side.
    return { imageDataUri };

  } catch (error: any) {
    console.error("AI Image Generation Error:", error);
    throw new Error("Sorry, the image could not be generated at this time. Please try again later.");
  }
}


/**
 * Saves a record of user-generated or uploaded media to Firestore from the client-side.
 */
export async function saveUserMedia(input: SaveMediaInput): Promise<{ success: boolean; message: string }> {
  try {
    const validatedInput = SaveMediaInputSchema.parse(input);

    // Use the client-side 'db' instance
    const mediaCollection = collection(db, 'userMedia');
    await addDoc(mediaCollection, {
      ...validatedInput,
    });

    return { success: true, message: 'Media record saved.' };
  } catch (error: any) {
    console.error("Error saving user media from client:", error);
    return { success: false, message: error.message || 'Could not save media record.' };
  }
}
