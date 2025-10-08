'use client';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';

const SaveMediaInputSchema = z.object({
  userId: z.string(),
  type: z.enum(['ai-generated', 'community-chat', 'ticket-media']),
  mediaUrl: z.string().url(),
  prompt: z.string().optional(),
});

type SaveMediaInput = z.infer<typeof SaveMediaInputSchema>;

export async function saveUserMedia(input: SaveMediaInput): Promise<{ success: boolean; message: string }> {
  try {
    const validatedInput = SaveMediaInputSchema.parse(input);
    
    // Set an expiration date based on the type of media
    const expiresAt = new Date();
    if (validatedInput.type === 'community-chat') {
        expiresAt.setDate(expiresAt.getDate() + 2); // 48 hours
    } else if (validatedInput.type === 'ticket-media') {
        expiresAt.setDate(expiresAt.getDate() + 15);
    } else {
        expiresAt.setDate(expiresAt.getDate() + 30); // Default for AI generated
    }

    await addDoc(collection(db, 'userMedia'), {
      ...validatedInput,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt,
    });

    return { success: true, message: 'Media saved successfully.' };
  } catch (error: any) {
    console.error("Error saving user media:", error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
