/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This function safely initializes Firebase Admin, ensuring credentials are
// correctly formatted, especially the multi-line private key.
function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  const hasCreds = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;
  const hasCredsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  let serviceAccount: ServiceAccount;

  try {
    if (hasCreds) {
      // Primary Method: Individual environment variables
      console.log('Initializing Firebase Admin with individual environment variables.');
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      };
    } else if (hasCredsJson) {
      // Fallback Method: Full GOOGLE_APPLICATION_CREDENTIALS JSON object
      console.log('Initializing Firebase Admin with GOOGLE_APPLICATION_CREDENTIALS.');
      const serviceAccountJson = JSON.parse(hasCredsJson);
      // Ensure private_key is correctly formatted with newlines
      serviceAccountJson.private_key = (serviceAccountJson.private_key || '').replace(/\\n/g, '\n');
      serviceAccount = serviceAccountJson;
    } else {
      throw new Error("Firebase Admin SDK credentials not found in environment variables.");
    }
    
    return initializeApp({
      credential: cert(serviceAccount),
    });

  } catch (error: any) {
    console.warn(`Firebase Admin SDK initialization failed: ${error.message}. Using placeholder credentials for local development. Server-side Firebase features will not work unless configured.`);
    const placeholderServiceAccount = {
      projectId: "demo-toolify",
      clientEmail: "demo@example.com",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC39G5s4s/j\nbi2g2aK2i8qGvPwsf5do4g5iE5y3j5k3L5a9i8f7o6e2e5h2d4e4h5j4k3k5k4j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\nj3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3j3\n-----END PRIVATE KEY-----\n",
    };
     return initializeApp({
        credential: cert(placeholderServiceAccount),
        projectId: placeholderServiceAccount.projectId,
    }, 'placeholder-app-instance-' + Date.now()); // Use a unique name to avoid conflicts
  }
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
