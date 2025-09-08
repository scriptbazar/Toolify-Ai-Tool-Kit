
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import serviceAccount from '../../firebase-service-account-key.json';

let adminDb: Firestore;

if (!getApps().length) {
  const adminApp = initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
  adminDb = getFirestore(adminApp);
} else {
  adminDb = getFirestore(getApps()[0]);
}

export { adminDb };
