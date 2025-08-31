
'use server';

/**
 * @fileOverview Manages user activity logs in Firestore.
 */

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { type UserActivity, type UserActivityDetails, type UserActivityType } from './user-activity.types';

/**
 * Adds a new activity log for a user.
 * @param userId - The ID of the user.
 * @param type - The type of activity performed.
 * @param details - An object containing details about the action.
 * @returns An object indicating success or failure.
 */
export async function addUserActivity(userId: string, type: UserActivityType, details: UserActivityDetails): Promise<{ success: boolean }> {
  if (!userId || !type || !details) {
    return { success: false };
  }
  try {
    const activityRef = adminDb.collection('users').doc(userId).collection('activity');
    await activityRef.add({
      type,
      details,
      timestamp: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error(`Could not add activity for user ${userId}:`, error);
    return { success: false };
  }
}

/**
 * Fetches the most recent activities for a user.
 * @param userId - The ID of the user.
 * @param count - The number of activities to fetch.
 * @returns A promise that resolves to an array of user activities.
 */
export async function getUserActivity(userId: string, count = 25): Promise<UserActivity[]> {
  if (!userId) return [];
  try {
    const activityRef = adminDb.collection('users').doc(userId).collection('activity');
    const snapshot = await activityRef.orderBy('timestamp', 'desc').limit(count).get();

    if (snapshot.empty) {
      // Create a default "Signed Up" activity if none exists.
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const createdAt = (userDoc.data()?.createdAt as Timestamp)?.toDate() || new Date();
      
      return [
        {
          id: 'initial-signup',
          userId,
          type: 'account_update',
          details: { name: 'Account created' },
          timestamp: createdAt.toISOString(),
        }
      ];
    }
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = (data.timestamp as Timestamp)?.toDate()?.toISOString() || new Date().toISOString();
        return {
            id: doc.id,
            userId,
            type: data.type,
            details: data.details,
            timestamp,
        } as UserActivity;
    });
  } catch (error) {
    console.error(`Error fetching activity for user ${userId}:`, error);
    return [];
  }
}
