
'use server';

/**
 * @fileOverview An AI agent that provides an in-depth analysis of content from a web URL.
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
  model: 'googleai/gemini-pro',
  input: { schema: AiWebContentSummarizerInputSchema },
  output: { schema: AiWebContentSummarizerOutputSchema },
  prompt: `You are an expert web content analyst and SEO strategist. Your task is to perform an in-depth analysis of the content from the provided URL.

**URL to Analyze:** {{{url}}}

**Instructions:**

Your analysis must be comprehensive and structured according to the output schema.

1.  **Overall Summary:** Read the entire content and write a concise, one-paragraph summary of the main topic and purpose of the page.
2.  **Core Concepts:** Identify and list the 3-5 most important core concepts or themes discussed in the content. Each concept should be a short phrase.
3.  **Key Takeaways:** Extract a list of the most important, actionable, or insightful takeaways from the article. These should be presented as clear, concise bullet points.
4.  **Target Audience:** Analyze the language, topic, and depth to determine the intended target audience for this content (e.g., "Beginner developers," "Marketing professionals," "Academic researchers").
5.  **Tone of Voice:** Describe the tone and style of the writing (e.g., "Formal and academic," "Casual and humorous," "Technical and instructive," "Persuasive and marketing-oriented").
6.  **SEO Analysis:**
    *   **Primary Keywords:** Identify the top 3-5 primary keywords or keyphrases that the content seems to be targeting.
    *   **LSI Keywords:** Identify a list of 5-7 Latent Semantic Indexing (LSI) keywords or related terms that support the main topic.
7.  **Final Verdict:** Provide a brief, one-sentence final verdict on the content's quality, clarity, and purpose.

Generate a complete analysis based on these instructions.
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
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to process the content from the URL. The URL might be inaccessible or the content too complex.");
    }
    return output;
  }
);
