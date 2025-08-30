

'use server';

/**
 * @fileOverview Manages user data in Firestore.
 *
 * - updateUserRole - A function that updates a user's role in the database.
 * - addLeadUser - Saves lead information from the chat widget.
 * - getAllEmails - Fetches all unique emails from both users and leads collections.
 * - updateUserActivity - Updates the last active timestamp for a user.
 * - getChatUsers - Fetches a list of all signed-up users for the community chat.
 */

import { z } from 'zod';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { AddLeadUserInputSchema, UpdateUserRoleInputSchema, type AddLeadUserInput, type UpdateUserRoleInput, type ReferralRequest, type ReferralStatus } from './user-management.types';
import { adminDb } from '@/lib/firebase-admin';
import crypto from 'crypto';


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
    // Use .set with merge: true to avoid errors if the document doesn't exist yet.
    // This can happen if a user signs up but their Firestore document hasn't been created
    // by the time the first activity update is triggered.
    await userRef.set({
      lastActive: FieldValue.serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    // This is a background task, so it's better to log the error than to crash.
    // The user can continue using the app even if this fails.
    console.error(`Could not update activity for user ${userId}:`, error);
    return { success: false };
  }
}


/**
 * Fetches all signed-up users for the community chat.
 */
export async function getChatUsers(): Promise<any[]> {
    try {
        const usersRef = adminDb.collection('users');
        const usersSnapshot = await usersRef.get();
        const usersList = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            const name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
            const createdAt = data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null;
            const lastActive = data.lastActive ? (data.lastActive as Timestamp).toDate().toISOString() : null;

            return {
                id: doc.id,
                initials: `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}` || 'U',
                name: name,
                username: data.userName,
                createdAt,
                lastActive,
            };
        });
        return usersList;
    } catch (error) {
        console.error("Error fetching chat users:", error);
        return []; // Return empty array on error to prevent crashing the client
    }
}

/**
 * Creates a request for a user to join the referral program.
 */
export async function requestToJoinReferralProgram(input: { userId: string, userName: string, userEmail: string }): Promise<{ success: boolean }> {
    const { userId, userName, userEmail } = input;
    
    // Check if a request already exists for this user
    const existingRequest = await adminDb.collection('referralRequests').where('userId', '==', userId).limit(1).get();
    if (!existingRequest.empty) {
        throw new Error("You have already submitted a request to join the program.");
    }
    
    await adminDb.collection('referralRequests').add({
        userId,
        userName,
        userEmail,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
}


/**
 * Fetches the referral status for a specific user.
 */
export async function getReferralStatus(userId: string): Promise<ReferralStatus> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (userDoc.exists() && userDoc.data()?.referralCode) {
    return { status: 'approved', referralCode: userDoc.data()?.referralCode };
  }

  const requestSnapshot = await adminDb.collection('referralRequests')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!requestSnapshot.empty) {
    const requestData = requestSnapshot.docs[0].data();
    return { status: requestData.status }; // 'pending' or 'rejected'
  }
  
  return { status: 'not_joined' };
}

/**
 * Fetches all pending referral requests for the admin panel.
 */
export async function getReferralRequests(): Promise<ReferralRequest[]> {
    try {
        const snapshot = await adminDb.collection('referralRequests').get();
        const requests = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    userId: data.userId,
                    userName: data.userName,
                    userEmail: data.userEmail,
                    status: data.status,
                    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                };
            })
            .filter(req => req.status === 'pending');

        // Sort by date in descending order (newest first) after fetching
        return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Error fetching referral requests:", error);
        // On failure, return an empty array to prevent the app from crashing.
        return [];
    }
}

/**
 * Updates the status of a referral request (approve/reject).
 */
export async function updateReferralRequestStatus(input: { requestId: string; status: 'approved' | 'rejected' }): Promise<{ success: boolean }> {
    const { requestId, status } = input;
    const requestRef = adminDb.collection('referralRequests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
        throw new Error('Referral request not found.');
    }

    if (status === 'approved') {
        const userId = requestDoc.data()!.userId;
        const referralCode = crypto.randomBytes(4).toString('hex'); // e.g., 'a4f5d6e7'
        
        const userRef = adminDb.collection('users').doc(userId);
        
        await adminDb.runTransaction(async (transaction) => {
            transaction.update(userRef, { referralCode });
            transaction.update(requestRef, { status: 'approved' });
        });
        
    } else { // 'rejected'
        await requestRef.update({ status: 'rejected' });
    }

    return { success: true };
}
