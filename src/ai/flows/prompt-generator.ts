
'use server';

/**
 * @fileOverview An AI agent that generates detailed prompts from a simple topic.
 */

import { ai } from '@/ai/genkit';
import { GeneratePromptInputSchema, GeneratePromptOutputSchema, type GeneratePromptInput, type GeneratePromptOutput } from './prompt-generator.types';

export async function generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput> {
  return generatePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePrompt',
  input: { schema: GeneratePromptInputSchema },
  output: { schema: GeneratePromptOutputSchema },
  prompt: `You are an expert prompt engineer. Your task is to expand a simple user-provided topic into a detailed, well-structured, and creative prompt suitable for an AI image generator or a text-based AI model.

The generated prompt should be descriptive and provide clear instructions to the AI, incorporating the specified style and mood.

User's Topic:
"{{{topic}}}"

Artistic Style: {{{style}}}
Desired Mood: {{{mood}}}

Instructions:
1.  Analyze the user's topic to understand the core concept.
2.  Expand upon the topic by adding descriptive details about the subject, setting, lighting, and composition.
3.  Incorporate the specified artistic style (e.g., '{{style}}') and mood (e.g., '{{mood}}') into the narrative of the prompt.
4.  Suggest specific elements that would enhance the desired mood, such as color palettes, weather conditions, or character expressions.
5.  Structure the output as a single, coherent paragraph.
6.  The final prompt should be highly creative and inspire a high-quality, detailed response from an AI.

Generate only the prompt text itself.
`,
});


const generatePromptFlow = ai.defineFlow(
  {
    name: 'generatePromptFlow',
    inputSchema: GeneratePromptInputSchema,
    outputSchema: GeneratePromptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate a prompt.');
    }
    return output;
  }
);

