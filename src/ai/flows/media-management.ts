
'use server';

/**
 * @fileOverview A function to save media details to a user's collection.
 * 
 * - saveUserMedia - A function to save media details to a user's collection.
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

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
