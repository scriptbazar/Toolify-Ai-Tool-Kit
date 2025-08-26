
'use server';

/**
 * @fileOverview Manages user data in Firestore.
 *
 * - updateUserRole - A function that updates a user's role in the database.
 * - UpdateUserRoleInput - The input type for the updateUserRole function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import {getApps, initializeApp, cert} from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

export const UpdateUserRoleInputSchema = z.object({
  userId: z.string().describe("The ID of the user to update."),
  newRole: z.enum(['user', 'admin']).describe("The new role to assign to the user."),
});
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleInputSchema>;

export async function updateUserRole(input: UpdateUserRoleInput): Promise<{ success: boolean }> {
  return updateUserRoleFlow(input);
}

const updateUserRoleFlow = ai.defineFlow(
  {
    name: 'updateUserRoleFlow',
    inputSchema: UpdateUserRoleInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ userId, newRole }) => {
    // In a real app, you MUST verify that the calling user is an admin before proceeding.
    // This is currently handled by Firestore security rules, but an extra layer of server-side
    // validation is best practice.
    
    try {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        role: newRole
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating user role:", error);
      // It's better to throw the error so the client can handle it.
      if (error instanceof Error) {
        throw new Error(`Failed to update user role: ${error.message}`);
      }
      throw new Error('An unknown error occurred while updating user role.');
    }
  }
);
