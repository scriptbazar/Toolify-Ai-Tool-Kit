/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  // If standard Google credentials are provided, use them.
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp();
  }
  
  // Otherwise, construct the service account from individual environment variables.
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Ensure all parts of the service account are present before initializing.
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
     return initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
      });
  }

  // If credentials are not fully set, log a clear warning and fall back to ADC.
  // This helps in local development where ADC might be configured.
  console.warn("Firebase Admin service account credentials not fully set in environment variables. Falling back to Application Default Credentials. This might fail if not configured.");
  return initializeApp();
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
