
import { z } from 'zod';

export const AiEmailComposerInputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  keyPoints: z.string().describe('The key points or message to convey in the email. This can be a simple sentence or a list of bullet points.'),
  tone: z.enum(['Formal', 'Casual', 'Friendly', 'Professional', 'Humorous']).describe('The desired tone of voice for the email.'),
});
export type AiEmailComposerInput = z.infer<typeof AiEmailComposerInputSchema>;

export const AiEmailComposerOutputSchema = z.object({
  emailBody: z.string().describe('The AI-generated body of the email.'),
});
export type AiEmailComposerOutput = z.infer<typeof AiEmailComposerOutputSchema>;

// Schema for regenerating email templates
export const RegenerateTemplateInputSchema = z.object({
  templateType: z.string().describe('The type of email template to regenerate (e.g., "Welcome Email", "Forgot Password").'),
});
export type RegenerateTemplateInput = z.infer<typeof RegenerateTemplateInputSchema>;

// Schema for generating a new feature announcement
export const GenerateFeatureAnnouncementInputSchema = z.object({
  featureName: z.string().describe('The name of the new feature.'),
  featureDescription: z.string().describe('A brief description of what the new feature does.'),
});
export type GenerateFeatureAnnouncementInput = z.infer<typeof GenerateFeatureAnnouncementInputSchema>;
