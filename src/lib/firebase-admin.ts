
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
      const serviceAccountJson = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      // The private key inside the JSON also needs its newlines fixed
      if (serviceAccountJson.private_key) {
        serviceAccountJson.private_key = serviceAccountJson.private_key.replace(/\\n/g, '\n');
      }
      
      return initializeApp({
        credential: cert(serviceAccountJson),
      });
    } catch (error: any) {
      console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS. Falling back to Application Default Credentials.', error);
    }
  }

  // If credentials are not fully set, log a clear warning and fall back to ADC.
  // This is the default behavior for many Google Cloud services.
  console.warn("Firebase Admin credentials not set via GOOGLE_APPLICATION_CREDENTIALS. Falling back to Application Default Credentials. This may fail if your environment is not configured for it (e.g., local development without gcloud CLI).");
  return initializeApp();
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
