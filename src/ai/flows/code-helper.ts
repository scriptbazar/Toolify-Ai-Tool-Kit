// src/ai/flows/code-helper.ts
'use server';
/**
 * @fileOverview A code generation AI agent.
 *
 * - codeHelper - A function that handles the code generation process.
 * - CodeHelperInput - The input type for the codeHelper function.
 * - CodeHelperOutput - The return type for the codeHelper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeHelperInputSchema = z.object({
  description: z.string().describe('The description of the coding problem or desired function.'),
});
export type CodeHelperInput = z.infer<typeof CodeHelperInputSchema>;

const CodeHelperOutputSchema = z.object({
  codeSnippet: z.string().describe('The generated code snippet or suggestion.'),
});
export type CodeHelperOutput = z.infer<typeof CodeHelperOutputSchema>;

export async function codeHelper(input: CodeHelperInput): Promise<CodeHelperOutput> {
  return codeHelperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeHelperPrompt',
  input: {schema: CodeHelperInputSchema},
  output: {schema: CodeHelperOutputSchema},
  prompt: `You are an expert code generation AI. You will generate code snippets based on the description provided by the user.

Description: {{{description}}}

Code Snippet:`,
});

const codeHelperFlow = ai.defineFlow(
  {
    name: 'codeHelperFlow',
    inputSchema: CodeHelperInputSchema,
    outputSchema: CodeHelperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
