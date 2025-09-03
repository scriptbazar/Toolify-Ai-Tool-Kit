
'use server';

/**
 * @fileOverview Manages tools in Firestore.
 */
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { type Tool, ToolSchema, UpsertToolInputSchema } from './tool-management.types';

const TOOLS_COLLECTION = 'tools';

const initialTools: Omit<Tool, 'id' | 'slug'>[] = [
    // Text Tools
    { name: 'Case Converter', description: 'Convert text between different letter cases.', icon: 'CaseSensitive', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Word Counter', description: 'Count words and characters in your text.', icon: 'Calculator', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Lorem Ipsum Generator', description: 'Generate placeholder text.', icon: 'FileText', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Text Repeater', description: 'Repeat a piece of text multiple times.', icon: 'Repeat', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Reverse Text', description: 'Reverse your text string.', icon: 'ArrowLeftRight', category: 'text', plan: 'Free', isNew: false, status: 'Active' },

    // Developer Tools
    { name: 'Password Generator', description: 'Create strong, secure passwords.', icon: 'KeyRound', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'JSON Formatter', description: 'Format and validate JSON data.', icon: 'Braces', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'HTML Minifier', description: 'Minify HTML code to reduce file size.', icon: 'FileCode', category: 'dev', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'CSS Minifier', description: 'Minify CSS code for faster loading.', icon: 'FileCode2', category: 'dev', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'JavaScript Minifier', description: 'Minify JavaScript code for better performance.', icon: 'FileJson', category: 'dev', plan: 'Pro', isNew: false, status: 'Active' },
    
    // AI Tools
    { name: 'Text to Speech', description: 'Convert text into spoken audio.', icon: 'Volume2', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Image Generator', description: 'Create images from text prompts.', icon: 'Image', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Blog Post Writer', description: 'Generate blog posts on any topic.', icon: 'PenSquare', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Email Composer', description: 'Compose professional emails with AI.', icon: 'Mail', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Chatbot', description: 'Chat with our advanced AI assistant.', icon: 'Bot', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },

    // PDF Tools
    { name: 'PDF Merger', description: 'Combine multiple PDF files into one.', icon: 'FilePlus2', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'PDF to Word', description: 'Convert PDF files to editable Word documents.', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'PDF Splitter', description: 'Split a single PDF into multiple files.', icon: 'FileSymlink', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Compress PDF', description: 'Reduce the file size of your PDF.', icon: 'FileArchive', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'PDF to JPG', description: 'Convert pages of a PDF to JPG images.', icon: 'FileImage', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    
    // Image Tools
    { name: 'Color Picker', description: 'Pick colors from a color wheel.', icon: 'Pipette', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Image Resizer', description: 'Resize images to your desired dimensions.', icon: 'Scaling', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Image Compressor', description: 'Reduce the file size of your images.', icon: 'Minimize2', category: 'image', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'PNG to JPG', description: 'Convert PNG images to JPG format.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'JPG to PNG', description: 'Convert JPG images to PNG format.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    
    // SEO Tools
    { name: 'Meta Tag Generator', description: 'Create SEO-friendly meta tags.', icon: 'Tags', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Robots.txt Generator', description: 'Generate a robots.txt file for your site.', icon: 'FileText', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'XML Sitemap Generator', description: 'Create an XML sitemap for search engines.', icon: 'FileCode', category: 'seo', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Keyword Density Checker', description: 'Analyze the keyword density of your text.', icon: 'Search', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'SERP Checker', description: 'Check search engine results pages.', icon: 'LineChart', category: 'seo', plan: 'Pro', isNew: false, status: 'Active' },

    // Calculators & Converters
    { name: 'BMI Calculator', description: 'Calculate your Body Mass Index.', icon: 'HeartPulse', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Unit Converter', description: 'Convert between different units of measurement.', icon: 'Ruler', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Age Calculator', description: 'Calculate your age in years, months, and days.', icon: 'Calendar', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Percentage Calculator', description: 'Calculate percentages easily.', icon: 'Percent', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Discount Calculator', description: 'Calculate the final price after a discount.', icon: 'BadgePercent', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    
    // Video Tools
    { name: 'Video to GIF', description: 'Convert a video clip to an animated GIF.', icon: 'Video', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Video Compressor', description: 'Reduce the file size of your video.', icon: 'Minimize', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Add Watermark to Video', description: 'Add a text or image watermark to your video.', icon: 'Droplets', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Mute Video', description: 'Remove the audio from a video file.', icon: 'VolumeX', category: 'video', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Video to MP3', description: 'Extract the audio from a video file.', icon: 'FileAudio', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
];

/**
 * Fetches all tools from Firestore, ordered by name.
 * If the collection is empty, it populates it with initial tools.
 * @returns {Promise<Tool[]>} A list of all tools.
 */
export async function getTools(): Promise<Tool[]> {
  if (!adminDb) {
    console.warn("Firebase Admin is not initialized. Skipping Firestore call and returning initial tools.");
    return initialTools.map(tool => ({...tool, id: tool.name.toLowerCase().replace(/\s+/g, '-'), slug: tool.name.toLowerCase().replace(/\s+/g, '-')}));
  }
  try {
    const toolsRef = adminDb.collection(TOOLS_COLLECTION);
    const snapshot = await toolsRef.get();

    const existingSlugs = new Set(snapshot.docs.map(doc => doc.data().slug));
    const batch = adminDb.batch();
    let hasNewTools = false;

    for (const toolData of initialTools) {
        const slug = toolData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        if (!existingSlugs.has(slug)) {
            const docRef = toolsRef.doc(slug);
            batch.set(docRef, { ...toolData, slug, createdAt: FieldValue.serverTimestamp() });
            hasNewTools = true;
        }
    }

    if (hasNewTools) {
        await batch.commit();
        // Re-fetch the data after populating to get a complete, sorted list
        const updatedSnapshot = await toolsRef.orderBy('name').get();
        const tools = updatedSnapshot.docs.map(doc => {
            const data = doc.data();
            return ToolSchema.parse({ ...data, id: doc.id });
        });
        return tools;
    }

    // If no new tools were added, just return the originally fetched and sorted data
    const sortedDocs = snapshot.docs.sort((a, b) => a.data().name.localeCompare(b.data().name));
    const tools = sortedDocs.map(doc => {
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
  if (!adminDb) {
    return { success: false, message: 'Firebase Admin is not initialized.' };
  }
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
    if (!adminDb) {
      return { success: false, message: 'Firebase Admin is not initialized.' };
    }
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

/**
 * Fetches the favorite tools for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Tool[]>} A list of the user's favorite tools.
 */
export async function getFavoriteTools(userId: string): Promise<Tool[]> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot fetch favorite tools.");
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

    