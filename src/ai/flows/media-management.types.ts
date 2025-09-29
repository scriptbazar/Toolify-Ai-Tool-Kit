
import { z } from 'zod';

export const SaveMediaInputSchema = z.object({
    userId: z.string(),
    type: z.enum(['ai-generated', 'community-chat', 'ticket-media']),
    mediaUrl: z.string().url(),
    prompt: z.string().optional(),
});
export type SaveMediaInput = z.infer<typeof SaveMediaInputSchema>;


export const GenerateImageInputSchema = z.object({
  promptText: z.string().describe('The text prompt to generate an image from.'),
  userId: z.string(), // To track usage, although not directly used in the model call
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

export const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a base64 data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;
