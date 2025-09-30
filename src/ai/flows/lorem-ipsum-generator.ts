
'use server';
/**
 * @fileOverview An AI agent that generates placeholder text based on a topic.
 *
 * - generateLoremIpsum - A function that generates placeholder text.
 * - GenerateLoremIpsumInput - The input type for the function.
 * - GenerateLoremIpsumOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    GenerateLoremIpsumInputSchema,
    GenerateLoremIpsumOutputSchema,
    type GenerateLoremIpsumInput,
    type GenerateLoremIpsumOutput,
} from './lorem-ipsum-generator.types';

export async function generateLoremIpsum(input: GenerateLoremIpsumInput): Promise<GenerateLoremIpsumOutput> {
  return generateLoremIpsumFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLoremIpsumPrompt',
  input: { schema: GenerateLoremIpsumInputSchema },
  output: { schema: GenerateLoremIpsumOutputSchema },
  prompt: `You are an expert at generating placeholder text. Your task is to generate text about a specific topic, formatted as paragraphs, sentences, or words. The generated text should resemble "Lorem Ipsum" in that it should be random-sounding and good for use as placeholder text in designs, but it must be based on the provided topic.

Topic: "{{{topic}}}"

Generate exactly {{{count}}} {{{type}}}.

- If the type is 'paragraphs', each paragraph should be separated by a double newline.
- Do not add any introductory or concluding phrases like "Here is your text:".
- Just generate the text itself.
`,
});

const generateLoremIpsumFlow = ai.defineFlow(
  {
    name: 'generateLoremIpsumFlow',
    inputSchema: GenerateLoremIpsumInputSchema,
    outputSchema: GenerateLoremIpsumOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate placeholder text. Please try again.");
    }
    return output;
  }
);
