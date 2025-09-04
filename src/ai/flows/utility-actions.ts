
'use server';

/**
 * @fileOverview Contains server actions for general site utilities.
 */

import { revalidatePath } from 'next/cache';

/**
 * Clears the Next.js data cache for the entire application.
 * This is useful for ensuring that changes to settings or content
 * are immediately visible to all users.
 * @returns {Promise<{ success: boolean; message: string }>} Result of the operation.
 */
export async function clearCache(): Promise<{ success: boolean; message: string }> {
  try {
    // Revalidates all paths in the application.
    // The 'layout' type ensures that both the data cache and the Full Route Cache are cleared.
    revalidatePath('/', 'layout');
    
    return { success: true, message: 'Cache cleared successfully.' };
  } catch (error: any) {
    console.error("Error clearing cache:", error);
    return { success: false, message: 'An error occurred while clearing the cache.' };
  }
}
