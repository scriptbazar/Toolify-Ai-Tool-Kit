
'use server';

/**
 * @fileOverview Generates images based on text prompts and manages user media.
 */

import { ai } from '@/ai/genkit';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { 
    GenerateImageInputSchema,
    GenerateImageOutputSchema,
    SaveMediaInputSchema,
    type GenerateImageInput,
    type GenerateImageOutput,
    type SaveMediaInput,
    type UserMedia
} from './ai-image-generator.types';


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
        const { text } = await ai.generate({
            model: 'googleai/gemini-1.5-flash-latest',
            prompt: `Generate a SVG image based on the following prompt. The SVG should be a single, complete XML block, starting with "<svg" and ending with "</svg>". Do not include any markdown like \`\`\`svg or other explanatory text. The SVG should be visually appealing, use a modern flat design style, and have a beautiful color palette.

User's Prompt: "${promptText}"`,
        });
        
        if (!text) {
             throw new Error('No SVG code was generated. The model may have failed to produce an output.');
        }

        // Clean the response to extract only the SVG code.
        const svgMatch = text.match(/<svg.*<\/svg>/s);
        const svgCode = svgMatch ? svgMatch[0] : '';
        
        if (!svgCode) {
            console.error("Failed to extract SVG from model response:", text);
            throw new Error('The AI returned an invalid format. Could not extract the SVG image.');
        }
        
        const imageDataUri = `data:image/svg+xml;base64,${Buffer.from(svgCode).toString('base64')}`;
        
        await saveUserMedia({
            userId,
            type: 'ai-generated',
            mediaUrl: imageDataUri,
            prompt: promptText,
        });
        
        return { imageDataUri };

    } catch (error: any) {
        console.error("AI SVG Generation Error:", error);
        throw new Error(error.message || "An unexpected error occurred during SVG generation.");
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
