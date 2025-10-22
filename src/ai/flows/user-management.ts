
'use server';

/**
 * @fileOverview Manages user data in Firestore.
 *
 * - updateUserRole - A function that updates a user's role in the database.
 * - getAllEmails - Fetches all unique emails from both users and leads collections.
 * - updateUserActivity - Updates the last active timestamp for a user.
 */

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase-admin';
import { 
    UpdateUserRoleInputSchema, 
    type UpdateUserRoleInput,
} from './user-management.schemas';

const UserProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  userName: z.string().min(3, 'Username must be at least 3 characters.'),
  mobileNumber: z.string().optional(),
  countryCode: z.string().optional(),
  enable2FA: z.boolean().optional(),
  twoFactorAuthMethods: z.object({
    email: z.boolean().optional(),
    authenticatorApp: z.boolean().optional(),
    mobileNumber: z.boolean().optional(),
  }).optional(),
});

export async function updateUserProfile(userId: string, profileData: any): Promise<{ success: boolean; message: string }> {
  const adminDb = getAdminDb();
  if (!adminDb || !userId) {
    return { success: false, message: 'Invalid user or database connection.' };
  }
  try {
    const validatedData = UserProfileUpdateSchema.parse(profileData);
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update(validatedData);
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
     if (error.name === 'ZodError') {
      return { success: false, message: `Validation error: ${error.errors.map((e: any) => e.message).join(', ')}` };
    }
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}

export async function updateUserRole(input: UpdateUserRoleInput): Promise<{ success: boolean; message: string }> {
  const adminDb = getAdminDb();
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
    if (error.name === 'ZodError') {
      return { success: false, message: `Validation error: ${error.errors.map((e: any) => e.message).join(', ')}` };
    }
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}

export async function getAllEmails(): Promise<{ id: string, name: string, email: string; userName?: string; role?: 'admin' | 'user'; source: string; date: string }[]> {
   const adminDb = getAdminDb();
   if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot fetch emails.");
    return [];
  }
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const leadsSnapshot = await adminDb.collection('leads').get();
    const commentsSnapshot = await adminDb.collection('comments').get();

    const emailMap = new Map<string, { id: string; name: string; userName?: string; role?: 'admin' | 'user'; source: string; date: string }>();

    const processDoc = (doc: FirebaseFirestore.QueryDocumentSnapshot, source: 'Signup' | 'Lead' | 'Comment') => {
      const data = doc.data();
      const email = data.email || (source === 'Comment' ? data.authorEmail : undefined);
      
      if (!email || typeof email !== 'string') return;

      const existing = emailMap.get(email);
      const isSignup = source === 'Signup';
      // Prioritize 'Signup' source over others
      if (existing && existing.source === 'Signup' && !isSignup) return;


      const timestamp = data.createdAt || data.submittedOn;
      let dateString: string;

      if (timestamp && typeof timestamp.toDate === 'function') {
        dateString = timestamp.toDate().toISOString();
      } else if (timestamp instanceof Date) {
        dateString = timestamp.toISOString();
      } else {
        dateString = new Date().toISOString();
      }
      
      const name = isSignup ? `${data.firstName || ''} ${data.lastName || ''}`.trim() : data.name || data.authorName || 'Unknown';

      emailMap.set(email, { 
          id: doc.id,
          name: name,
          userName: data.userName,
          role: data.role,
          source, 
          date: dateString 
        });
    };
    
    usersSnapshot.forEach(doc => processDoc(doc, 'Signup'));
    leadsSnapshot.forEach(doc => processDoc(doc, 'Lead'));
    commentsSnapshot.forEach(doc => processDoc(doc, 'Comment'));

    const allEmails = Array.from(emailMap.entries()).map(([email, data]) => ({
      email,
      ...data
    }));

    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return allEmails;
  } catch (error: any) {
    console.error("Error fetching all emails:", error);
    return [];
  }
}


/**
 * Updates the last active timestamp for a given user.
 * @param userId - The ID of the user to update.
 * @returns An object indicating success or failure.
 */
export async function updateUserActivity(userId: string): Promise<{ success: boolean }> {
  const adminDb = getAdminDb();
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
 * Allows a user to request to join the affiliate program.
 * Sets their affiliate status to 'pending'.
 */
export async function requestToJoinAffiliateProgram(userId: string): Promise<{ success: boolean; message: string }> {
    const adminDb = getAdminDb();
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
export async function getAffiliateRequests(): Promise<any[]> {
  const adminDb = getAdminDb();
  if (!adminDb) return [];
  try {
    const snapshot = await adminDb.collection('users')
      .where('affiliateStatus', '==', 'pending')
      .get();
      
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            avatar: data.avatar || `https://i.pravatar.cc/150?u=${data.email}`,
            requestDate: (data.referralRequestDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            status: data.affiliateStatus
        };
    });
  } catch (error) {
    console.error("Error fetching affiliate requests:", error);
    return [];
  }
}

/**
 * Fetches all users who have an 'approved' affiliate status.
 */
export async function getAffiliates(): Promise<any[]> {
    const adminDb = getAdminDb();
    if (!adminDb) return [];
    try {
        const snapshot = await adminDb.collection('users')
            .where('affiliateStatus', '==', 'approved')
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                avatar: data.avatar || `https://i.pravatar.cc/150?u=${data.email}`,
                // These are placeholders for now
                referrals: data.referrals || 0, 
                earnings: data.earnings || 0.00,
                status: 'Active', 
            };
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
  const adminDb = getAdminDb();
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
    const adminDb = getAdminDb();
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


/**
 * Deletes a user from Firestore. This is a permanent action.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<{ success: boolean; message: string }>} Result of the operation.
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  const adminDb = getAdminDb();
  if (!adminDb || !userId) {
    return { success: false, message: 'Invalid user or database connection.' };
  }
  try {
    await adminDb.collection('users').doc(userId).delete();
    // Note: This does not delete the user from Firebase Authentication.
    // A more complete solution would also involve deleting the user from Auth,
    // which requires higher privileges and is often handled separately.
    return { success: true, message: 'User deleted from database successfully.' };
  } catch (error: any) {
    console.error(`Error deleting user ${userId}:`, error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
