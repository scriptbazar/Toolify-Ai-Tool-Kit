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
  prompt: `You are an expert prompt engineer. Your task is to expand a simple user-provided topic into a detailed, well-structured, and creative prompt suitable for an AI model.

The generated prompt should be descriptive and provide clear instructions to the AI, incorporating the specified category and detail level.

User's Topic:
"{{{topic}}}"

Prompt Category: {{{category}}}
Desired Detail Level: {{{detailLevel}}}

Instructions:
1.  Analyze the user's topic and the selected category to understand the core concept.
2.  Based on the **category**, tailor the prompt.
    - If **Image**: Describe the subject, setting, lighting, composition, colors, and artistic style.
    - If **Website**: Describe the purpose, target audience, key features, pages, and desired look and feel.
    - If **App**: Describe the app's core functionality, user flow, main screens, and design aesthetic.
    - If **Social Media Ad**: Describe the target platform (e.g., Instagram, Facebook), the product/service being advertised, the target audience, the key message, a call-to-action, and the desired tone (e.g., urgent, friendly, humorous). Include requests for ad copy (headline, body text) and visual ideas.
    - If **Video Script**: Describe the video type (e.g., tutorial, commercial, vlog), the core message, target audience, desired length, and tone. Include instructions for scene-by-scene descriptions, dialogue, voiceover text, and on-screen graphics.
    - If **General**: Create a universally applicable, detailed prompt.
3.  Adjust the length and complexity based on the **detail level**:
    - **Short**: A concise, single-paragraph prompt.
    - **Medium**: A few paragraphs with bullet points for key elements.
    - **Detailed**: A comprehensive, multi-paragraph prompt with specific instructions.
    - **Advanced**: A highly detailed, professional-grade prompt with constraints, examples, and persona instructions for the AI.
4.  The final prompt should be highly creative and inspire a high-quality, detailed response from an AI.

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
