/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  // Construct the service account from individual environment variables.
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key from an environment variable needs to have its escaped newlines replaced.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Ensure all parts of the service account are present and valid before initializing.
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey && serviceAccount.privateKey.length > 10) {
     return initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
      });
  }

  // If credentials are not fully set or are invalid, log a clear warning and fall back to ADC.
  // This helps in local development where ADC might be configured.
  console.warn("Firebase Admin service account credentials not fully set in environment variables. Falling back to Application Default Credentials. This might fail if not configured.");
  return initializeApp();
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
