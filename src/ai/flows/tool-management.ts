
'use server';

/**
 * @fileOverview Manages tools in Firestore.
 */
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { type Tool, ToolSchema, UpsertToolInputSchema } from './tool-management.types';

const TOOLS_COLLECTION = 'tools';

/**
 * Fetches all tools from Firestore, ordered by name.
 * @returns {Promise<Tool[]>} A list of all tools.
 */
export async function getTools(): Promise<Tool[]> {
  try {
    const snapshot = await adminDb.collection(TOOLS_COLLECTION).orderBy('name').get();
    if (snapshot.empty) {
      return [];
    }
    const tools = snapshot.docs.map(doc => {
        const data = doc.data();
        return ToolSchema.parse({ ...data, id: doc.id });
    });
    return tools;
  } catch (error) {
    console.error("Error fetching tools:", error);
    return [];
  }
}

/**
 * Adds or updates a tool in Firestore.
 * @param {Partial<Tool>} toolData - The data for the tool. If an ID is provided, it updates; otherwise, it adds.
 * @returns {Promise<{ success: boolean; message: string; toolId?: string }>}
 */
export async function upsertTool(toolData: Partial<Tool>): Promise<{ success: boolean; message: string; toolId?: string }> {
  try {
    const { id, ...data } = toolData;
    
    // Auto-generate slug from the name if it's a new tool or name is changed
    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    if (id) {
      // Update existing tool
      const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(id);
      await toolRef.update(data);
      return { success: true, message: 'Tool updated successfully.', toolId: id };
    } else {
      // Add new tool
      if (!data.slug) throw new Error("Slug is required for a new tool.");
      const docRef = adminDb.collection(TOOLS_COLLECTION).doc(data.slug);
      await docRef.set({ ...data, createdAt: FieldValue.serverTimestamp() });
      return { success: true, message: 'Tool added successfully.', toolId: docRef.id };
    }
  } catch (error: any) {
    console.error("Error upserting tool:", error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}


/**
 * Deletes a tool from Firestore.
 * @param {string} toolId - The ID of the tool to delete.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function deleteTool(toolId: string): Promise<{ success: boolean; message: string }> {
    if (!toolId) {
        return { success: false, message: 'Tool ID is required.' };
    }
    try {
        await adminDb.collection(TOOLS_COLLECTION).doc(toolId).delete();
        return { success: true, message: 'Tool deleted successfully.' };
    } catch (error: any) {
        console.error(`Error deleting tool ${toolId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}
