import { z } from 'zod';

export const AiWebContentSummarizerInputSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }).describe('The URL of the web page to analyze.'),
});
export type AiWebContentSummarizerInput = z.infer<typeof AiWebContentSummarizerInputSchema>;

export const AiWebContentSummarizerOutputSchema = z.object({
  summary: z.string().describe('A concise, one-paragraph summary of the content.'),
  coreConcepts: z.array(z.string()).describe('A list of the 3-5 most important concepts discussed.'),
  keyTakeaways: z.array(z.string()).describe('A list of the main takeaways or conclusions from the content.'),
  targetAudience: z.string().describe('The intended target audience for the content.'),
  toneOfVoice: z.string().describe('The tone and style of the writing.'),
  seoAnalysis: z.object({
    primaryKeywords: z.array(z.string()).describe('A list of the primary SEO keywords targeted.'),
    lsiKeywords: z.array(z.string()).describe('A list of related LSI keywords.'),
  }).describe('An analysis of the content\'s SEO elements.'),
  finalVerdict: z.string().describe('A brief, one-sentence final verdict on the content.'),
});
export type AiWebContentSummarizerOutput = z.infer<typeof AiWebContentSummarizerOutputSchema>;
