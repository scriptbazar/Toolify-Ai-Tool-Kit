'use server';
/**
 * @fileOverview AI Writer tool that generates articles, blog posts, or marketing copy based on user input.
 *
 * - aiWriter - A function that generates content based on the provided topic or keywords.
 * - AiWriterInput - The input type for the aiWriter function.
 * - AiWriterOutput - The return type for the aiWriter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiWriterInputSchema = z.object({
  topic: z.string().describe('The topic or keywords for the AI to generate content about.'),
});
export type AiWriterInput = z.infer<typeof AiWriterInputSchema>;

const AiWriterOutputSchema = z.object({
  content: z.string().describe('The generated article, blog post, or marketing copy.'),
});
export type AiWriterOutput = z.infer<typeof AiWriterOutputSchema>;

export async function aiWriter(input: AiWriterInput): Promise<AiWriterOutput> {
  return aiWriterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWriterPrompt',
  input: {schema: AiWriterInputSchema},
  output: {schema: AiWriterOutputSchema},
  prompt: `You are an expert content writer. Generate an original and relevant article, blog post, or marketing copy based on the following topic or keywords: {{{topic}}}.`,
});

const aiWriterFlow = ai.defineFlow(
  {
    name: 'aiWriterFlow',
    inputSchema: AiWriterInputSchema,
    outputSchema: AiWriterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
