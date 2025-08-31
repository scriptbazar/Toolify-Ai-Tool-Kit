
'use server';

/**
 * @fileOverview An AI agent for creating and managing announcements.
 * - generateAnnouncement - Generates an announcement title and content.
 * - saveAnnouncement - Saves a new announcement to Firestore.
 */

import { ai } from '@/ai/genkit';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'genkit';

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
        const { title, content } = SaveAnnouncementInputSchema.parse(input);
        
        await adminDb.collection('announcements').add({
            title,
            content,
            createdAt: FieldValue.serverTimestamp(),
            // Initially, no one has read it
            readBy: [], 
        });

        return { success: true, message: "Announcement published successfully." };

    } catch (error: any) {
        console.error("Error saving announcement:", error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}
