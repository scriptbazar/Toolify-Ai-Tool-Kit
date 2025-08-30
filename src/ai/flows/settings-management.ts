
'use server';

/**
 * @fileOverview Manages application settings in Firestore.
 *
 * - getSettings - Retrieves the entire settings document.
 * - updateSettings - Updates the settings document with new values.
 */

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { AppSettingsSchema, type AppSettings } from './settings-management.types';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_COLLECTION = 'settings';
const MAIN_SETTINGS_DOC_ID = 'main';

/**
 * Retrieves the application settings from Firestore.
 * If no settings exist, it returns the default values defined in the schema.
 * @returns {Promise<AppSettings>} The application settings.
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(MAIN_SETTINGS_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists()) {
      // Validate data against schema, falling back to defaults if fields are missing
      const parsedData = AppSettingsSchema.safeParse(docSnap.data());
      if (parsedData.success) {
        return parsedData.data;
      } else {
        // This case handles situations where the data in Firestore is malformed.
        // It returns default settings to prevent the app from crashing.
        console.warn("Firestore settings data is invalid, returning defaults.", parsedData.error);
        return AppSettingsSchema.parse({}); 
      }
    } else {
      // If the document doesn't exist, return the default settings.
      return AppSettingsSchema.parse({});
    }
  } catch (error: any) {
    console.error("Error getting settings:", error.message);
    // On error, return default settings to ensure app stability.
    return AppSettingsSchema.parse({});
  }
}

/**
 * Updates the application settings in Firestore and writes API keys to .env.local.
 * It performs a deep merge to only update the provided fields in Firestore.
 * @param {AppSettings} newSettings - The new settings values to save.
 * @returns {Promise<{ success: boolean; message: string }>} Result of the operation.
 */
export async function updateSettings(newSettings: AppSettings): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Fetch the current settings from Firestore.
    const currentSettings = await getSettings();

    // 2. Perform a deep merge of current settings with new settings.
    const mergedSettings = {
        ...currentSettings,
        ...newSettings,
        general: { ...currentSettings.general, ...newSettings.general },
        referral: { ...currentSettings.referral, ...newSettings.referral },
        advertisement: { ...currentSettings.advertisement, ...newSettings.advertisement },
        plan: { ...currentSettings.plan, ...newSettings.plan },
        payment: { ...currentSettings.payment, ...newSettings.payment },
        page: { ...currentSettings.page, ...newSettings.page },
    };

    // 3. Validate the merged data to ensure it conforms to the schema.
    const validatedSettings = AppSettingsSchema.parse(mergedSettings);
    
    // 4. Save the fully merged and validated settings to Firestore.
    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(MAIN_SETTINGS_DOC_ID);
    await docRef.set(validatedSettings, { merge: true });
    
    // 5. Write API keys to .env.local if they exist
    const geminiApiKey = validatedSettings.general?.apiKeys?.gemini;
    if (geminiApiKey) {
      const envLocalPath = path.resolve(process.cwd(), '.env.local');
      let envContent = '';
      try {
        envContent = await fs.readFile(envLocalPath, 'utf-8');
      } catch (e: any) {
        if (e.code !== 'ENOENT') throw e; // Ignore if file doesn't exist
      }

      const key = 'GEMINI_API_KEY';
      const value = geminiApiKey;

      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
      
      await fs.writeFile(envLocalPath, envContent.trim());
    }

    return { success: true, message: 'Settings updated successfully.' };
  } catch (error: any) {
    console.error("Error updating settings:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, message: error.message || 'An unknown error occurred while updating settings.' };
  }
}
