'use server';

/**
 * @fileOverview AI-powered resume builder flow.
 *
 * - aiResumeBuilder - A function that generates a resume using AI.
 * - AiResumeBuilderInput - The input type for the aiResumeBuilder function.
 * - AiResumeBuilderOutput - The return type for the aiResumeBuilder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiResumeBuilderInputSchema = z.object({
  jobExperience: z.string().describe('Details of your job experience.'),
  skills: z.string().describe('Your skills.'),
  education: z.string().describe('Your education details.'),
});
export type AiResumeBuilderInput = z.infer<typeof AiResumeBuilderInputSchema>;

const AiResumeBuilderOutputSchema = z.object({
  resume: z.string().describe('The generated resume.'),
});
export type AiResumeBuilderOutput = z.infer<typeof AiResumeBuilderOutputSchema>;

export async function aiResumeBuilder(input: AiResumeBuilderInput): Promise<AiResumeBuilderOutput> {
  return aiResumeBuilderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiResumeBuilderPrompt',
  input: {schema: AiResumeBuilderInputSchema},
  output: {schema: AiResumeBuilderOutputSchema},
  prompt: `You are an expert resume writer. Create a professional resume based on the following information:\n\nJob Experience: {{{jobExperience}}}\nSkills: {{{skills}}}\nEducation: {{{education}}}`,
});

const aiResumeBuilderFlow = ai.defineFlow(
  {
    name: 'aiResumeBuilderFlow',
    inputSchema: AiResumeBuilderInputSchema,
    outputSchema: AiResumeBuilderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
