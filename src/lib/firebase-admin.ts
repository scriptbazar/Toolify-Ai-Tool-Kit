
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
  let credentialsFound = false;

  // Primary method: GOOGLE_APPLICATION_CREDENTIALS environment variable (JSON string)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const serviceAccountJson = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      
      const privateKey = serviceAccountJson.private_key || serviceAccountJson.privateKey;
      if (privateKey) {
        serviceAccountJson.private_key = privateKey.replace(/\\n/g, '\n');
        if (serviceAccountJson.privateKey) {
            delete serviceAccountJson.privateKey;
        }
      }
      
      serviceAccount = serviceAccountJson;
      credentialsFound = true;
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
    credentialsFound = true;
    console.log('Initializing Firebase Admin with individual environment variables.');
  }

  // Development fallback: Use placeholder credentials if none are found.
  // This allows the server to start for UI development but Firestore/Admin features will fail.
  if (!credentialsFound) {
      console.warn("Firebase Admin credentials not found. Using placeholder credentials for development. Server-side Firebase operations will fail.");
      serviceAccount = {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
          clientEmail: 'demo@example.com',
          privateKey: '-----BEGIN PRIVATE KEY-----\\n-----END PRIVATE KEY-----\\n',
      };
  }

  return initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
