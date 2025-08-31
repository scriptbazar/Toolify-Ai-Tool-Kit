/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This function safely initializes Firebase Admin, ensuring credentials are
// correctly formatted, especially the multi-line private key.
function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    const defaultApp = getApps().find(app => app.name === '[DEFAULT]');
    if (defaultApp) return defaultApp;
  }

  const hasCreds = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;
  const hasCredsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  let serviceAccount: ServiceAccount | undefined;

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
    }

    if (serviceAccount) {
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
        throw new Error("Firebase Admin SDK credentials not found in environment variables.");
    }
    
  } catch (error: any) {
    console.warn(`Firebase Admin SDK initialization failed: ${error.message}. Using placeholder credentials for local development. Server-side Firebase features will not work unless configured.`);
    
    // Check if placeholder app already exists to prevent re-initialization errors
    const placeholderAppName = 'placeholder-app-instance-' + Date.now();
    
    const placeholderServiceAccount = {
      projectId: "demo-toolify",
      clientEmail: "demo@example.com",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCpQol0TqgG51e7\nB8fGgqVb1f9b5g3hD/j/k9l7m8n9o0p1q3r5s7t9v/x+y/z/A+B/C+D/E+F/G+H\n/I+J/K+L/M+N/O+P/Q+R/S+T/U+V/W+X/Y+Z/a+b/c+d/e+f/g+h/i+j/k+l/m+n\n/o+p+q+r/s+t+u+v+w+x+y+z/1+2+3+4+5+6+7+8+9/0/A+B/C+D/E+F/G+H\n/I+J/K+L/M+N/O+P/Q+R/S+T/U+V/W+X/Y+Z/a+b/c+d/e+f/g+h/i+j/k+l/m+n\n/o+p+q+r/s+t+u+v+w+x+y+z/1+2+3+4+5+6+7+8+9/0/A+B/C+D/E+F/G+H\n/I+J/K+L/M+N/O+P/Q+R/S+T/U+V/W+X/Y+Z/a+b/c+d/e+f/g+h/i+j/k+l/m+n\n/o+p+q+r/s+t+u+v+w+x+y+z/1+2+3+4+5+6+7+8+9/0/A+B/C+D/E+F/G+H\n/I+J/K+L/M+N/O+P/Q+R/S+T/U+V/W+X/Y+Z/a+b/c+d/e+f/g+h/i+j/k+l/m+n\n/o+p+q+r/s+t+u+v+w+x+y+z/1+2+3+4+5+6+7+8+9/0/A+B/C+D/E+F/G+H\n/I+J/K+L/M+N/O+P/Q+R/S+T/U+V/W+X/Y+Z/a+b/c+d/e+f/g+h/i+j/k+l/m+n\n/o+p+q+r/s+t+u+v+w+x+y+z/1+2+3+4+5+6+7+8+9/0/A+B/C+D/E+F/G+H\n/I+J/K+L/M+N/O+P/Q+R/S+T/U+V/W+X/Y+Z/a+b/c+d/e+f/g+h/i+j/k+l/m+n\n/o+p+q+r/s+t+u+v+w+x+y+z/1+2+3+4+5+6+7+8+9/0/A+B/C+D/E+F/G+H\n/I+J/K+L/M+N/O+P/Q+R/S+T/U+V/W+X/Y+Z/a+b/c+d/e+f/g+h/i+j/k+l/m+n\n/o+p+q+r/s+t+u+v+w+x+y+z/1+2+3+4+5+6+7+8+9/0CAwEAAQ==\n-----END PRIVATE KEY-----\n",
    };
     return initializeApp({
        credential: cert(placeholderServiceAccount),
        projectId: placeholderServiceAccount.projectId,
    }, placeholderAppName);
  }
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };
