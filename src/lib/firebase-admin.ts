
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

const hasCreds = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

try {
  const existingApp = getApps().find(app => app.name === '[DEFAULT]');
  if (existingApp) {
    adminApp = existingApp;
  } else if (hasCreds) {
    console.log("Initializing Firebase Admin SDK with environment variables.");
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      // Replace escaped newlines from environment variables
      privateKey: (process.env.FIREBASE_PRIVATE_KEY!).replace(/\\n/g, '\n'),
    };

    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    console.warn(
      "Firebase Admin SDK credentials not found in environment variables. " +
      "Server-side Firebase features will not be available. " +
      "To use them, please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }
} catch (error: any) {
  console.error("Firebase Admin SDK initialization failed:", error.message);
}

if (adminApp) {
  adminDb = getFirestore(adminApp);
} else {
  // If initialization fails or is skipped, adminDb will be undefined.
  // Code using adminDb should handle this case gracefully.
  adminDb = undefined;
}

export { adminDb };
