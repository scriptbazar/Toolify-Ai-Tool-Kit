
'use server';

/**
 * @fileOverview Manages user data in Firestore.
 *
 * - updateUserRole - A function that updates a user's role in the database.
 * - addLeadUser - Saves lead information from the chat widget.
 * - getAllEmails - Fetches all unique emails from both users and leads collections.
 * - updateUserActivity - Updates the last active timestamp for a user.
 */

import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { AddLeadUserInputSchema, UpdateUserRoleInputSchema, type AddLeadUserInput, type UpdateUserRoleInput } from './user-management.types';
import { adminDb } from '@/lib/firebase-admin';


export async function updateUserRole(input: UpdateUserRoleInput): Promise<{ success: boolean; message: string }> {
  try {
    const { userId, newRole } = UpdateUserRoleInputSchema.parse(input);
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({ role: newRole });
    return { success: true, message: 'User role updated successfully.' };
  } catch (error: any) {
    console.error("Error updating user role:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}

export async function addLeadUser(input: AddLeadUserInput): Promise<{ success: boolean; message: string }> {
  try {
    const { name, email, message } = AddLeadUserInputSchema.parse(input);
    const leadsRef = adminDb.collection('leads');
    await leadsRef.add({
      name,
      email,
      message,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { success: true, message: 'Lead added successfully.' };
  } catch (error: any) {
    console.error("Error adding lead user:", error);
     if (error instanceof z.ZodError) {
      return { success: false, message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}

export async function getAllEmails(): Promise<{ email: string; source: string; date: string }[]> {
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const leadsSnapshot = await adminDb.collection('leads').get();

    const emailMap = new Map<string, { source: string; date: string }>();

    const processDoc = (doc: FirebaseFirestore.QueryDocumentSnapshot, source: 'Signup' | 'Lead') => {
      const data = doc.data();
      const email = data.email;
      if (email && !emailMap.has(email)) {
        const timestamp = data.createdAt;
        let dateString: string;

        if (timestamp && typeof timestamp.toDate === 'function') {
          dateString = timestamp.toDate().toISOString();
        } else if (timestamp instanceof Date) {
          dateString = timestamp.toISOString();
        } else {
          // Fallback for missing or malformed dates
          dateString = new Date().toISOString();
        }
        
        emailMap.set(email, { source, date: dateString });
      }
    };
    
    usersSnapshot.forEach(doc => processDoc(doc, 'Signup'));
    leadsSnapshot.forEach(doc => processDoc(doc, 'Lead'));
    
    const allEmails = Array.from(emailMap.entries()).map(([email, { source, date }]) => ({
      email,
      source,
      date,
    }));

    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return allEmails;
  } catch (error: any) {
    console.error("Error fetching all emails:", error);
    // Instead of throwing, return an empty array to allow the UI to render gracefully.
    // The error is logged on the server for debugging.
    return [];
  }
}


/**
 * Updates the last active timestamp for a given user.
 * @param userId - The ID of the user to update.
 * @returns An object indicating success or failure.
 */
export async function updateUserActivity(userId: string): Promise<{ success: boolean }> {
  if (!userId) {
    return { success: false };
  }
  try {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      lastActive: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    // It's okay if this fails silently (e.g., user doc doesn't exist),
    // as it's just a background heartbeat.
    console.log(`Could not update activity for user ${userId}:`, error);
    return { success: false };
  }
}
