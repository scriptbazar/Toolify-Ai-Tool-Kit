
'use server';

/**
 * @fileOverview Manages user activity logs in Firestore.
 */

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { type UserActivity, type UserActivityDetails, type UserActivityType, type UserLoginHistory } from './user-activity.types';
import { headers } from 'next/headers';

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


/**
 * Logs a user's login event to Firestore.
 * This should be called from the server-side after a successful login.
 */
export async function logUserLogin(userId: string): Promise<{ success: boolean }> {
  if (!userId) return { success: false };

  try {
    const headerList = headers();
    const ip = headerList.get('x-forwarded-for') ?? 'Unknown IP';
    const userAgent = headerList.get('user-agent') ?? 'Unknown Device';
    
    // In a real app, you would use a GeoIP service here.
    const location = 'Unknown Location'; 

    await adminDb.collection('users').doc(userId).collection('loginHistory').add({
      timestamp: FieldValue.serverTimestamp(),
      ipAddress: ip,
      userAgent: userAgent,
      location: location,
      status: 'Success',
    });

    return { success: true };
  } catch (error) {
    console.error(`Could not log login for user ${userId}:`, error);
    return { success: false };
  }
}

/**
 * Fetches the login history for a specific user.
 */
export async function getLoginHistory(userId: string): Promise<UserLoginHistory[]> {
    if (!userId) return [];
    try {
        const historyRef = adminDb.collection('users').doc(userId).collection('loginHistory');
        const snapshot = await historyRef.orderBy('timestamp', 'desc').limit(20).get();

        if (snapshot.empty) return [];
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const timestamp = (data.timestamp as Timestamp)?.toDate()?.toISOString() || new Date().toISOString();
            return {
                id: doc.id,
                timestamp,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                location: data.location,
                status: data.status
            } as UserLoginHistory;
        });

    } catch (error) {
        console.error(`Error fetching login history for user ${userId}:`, error);
        return [];
    }
}
