
import { z } from 'zod';

export const AiWebContentSummarizerInputSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }).describe('The URL of the web page to summarize and explain.'),
});
export type AiWebContentSummarizerInput = z.infer<typeof AiWebContentSummarizerInputSchema>;

export const AiWebContentSummarizerOutputSchema = z.object({
  summary: z.string().describe('A concise, professional summary of the content.'),
  explanation: z.string().describe('A detailed, easy-to-understand explanation of the content.'),
});
export type AiWebContentSummarizerOutput = z.infer<typeof AiWebContentSummarizerOutputSchema>;
