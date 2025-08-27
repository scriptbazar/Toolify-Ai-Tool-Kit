/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin(): App {
  if (!getApps().length) {
    try {
      const serviceAccount: ServiceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
      );
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
       console.error('Firebase Admin SDK initialization error:', error);
       // Fallback for environments where ADC might be expected or for local dev without service account JSON
       return initializeApp();
    }
  }
  return getApps()[0];
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
