/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Placeholder credentials for local development when env vars are not set.
// This allows the server to start, but Firebase Admin features will not work.
const placeholderServiceAccount: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  clientEmail: 'demo@example.com',
  privateKey: '-----BEGIN PRIVATE KEY-----\n-----END PRIVATE KEY-----\n',
};

function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  let serviceAccount: ServiceAccount | undefined;
  let credentialsFound = false;

  // Primary Method: Individual environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };
    credentialsFound = true;
    console.log('Initializing Firebase Admin with individual environment variables.');
  } 
  // Fallback Method: Full GOOGLE_APPLICATION_CREDENTIALS JSON object
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const serviceAccountJson = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      const privateKey = (serviceAccountJson.private_key || '').replace(/\\n/g, '\n');
      serviceAccountJson.private_key = privateKey;
      serviceAccount = serviceAccountJson;
      credentialsFound = true;
      console.log('Initializing Firebase Admin with GOOGLE_APPLICATION_CREDENTIALS.');
    } catch (error) {
      console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS. Using placeholder credentials. Error:', error);
      // Fall through to use placeholder
    }
  }

  if (!credentialsFound) {
    console.warn("Firebase Admin SDK credentials not found. Using placeholder credentials for local development. Server-side Firebase features will not work.");
    serviceAccount = placeholderServiceAccount;
  }
  
  return initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
