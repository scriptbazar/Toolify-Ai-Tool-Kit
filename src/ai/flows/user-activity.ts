
'use server';

/**
 * @fileOverview Manages user activity logs in Firestore.
 */

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export const UserActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.string(),
  timestamp: z.string().datetime(),
});

export type UserActivity = z.infer<typeof UserActivitySchema>;

/**
 * Adds a new activity log for a user.
 * @param userId - The ID of the user.
 * @param action - A description of the action performed.
 * @returns An object indicating success or failure.
 */
export async function addUserActivity(userId: string, action: string): Promise<{ success: boolean }> {
  if (!userId || !action) {
    return { success: false };
  }
  try {
    const activityRef = adminDb.collection('users').doc(userId).collection('activity');
    await activityRef.add({
      action,
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
export async function getUserActivity(userId: string, count = 5): Promise<UserActivity[]> {
  if (!userId) return [];
  try {
    const activityRef = adminDb.collection('users').doc(userId).collection('activity');
    const snapshot = await activityRef.orderBy('timestamp', 'desc').limit(count).get();

    if (snapshot.empty) {
      return [
        {
          id: 'initial-signup',
          userId,
          action: 'Signed up for ToolifyAI',
          timestamp: new Date().toISOString(),
        }
      ];
    }
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = (data.timestamp as Timestamp)?.toDate()?.toISOString() || new Date().toISOString();
        return {
            id: doc.id,
            userId,
            action: data.action,
            timestamp,
        };
    });
  } catch (error) {
    console.error(`Error fetching activity for user ${userId}:`, error);
    return [];
  }
}
