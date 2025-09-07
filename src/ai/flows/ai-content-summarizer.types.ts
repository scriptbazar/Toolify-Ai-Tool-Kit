
import { z } from 'zod';

export const AiContentSummarizerInputSchema = z.object({
  textToSummarize: z.string().describe('The text content to be summarized.'),
  summaryLength: z.enum(['Short', 'Medium', 'Detailed']).describe('The desired length and format of the summary.'),
});
export type AiContentSummarizerInput = z.infer<typeof AiContentSummarizerInputSchema>;

export const AiContentSummarizerOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the text.'),
});
export type AiContentSummarizerOutput = z.infer<typeof AiContentSummarizerOutputSchema>;
