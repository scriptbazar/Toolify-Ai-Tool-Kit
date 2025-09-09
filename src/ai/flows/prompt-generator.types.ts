
import { z } from 'zod';

export const GeneratePromptInputSchema = z.object({
  topic: z.string().describe('The simple topic or keywords provided by the user.'),
  category: z.enum(['Image', 'Website', 'App', 'Social Media Ad', 'Video Script', 'Marketing Copy', 'Creative Writing', 'General']).describe('The category for which the prompt is being generated.'),
  detailLevel: z.enum(['Short', 'Medium', 'Detailed', 'Advanced']).describe('The desired level of detail for the prompt.'),
  
  // Style fields for each category
  imageStyle: z.enum(['Photorealistic', 'Cartoon', 'Abstract', 'Painting', '3D Render', 'Anime/Manga', 'Pixel Art']).optional().describe('The artistic style for image generation prompts.'),
  websiteStyle: z.enum(['Minimalist', 'Corporate', 'Playful', 'Modern', 'Luxury']).optional().describe('The design style for website prompts.'),
  appStyle: z.enum(['Clean', 'Modern', 'Gamified', 'Professional', 'Neumorphic']).optional().describe('The design aesthetic for app prompts.'),
  socialMediaAdStyle: z.enum(['Urgent', 'Friendly', 'Humorous', 'Inspirational', 'Benefit-focused']).optional().describe('The tone/style for social media ad prompts.'),
  videoScriptStyle: z.enum(['Tutorial', 'Commercial', 'Vlog', 'Explainer', 'Documentary']).optional().describe('The type of video script to generate.'),
  marketingCopyStyle: z.enum(['Persuasive', 'Informative', 'Inspirational', 'Storytelling', 'Technical']).optional().describe('The tone for marketing copy prompts.'),
  creativeWritingStyle: z.enum(['Fantasy', 'Sci-Fi', 'Horror', 'Mystery', 'Romance']).optional().describe('The genre for creative writing prompts.'),
});
export type GeneratePromptInput = z.infer<typeof GeneratePromptInputSchema>;


export const GeneratePromptOutputSchema = z.object({
  prompt: z.string().describe('The AI-generated detailed prompt.'),
});
export type GeneratePromptOutput = z.infer<typeof GeneratePromptOutputSchema>;
