
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  // Standard way to provide credentials in many environments.
  // The value is a JSON string of the service account.
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error: any) {
      console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS. Falling back to default.', error);
    }
  }

  // Fallback for environments where individual keys are set.
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace escaped newlines with actual newline characters. This is crucial.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
     return initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
      });
  }

  // If credentials are not fully set, log a clear warning and fall back to ADC.
  // This is the default behavior for many Google Cloud services.
  console.warn("Firebase Admin credentials not fully set in environment variables. Falling back to Application Default Credentials. This may fail if your environment is not configured for it (e.g., local development without gcloud CLI).");
  return initializeApp();
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
