'use server';

/**
 * @fileOverview An AI agent that composes emails based on user-provided criteria.
 *
 * - composeEmail - A function that generates an email body using AI.
 * - AiEmailComposerInput - The input type for the composeEmail function.
 * - AiEmailComposerOutput - The return type for the composeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AiEmailComposerInputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  keyPoints: z.string().describe('The key points or message to convey in the email. This can be a simple sentence or a list of bullet points.'),
  tone: z.enum(['Formal', 'Casual', 'Friendly', 'Professional', 'Humorous']).describe('The desired tone of voice for the email.'),
});
export type AiEmailComposerInput = z.infer<typeof AiEmailComposerInputSchema>;

export const AiEmailComposerOutputSchema = z.object({
  emailBody: z.string().describe('The AI-generated body of the email.'),
});
export type AiEmailComposerOutput = z.infer<typeof AiEmailComposerOutputSchema>;

export async function composeEmail(input: AiEmailComposerInput): Promise<AiEmailComposerOutput> {
  return composeEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'composeEmailPrompt',
  input: {schema: AiEmailComposerInputSchema},
  output: {schema: AiEmailComposerOutputSchema},
  prompt: `You are an expert email copywriter. Your task is to write a clear, concise, and effective email based on the provided information.

Subject: {{{subject}}}

Key Points to Include:
{{{keyPoints}}}

Tone: {{{tone}}}

Please generate only the body of the email. Do not include the subject line in your response.
`,
});

const composeEmailFlow = ai.defineFlow(
  {
    name: 'composeEmailFlow',
    inputSchema: AiEmailComposerInputSchema,
    outputSchema: AiEmailComposerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate email content.');
    }
    return { emailBody: output.emailBody };
  }
);
