
'use server';

/**
 * @fileOverview Generates images based on text prompts and manages user media.
 */

import { ai } from '@/ai/genkit';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { 
    GenerateImageInputSchema,
    SaveMediaInputSchema,
    type GenerateImageInput,
    type SaveMediaInput,
    type UserMedia
} from './ai-image-generator.types';
import { z } from 'zod';


// Define a Zod schema for the output of the image generation flow.
// It will now return a data URI for an SVG image.
const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated SVG image as a data URI.'),
});
type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;


// --- Main Flow for Image Generation ---
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
        const prompt = `
          Generate a clean, modern, vector-style SVG image based on the following description: "${promptText}".

          **Instructions for the SVG:**
          - The SVG should be a complete, valid XML file.
          - It must have a viewBox attribute, e.g., 'viewBox="0 0 100 100"'.
          - Do NOT include any text elements (<text>) in the SVG, especially not in Hindi or other non-Latin scripts.
          - Use simple shapes and a pleasant, modern color palette.
          - The output must be ONLY the SVG code, starting with <svg> and ending with </svg>. Do not include any other text, markdown, or explanations.
        `;
        
        const { text } = await ai.generate({
          model: 'gemini-1.5-flash-latest',
          prompt: prompt,
        });

        if (!text) {
             throw new Error('The model did not return any image content.');
        }

        // Clean the response to ensure only the SVG code is present.
        const svgMatch = text.match(/<svg.*<\/svg>/s);
        const cleanSvg = svgMatch ? svgMatch[0] : '';
        
        if (!cleanSvg) {
            throw new Error('Could not extract valid SVG code from the AI response.');
        }

        const imageDataUri = `data:image/svg+xml;base64,${Buffer.from(cleanSvg).toString('base64')}`;

        await saveUserMedia({
            userId,
            type: 'ai-generated',
            mediaUrl: imageDataUri, // Save the Data URI directly
            prompt: promptText,
        });
        
        return { imageDataUri };

    } catch (error: any) {
        console.error("AI Image Generation Error:", error);
        // Provide a more user-friendly error message
        if (error.message && error.message.includes('billing')) {
            throw new Error("Image generation failed. This feature requires a billing-enabled Google Cloud project.");
        }
        throw new Error(error.message || "An unexpected error occurred during image generation.");
    }
  }
);


const RemoveBgInputSchema = z.object({
  imageDataUri: z.string().describe("A photo of an object, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  userId: z.string().describe('The ID of the user requesting the background removal.'),
});
export type RemoveBgInput = z.infer<typeof RemoveBgInputSchema>;

const RemoveBgOutputSchema = z.object({
  imageDataUri: z.string().describe('The resulting image with a transparent background as a data URI.'),
});
export type RemoveBgOutput = z.infer<typeof RemoveBgOutputSchema>;


export async function removeImageBackground(input: RemoveBgInput): Promise<RemoveBgOutput> {
  return removeImageBackgroundFlow(input);
}


const removeImageBackgroundFlow = ai.defineFlow(
  {
    name: 'removeImageBackgroundFlow',
    inputSchema: RemoveBgInputSchema,
    outputSchema: RemoveBgOutputSchema,
  },
  async ({ imageDataUri, userId }) => {
     try {
        const prompt = [
            { text: "Remove the background from this image. Make the background transparent. The output should be a PNG." },
            { media: { url: imageDataUri } }
        ];

        const { media } = await ai.generate({
          model: 'gemini-pro-vision',
          prompt,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          }
        });

        if (!media || !media.url) {
             throw new Error('The model did not return any image content.');
        }

        await saveUserMedia({
            userId,
            type: 'ai-generated',
            mediaUrl: media.url,
            prompt: 'Background removed from image',
        });
        
        return { imageDataUri: media.url };

    } catch (error: any) {
        console.error("AI Background Removal Error:", error);
        if (error.message && error.message.includes('billing')) {
            throw new Error("Background removal failed. This feature requires a billing-enabled Google Cloud project.");
        }
        throw new Error(error.message || "An unexpected error occurred during background removal.");
    }
  }
);



// --- Functions for Media Management ---

/**
 * Saves media metadata to a user's subcollection in Firestore.
 */
export async function saveUserMedia(input: SaveMediaInput): Promise<{ success: boolean; message: string }> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    return { success: false, message: "Database not initialized." };
  }
  
  try {
    const { userId, type, mediaUrl, prompt } = SaveMediaInputSchema.parse(input);
    const expiresAt = new Date();
    if (type === 'community-chat') {
        expiresAt.setDate(expiresAt.getDate() + 2); // Expires in 2 days
    } else if (type === 'ticket-media') {
        expiresAt.setDate(expiresAt.getDate() + 15); // Expires in 15 days
    } else {
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
    }

    await adminDb.collection('users').doc(userId).collection('userMedia').add({
      type,
      mediaUrl,
      prompt,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
    });
    
    return { success: true, message: "Media saved successfully." };
  } catch (error: any) {
    console.error("Error saving media:", error);
    return { success: false, message: error.message || "Failed to save media." };
  }
}

/**
 * Fetches all media for a specific user from Firestore.
 */
export async function getUserMedia(userId: string): Promise<UserMedia[]> {
    const adminDb = getAdminDb();
    if (!userId || !adminDb) {
        return [];
    }
    
    try {
        const mediaRef = adminDb.collection('users').doc(userId).collection('userMedia');
        const snapshot = await mediaRef.orderBy('createdAt', 'desc').get();
        
        if (snapshot.empty) {
            return [];
        }

        const mediaList: UserMedia[] = snapshot.docs.map(doc => {
            const data = doc.data();
            // Firestore timestamps need to be converted to ISO strings
            const createdAt = (data.createdAt as any)?.toDate ? (data.createdAt.toDate().toISOString()) : new Date().toISOString();
            const expiresAt = (data.expiresAt as any)?.toDate ? (data.expiresAt.toDate().toISOString()) : new Date().toISOString();
            
            return {
                id: doc.id,
                userId: userId,
                type: data.type,
                mediaUrl: data.mediaUrl,
                prompt: data.prompt,
                createdAt,
                expiresAt,
            } as UserMedia;
        });
        
        return mediaList;

    } catch (error: any) {
        console.error(`Error fetching media for user ${userId}:`, error);
        // Throw the error so the client can handle it, which seems to be the current behavior (showing a toast).
        throw new Error("Could not load your media gallery.");
    }
}
    