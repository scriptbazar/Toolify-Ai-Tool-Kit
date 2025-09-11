

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
    { name: 'Speech to Text', description: 'Transcribe audio files into written text.', icon: 'Voicemail', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF Merger', description: 'Combine multiple PDF files into a single, organized document.', icon: 'FilePlus2', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Unlock PDF', description: 'Remove password and restrictions from PDF files.', icon: 'Unlock', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'Lock PDF', description: 'Protect your PDF files with a password and set permissions.', icon: 'Lock', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
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
    { name: 'AI Voice Cloning', description: 'Create a digital clone of your voice and generate speech in your own accent.', icon: 'Voicemail', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Add Watermark to PDF', description: 'Add a text or image watermark to your PDF documents.', icon: 'Fingerprint', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
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
    { name: 'Compress PDF', description: 'Reduce the file size of your PDF files.', icon: 'FileArchive', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'Excel to PDF', description: 'Convert your Excel spreadsheets to PDF.', icon: 'FileSpreadsheet', category: 'pdf', plan: 'Free', isNew: true, status: 'Coming Soon' },
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
    { name: 'Image Background Remover', description: 'Automatically remove the background from your images with a single click.', icon: 'Scissors', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AdMob Revenue Calculator', description: 'Estimate your potential AdMob earnings.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'AdSense Revenue Calculator', description: 'Estimate your potential AdSense earnings.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'IFSC Code to Bank Details', description: 'Get bank details from an IFSC code.', icon: 'Banknote', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'GST Calculator', description: 'Calculate Goods and Services Tax.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Image Color Extractor', description: 'Extract a color palette from an image.', icon: 'Pipette', category: 'image', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Image Cropper', description: 'Crop images to your desired dimensions.', icon: 'Crop', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image Compressor', description: 'Reduce the file size of your images.', icon: 'FileArchive', category: 'image', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Image Text Extractor', description: 'Extract text from an image.', icon: 'ScanText', category: 'ai', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'Image Converter', description: 'Convert images between different formats like PNG, JPG, WEBP.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PDF Splitter', description: 'Split a PDF into multiple smaller files or extract specific pages.', icon: 'Split', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'PDF Page Reorder', description: 'Rearrange the pages of your PDF document into a new order.', icon: 'Shuffle', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'PDF Page Counter', description: 'Quickly count the number of pages in a PDF file.', icon: 'ListOrdered', category: 'pdf', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'PDF Page Numberer', description: 'Add page numbers to your PDF documents.', icon: 'Hash', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'PDF Page Remover', description: 'Delete one or more pages from a PDF document.', icon: 'FileMinus', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'PDF Organizer', description: 'Visually rearrange, delete, and organize PDF pages.', icon: 'Layers', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'Website Screenshot', description: 'Take a full-page screenshot of any website.', icon: 'MonitorSmartphone', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'What Is My Browser', description: 'Get detailed information about your web browser and device.', icon: 'Globe', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Negative Marking Calculator', description: 'Calculate your final score in exams with negative marking.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'YouTube Channel Banner Downloader', description: 'Download the banner image from any YouTube channel.', icon: 'Download', category: 'video', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'YouTube Channel Logo Downloader', description: 'Download the profile picture/logo from any YouTube channel.', icon: 'Download', category: 'video', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'YouTube Video Description Extractor', description: 'Extract and view the full description of any YouTube video.', icon: 'FileText', category: 'video', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'YouTube Video Title Extractor', description: 'Extract the title from any YouTube video.', icon: 'FileText', category: 'video', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'YouTube Video Thumbnail Downloader', description: 'Download thumbnails from YouTube videos in all available qualities.', icon: 'Image', category: 'video', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'YouTube Region Restriction Checker', description: 'Check if a YouTube video is restricted in any country.', icon: 'Globe', category: 'video', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Google Drive Direct Link Generator', description: 'Convert Google Drive sharing links to permanent direct download links.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Dropbox Direct Link Generator', description: 'Convert Dropbox sharing links to permanent direct download links.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'OneDrive Direct Link Generator', description: 'Convert OneDrive sharing links to permanent direct download links.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'NSDL PAN Card Photo & Signature Resizer', description: 'Resize photo and signature for NSDL PAN card applications.', icon: 'Crop', category: 'image', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'UTI PAN Card Photo & Signature Resizer', description: 'Resize photo and signature for UTI PAN card applications.', icon: 'Crop', category: 'image', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'PRN to PDF', description: 'Convert PRN files to PDF format.', icon: 'FileText', category: 'pdf', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Image to PDF', description: 'Convert JPG, PNG, and other images to a PDF file.', icon: 'FileImage', category: 'pdf', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'PDF Signer', description: 'Sign your PDF documents electronically.', icon: 'PenSquare', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'Rotate PDF', description: 'Rotate all or specific pages in your PDF document.', icon: 'RotateCw', category: 'pdf', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'Marks to Percentage Calculator', description: 'Convert your marks or grades into a percentage.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'SRM to CGPA Calculator', description: 'Calculate CGPA for SRM University students.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'CGPA to Marks Calculator', description: 'Convert CGPA to equivalent marks.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'GPA to Percentage Converter', description: 'Convert GPA to percentage.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'GPA to CGPA Calculator', description: 'Calculate CGPA from GPA.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Percentage to CGPA Converter', description: 'Convert percentage to CGPA.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'CGPA to GPA Converter', description: 'Convert CGPA to GPA.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Text Encryption & Decryption', description: 'Encrypt and decrypt text using various algorithms.', icon: 'Lock', category: 'dev', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'Password Strength Checker', description: 'Check the strength of your password.', icon: 'CheckCheck', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'SHA256 Hash Generator', description: 'Generate SHA256 hash for any text.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Universal Hash Generator', description: 'Generate various types of hashes (MD5, SHA1, etc.).', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'AES Encryption & Decryption', description: 'Encrypt and decrypt files using AES.', icon: 'Key', category: 'dev', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'Universal File Converter', description: 'Convert files from one format to another.', icon: 'FileCog', category: 'dev', plan: 'Pro', isNew: true, status: 'Coming Soon' },
    { name: 'Image Shape Converter', description: 'Convert images into various shapes (circle, star, etc.).', icon: 'Shapes', category: 'image', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Morse to Text Translator', description: 'Translate Morse code to plain text.', icon: 'MessageSquare', category: 'text', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Text to Morse Code', description: 'Translate plain text to Morse code.', icon: 'MessageSquare', category: 'text', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Cryptocurrency Converter', description: 'Convert between different cryptocurrencies and fiat.', icon: 'Bitcoin', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Barcode Generator', description: 'Generate barcodes in various formats.', icon: 'Barcode', category: 'dev', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Currency Converter', description: 'Convert between different world currencies.', icon: 'Coins', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
    { name: 'Credit Card Interest Calculator', description: 'Calculate the interest on your credit card balance.', icon: 'CreditCard', category: 'calculator', plan: 'Free', isNew: true, status: 'Coming Soon' },
];

/**
 * Fetches all tools from Firestore, ordered by name.
 * If the collection is empty, it populates it with initial tools.
 * It also self-heals by adding any missing tools from the initial list.
 * @returns {Promise<Tool[]>} A list of all tools.
 */
export async function getTools(): Promise<Tool[]> {
  try {
    const adminDb = getAdminDb();
    const toolsRef = adminDb.collection(TOOLS_COLLECTION);
    let snapshot = await toolsRef.get();

    // If the collection is empty, populate it.
    if (snapshot.empty) {
      console.log('Tools collection is empty, populating with initial tools...');
      const batch = adminDb.batch();
      for (const toolData of initialTools) {
          const slug = toolData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          const docRef = toolsRef.doc(slug);
          batch.set(docRef, { ...toolData, slug, createdAt: FieldValue.serverTimestamp() });
      }
      await batch.commit();
      snapshot = await toolsRef.get(); // Re-fetch after populating
    } else {
        // Self-healing: Check for and add any missing tools
        const existingToolSlugs = new Set(snapshot.docs.map(doc => doc.id));
        const missingTools = initialTools.filter(tool => {
            const slug = tool.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            return !existingToolSlugs.has(slug);
        });

        if (missingTools.length > 0) {
            console.log(`Found ${missingTools.length} missing tools. Adding them to the database...`);
            const batch = adminDb.batch();
            for (const toolData of missingTools) {
                const slug = toolData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                const docRef = toolsRef.doc(slug);
                batch.set(docRef, { ...toolData, slug, createdAt: FieldValue.serverTimestamp() });
            }
            await batch.commit();
            snapshot = await toolsRef.get(); // Re-fetch to include newly added tools
        }
    }
    
    const fetchedTools: Tool[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt instanceof Timestamp) 
            ? data.createdAt.toDate().toISOString() 
            : new Date().toISOString();

        const rawTool = { 
            id: doc.id,
            ...data,
            createdAt: createdAt,
        };
            
        const parsed = ToolSchema.safeParse(rawTool);

        if (parsed.success) {
            return parsed.data;
        } else {
            console.warn(`Invalid tool data for doc ${doc.id}:`, parsed.error.format());
            return null;
        }
    }).filter((tool): tool is Tool => tool !== null)
      .sort((a, b) => a.name.localeCompare(b.name)); // Ensure final list is sorted by name
    
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
  try {
    const adminDb = getAdminDb();
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
  try {
    const adminDb = getAdminDb();
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
    try {
        const adminDb = getAdminDb();
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
        console.error("Error fetching tool requests:", error);
        return [];
    }
}

/**
 * Updates the status of a tool request.
 */
export async function updateToolRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean, message: string }> {
    try {
        const adminDb = getAdminDb();
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

    