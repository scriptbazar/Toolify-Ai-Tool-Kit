
'use server';

/**
 * @fileOverview Manages tools in Firestore.
 */
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { type Tool, ToolSchema, UpsertToolInputSchema, type ToolRequest, ToolRequestSchema } from './tool-management.types';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TOOLS_COLLECTION = 'tools';
const TOOL_REQUESTS_COLLECTION = 'toolRequests';

const initialTools: Omit<Tool, 'id' | 'slug'>[] = [
    // Text Tools (10)
    { name: 'Case Converter', description: 'Convert text between different letter cases (e.g., uppercase, lowercase, title case).', icon: 'CaseSensitive', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Word Counter', description: 'Count words, characters, sentences, and paragraphs in your text.', icon: 'Calculator', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Lorem Ipsum Generator', description: 'Generate placeholder text in various lengths and formats.', icon: 'FileText', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Text Repeater', description: 'Repeat a piece of text multiple times with optional new lines.', icon: 'Repeat', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Reverse Text', description: 'Reverse your text string, word by word, or the entire block.', icon: 'ArrowLeftRight', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Remove Extra Spaces', description: 'Clean up text by removing extra spaces, tabs, and line breaks.', icon: 'Eraser', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Text to Binary', description: 'Convert plain text into binary code (0s and 1s).', icon: 'Binary', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Binary to Text', description: 'Translate binary code back into human-readable text.', icon: 'Binary', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Find and Replace', description: 'Easily find and replace specific words or phrases in a block of text.', icon: 'Search', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Random Word Generator', description: 'Generate random words for creative writing, games, or brainstorming.', icon: 'Wand2', category: 'text', plan: 'Free', isNew: false, status: 'Active' },

    // Developer Tools (10)
    { name: 'Password Generator', description: 'Create strong, secure, and customizable passwords.', icon: 'KeyRound', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'JSON Formatter', description: 'Format, validate, and beautify your JSON data for readability.', icon: 'Braces', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'HTML Minifier', description: 'Minify HTML code to reduce file size and improve website performance.', icon: 'FileCode', category: 'dev', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'CSS Minifier', description: 'Minify CSS code for faster loading and optimized stylesheets.', icon: 'FileCode2', category: 'dev', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'JavaScript Minifier', description: 'Minify JavaScript code for better performance and faster execution.', icon: 'FileJson', category: 'dev', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'URL Encoder/Decoder', description: 'Encode or decode URLs and strings according to RFC 3986.', icon: 'Link', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Base64 Encoder/Decoder', description: 'Encode data into Base64 or decode Base64 strings back to their original form.', icon: 'Fingerprint', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Unix Timestamp Converter', description: 'Convert Unix timestamps to human-readable dates and vice-versa.', icon: 'Clock', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'UUID Generator', description: 'Generate universally unique identifiers (UUIDs) in various versions.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'SQL Formatter', description: 'Beautify and format your SQL queries for better readability.', icon: 'Database', category: 'dev', plan: 'Pro', isNew: false, status: 'Active' },
    
    // AI Tools (10)
    { name: 'AI Blog Post Writer', description: 'Generate high-quality, SEO-friendly blog posts on any topic.', icon: 'PenSquare', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Image Generator', description: 'Create stunning and unique images from text prompts.', icon: 'Image', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Email Composer', description: 'Compose professional and effective emails for any situation with AI.', icon: 'Mail', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Chatbot', description: 'Engage in intelligent conversations with our advanced AI assistant.', icon: 'Bot', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Text to Speech', description: 'Convert written text into natural-sounding spoken audio in various voices.', icon: 'Volume2', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Content Summarizer', description: 'Summarize long articles, documents, or texts into concise points.', icon: 'AlignJustify', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Story Generator', description: 'Create compelling stories and narratives from a simple prompt.', icon: 'BookOpen', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Tweet Generator', description: 'Generate engaging and viral tweets for your social media.', icon: 'Twitter', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Product Description Writer', description: 'Craft persuasive product descriptions for your e-commerce store.', icon: 'ShoppingCart', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Code Assistant', description: 'Get help with writing, debugging, and explaining code snippets in various languages.', icon: 'CodeXml', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },

    // PDF Tools (10)
    { name: 'PDF Merger', description: 'Combine multiple PDF files into a single, organized document.', icon: 'FilePlus2', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'PDF to Word', description: 'Convert PDF files to editable Microsoft Word documents (.docx).', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'PDF Splitter', description: 'Split a single PDF into multiple files by page ranges or single pages.', icon: 'FileSymlink', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Compress PDF', description: 'Reduce the file size of your PDF documents without losing quality.', icon: 'FileArchive', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'PDF to JPG', description: 'Convert each page of a PDF file into high-quality JPG images.', icon: 'FileImage', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Word to PDF', description: 'Convert Microsoft Word documents (.docx) into PDF files.', icon: 'FileDigit', category: 'pdf', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Excel to PDF', description: 'Convert Microsoft Excel spreadsheets (.xlsx) into PDF files.', icon: 'FileSpreadsheet', category: 'pdf', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'PPT to PDF', description: 'Convert PowerPoint presentations (.pptx) into PDF files.', icon: 'FileSlideshow', category: 'pdf', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Rotate PDF', description: 'Rotate pages within your PDF file permanently.', icon: 'RotateCw', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Add Watermark to PDF', description: 'Add a text or image watermark to your PDF documents.', icon: 'Droplets', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    
    // Image Tools (10)
    { name: 'Color Picker', description: 'Pick colors from an interactive color wheel or your screen.', icon: 'Pipette', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Image Resizer', description: 'Resize images to your desired dimensions by pixel or percentage.', icon: 'Scaling', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Image Compressor', description: 'Reduce the file size of your images (JPG, PNG) without significant quality loss.', icon: 'Minimize2', category: 'image', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'PNG to JPG', description: 'Convert PNG images to JPG format with adjustable quality.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'JPG to PNG', description: 'Convert JPG images to PNG format with a transparent background.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Image to Base64', description: 'Convert images into Base64 strings for embedding in code.', icon: 'Fingerprint', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Flip Image', description: 'Flip images horizontally or vertically.', icon: 'FlipHorizontal', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Rotate Image', description: 'Rotate images by 90, 180, or 270 degrees.', icon: 'RotateCw', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Image Cropper', description: 'Crop images to a specific aspect ratio or custom size.', icon: 'Crop', category: 'image', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'ICO Converter', description: 'Create a favicon.ico file from any image.', icon: 'Star', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    
    // SEO Tools (10)
    { name: 'Meta Tag Generator', description: 'Create SEO-friendly meta tags (title, description) for your website.', icon: 'Tags', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Robots.txt Generator', description: 'Generate a robots.txt file to guide search engine crawlers.', icon: 'FileText', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'XML Sitemap Generator', description: 'Create an XML sitemap to help search engines index your site.', icon: 'FileCode', category: 'seo', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Keyword Density Checker', description: 'Analyze the keyword density of your text to optimize for SEO.', icon: 'Search', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'SERP Checker', description: 'Check search engine results pages for specific keywords and locations.', icon: 'LineChart', category: 'seo', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Redirect Checker', description: 'Check the status code and redirect chain of any URL.', icon: 'Link2', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Website Word Counter', description: 'Count the total words on any live webpage.', icon: 'Calculator', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Title Tag Checker', description: 'Check the length and appearance of your title tag in search results.', icon: 'TextCursorInput', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Favicon Checker', description: 'Check if your website has a valid and properly configured favicon.', icon: 'Star', category: 'seo', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Schema Generator', description: 'Create structured data (schema markup) for your website to enhance SERP visibility.', icon: 'Braces', category: 'seo', plan: 'Pro', isNew: false, status: 'Active' },

    // Calculators & Converters (10)
    { name: 'BMI Calculator', description: 'Calculate your Body Mass Index to assess your weight status.', icon: 'HeartPulse', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Unit Converter', description: 'Convert between different units of measurement (length, mass, temp, etc.).', icon: 'Ruler', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Age Calculator', description: 'Calculate your age in years, months, and days from your birth date.', icon: 'Calendar', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Percentage Calculator', description: 'Calculate percentages, fractions, and percentage changes easily.', icon: 'Percent', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Discount Calculator', description: 'Calculate the final price after applying a discount.', icon: 'BadgePercent', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Loan Calculator', description: 'Estimate your monthly loan payments, interest, and total cost.', icon: 'Landmark', category: 'cal_con', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Time Zone Converter', description: 'Convert times between different time zones around the world.', icon: 'Globe', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'GPA Calculator', description: 'Calculate your Grade Point Average (GPA) for any grading scale.', icon: 'GraduationCap', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Fuel Cost Calculator', description: 'Estimate the fuel cost for a trip based on distance, fuel efficiency, and price.', icon: 'Fuel', category: 'cal_con', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Date Calculator', description: 'Add or subtract days, weeks, months, and years from a date.', icon: 'CalendarDays', category: 'cal_con', plan: 'Free', isNew: false, status: 'Active' },
    
    // Video Tools (10)
    { name: 'Video to GIF', description: 'Convert a video clip into a high-quality animated GIF.', icon: 'Video', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Video Compressor', description: 'Reduce the file size of your video without significant quality loss.', icon: 'Minimize', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Add Watermark to Video', description: 'Add a text or image watermark to your video.', icon: 'Droplets', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Mute Video', description: 'Remove the audio track from a video file.', icon: 'VolumeX', category: 'video', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Video to MP3', description: 'Extract the audio track from a video file and save it as an MP3.', icon: 'FileAudio', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Resize Video', description: 'Resize video dimensions to fit different aspect ratios (e.g., 16:9, 1:1).', icon: 'Scaling', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Trim Video', description: 'Cut and trim video clips to a desired length.', icon: 'Scissors', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Rotate Video', description: 'Rotate videos by 90, 180, or 270 degrees.', icon: 'RotateCw', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Loop Video', description: 'Create a seamless looping video for social media or presentations.', icon: 'Repeat', category: 'video', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Video Subtitle Extractor', description: 'Extract subtitles (if embedded) from a video file into a text file.', icon: 'Captions', category: 'video', plan: 'Pro', isNew: false, status: 'Active' },
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

const RequestToolInputSchema = ToolRequestSchema.pick({
    name: true,
    email: true,
    toolName: true,
    description: true,
});
type RequestToolInput = z.infer<typeof RequestToolInputSchema>;

export async function requestNewTool(input: RequestToolInput): Promise<{ success: boolean; message: string }> {
    if (!adminDb) {
        return { success: false, message: "Database not initialized." };
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

const GenerateToolDescInputSchema = z.object({
  toolName: z.string().describe('The name of the tool for which to generate a description.'),
});

const GenerateToolDescOutputSchema = z.object({
  description: z.string().describe('The AI-generated description of the tool.'),
});

export async function generateToolDescription(input: z.infer<typeof GenerateToolDescInputSchema>): Promise<z.infer<typeof GenerateToolDescOutputSchema>> {
  return generateToolDescriptionFlow(input);
}

const generateToolDescPrompt = ai.definePrompt({
  name: 'generateToolDescriptionPrompt',
  input: { schema: GenerateToolDescInputSchema },
  output: { schema: GenerateToolDescOutputSchema },
  prompt: `You are an expert at writing clear and concise descriptions for web tools.
A user has requested a new tool. Based on the tool's name, generate a helpful and engaging description for it.
Explain what the tool does and who it might be useful for. Keep it to one or two sentences.

Tool Name: {{{toolName}}}

Generated Description:`,
});

const generateToolDescriptionFlow = ai.defineFlow(
  {
    name: 'generateToolDescriptionFlow',
    inputSchema: GenerateToolDescInputSchema,
    outputSchema: GenerateToolDescOutputSchema,
  },
  async (input) => {
    const { output } = await generateToolDescPrompt(input);
    if (!output) {
      throw new Error('Failed to generate tool description.');
    }
    return output;
  }
);


/**
 * Fetches all tool requests from Firestore.
 */
export async function getToolRequests(): Promise<ToolRequest[]> {
    if (!adminDb) return [];
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
    if (!adminDb) return { success: false, message: 'Database not initialized.' };
    try {
        const requestRef = adminDb.collection(TOOL_REQUESTS_COLLECTION).doc(requestId);
        await requestRef.update({ status });
        return { success: true, message: 'Request status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}
    


