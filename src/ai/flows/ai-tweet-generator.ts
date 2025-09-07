
'use server';
/**
 * @fileOverview An AI agent that generates tweets from a topic.
 *
 * - aiTweetGenerator - A function that generates a tweet based on a topic and tone.
 * - AiTweetGeneratorInput - The input type for the aiTweetGenerator function.
 * - AiTweetGeneratorOutput - The return type for the aiTweetGenerator function.
 */

import {ai} from '@/ai/genkit';
import {
    AiTweetGeneratorInputSchema,
    AiTweetGeneratorOutputSchema,
    type AiTweetGeneratorInput,
    type AiTweetGeneratorOutput,
} from './ai-tweet-generator.types';

export async function aiTweetGenerator(input: AiTweetGeneratorInput): Promise<AiTweetGeneratorOutput> {
  return aiTweetGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTweetGeneratorPrompt',
  input: {schema: AiTweetGeneratorInputSchema},
  output: {schema: AiTweetGeneratorOutputSchema},
  prompt: `You are an expert social media manager specializing in writing engaging tweets. Your task is to generate a concise, impactful tweet based on the user's provided topic and tone.

Topic: "{{{topic}}}"
Tone: {{{tone}}}

Instructions:
1.  Craft a tweet that is under 280 characters.
2.  The tweet should be engaging and relevant to the topic.
3.  Include 2-3 relevant and popular hashtags.
4.  Ensure the tweet matches the selected tone.
5.  Generate only the tweet text.
`,
});

const aiTweetGeneratorFlow = ai.defineFlow(
  {
    name: 'aiTweetGeneratorFlow',
    inputSchema: AiTweetGeneratorInputSchema,
    outputSchema: AiTweetGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
