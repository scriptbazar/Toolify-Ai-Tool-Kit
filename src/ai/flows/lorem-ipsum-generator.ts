
'use server';

/**
 * @fileOverview An AI-powered Lorem Ipsum generator.
 */

import { ai } from '@/ai/genkit';
import { LoremIpsumInputSchema, LoremIpsumOutputSchema, type LoremIpsumInput, type LoremIpsumOutput } from './lorem-ipsum-generator.types';

export async function generateLoremIpsum(input: LoremIpsumInput): Promise<LoremIpsumOutput> {
  return generateLoremIpsumFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLoremIpsumPrompt',
  input: { schema: LoremIpsumInputSchema },
  output: { schema: LoremIpsumOutputSchema },
  prompt: `You are an expert text generator. Your task is to generate placeholder text, similar to Lorem Ipsum, but based on a specific topic if provided.

**Instructions:**

1.  **Text Type:** Generate the requested number of {{type}}.
2.  **Amount:** Generate exactly {{count}} {{type}}.
3.  **Topic:** 
    {{#if topic}}
    The text should be themed around **"{{{topic}}}"**. Use vocabulary and sentence structures related to this topic, but ensure the text remains nonsensical and serves as placeholder content. It should look plausible but not be distracting.
    {{else}}
    Generate traditional, classic "Lorem ipsum dolor sit amet..." style text.
    {{/if}}
4.  **Formatting:**
    *   If generating paragraphs, separate them with a double newline character ('\n\n').
    *   If generating sentences or words, separate them with spaces.
    *   Do not add any titles, headings, or introductory phrases like "Here is your text:". Generate only the requested text.

Generate the text now.
`,
});

const generateLoremIpsumFlow = ai.defineFlow(
  {
    name: 'generateLoremIpsumFlow',
    inputSchema: LoremIpsumInputSchema,
    outputSchema: LoremIpsumOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate Lorem Ipsum text.');
    }
    return output;
  }
);
