
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 * This file handles server-side Firebase connections.
 */
import { initializeApp, getApps, App, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { AppSettingsSchema, type AppSettings } from '@/ai/flows/settings-management.types';
import serviceAccount from '@/firebase-service-account-key.json';

// This function ensures that the Firebase Admin app is initialized only once.
const getAdminApp = (): App => {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    
    return initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
};

export function getAdminDb(): Firestore {
    try {
        return getFirestore(getAdminApp());
    } catch (error: any) {
        console.error("Error getting Firestore instance:", error.message);
        // Fallback or re-throw to make the error obvious during development
        throw new Error("Failed to get Firestore instance. Firebase Admin might not be initialized correctly.");
    }
}

export function getAdminAuth(): Auth {
     try {
        return getAuth(getAdminApp());
    } catch (error: any) {
        console.error("Error getting Auth instance:", error.message);
        throw new Error("Failed to get Auth instance. Firebase Admin might not be initialized correctly.");
    }
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
