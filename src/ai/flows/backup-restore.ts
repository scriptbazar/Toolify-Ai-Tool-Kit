
'use server';

/**
 * @fileOverview Manages Firestore backup and restore operations using Google Cloud services.
 */

import { FirestoreAdminClient } from '@google-cloud/firestore';
import type { BackupInfo } from './backup-restore.types';

const firestoreAdminClient = new FirestoreAdminClient();
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const bucketName = `gs://${projectId}-backups`;


/**
 * Creates a new backup of specified Firestore collections.
 * @param {'all' | 'users' | 'settings'} type - The type of backup to create.
 * @returns A promise resolving to an object indicating success or failure.
 */
export async function createBackup(type: 'all' | 'users' | 'settings'): Promise<{ success: boolean; message: string }> {
    if (!projectId) {
        return { success: false, message: "Firebase Project ID is not configured." };
    }

    const databasePath = firestoreAdminClient.databasePath(projectId, '(default)');
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const outputUriPrefix = `${bucketName}/${type}_${timestamp}`;

    let collections: string[] = [];
    if (type === 'users') {
        collections = ['users', 'leads'];
    } else if (type === 'settings') {
        collections = ['settings'];
    }

    try {
        const [operation] = await firestoreAdminClient.exportDocuments({
            name: databasePath,
            outputUriPrefix,
            collectionIds: collections.length > 0 ? collections : [], // Empty array means all collections
        });
        
        console.log(`Backup operation started: ${operation.name}`);
        // Note: The operation runs in the background. We don't wait for it to complete here.
        return { success: true, message: `Backup process initiated successfully. It may take a few minutes to complete.` };

    } catch (error: any) {
        console.error("Error creating backup:", error);
        return { success: false, message: error.message || 'An unknown error occurred while creating the backup.' };
    }
}

/**
 * Fetches a list of all available backups from Google Cloud Storage.
 * @returns A promise resolving to an array of backup information.
 */
export async function getBackups(): Promise<BackupInfo[]> {
    try {
        const { Storage } = await import('@google-cloud/storage');
        const storage = new Storage({ projectId });
        const [files] = await storage.bucket(bucketName.replace('gs://', '')).getFiles();
        
        // This is a simplified listing. Real backups create a metadata file.
        // We will look for these `.overall_export_metadata` files.
        const backupMetadataFiles = files.filter(file => file.name.endsWith('.overall_export_metadata'));

        const backupInfos = backupMetadataFiles.map(file => {
            return {
                id: file.name.replace('.overall_export_metadata', ''),
                updated: file.metadata.updated,
            };
        });

        // Sort by date, newest first
        backupInfos.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
        
        return backupInfos;
    } catch (error: any) {
        // Handle case where bucket doesn't exist
        if (error.code === 404) {
            console.warn(`Backup bucket "${bucketName}" not found. Returning empty list.`);
            return [];
        }
        console.error("Error fetching backups:", error);
        throw new Error("Could not retrieve backup list from Cloud Storage.");
    }
}

/**
 * Deletes a backup from Google Cloud Storage.
 * @param {string} backupId - The full path/ID of the backup to delete.
 * @returns A promise resolving to an object indicating success or failure.
 */
export async function deleteBackup(backupId: string): Promise<{ success: boolean, message: string }> {
    try {
        const { Storage } = await import('@google-cloud/storage');
        const storage = new Storage({ projectId });
        const bucket = storage.bucket(bucketName.replace('gs://', ''));

        // GCS exports create a folder-like structure. We need to delete all files with that prefix.
        await bucket.deleteFiles({ prefix: backupId });
        
        console.log(`Successfully deleted backup with prefix: ${backupId}`);
        return { success: true, message: 'Backup deleted successfully.' };
    } catch (error: any) {
        console.error(`Error deleting backup ${backupId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred while deleting the backup.' };
    }
}

/**
 * Initiates a restore operation from a specified backup.
 * @param {string} backupId - The ID of the backup to restore from.
 * @returns A promise resolving to an object indicating success or failure.
 */
export async function restoreBackup(backupId: string): Promise<{ success: boolean; message: string }> {
     if (!projectId) {
        return { success: false, message: "Firebase Project ID is not configured." };
    }

    const databasePath = firestoreAdminClient.databasePath(projectId, '(default)');
    const inputUriPrefix = `${bucketName}/${backupId}`;

    try {
        const [operation] = await firestoreAdminClient.importDocuments({
            name: databasePath,
            inputUriPrefix,
            // To restore all collections from the backup, leave collectionIds empty.
            collectionIds: [],
        });
        
        console.log(`Restore operation started: ${operation.name}`);
        return { success: true, message: `Restore process initiated successfully. It may take several minutes to complete.` };

    } catch (error: any) {
        console.error("Error restoring backup:", error);
        return { success: false, message: error.message || 'An unknown error occurred while restoring the backup.' };
    }
}
