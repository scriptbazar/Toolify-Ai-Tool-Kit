
'use server';
/**
 * @fileOverview An AI agent that rewrites user-provided text based on a specific goal.
 *
 * - aiRewriter - A function that rewrites text.
 * - AiRewriterInput - The input type for the aiRewriter function.
 * - AiRewriterOutput - The return type for the aiRewriter function.
 */

import {ai} from '@/ai/genkit';
import {
    AiRewriterInputSchema,
    AiRewriterOutputSchema,
    type AiRewriterInput,
    type AiRewriterOutput,
} from './ai-rewriter.types';

export async function aiRewriter(input: AiRewriterInput): Promise<AiRewriterOutput> {
  return aiRewriterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiRewriterPrompt',
  input: {schema: AiRewriterInputSchema},
  output: {schema: AiRewriterOutputSchema},
  prompt: `You are an expert editor and copywriter. Your task is to rewrite the given text based on the user's specified goal.

User's Goal: **{{{goal}}}**

Instructions for the goal:
- **Improve Clarity:** Rephrase complex sentences, simplify vocabulary, and improve the overall flow and readability.
- **Make it Formal:** Convert casual language, slang, and abbreviations into professional and formal language suitable for business or academic contexts.
- **Make it Casual:** Convert formal language into a more relaxed, conversational, and friendly tone.
- **Fix Grammar & Spelling:** Correct all grammatical errors, typos, and punctuation mistakes.
- **Shorten:** Condense the text to its most essential points while retaining the core message. Make it more concise.
- **Expand:** Elaborate on the given text, adding more detail, examples, or explanations to make it more comprehensive.

Original Text:
---
{{{textToRewrite}}}
---

Please provide only the rewritten text as your response.
`,
});

const aiRewriterFlow = ai.defineFlow(
  {
    name: 'aiRewriterFlow',
    inputSchema: AiRewriterInputSchema,
    outputSchema: AiRewriterOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
