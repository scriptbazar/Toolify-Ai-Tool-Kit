
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

// Initialize the app first
getAdminApp();

// Now, it's safe to get the Firestore instance
export const adminDb = getFirestore();

/**
 * @deprecated Use the exported `adminDb` instance instead.
 */
export function getAdminDb(): Firestore {
    return adminDb;
}
