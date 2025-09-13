'use server';
/**
 * @fileOverview An AI agent that generates SEO keywords for a given topic.
 * 
 * - aiSeoKeywordGenerator - The main function for generating keywords.
 */

import { ai } from '@/ai/genkit';
import {
    AiSeoKeywordGeneratorInputSchema,
    AiSeoKeywordGeneratorOutputSchema,
    type AiSeoKeywordGeneratorInput,
    type AiSeoKeywordGeneratorOutput,
} from './ai-seo-keyword-generator.types';

export async function aiSeoKeywordGenerator(input: AiSeoKeywordGeneratorInput): Promise<AiSeoKeywordGeneratorOutput> {
  return aiSeoKeywordGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSeoKeywordGeneratorPrompt',
  input: { schema: AiSeoKeywordGeneratorInputSchema },
  output: { schema: AiSeoKeywordGeneratorOutputSchema },
  prompt: `You are an expert SEO strategist with deep knowledge of keyword research and user intent. Your task is to generate a comprehensive list of keywords for a given topic, tailored for a specific audience.

Topic: "{{{topic}}}"
Target Audience: "{{{targetAudience}}}"

**Instructions:**

1.  **Analyze Intent:** First, analyze the user's topic and target audience to understand the underlying search intent (informational, transactional, commercial, navigational).
2.  **Generate Primary Keywords:** Create a list of 5-7 core, high-volume "head" keywords. These are the main terms people would search for.
3.  **Generate Secondary Keywords:** Create a list of 10-15 related "body" keywords. These are more specific than primary keywords and often consist of 2-3 words. They should cover different facets of the main topic.
4.  **Generate Long-Tail Keywords:** Create a list of 10-15 conversational, question-based, or very specific "long-tail" keywords (4+ words). These are crucial for capturing highly qualified traffic and answering specific user questions. Examples include "how to...", "best X for Y", "compare A and B".
5.  **Quality & Relevance:** Ensure all generated keywords are highly relevant to the topic and appropriate for the target audience. Avoid overly broad or irrelevant terms.

Structure your response according to the output schema. Return the keywords as simple arrays of strings.
`,
});

const aiSeoKeywordGeneratorFlow = ai.defineFlow(
  {
    name: 'aiSeoKeywordGeneratorFlow',
    inputSchema: AiSeoKeywordGeneratorInputSchema,
    outputSchema: AiSeoKeywordGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate any keywords. Please try refining your topic.");
    }
    return output;
  }
);

    