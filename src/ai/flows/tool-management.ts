
'use server';

/**
 * @fileOverview Manages tools in Firestore.
 */
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { type Tool, ToolSchema, UpsertToolInputSchema, type ToolRequest, ToolRequestSchema } from './tool-management.types';
import { z } from 'zod';

const TOOLS_COLLECTION = 'tools';
const TOOL_REQUESTS_COLLECTION = 'toolRequests';

const initialTools: Omit<Tool, 'id' | 'slug' | 'createdAt'>[] = [
    { name: 'Case Converter', description: 'Convert text between different letter cases (e.g., uppercase, lowercase, title case).', icon: 'CaseSensitive', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Word Counter', description: 'Count words, characters, sentences, and paragraphs in your text.', icon: 'Calculator', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Lorem Ipsum Generator', description: 'Generate placeholder text in various lengths and formats.', icon: 'FileText', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Password Generator', description: 'Create strong, secure, and customizable passwords.', icon: 'KeyRound', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'JSON Formatter', description: 'Format, validate, and beautify your JSON data for readability.', icon: 'Braces', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'BMI Calculator', description: 'Calculate your Body Mass Index to assess your weight status.', icon: 'HeartPulse', category: 'calculator', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Text to Speech', description: 'Convert written text into natural-sounding spoken audio in various voices.', icon: 'Volume2', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF Merger', description: 'Combine multiple PDF files into a single, organized document.', icon: 'FilePlus2', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Unit Converter', description: 'Convert between different units of measurement (length, mass, temp, etc.).', icon: 'Ruler', category: 'calculator', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Color Picker', description: 'Pick colors from an interactive color wheel or your screen.', icon: 'Pipette', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Text Repeater', description: 'Repeat a piece of text with optional new lines.', icon: 'Repeat', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Prompt Generator', description: 'Generate creative prompts for AI models based on your topic.', icon: 'Lightbulb', category: 'ai', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'AI Blog Post Writer', description: 'Generate a complete, SEO-friendly blog post from just a topic.', icon: 'PenSquare', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Content Summarizer', description: 'Summarize long articles, documents, or texts into concise points.', icon: 'AlignLeft', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Code Assistant', description: 'Get help with writing, debugging, and explaining code snippets.', icon: 'Code', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Email Composer', description: 'Generate professional emails for various purposes based on your key points.', icon: 'Mail', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Image Generator', description: 'Create stunning, unique images from text descriptions.', icon: 'Image', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Product Description Writer', description: 'Craft persuasive and engaging descriptions for your e-commerce products.', icon: 'ShoppingCart', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Story Generator', description: 'Craft compelling stories in various genres from a simple prompt.', icon: 'BookOpen', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
];

/**
 * Fetches all tools from Firestore, ordered by name.
 * If the collection is empty, it populates it with initial tools.
 * @returns {Promise<Tool[]>} A list of all tools.
 */
export async function getTools(): Promise<Tool[]> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("Database not initialized, cannot fetch tools.");
    return [];
  }
  
  const toolsRef = adminDb.collection(TOOLS_COLLECTION);
  
  try {
    let snapshot = await toolsRef.orderBy('name').get();

    if (snapshot.empty) {
      console.log('Tools collection is empty, populating with initial tools...');
      const batch = adminDb.batch();
      for (const toolData of initialTools) {
          const slug = toolData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          const docRef = toolsRef.doc(slug);
          batch.set(docRef, { ...toolData, slug, createdAt: FieldValue.serverTimestamp() });
      }
      await batch.commit();
      // Re-fetch the data after populating, ensuring it's ordered
      snapshot = await toolsRef.orderBy('name').get();
    }
    
    const fetchedTools = snapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure createdAt is a serializable string
        const createdAt = (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString();
        return ToolSchema.parse({ ...data, id: doc.id, createdAt });
    });
    
    return fetchedTools;

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
  const adminDb = getAdminDb();
  if (!adminDb) {
    return { success: false, message: 'Database not initialized.' };
  }
  try {
    const { id, ...data } = toolData;
    
    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
    
    // Validate data before saving
    const validatedData = UpsertToolInputSchema.parse(data);

    if (id) {
      const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(id);
      await toolRef.update(validatedData);
      return { success: true, message: 'Tool updated successfully.', toolId: id };
    } else {
      if (!data.slug) throw new Error("Slug is required for a new tool.");
      const docRef = adminDb.collection(TOOLS_COLLECTION).doc(data.slug);
      await docRef.set({ ...validatedData, createdAt: FieldValue.serverTimestamp() });
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
    const adminDb = getAdminDb();
    if (!toolId) {
        return { success: false, message: 'Tool ID is required.' };
    }
    try {
        const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(toolId);
        const doc = await toolRef.get();
        if (!doc.exists) {
            return { success: false, message: 'Tool not found.' };
        }
        
        await toolRef.delete();

        // Log the component file path for manual deletion
        const toolName = doc.data()?.name || toolId;
        const componentName = toolName.replace(/\s+/g, '');
        const componentPath = `src/components/tools/${componentName}.tsx`;
        console.log(`ACTION REQUIRED: Tool '${toolName}' deleted from database. Please manually delete the component file: ${componentPath}`);

        return { success: true, message: 'Tool deleted successfully.' };
    } catch (error: any) {
        console.error(`Error deleting tool ${toolId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

/**
 * Fetches the favorite tools for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Tool[]>} A list of the user's favorite tools.
 */
export async function getFavoriteTools(userId: string): Promise<Tool[]> {
  const adminDb = getAdminDb();
  if (!adminDb) {
      return [];
  }
  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists()) {
      return [];
    }

    const userData = userDocSnap.data();
    const favoriteSlugs: string[] = userData?.favorites || [];

    if (favoriteSlugs.length === 0) {
      return [];
    }

    const allTools = await getTools();
    const userFavorites = allTools.filter(tool => favoriteSlugs.includes(tool.slug));
    
    return userFavorites;
  } catch (error) {
    console.error(`Error fetching favorite tools for user ${userId}:`, error);
    return [];
  }
}

const RequestToolInputSchema = ToolRequestSchema.pick({
    name: true,
    email: true,
    toolName: true,
    description: true,
});
type RequestToolInput = {
    name: string;
    email: string;
    toolName: string;
    description: string;
};

export async function requestNewTool(input: RequestToolInput): Promise<{ success: boolean; message: string }> {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return { success: false, message: 'Database not initialized.' };
    }
    try {
        const validatedInput = RequestToolInputSchema.parse(input);
        await adminDb.collection(TOOL_REQUESTS_COLLECTION).add({
            ...validatedInput,
            status: 'pending',
            requestedAt: FieldValue.serverTimestamp(),
        });
        return { success: true, message: "Your tool request has been submitted successfully!" };
    } catch (error: any) {
        console.error("Error submitting tool request:", error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

/**
 * Fetches all tool requests from Firestore.
 */
export async function getToolRequests(): Promise<ToolRequest[]> {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return [];
    }
    try {
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
        console.error("Error fetching tool requests:", error);
        return [];
    }
}

/**
 * Updates the status of a tool request.
 */
export async function updateToolRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean, message: string }> {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return { success: false, message: 'Database not initialized.' };
    }
    try {
        const requestRef = adminDb.collection(TOOL_REQUESTS_COLLECTION).doc(requestId);
        await requestRef.update({ status });
        return { success: true, message: 'Request status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}


const GenerateToolDescriptionInputSchema = z.object({
  toolName: z.string().describe('The name of the tool to generate a description for.'),
});

const GenerateToolDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed, user-friendly description of what the tool does.'),
});

export async function generateToolDescription(input: z.infer<typeof GenerateToolDescriptionInputSchema>): Promise<z.infer<typeof GenerateToolDescriptionOutputSchema>> {
  const prompt = `Generate a concise and user-friendly description for a web tool called "${input.toolName}". The description should be a single sentence, starting with a verb, and clearly explain the tool's primary function. For example, for a "Case Converter" tool, a good description would be "Convert text between different letter cases (e.g., uppercase, lowercase, title case)."`;

  // This would be a call to a Genkit flow in a real app
  // For now, we simulate a simple response.
  const generatedDesc = `A new, amazing tool that helps you with ${input.toolName}.`;

  return { description: generatedDesc };
}
