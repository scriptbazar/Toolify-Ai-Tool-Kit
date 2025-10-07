
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { AppSettingsSchema, type AppSettings } from '@/ai/flows/settings-management.types';
import serviceAccount from '@/firebase-service-account-key.json';

// Define a type for our global variable to ensure type safety.
declare global {
  var __firebaseAdminApp__: App | undefined;
}

function getAdminApp(): App {
  if (global.__firebaseAdminApp__) {
    return global.__firebaseAdminApp__;
  }

  if (getApps().length > 0) {
    global.__firebaseAdminApp__ = getApps()[0];
    return global.__firebaseAdminApp__!;
  }

  try {
    const app = initializeApp({
      credential: cert(serviceAccount as ServiceAccount)
    });
    global.__firebaseAdminApp__ = app;
    console.log("Firebase Admin SDK initialized successfully.");
    return app;
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message);
    throw new Error("Failed to initialize Firebase Admin SDK.");
  }
}

let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

export function getAdminDb(): Firestore {
    if (!adminDb) {
        adminDb = getFirestore(getAdminApp());
    }
    return adminDb;
}

export function getAdminAuth(): Auth {
    if (!adminAuth) {
        adminAuth = getAuth(getAdminApp());
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
