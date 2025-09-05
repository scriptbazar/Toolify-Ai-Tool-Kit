
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
// The service account key is imported directly from the JSON file.
// Ensure this file is present and correctly configured.
import serviceAccount from '../../firebase-service-account-key.json';

let adminDb: Firestore;

// Check if Firebase Admin SDK has already been initialized.
if (!getApps().length) {
  try {
    // Initialize the app with service account credentials.
    initializeApp({
      credential: cert(serviceAccount as ServiceAccount),
    });
  } catch (error: any) {
     // This error is critical for server functionality, so we log it.
     // In a real production environment, you might use a more robust logging service.
    console.error("CRITICAL: Firebase Admin SDK initialization failed:", error.message);
  }
}

// Get the Firestore instance from the initialized app.
// This will be undefined if initialization failed.
try {
    adminDb = getFirestore();
} catch (error: any) {
     console.error("CRITICAL: Failed to get Firestore instance. Server-side database features will be disabled.", error);
}

export { adminDb };
