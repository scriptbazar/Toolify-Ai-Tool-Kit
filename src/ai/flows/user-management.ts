
'use server';

/**
 * @fileOverview Manages user data in Firestore.
 *
 * - updateUserRole - A function that updates a user's role in the database.
 * - addLeadUser - Saves lead information from the chat widget.
 * - getAllEmails - Fetches all unique emails from both users and leads collections.
 */

import { z } from 'zod';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {getApps, initializeApp} from 'firebase-admin/app';
import { AddLeadUserInputSchema, UpdateUserRoleInputSchema, type AddLeadUserInput, type UpdateUserRoleInput } from './user-management.types';


// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

export async function updateUserRole(input: UpdateUserRoleInput): Promise<{ success: boolean; message: string }> {
  try {
    const { userId, newRole } = UpdateUserRoleInputSchema.parse(input);
    const userRef = db.collection('users').doc(userId);
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
    const leadsRef = db.collection('leads');
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
    const usersSnapshot = await db.collection('users').get();
    const leadsSnapshot = await db.collection('leads').get();

    const emailMap = new Map<string, { source: string; date: string }>();

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      const email = data.email;
      if (email && !emailMap.has(email)) {
         const timestamp = data.createdAt;
        // Handle both Firestore Timestamp and regular Date objects for createdAt
        const date = timestamp && typeof timestamp.toDate === 'function' 
          ? timestamp.toDate().toISOString() 
          : (timestamp instanceof Date ? timestamp.toISOString() : new Date().toISOString());

        emailMap.set(email, {
          source: 'Signup',
          date: date,
        });
      }
    });

    leadsSnapshot.forEach(doc => {
      const data = doc.data();
      const email = data.email;
      if (email && !emailMap.has(email)) {
        const timestamp = data.createdAt;
        const date = timestamp && typeof timestamp.toDate === 'function' 
          ? timestamp.toDate().toISOString() 
          : (timestamp instanceof Date ? timestamp.toISOString() : new Date().toISOString());
        
        emailMap.set(email, {
          source: 'Lead',
          date: date,
        });
      }
    });
    
    const allEmails = Array.from(emailMap.entries()).map(([email, { source, date }]) => ({
      email,
      source,
      date,
    }));

    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return allEmails;
  } catch (error: any) {
    console.error("Error fetching all emails:", error);
    // Throw the error so the client-side can handle it
    throw new Error(`Failed to fetch emails: ${error.message}`);
  }
}
