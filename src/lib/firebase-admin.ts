/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  // First, try to build credentials from individual environment variables.
  // This is a more robust method, especially in environments where parsing JSON can be tricky.
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'), // Ensure newlines are correctly formatted
  };

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error: any) {
      console.error('Failed to initialize Firebase Admin with individual environment variables:', error);
      // Fall through to the next method if this fails
    }
  }

  // Second, try the standard GOOGLE_APPLICATION_CREDENTIALS (as JSON string)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const serviceAccountJsonString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const parsedServiceAccount: ServiceAccount = JSON.parse(serviceAccountJsonString);

      if (parsedServiceAccount.private_key) {
        parsedServiceAccount.private_key = parsedServiceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      return initializeApp({
        credential: cert(parsedServiceAccount),
      });
    } catch (error: any) {
      console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS. Falling back to Application Default Credentials.', error);
    }
  }

  // Finally, fall back to Application Default Credentials if no other method works.
  // This is the default for many Google Cloud environments.
  console.warn("Firebase Admin credentials not explicitly set. Falling back to Application Default Credentials. This may fail if your environment is not configured (e.g., local dev without gcloud login).");
  return initializeApp();
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
