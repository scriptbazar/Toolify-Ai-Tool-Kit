

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
import { AddLeadUserInputSchema, UpdateUserRoleInputSchema, type AddLeadUserInput, type UpdateUserRoleInput, type ReferralRequest, ReferralRequestSchema, type Affiliate, AffiliateSchema } from './user-management.types';
import { adminDb } from '@/lib/firebase-admin';
import crypto from 'crypto';


export async function updateUserRole(input: UpdateUserRoleInput): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    const message = "Firebase Admin is not initialized. Check server environment variables.";
    console.error(message);
    return { success: false, message };
  }
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
  if (!adminDb) {
    const message = "Firebase Admin is not initialized. Check server environment variables.";
    console.error(message);
    return { success: false, message };
  }
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
   if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot fetch emails.");
    return [];
  }
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
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update user activity.");
    return { success: false };
  }
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
    if (!adminDb) {
        console.error("Firebase Admin is not initialized. Cannot fetch chat users.");
        return [];
    }
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
 * Allows a user to request to join the affiliate program.
 * Sets their affiliate status to 'pending'.
 */
export async function requestToJoinAffiliateProgram(userId: string): Promise<{ success: boolean; message: string }> {
    if (!adminDb || !userId) {
        return { success: false, message: 'Invalid user or database connection.' };
    }
    try {
        const userRef = adminDb.collection('users').doc(userId);
        await userRef.update({
            affiliateStatus: 'pending',
            referralRequestDate: FieldValue.serverTimestamp(),
        });
        return { success: true, message: 'Your request has been submitted for review.' };
    } catch (error: any) {
        console.error("Error submitting affiliate request:", error);
        return { success: false, message: 'Could not submit your request. Please try again.' };
    }
}


/**
 * Fetches all users who have a 'pending' affiliate status.
 */
export async function getAffiliateRequests(): Promise<ReferralRequest[]> {
  if (!adminDb) return [];
  try {
    const snapshot = await adminDb.collection('users')
      .where('affiliateStatus', '==', 'pending')
      .get();
      
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return ReferralRequestSchema.parse({
            id: doc.id,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            avatar: data.avatar || `https://i.pravatar.cc/150?u=${data.email}`,
            requestDate: (data.referralRequestDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            status: data.affiliateStatus
        });
    });
  } catch (error) {
    console.error("Error fetching affiliate requests:", error);
    return [];
  }
}

/**
 * Fetches all users who have an 'approved' affiliate status.
 */
export async function getAffiliates(): Promise<Affiliate[]> {
    if (!adminDb) return [];
    try {
        const snapshot = await adminDb.collection('users')
            .where('affiliateStatus', '==', 'approved')
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return AffiliateSchema.parse({
                id: doc.id,
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                avatar: data.avatar || `https://i.pravatar.cc/150?u=${data.email}`,
                // These are placeholders for now
                referrals: data.referrals || 0, 
                earnings: data.earnings || 0.00,
                status: 'Active', 
            });
        });
    } catch (error) {
        console.error("Error fetching affiliates:", error);
        return [];
    }
}

/**
 * Updates a user's affiliate status.
 */
export async function updateAffiliateRequestStatus(userId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean; message: string }> {
  if (!adminDb || !userId) {
    return { success: false, message: 'Invalid user or database connection.' };
  }
  try {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      affiliateStatus: status,
    });
    return { success: true, message: `User affiliate status updated to ${status}.` };
  } catch (error: any) {
    console.error("Error updating affiliate status:", error);
    return { success: false, message: 'Could not update status. Please try again.' };
  }
}


/**
 * Tracks a click on an affiliate link.
 * @param referrerId - The ID of the affiliate user whose link was clicked.
 * @returns An object indicating success or failure.
 */
export async function trackAffiliateClick(referrerId: string): Promise<{ success: boolean; message: string }> {
    if (!adminDb || !referrerId) {
        return { success: false, message: 'Invalid referrer ID or database connection.' };
    }
    try {
        const userRef = adminDb.collection('users').doc(referrerId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return { success: false, message: 'Referrer not found.' };
        }

        // Use FieldValue.increment to atomically increase the click count.
        await userRef.update({
            affiliateClicks: FieldValue.increment(1)
        });

        return { success: true, message: 'Click tracked successfully.' };
    } catch (error: any) {
        console.error(`Error tracking click for referrer ${referrerId}:`, error);
        // It's possible the 'affiliateClicks' field doesn't exist. Let's try setting it to 1 if that's the case.
        if (error.code === 5) { // 'NOT_FOUND' error code, indicating field doesn't exist
             try {
                const userRef = adminDb.collection('users').doc(referrerId);
                await userRef.set({ affiliateClicks: 1 }, { merge: true });
                return { success: true, message: 'Click tracked successfully.' };
            } catch (initError: any) {
                console.error(`Error initializing clicks for referrer ${referrerId}:`, initError);
                return { success: false, message: 'Could not initialize click tracking.' };
            }
        }
        return { success: false, message: 'An unknown error occurred while tracking the click.' };
    }
}
