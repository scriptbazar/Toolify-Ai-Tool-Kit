
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

The generated prompt should be descriptive and provide clear instructions to the AI.

User's Topic:
"{{{topic}}}"

Instructions:
1.  Analyze the user's topic to understand the core concept.
2.  Expand upon the topic by adding descriptive details, specifying a style (e.g., photorealistic, cartoon, oil painting), suggesting a mood or atmosphere, and including relevant objects or characters.
3.  Structure the output as a single, coherent paragraph.
4.  The final prompt should be creative and inspire a high-quality response from an AI.

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
