
'use server';

/**
 * @fileOverview Manages tools in Firestore.
 */
import { adminDb } from '@/lib/firebase-admin';
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
    { name: 'AI Image Generator', description: 'Create stunning, unique images from text descriptions.', icon: 'ImageIcon', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Product Description Writer', description: 'Craft persuasive and engaging descriptions for your e-commerce products.', icon: 'ShoppingCart', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Story Generator', description: 'Craft compelling stories in various genres from a simple prompt.', icon: 'BookOpen', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Tweet Generator', description: 'Generate engaging tweets and thread ideas for social media.', icon: 'Twitter', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Add Watermark to PDF', description: 'Add a text or image watermark to your PDF documents.', icon: 'Fingerprint', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Add Watermark to Video', description: 'Add a text or image watermark to your videos.', icon: 'Video', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Age Calculator', description: 'Calculate age from date of birth.', icon: 'Gift', category: 'calculator', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Amazon Shipping Label Cropper', description: 'Effortlessly crop your standard 8.5x11 inch Amazon FBA shipping labels to a perfect 4x6 inch format, ideal for thermal printers. Save time and label costs.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Myntra Shipping Label Cropper', description: 'Quickly convert your standard Myntra shipping labels into a 4x6 inch thermal printer-friendly format. Streamline your packing process with one click.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Flipkart Shipping Label Cropper', description: 'Crop your Flipkart shipping labels from a full page to a 4x6 inch size in seconds. Perfect for sellers using thermal printers for efficient dispatch.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Meesho Shipping Label Cropper', description: 'Optimize your Meesho shipping process. This tool crops your default shipping labels to a 4x6 inch format, saving paper and streamlining your workflow.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Base64 Encoder/Decoder', description: 'Encode to and decode from Base64 format.', icon: 'Package', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Binary to Text', description: 'Convert binary code to human-readable text.', icon: 'Binary', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'CSS Minifier', description: 'Minify CSS code to reduce file size and improve load times.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Discount Calculator', description: 'Calculate final price after discount and see how much you save.', icon: 'BadgePercent', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Date Calculator', description: 'Calculate the duration between two dates or add/subtract from a date.', icon: 'CalendarDays', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Compress PDF', description: 'Reduce the file size of your PDF files.', icon: 'FileArchive', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Excel to PDF', description: 'Convert your Excel spreadsheets to PDF.', icon: 'FileSpreadsheet', category: 'pdf', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Text to Binary', description: 'Convert human-readable text to binary code.', icon: 'Binary', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Reverse Text', description: 'Reverse your text in various ways (by word, all characters, etc.).', icon: 'ArrowLeftRight', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Remove Extra Spaces', description: 'Clean up your text by removing extra spaces and line breaks.', icon: 'Eraser', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Find and Replace', description: 'Quickly find and replace words or phrases in your text.', icon: 'SearchCode', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Random Word Generator', description: 'Generate random words for creative writing, games, or brainstorming.', icon: 'Shuffle', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Rotate Image', description: 'Rotate an image by 90, 180, or 270 degrees.', icon: 'RotateCw', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PNG to JPG', description: 'Convert PNG images to JPG format.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'JPG to PNG', description: 'Convert JPG images to PNG format.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image to Base64', description: 'Convert an image to a Base64 string.', icon: 'Code', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image Resizer', description: 'Resize image dimensions by pixels or percentage.', icon: 'Scaling', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Flip Image', description: 'Flip an image horizontally or vertically.', icon: 'FlipHorizontal', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'ICO Converter', description: 'Convert any image to a favicon.ico file.', icon: 'Star', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image Compressor', description: 'Reduce the file size of your images.', icon: 'Minimize2', category: 'image', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Image Cropper', description: 'Crop images to a specific size or aspect ratio.', icon: 'Crop', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Loop Video', description: 'Create seamlessly looping video clips.', icon: 'Repeat', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Mute Video', description: 'Remove the audio track from a video.', icon: 'VolumeX', category: 'video', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Resize Video', description: 'Change the dimensions of your video.', icon: 'Scaling', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Rotate Video', description: 'Rotate a video by 90, 180, or 270 degrees.', icon: 'RotateCw', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Trim Video', description: 'Cut out parts of a video by setting start and end times.', icon: 'Scissors', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Video to GIF', description: 'Convert a portion of a video into an animated GIF.', icon: 'FileVideo', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Video to MP3', description: 'Extract the audio from a video file and save as MP3.', icon: 'Music', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Video Subtitle Extractor', description: 'Extract subtitles from a video file.', icon: 'Captions', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Video Compressor', description: 'Reduce the file size of your videos.', icon: 'Minimize2', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF Splitter', description: 'Extract pages or split a PDF into multiple files.', icon: 'FileCog', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Word to PDF', description: 'Convert a Word document (.docx) to a PDF.', icon: 'FileText', category: 'pdf', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Rotate PDF', description: 'Rotate all or specific pages in a PDF file.', icon: 'RotateCw', category: 'pdf', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PPT to PDF', description: 'Convert a PowerPoint presentation (.pptx) to a PDF.', icon: 'FileVideo2', category: 'pdf', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PDF to Word', description: 'Convert a PDF file into an editable Word document.', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF to JPG', description: 'Convert PDF pages into high-quality JPG images.', icon: 'FileImage', category: 'pdf', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Meta Tag Generator', description: 'Create SEO-friendly meta title and description tags.', icon: 'Code', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Robots.txt Generator', description: 'Generate a robots.txt file to control search engine crawlers.', icon: 'FileText', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'XML Sitemap Generator', description: 'Create an XML sitemap to help search engines index your site.', icon: 'FileCode', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Favicon Checker', description: 'Check if a website has a favicon and preview it.', icon: 'Star', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Keyword Density Checker', description: 'Analyze the keyword density of your text content.', icon: 'Search', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'SERP Checker', description: 'Check search engine results for a keyword in a specific location.', icon: 'LineChart', category: 'seo', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Redirect Checker', description: 'Follow the redirect path of a URL.', icon: 'ArrowRightLeft', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Schema Generator', description: 'Generate structured data markup for FAQs, articles, and more.', icon: 'BookCopy', category: 'seo', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Title Tag Checker', description: 'Check the length and preview your title tag for SERPs.', icon: 'TextCursorInput', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Website Word Counter', description: 'Count the total words on any live webpage.', icon: 'Calculator', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Fuel Cost Calculator', description: 'Estimate the total fuel cost for a journey.', icon: 'Fuel', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'GPA Calculator', description: 'Calculate your Grade Point Average (GPA).', icon: 'GraduationCap', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Loan Calculator', description: 'Estimate your monthly loan payments.', icon: 'Landmark', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Percentage Calculator', description: 'Perform various percentage calculations.', icon: 'BadgePercent', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Time Zone Converter', description: 'Compare time across different cities and time zones.', icon: 'Clock', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Unix Timestamp Converter', description: 'Convert Unix timestamps to human-readable dates and vice-versa.', icon: 'Timer', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
];

/**
 * Fetches all tools from Firestore, ordered by name.
 * If the collection is empty, it populates it with initial tools.
 * @returns {Promise<Tool[]>} A list of all tools.
 */
export async function getTools(): Promise<Tool[]> {
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
    
    const fetchedTools: Tool[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt instanceof Timestamp) 
            ? data.createdAt.toDate().toISOString() 
            : new Date().toISOString();
            
        const parsed = ToolSchema.safeParse({ 
            id: doc.id,
            ...data,
            createdAt
        });

        if (parsed.success) {
            return parsed.data;
        } else {
            console.warn(`Invalid tool data for doc ${doc.id}:`, parsed.error.format());
            return null;
        }
    }).filter((tool): tool is Tool => tool !== null);
    
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
    if (!adminDb) {
        return { success: false, message: 'Database not initialized.' };
    }
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
