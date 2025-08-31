
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  let serviceAccount: ServiceAccount | undefined;

  // Primary method: GOOGLE_APPLICATION_CREDENTIALS environment variable (JSON string)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const serviceAccountJson = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      // Firebase Admin SDK expects private_key, but some environments provide privateKey
      if (serviceAccountJson.privateKey) {
        serviceAccountJson.private_key = serviceAccountJson.privateKey.replace(/\\n/g, '\n');
        delete serviceAccountJson.privateKey;
      } else if (serviceAccountJson.private_key) {
        serviceAccountJson.private_key = serviceAccountJson.private_key.replace(/\\n/g, '\n');
      }
      serviceAccount = serviceAccountJson;
      console.log('Initializing Firebase Admin with GOOGLE_APPLICATION_CREDENTIALS.');
    } catch (error) {
      console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS. Error:', error);
      // Fall through to the next method
    }
  }

  // Fallback method: Individual environment variables
  if (!serviceAccount && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };
    console.log('Initializing Firebase Admin with individual environment variables.');
  }

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }
  
  // If no credentials are provided, we cannot initialize the admin app.
  throw new Error(
    'Firebase Admin SDK credentials not found. Please set GOOGLE_APPLICATION_CREDENTIALS or the individual FIREBASE_* environment variables.'
  );
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
