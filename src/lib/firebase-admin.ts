
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { AppSettingsSchema, type AppSettings } from '@/ai/flows/settings-management.types';
import serviceAccount from '../../firebase-service-account-key.json';

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0]!;
  } else {
    adminApp = initializeApp({
      credential: cert(serviceAccount as ServiceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
  }
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (adminDb) {
    return adminDb;
  }
  adminDb = getFirestore(getAdminApp());
  return adminDb;
}

export function getAdminAuth(): Auth {
  if (adminAuth) {
    return adminAuth;
  }
  adminAuth = getAuth(getAdminApp());
  return adminAuth;
}


export function getAdminStorage() {
  return getStorage(getAdminApp());
}

const SETTINGS_COLLECTION = 'settings';
const MAIN_SETTINGS_DOC_ID = 'main';

export async function getSettingsData(): Promise<AppSettings> {
  try {
    const db = getAdminDb();
    const docRef = db.collection(SETTINGS_COLLECTION).doc(MAIN_SETTINGS_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        const parsedData = AppSettingsSchema.safeParse(docSnap.data());
        if (parsedData.success) {
            return parsedData.data;
        } else {
            console.warn("Firestore settings data is invalid, returning partial valid data.", parsedData.error.flatten());
            // Return what is valid, merged with an empty schema to ensure all keys are present.
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
