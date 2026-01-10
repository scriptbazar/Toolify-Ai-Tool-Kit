
'use server';

/**
 * @fileOverview A set of flows for managing media files.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';


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
