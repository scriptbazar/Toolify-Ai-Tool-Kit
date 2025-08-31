
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  // Standard way to initialize: from GOOGLE_APPLICATION_CREDENTIALS
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

      // Firebase Admin SDK needs private_key, not privateKey
      if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      console.log('Initializing Firebase Admin with GOOGLE_APPLICATION_CREDENTIALS.');
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error: any) {
      console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS. Error:', error);
      // Fall through to other methods if parsing fails
    }
  }

  // Fallback for environments that set individual keys (like Vercel)
  const serviceAccountFromVars: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  if (serviceAccountFromVars.projectId && serviceAccountFromVars.clientEmail && serviceAccountFromVars.privateKey) {
    console.log('Initializing Firebase Admin with individual environment variables.');
    return initializeApp({
      credential: cert(serviceAccountFromVars),
    });
  }

  // Last resort: Application Default Credentials (for Google Cloud environments)
  console.warn("Firebase Admin credentials not explicitly set. Falling back to Application Default Credentials. This might fail if your environment is not configured correctly.");
  return initializeApp();
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
