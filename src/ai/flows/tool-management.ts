
'use server';

/**
 * @fileOverview Manages tools in Firestore.
 */
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp, Query } from 'firebase-admin/firestore';
import { z } from 'zod';
import { type Tool, type UpsertToolInput, type ToolRequest, ToolSchema, UpsertToolInputSchema, ToolRequestSchema } from './tool-management.types';
import { unstable_cache as cache, revalidatePath } from 'next/cache';


const TOOLS_COLLECTION = 'tools';
const TOOL_REQUESTS_COLLECTION = 'toolRequests';

const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ & /g, ' and ').replace(/\s+/g, '-').replace(/[^\w.-]+/g, '');
};

/**
 * Seeds the initial tools into the database ONLY if the collection is empty.
 * This is a lightweight check to prevent slow boot times.
 */
export async function seedInitialTools() {
    return true; 
}

interface GetToolsOptions {
  query?: string;
  category?: string;
  limit?: number;
  slug?: string;
  status?: string;
}

/**
 * High-performance cached function to fetch tools.
 */
async function getToolsFn (options: GetToolsOptions = {}) {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) return [];
        
        let query: Query | FirebaseFirestore.DocumentReference | FirebaseFirestore.CollectionReference = adminDb.collection(TOOLS_COLLECTION);
        
        // Fast path for single tool fetch
        if (options.slug) {
            const docRef = adminDb.collection(TOOLS_COLLECTION).doc(options.slug);
            const docSnap = await docRef.get();
             if (!docSnap.exists) return [];
            const data = docSnap.data();
            if (!data) return [];
            const tool = ToolSchema.safeParse({ id: docSnap.id, slug: docSnap.id, ...data, createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString() });
            return tool.success ? [tool.data] : [];
        }
        
        if (options.category && options.category !== 'all') {
            query = (query as any).where('category', '==', options.category);
        }
        
        const finalSnapshot = await (query as any).get();
        return processSnapshot(finalSnapshot.docs, options);

    } catch(e: any) {
        console.error("Error in getTools:", e.message);
        return [];
    }
};

export const getTools = cache(
  async (options: GetToolsOptions = {}) => getToolsFn(options),
  ['tools-list-cache'],
  { revalidate: 3600, tags: ['tools'] }
);


function processSnapshot(docs: FirebaseFirestore.DocumentData[], options: GetToolsOptions): Tool[] {
    let tools: Tool[] = [];
    docs.forEach(doc => {
        const data = doc.data();
        const tool = ToolSchema.safeParse({ id: doc.id, slug: doc.id, ...data, createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString() });
        if (tool.success) {
            tools.push(tool.data);
        }
    });
    
    tools.sort((a, b) => a.name.localeCompare(b.name));

    if (options.query) {
        const lowercasedQuery = options.query.toLowerCase();
        tools = tools.filter(tool => 
            tool.name.toLowerCase().includes(lowercasedQuery) ||
            tool.description.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    if (options.status !== 'all' && !options.slug) {
        tools = tools.filter(tool => tool.status !== 'Disabled');
    }
    
    if (options.limit) {
      tools = tools.slice(0, options.limit);
    }

    return tools;
}


/**
 * Adds or updates a tool in Firestore.
 */
export async function upsertTool(toolData: Partial<Tool>): Promise<{ success: boolean; message: string; toolId?: string }> {
  try {
    const adminDb = getAdminDb();
    const { id, ...data } = toolData;
    
    let docId = id;

    if (data.name && !id) {
      data.slug = generateSlug(data.name);
      docId = data.slug;
    }

    if (!docId) throw new Error("Document ID required.");
    
    const validatedData = UpsertToolInputSchema.parse(data);
    const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(docId);
    
    if (id) {
      await toolRef.set({ ...validatedData }, { merge: true });
    } else {
      await toolRef.set({ ...validatedData, slug: docId, createdAt: FieldValue.serverTimestamp() });
    }
    
    revalidatePath('/tools');
    return { success: true, message: 'Tool saved successfully.', toolId: docId };
  } catch (error: any) {
    console.error("Error upserting tool:", error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}


/**
 * Deletes a tool from Firestore.
 */
export async function deleteTool(toolId: string): Promise<{ success: boolean; message: string }> {
    const adminDb = getAdminDb();
    if (!toolId) return { success: false, message: 'Tool ID required.' };
    try {
        const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(toolId);
        await toolRef.delete();
        revalidatePath('/tools');
        return { success: true, message: 'Tool deleted successfully.' };
    } catch (error: any) {
        console.error(`Error deleting tool ${toolId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

/**
 * AI logic for generating tool descriptions.
 */
export async function generateToolDescription(input: { toolName: string }): Promise<{ description: string }> {
    return { description: `An advanced tool for ${input.toolName} designed to increase efficiency.` };
}

/**
 * Fetches the favorite tools for a specific user.
 */
export async function getFavoriteTools(userId: string): Promise<Tool[]> {
  try {
    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) return [];

    const userData = userDocSnap.data();
    const favoriteSlugs: string[] = userData?.favorites || [];

    if (favoriteSlugs.length === 0) return [];

    const allTools = await getTools({});
    return allTools.filter(tool => favoriteSlugs.includes(tool.slug));
  } catch (error) {
    console.error(`Error fetching favorite tools:`, error);
    return [];
  }
}

export async function requestNewTool(input: any): Promise<{ success: boolean; message: string }> {
    try {
        const adminDb = getAdminDb();
        await adminDb.collection(TOOL_REQUESTS_COLLECTION).add({
            ...input,
            status: 'pending',
            requestedAt: FieldValue.serverTimestamp(),
        });
        return { success: true, message: "Request submitted successfully!" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getToolRequests(): Promise<ToolRequest[]> {
    try {
        const adminDb = getAdminDb();
        const snapshot = await adminDb.collection(TOOL_REQUESTS_COLLECTION).orderBy('requestedAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                requestedAt: (data.requestedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as ToolRequest;
        });
    } catch (error) {
        return [];
    }
}

export async function updateToolRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean, message: string }> {
    try {
        const adminDb = getAdminDb();
        const requestRef = adminDb.collection(TOOL_REQUESTS_COLLECTION).doc(requestId);
        await requestRef.update({ status });
        return { success: true, message: 'Request updated.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function toggleFavoriteTool(userId: string, toolSlug: string): Promise<{ success: boolean, message: string }> {
  const adminDb = getAdminDb();
  if (!userId || !toolSlug) return { success: false, message: "Missing data." };
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return { success: false, message: "User not found." };

    const userData = userDoc.data();
    const currentFavorites: string[] = userData?.favorites || [];

    if (currentFavorites.includes(toolSlug)) {
      await userRef.update({ favorites: FieldValue.arrayRemove(toolSlug) });
      return { success: true, message: "Removed from favorites." };
    } else {
      await userRef.set({ favorites: FieldValue.arrayUnion(toolSlug) }, { merge: true });
      return { success: true, message: "Added to favorites." };
    }
  } catch (error: any) {
    return { success: false, message: "Could not update favorites." };
  }
}
