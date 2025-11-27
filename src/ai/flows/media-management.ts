
'use server';

/**
 * @fileOverview A set of flows for generating and managing media files.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';


// Schema for generating an image
const GenerateImageInputSchema = z.object({
  promptText: z.string().describe("A descriptive text prompt for image generation."),
  userId: z.string().describe("The ID of the user requesting the image."),
  count: z.number().min(1).max(4).default(1).describe("The number of images to generate."),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUris: z.array(z.string().describe("A generated image as a data URI.")),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

// Schema for saving media
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
 * This flow is currently disabled as the tool has been removed.
 */
// export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
//   const { promptText, count } = GenerateImageInputSchema.parse(input);

//   try {
//     const images: string[] = [];
//     const generationPromises = [];

//     for (let i = 0; i < count; i++) {
//         generationPromises.push(ai.generate({
//             model: googleAI.model('imagen-4.0-fast-generate-001'), 
//             prompt: promptText,
//         }));
//     }

//     const results = await Promise.all(generationPromises);

//     for (const result of results) {
//         if (result.media && result.media.length > 0 && result.media[0].url) {
//             images.push(result.media[0].url);
//         }
//     }
    
//     if (images.length === 0) {
//       throw new Error("Image generation failed to return any valid images.");
//     }
    
//     return { imageDataUris: images };

//   } catch (error: any) {
//     console.error("AI Image Generation Error:", error);
//     throw new Error("Sorry, the image could not be generated at this time. Please try again later.");
//   }
// }

/**
 * Saves a user's generated or uploaded media to Firestore with an expiration date.
 */
export async function saveUserMedia(input: SaveMediaInput): Promise<{ success: boolean; message: string }> {
    const adminDb = getAdminDb();
    if (!adminDb) {
        return { success: false, message: "Database not initialized." };
    }

    try {
        const validatedInput = SaveMediaInputSchema.parse(input);
        
        await adminDb.collection('userMedia').add({
            ...validatedInput,
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: new Date(validatedInput.expiresAt),
        });

        return { success: true, message: 'Media saved.' };

    } catch (error: any) {
        console.error("Error saving user media:", error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}
