
'use server';
/**
 * @fileOverview An AI agent that summarizes long texts.
 *
 * - summarizeContent - A function that generates a summary of a given text.
 * - AiContentSummarizerInput - The input type for the summarizeContent function.
 * - AiContentSummarizerOutput - The return type for the summarizeContent function.
 */

import {ai} from '@/ai/genkit';
import {
    AiContentSummarizerInputSchema,
    AiContentSummarizerOutputSchema,
    type AiContentSummarizerInput,
    type AiContentSummarizerOutput,
} from './ai-content-summarizer.types';

export async function summarizeContent(input: AiContentSummarizerInput): Promise<AiContentSummarizerOutput> {
  return summarizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  input: {schema: AiContentSummarizerInputSchema},
  output: {schema: AiContentSummarizerOutputSchema},
  prompt: `You are an expert at summarizing long and complex texts. Your task is to read the following text and provide a summary based on the requested length.

Requested Summary Length: {{{summaryLength}}}
- Short: Provide a concise, one-paragraph summary.
- Medium: Provide a summary with a few key bullet points.
- Detailed: Provide a more comprehensive summary with multiple paragraphs and sub-headings.

Text to Summarize:
---
{{{textToSummarize}}}
---

Please generate only the summary. Do not add any introductory or concluding phrases like "Here is the summary:".
`,
});

const summarizeContentFlow = ai.defineFlow(
  {
    name: 'summarizeContentFlow',
    inputSchema: AiContentSummarizerInputSchema,
    outputSchema: AiContentSummarizerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
