import { z } from 'zod';

export const AiSeoKeywordGeneratorInputSchema = z.object({
  topic: z.string().describe('The main topic or subject for which to generate keywords.'),
  targetAudience: z.string().describe('The intended audience for the content (e.g., beginners, experts, developers, marketers).'),
});
export type AiSeoKeywordGeneratorInput = z.infer<typeof AiSeoKeywordGeneratorInputSchema>;

export const AiSeoKeywordGeneratorOutputSchema = z.object({
  primaryKeywords: z.array(z.string()).describe('A list of 5-7 core, high-volume "head" keywords.'),
  secondaryKeywords: z.array(z.string()).describe('A list of 10-15 related "body" keywords (2-3 words).'),
  longTailKeywords: z.array(z.string()).describe('A list of 10-15 conversational or question-based "long-tail" keywords (4+ words).'),
});
export type AiSeoKeywordGeneratorOutput = z.infer<typeof AiSeoKeywordGeneratorOutputSchema>;

    