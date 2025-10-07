
import { z } from 'zod';

export const AnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  featureSlug: z.string().optional(),
  isNew: z.boolean(),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;

export const GenerateAnnouncementInputSchema = z.object({
  featureName: z.string().describe('The name of the new feature being announced.'),
  featureDescription: z.string().describe('A brief description of what the new feature does.'),
});
export type GenerateAnnouncementInput = z.infer<typeof GenerateAnnouncementInputSchema>;

export const GenerateAnnouncementOutputSchema = z.object({
  title: z.string().describe('A catchy and exciting title for the announcement.'),
  content: z.string().describe('The full content of the announcement, written in an engaging and informative tone.'),
});
export type GenerateAnnouncementOutput = z.infer<typeof GenerateAnnouncementOutputSchema>;

export const SaveAnnouncementInputSchema = z.object({
    title: z.string(),
    content: z.string(),
    featureName: z.string(),
    featureDescription: z.string(),
});
export type SaveAnnouncementInput = z.infer<typeof SaveAnnouncementInputSchema>;
