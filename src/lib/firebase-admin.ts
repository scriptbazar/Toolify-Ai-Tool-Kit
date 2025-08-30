
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }
  
  // Directly use environment variables to construct the service account object.
  // This is a more direct approach to avoid issues with parsing JSON strings from env vars.
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
     return initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
      });
  }
  
  // Fallback for local development or environments where ADC is preferred.
  console.warn("Firebase Admin credentials not fully set. Falling back to Application Default Credentials.");
  return initializeApp();
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
