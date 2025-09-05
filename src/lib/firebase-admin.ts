
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import serviceAccount from '../../firebase-service-account-key.json';

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  try {
    adminApp = initializeApp({
      credential: cert(serviceAccount as ServiceAccount),
    });
    return adminApp;
  } catch (error: any) {
    console.error("CRITICAL: Firebase Admin SDK initialization failed:", error.message);
    throw error; // Re-throw the error to prevent the app from continuing in a broken state
  }
}

let adminDbInstance: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (adminDbInstance) {
    return adminDbInstance;
  }
  try {
    adminDbInstance = getFirestore(getAdminApp());
    return adminDbInstance;
  } catch (error: any) {
    console.error("CRITICAL: Failed to get Firestore instance. Server-side database features will be disabled.", error);
    throw error;
  }
}

export const adminDb = getAdminDb();
