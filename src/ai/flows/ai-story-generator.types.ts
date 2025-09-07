
import { z } from 'zod';

export const AiStoryGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic or a short prompt for the story.'),
  genre: z.enum(['Fantasy', 'Sci-Fi', 'Mystery', 'Horror', 'Adventure', 'Romance', 'Comedy']).describe('The genre of the story.'),
});
export type AiStoryGeneratorInput = z.infer<typeof AiStoryGeneratorInputSchema>;

export const AiStoryGeneratorOutputSchema = z.object({
  story: z.string().describe('The AI-generated story.'),
});
export type AiStoryGeneratorOutput = z.infer<typeof AiStoryGeneratorOutputSchema>;
