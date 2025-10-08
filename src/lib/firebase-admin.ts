
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { AppSettingsSchema, type AppSettings } from '@/ai/flows/settings-management.types';
import serviceAccount from '@/firebase-service-account-key.json';

let adminApp: App | undefined;

function getInitializedApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp!;
  }
  
  try {
      adminApp = initializeApp({
          credential: cert(serviceAccount as ServiceAccount)
      });
      console.log("Firebase Admin SDK initialized successfully.");
      return adminApp;
  } catch (error: any) {
      console.error("Firebase Admin initialization error:", error.message);
      // This will prevent the app from running if Firebase Admin can't initialize, which is safer.
      throw new Error("Failed to initialize Firebase Admin SDK. Check service account credentials and server environment.");
  }
}

// Firestore and Auth instances are lazy-loaded to ensure the app is initialized first.
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

export function getAdminDb(): Firestore {
    if (!adminDb) {
        adminDb = getFirestore(getInitializedApp());
    }
    return adminDb;
}

export function getAdminAuth(): Auth {
    if (!adminAuth) {
        adminAuth = getAuth(getInitializedApp());
    }
    return adminAuth;
}


const SETTINGS_COLLECTION = 'settings';
const MAIN_SETTINGS_DOC_ID = 'main';

export async function getSettingsData(): Promise<AppSettings> {
    const db = getAdminDb();
    try {
        const docRef = db.collection(SETTINGS_COLLECTION).doc(MAIN_SETTINGS_DOC_ID);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const parsedData = AppSettingsSchema.safeParse(docSnap.data());
            if (parsedData.success) {
                return parsedData.data;
            } else {
                console.warn("Firestore settings data is invalid, returning partial valid data.", parsedData.error.flatten());
                return { ...AppSettingsSchema.parse({}), ...docSnap.data() };
            }
        } else {
           return AppSettingsSchema.parse({});
        }
    } catch (error: any) {
        console.error("Error getting settings from admin DB:", error.message);
        throw new Error("Could not fetch settings from Firestore.");
    }
}
