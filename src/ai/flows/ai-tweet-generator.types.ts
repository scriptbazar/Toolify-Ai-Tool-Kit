
import { z } from 'zod';

export const AiTweetGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic or a short prompt for the tweet.'),
  tone: z.enum(['Professional', 'Witty', 'Informative', 'Casual', 'Humorous']).describe('The desired tone for the tweet.'),
});
export type AiTweetGeneratorInput = z.infer<typeof AiTweetGeneratorInputSchema>;

export const AiTweetGeneratorOutputSchema = z.object({
  tweet: z.string().describe('The AI-generated tweet, including relevant hashtags.'),
});
export type AiTweetGeneratorOutput = z.infer<typeof AiTweetGeneratorOutputSchema>;
