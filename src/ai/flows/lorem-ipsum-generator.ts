
'use server';

/**
 * @fileOverview An AI-powered Lorem Ipsum generator.
 */

import { ai } from '@/ai/genkit';
import { LoremIpsumInputSchema, LoremIpsumOutputSchema, type LoremIpsumInput, type LoremIpsumOutput } from './lorem-ipsum-generator.types';

export async function generateLoremIpsum(input: LoremIpsumInput): Promise<LoremIpsumOutput> {
  return generateLoremIpsumFlow(input);
}

const generateLoremIpsumFlow = ai.defineFlow(
  {
    name: 'generateLoremIpsumFlow',
    inputSchema: LoremIpsumInputSchema,
    outputSchema: LoremIpsumOutputSchema,
  },
  async (input) => {
    
    const topicInstruction = input.topic
        ? `The text should be themed around **"${input.topic}"**. Use vocabulary and sentence structures related to this topic, but ensure the text remains nonsensical and serves as placeholder content. It should look plausible but not be distracting.`
        : 'Generate traditional, classic "Lorem ipsum dolor sit amet..." style text.';

    const prompt = `You are an expert text generator. Your task is to generate placeholder text, similar to Lorem Ipsum, but based on a specific topic if provided.

**Instructions:**

1.  **Text Type:** Generate the requested number of ${input.type}.
2.  **Amount:** Generate exactly ${input.count} ${input.type}.
3.  **Topic:** 
    ${topicInstruction}
4.  **Formatting:**
    *   If generating paragraphs, separate them with a double newline character ('\\n\\n').
    *   If generating sentences or words, separate them with spaces.
    *   Do not add any titles, headings, or introductory phrases like "Here is your text:". Generate only the requested text.

Generate the text now.
`;

    const { text } = await ai.generate({
        prompt: prompt,
    });
    
    if (!text) {
        throw new Error("Failed to generate Lorem Ipsum text.");
    }
    
    return { text };
  }
);
