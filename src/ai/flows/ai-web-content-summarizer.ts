
'use server';

/**
 * @fileOverview An AI agent that summarizes and explains content from a web URL.
 * 
 * - summarizeAndExplainWebContent - A function that fetches content from a URL and uses AI to process it.
 */

import { ai } from '@/ai/genkit';
import {
    AiWebContentSummarizerInputSchema,
    AiWebContentSummarizerOutputSchema,
    type AiWebContentSummarizerInput,
    type AiWebContentSummarizerOutput,
} from './ai-web-content-summarizer.types';

export async function summarizeAndExplainWebContent(input: AiWebContentSummarizerInput): Promise<AiWebContentSummarizerOutput> {
  return summarizeAndExplainWebContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAndExplainWebContentPrompt',
  input: { schema: AiWebContentSummarizerInputSchema },
  output: { schema: AiWebContentSummarizerOutputSchema },
  prompt: `You are an expert analyst and writer. Your task is to analyze the content of the provided URL, create a professional summary, and provide a detailed explanation.

**URL to Analyze:** {{{url}}}

**Instructions:**

1.  **Access and Read:** Access the content of the provided URL.
2.  **Professional Summary:** Write a concise, professional summary of the key points and main arguments from the content. The summary should be suitable for a busy executive.
3.  **Detailed Explanation:** Write a detailed, easy-to-understand explanation of the content. Break down complex topics, explain jargon, and provide context where necessary. This section should be educational for someone unfamiliar with the topic.

Structure your response according to the output schema.
`,
});

const summarizeAndExplainWebContentFlow = ai.defineFlow(
  {
    name: 'summarizeAndExplainWebContentFlow',
    inputSchema: AiWebContentSummarizerInputSchema,
    outputSchema: AiWebContentSummarizerOutputSchema,
  },
  async (input) => {
    // Gemini can directly access public URLs provided in the prompt.
    // In a production app, for more reliability, you might fetch the content
    // using a library like Cheerio or Puppeteer and then pass the text content.
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to process the content from the URL. The URL might be inaccessible or the content too complex.");
    }
    return output;
  }
);
