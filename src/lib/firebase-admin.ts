

/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { AppSettingsSchema, type AppSettings } from '@/ai/flows/settings-management.types';
import { z } from 'zod';
import { getAuth, Auth } from 'firebase-admin/auth';
import serviceAccount from '@/firebase-service-account-key.json';

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

if (getApps().length === 0) {
  try {
    adminApp = initializeApp({
      credential: cert(serviceAccount as ServiceAccount)
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message);
  }
} else {
  adminApp = getApps()[0];
}

adminAuth = getAuth(adminApp!);
adminDb = getFirestore(adminApp!);

export function getAdminDb() {
    return adminDb;
}

export function getAdminAuth() {
    return adminAuth;
}

const SETTINGS_COLLECTION = 'settings';
const MAIN_SETTINGS_DOC_ID = 'main';

export async function getSettingsData(): Promise<AppSettings> {
    const db = getAdminDb();
    if (!db) {
        throw new Error("Firestore Admin DB is not available.");
    }
    try {
        const docRef = db.collection(SETTINGS_COLLECTION).doc(MAIN_SETTINGS_DOC_ID);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const parsedData = AppSettingsSchema.safeParse(docSnap.data());
            if (parsedData.success) {
                return parsedData.data;
            } else {
                console.warn("Firestore settings data is invalid, returning partial valid data.", parsedData.error);
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
