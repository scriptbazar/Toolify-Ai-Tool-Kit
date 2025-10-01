
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import serviceAccount from '@/firebase-service-account-key.json';
import { AppSettingsSchema, type AppSettings } from '@/ai/flows/settings-management.types';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';


let adminDb: Firestore;
let adminApp: App;

function initializeAdmin() {
    if (!getApps().length) {
      try {
        adminApp = initializeApp({
          credential: cert(serviceAccount as ServiceAccount),
        });
        adminDb = getFirestore(adminApp);
      } catch (error: any) {
        console.error("Firebase Admin initialization error:", error.message);
        // Avoid crashing the server on initialization failure.
        // Functions calling getAdminDb/getAdminAuth should handle the case where they are null.
      }
    } else {
      adminApp = getApps()[0];
      adminDb = getFirestore(adminApp);
    }
}

// Initialize on module load
initializeAdmin();


export function getAdminDb() {
    if (!adminDb) {
        initializeAdmin();
    }
    return adminDb;
}

export function getAdminAuth() {
    if (!adminApp) {
        initializeAdmin();
    }
    return getAuth(adminApp);
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
                console.warn("Firestore settings data is invalid, returning partial valid data.", parsedData.error);
                // Return what we can, with defaults for the rest.
                return { ...AppSettingsSchema.parse({}), ...docSnap.data() };
            }
        } else {
           // This case should ideally not happen if defaults are set on first write.
           return AppSettingsSchema.parse({});
        }
    } catch (error: any) {
        console.error("Error getting settings from admin DB:", error.message);
        throw new Error("Could not fetch settings from Firestore.");
    }
}
