
import { z } from 'zod';

export const GeneratePromptInputSchema = z.object({
  topic: z.string().describe('The simple topic or keywords provided by the user.'),
  style: z.enum(['Photorealistic', 'Cartoon', 'Oil Painting', 'Abstract', 'Anime', 'Minimalist']).describe('The artistic style of the desired output.'),
  mood: z.enum(['Cinematic', 'Dramatic', 'Cheerful', 'Mysterious', 'Calm', 'Futuristic']).describe('The mood or atmosphere of the prompt.'),
});
export type GeneratePromptInput = z.infer<typeof GeneratePromptInputSchema>;


export const GeneratePromptOutputSchema = z.object({
  prompt: z.string().describe('The AI-generated detailed prompt.'),
});
export type GeneratePromptOutput = z.infer<typeof GeneratePromptOutputSchema>;
