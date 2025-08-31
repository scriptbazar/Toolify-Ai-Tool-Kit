
'use server';

/**
 * @fileOverview An AI agent for creating and managing announcements.
 * - generateAnnouncement - Generates an announcement title and content.
 * - saveAnnouncement - Saves a new announcement to Firestore.
 * - getAnnouncementsForUser - Fetches all announcements and indicates if they are new for the user.
 * - markAnnouncementsAsRead - Marks specific announcements as read for a user.
 */

import { ai } from '@/ai/genkit';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { type Announcement } from './announcement-flow.types';

const GenerateAnnouncementInputSchema = z.object({
  featureName: z.string().describe('The name of the new feature being announced.'),
  featureDescription: z.string().describe('A brief description of what the new feature does.'),
});
export type GenerateAnnouncementInput = z.infer<typeof GenerateAnnouncementInputSchema>;

const GenerateAnnouncementOutputSchema = z.object({
  title: z.string().describe('A catchy and exciting title for the announcement.'),
  content: z.string().describe('The full content of the announcement, written in an engaging and informative tone.'),
});
export type GenerateAnnouncementOutput = z.infer<typeof GenerateAnnouncementOutputSchema>;

export async function generateAnnouncement(input: GenerateAnnouncementInput): Promise<GenerateAnnouncementOutput> {
  return generateAnnouncementFlow(input);
}

const generateAnnouncementPrompt = ai.definePrompt({
  name: 'generateAnnouncementPrompt',
  input: { schema: GenerateAnnouncementInputSchema },
  output: { schema: GenerateAnnouncementOutputSchema },
  prompt: `You are an expert marketing copywriter for a SaaS company called ToolifyAI. Your task is to write a short, exciting announcement about a new feature.

Feature Name: {{{featureName}}}
Feature Description: {{{featureDescription}}}

Generate a catchy title and a detailed announcement content. The tone should be enthusiastic and friendly. Explain the feature's benefits and encourage users to try it out.`,
});

const generateAnnouncementFlow = ai.defineFlow(
  {
    name: 'generateAnnouncementFlow',
    inputSchema: GenerateAnnouncementInputSchema,
    outputSchema: GenerateAnnouncementOutputSchema,
  },
  async (input) => {
    const { output } = await generateAnnouncementPrompt(input);
    if (!output) {
      throw new Error('Failed to generate announcement content.');
    }
    return output;
  }
);


const SaveAnnouncementInputSchema = z.object({
    title: z.string(),
    content: z.string(),
    featureName: z.string(),
    featureDescription: z.string(),
});
export type SaveAnnouncementInput = z.infer<typeof SaveAnnouncementInputSchema>;


export async function saveAnnouncement(input: SaveAnnouncementInput): Promise<{ success: boolean; message: string }> {
    if (!adminDb) {
        return { success: false, message: "Database not initialized." };
    }
    
    try {
        const { title, content, featureName } = SaveAnnouncementInputSchema.parse(input);
        
        await adminDb.collection('announcements').add({
            title,
            content,
            featureName,
            // Create a slug from the feature name to link to the tool
            featureSlug: featureName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
            createdAt: FieldValue.serverTimestamp(),
            readBy: [], 
        });

        return { success: true, message: "Announcement published successfully." };

    } catch (error: any) {
        console.error("Error saving announcement:", error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}


export async function getAnnouncementsForUser(userId: string): Promise<Announcement[]> {
  if (!adminDb) {
    console.warn("Cannot get announcements: DB not initialized.");
    return [];
  }
  try {
    const snapshot = await adminDb.collection('announcements').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    
    const announcements = snapshot.docs.map(doc => {
      const data = doc.data();
      const readBy: string[] = data.readBy || [];
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        featureSlug: data.featureSlug,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        isNew: !readBy.includes(userId),
      } as Announcement;
    });

    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

export async function markAnnouncementsAsRead(userId: string, announcementIds: string[]): Promise<{ success: boolean }> {
  if (!adminDb || !userId || announcementIds.length === 0) {
    return { success: false };
  }

  const batch = adminDb.batch();
  announcementIds.forEach(id => {
    const docRef = adminDb.collection('announcements').doc(id);
    batch.update(docRef, {
      readBy: FieldValue.arrayUnion(userId)
    });
  });

  try {
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error marking announcements as read:", error);
    return { success: false };
  }
}
