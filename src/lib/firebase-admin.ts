
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import serviceAccount from '../../firebase-service-account-key.json';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

// This block will be executed when the module is imported.
if (!getApps().length) {
    console.log("Initializing Firebase Admin SDK...");
    try {
        adminApp = initializeApp({
            credential: cert(serviceAccount as any)
        });
        adminDb = getFirestore(adminApp);
    } catch (error: any) {
        console.error("Firebase Admin SDK initialization failed:", error.message);
        // Fallback to undefined if initialization fails
        adminApp = undefined;
        adminDb = undefined;
    }
} else {
    adminApp = getApps()[0];
    adminDb = getFirestore(adminApp);
}

if (!adminDb) {
    console.warn(
      "Firebase Admin SDK could not be initialized. " +
      "Server-side Firebase features will not be available."
    );
}


export { adminDb };
