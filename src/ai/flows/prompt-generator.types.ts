
import { z } from 'zod';

export const GeneratePromptInputSchema = z.object({
  topic: z.string().describe('The simple topic or keywords provided by the user.'),
  category: z.enum(['Image', 'Website', 'App', 'Social Media Ad', 'Video Script', 'Marketing Copy', 'Creative Writing', 'General']).describe('The category for which the prompt is being generated.'),
  detailLevel: z.enum(['Short', 'Medium', 'Detailed', 'Advanced']).describe('The desired level of detail for the prompt.'),
  imageStyle: z.enum(['Photorealistic', 'Cartoon', 'Abstract', 'Painting', '3D Render', 'Anime/Manga', 'Pixel Art']).optional().describe('The artistic style for image generation prompts.'),
});
export type GeneratePromptInput = z.infer<typeof GeneratePromptInputSchema>;


export const GeneratePromptOutputSchema = z.object({
  prompt: z.string().describe('The AI-generated detailed prompt.'),
});
export type GeneratePromptOutput = z.infer<typeof GeneratePromptOutputSchema>;
