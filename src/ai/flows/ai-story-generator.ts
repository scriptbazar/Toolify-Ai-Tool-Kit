
'use server';
/**
 * @fileOverview AI Story Generator tool that creates short stories based on user input.
 *
 * - aiStoryGenerator - A function that generates a story based on a topic and genre.
 * - AiStoryGeneratorInput - The input type for the aiStoryGenerator function.
 * - AiStoryGeneratorOutput - The return type for the aiStoryGenerator function.
 */

import {ai} from '@/ai/genkit';
import {
    AiStoryGeneratorInputSchema,
    AiStoryGeneratorOutputSchema,
    type AiStoryGeneratorInput,
    type AiStoryGeneratorOutput,
} from './ai-story-generator.types';

export async function aiStoryGenerator(input: AiStoryGeneratorInput): Promise<AiStoryGeneratorOutput> {
  return aiStoryGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStoryGeneratorPrompt',
  input: {schema: AiStoryGeneratorInputSchema},
  output: {schema: AiStoryGeneratorOutputSchema},
  config: {
    responseMimeType: "application/json",
  },
  prompt: `You are an expert storyteller. Your task is to write a short, engaging story based on the user's provided topic and genre.

{{#if language}}
The story must be written in the following language: **{{{language}}}**.
{{/if}}

Genre: {{{genre}}}
Topic/Prompt: "{{{topic}}}"

Instructions:
1.  Craft a compelling narrative with a clear beginning, middle, and end.
2.  Develop at least one interesting character.
3.  Ensure the story fits the selected genre and is engaging.
4.  The story should be at least 300 words long.
5.  Generate only the story text. Do not add a title or any other introductory phrases.
`,
});

const aiStoryGeneratorFlow = ai.defineFlow(
  {
    name: 'aiStoryGeneratorFlow',
    inputSchema: AiStoryGeneratorInputSchema,
    outputSchema: AiStoryGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a story. Please try again.");
    }
    return output;
  }
);
