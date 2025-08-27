/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin(): App {
  if (!getApps().length) {
    return initializeApp();
  }
  return getApps()[0];
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
