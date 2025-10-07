
'use server';

/**
 * @fileOverview Manages user activity logs in Firestore.
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { type UserActivity, type UserActivityDetails, type UserActivityType, type UserLoginHistory } from './user-activity.types';


export type ToolUsageStat = {
    toolName: string;
    count: number;
};

export type RecentToolActivity = {
    id: string;
    toolName: string;
    userId: string;
    userName: string;
    timestamp: string;
};

export type AdminActivityLogItem = {
    id: string;
    userId: string;
    userName: string;
    type: UserActivityType;
    details: UserActivityDetails;
    timestamp: string;
}


/**
 * Adds a new activity log for a user with a 15-day expiration date.
 * @param userId - The ID of the user.
 * @param type - The type of activity performed.
 * @param details - An object containing details about the action.
 * @returns An object indicating success or failure.
 */
export async function addUserActivity(userId: string, type: UserActivityType, details: UserActivityDetails): Promise<{ success: boolean }> {
  const adminDb = getAdminDb();
  if (!userId || !type || !details) {
    return { success: false };
  }
  try {
    const activityRef = adminDb.collection('users').doc(userId).collection('activity');
    
    // Set an expiration date 15 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);

    await activityRef.add({
      type,
      details,
      timestamp: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
    return { success: true };
  } catch (error) {
    console.error(`Could not add activity for user ${userId}:`, error);
    return { success: false };
  }
}

/**
 * Fetches the most recent activities for a user after cleaning up expired entries.
 * @param userId - The ID of the user.
 * @param count - The number of activities to fetch.
 * @returns A promise that resolves to an array of user activities.
 */
export async function getUserActivity(userId: string, count = 100): Promise<UserActivity[]> {
  const adminDb = getAdminDb();
  if (!userId) return [];
  try {
    const activityRef = adminDb.collection('users').doc(userId).collection('activity');
    const now = new Date();

    // --- Cleanup Expired Activities ---
    const expiredQuery = activityRef.where('expiresAt', '<=', now);
    const expiredSnapshot = await expiredQuery.get();
    if (!expiredSnapshot.empty) {
        const batch = adminDb.batch();
        expiredSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Cleaned up ${expiredSnapshot.size} expired activities for user ${userId}.`);
    }

    // --- Fetch Remaining Activities ---
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
  const adminDb = getAdminDb();
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
    
    await addUserActivity(userId, 'login', { name: 'User logged in' });

    // Revalidate the cache for the entire site to ensure the new session is picked up
    revalidatePath('/', 'layout');

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
    const adminDb = getAdminDb();
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


/**
 * Fetches and aggregates tool usage statistics.
 */
export async function getToolUsageStats(): Promise<ToolUsageStat[]> {
    const adminDb = getAdminDb();
    if (!adminDb) return [];
    try {
        const activitySnapshot = await adminDb.collectionGroup('activity').where('type', '==', 'tool_usage').get();
        
        const stats: { [key: string]: number } = {};
        
        activitySnapshot.forEach(doc => {
            const toolName = doc.data().details.name;
            if (toolName) {
                stats[toolName] = (stats[toolName] || 0) + 1;
            }
        });

        return Object.entries(stats)
            .map(([toolName, count]) => ({ toolName, count }))
            .sort((a, b) => b.count - a.count);

    } catch (error) {
        console.error("Error fetching tool usage stats:", error);
        return [];
    }
}

/**
 * Fetches the most recent tool usage activities.
 */
export async function getRecentToolActivity(count = 20): Promise<RecentToolActivity[]> {
    const adminDb = getAdminDb();
    if (!adminDb) return [];
    try {
        const activitySnapshot = await adminDb.collectionGroup('activity')
            .where('type', '==', 'tool_usage')
            .orderBy('timestamp', 'desc')
            .limit(count)
            .get();
        
        if (activitySnapshot.empty) return [];
        
        // Fetch user data in parallel to avoid multiple awaits in a loop
        const userIds = [...new Set(activitySnapshot.docs.map(doc => doc.ref.parent.parent!.id))];
        const userDocs = await Promise.all(userIds.map(id => adminDb.collection('users').doc(id).get()));
        const userMap = new Map(userDocs.map(doc => [doc.id, doc.data()]));

        return activitySnapshot.docs.map(doc => {
            const data = doc.data();
            const userId = doc.ref.parent.parent!.id;
            const user = userMap.get(userId);
            
            return {
                id: doc.id,
                toolName: data.details.name,
                userId: userId,
                userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            };
        });

    } catch (error) {
        console.error("Error fetching recent tool activity:", error);
        return [];
    }
}


/**
 * Fetches a log of all important admin-relevant activities across all users.
 * Also handles cleanup of expired activities.
 */
export async function getAdminActivityLog(): Promise<AdminActivityLogItem[]> {
    const adminDb = getAdminDb();
    if (!adminDb) return [];
    
    try {
        const now = new Date();
        const activityQuery = adminDb.collectionGroup('activity')
            .where('type', 'in', ['tool_usage', 'login', 'logout', 'account_update']);

        // First, handle deletion of expired documents
        const expiredQuery = activityQuery.where('expiresAt', '<=', now);
        const expiredSnapshot = await expiredQuery.get();
        
        if (!expiredSnapshot.empty) {
            const batch = adminDb.batch();
            expiredSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Cleaned up ${expiredSnapshot.size} expired activities.`);
        }
        
        // Then, fetch the latest activities
        const finalQuery = activityQuery.orderBy('timestamp', 'desc');
        const activitySnapshot = await finalQuery.get();
        
        if (activitySnapshot.empty) return [];
        
        const userIds = [...new Set(activitySnapshot.docs.map(doc => doc.ref.parent.parent!.id))];
        const userDocs = await Promise.all(userIds.map(id => adminDb.collection('users').doc(id).get()));
        const userMap = new Map(userDocs.map(doc => doc.exists ? [doc.id, doc.data()] : [doc.id, null]));

        return activitySnapshot.docs.map(doc => {
            const data = doc.data();
            const userId = doc.ref.parent.parent!.id;
            const user = userMap.get(userId);
            
            return {
                id: doc.id,
                userId: userId,
                userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                type: data.type,
                details: data.details,
                timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            };
        });

    } catch (error) {
        console.error("Error fetching admin activity log:", error);
        return [];
    }
}

    