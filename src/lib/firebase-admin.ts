

/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { AppSettingsSchema, type AppSettings } from '@/ai/flows/settings-management.types';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '@/firebase-service-account-key.json';

let adminDb: Firestore;
let adminApp: App;

function initializeAdmin() {
    // Check if the app is already initialized to prevent re-initialization error
    if (getApps().length === 0) {
        try {
            console.log("Initializing Firebase Admin SDK...");
            adminApp = initializeApp({
                credential: cert(serviceAccount as ServiceAccount)
            });
            adminDb = getFirestore(adminApp);
            console.log("Firebase Admin SDK initialized successfully.");
        } catch (error: any) {
            console.error("Firebase Admin initialization error:", error.message);
            // In case of error, subsequent calls will try to re-initialize
        }
    } else {
        adminApp = getApps()[0];
        adminDb = getFirestore(adminApp);
    }
}

// Call initialization on module load
initializeAdmin();

export function getAdminDb() {
    if (!adminDb) {
        console.warn("Admin DB not initialized, attempting to re-initialize.");
        initializeAdmin();
    }
    return adminDb;
}

export function getAdminAuth() {
    if (!adminApp) {
        console.warn("Admin App not initialized, attempting to re-initialize.");
        initializeAdmin();
    }
    return getAuth(adminApp);
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
