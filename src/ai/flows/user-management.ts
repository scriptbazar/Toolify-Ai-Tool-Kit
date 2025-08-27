
'use server';

/**
 * @fileOverview Manages user data in Firestore.
 *
 * - updateUserRole - A function that updates a user's role in the database.
 * - addLeadUser - Saves lead information from the chat widget.
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
