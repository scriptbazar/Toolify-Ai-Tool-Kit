
'use server';

/**
 * @fileOverview An AI agent that generates detailed prompts in JSON format.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GeneratePromptInputSchema, JsonPromptOutputSchema, type GeneratePromptInput, type JsonPromptOutput } from './json-prompt-generator.types';

export async function generateJsonPrompt(input: GeneratePromptInput): Promise<JsonPromptOutput> {
  return generateJsonPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJsonPrompt',
  input: { schema: GeneratePromptInputSchema },
  output: { schema: JsonPromptOutputSchema },
  prompt: `You are an expert prompt engineer specializing in creating structured JSON prompts. Your task is to expand a simple user-provided topic into a detailed, well-structured, and creative prompt in JSON format.

The generated prompt should be a valid JSON object with descriptive keys and provide clear instructions to an AI model, incorporating the specified category, style, and detail level.

User's Topic:
"{{{topic}}}"

Prompt Category: {{{category}}}
Desired Detail Level: {{{detailLevel}}}

**JSON Structure Instructions:**
- The root object should have a "prompt" key containing the main instructions.
- Include a "category" key with the value: {{{category}}}.
- Include a "style" key with the relevant style if provided.
- Include a "detailLevel" key with the value: {{{detailLevel}}}.
- Add specific keys based on the category. For example, for "Image", include "subject", "setting", "lighting", "composition". For "Website", include "purpose", "targetAudience", "keyFeatures", "pages".

**Content Instructions:**
1.  Analyze the user's topic and the selected category to understand the core concept.
2.  Based on the **category**, tailor the JSON prompt with specific, actionable instructions:
    - If **Image**: Describe the subject, setting, lighting, composition, and colors.
    {{#if imageStyle}}
    The artistic style should be: **{{{imageStyle}}}**.
    {{/if}}
    - If **Website**: Describe the purpose, target audience, key features, required pages (Home, About, Contact, etc.), and desired look and feel.
    {{#if websiteStyle}}
    The design style should be: **{{{websiteStyle}}}**.
    {{/if}}
    - If **App**: Describe the app's core functionality, target user, main screens or user flow, platform (iOS, Android, web), and design aesthetic.
     {{#if appStyle}}
    The design aesthetic should be: **{{{appStyle}}}**.
    {{/if}}
3.  Adjust the length and complexity of the JSON values based on the **detail level**:
    - **Short**: A concise JSON object with key instructions.
    - **Medium**: A more detailed object with nested objects or arrays.
    - **Detailed**: A comprehensive, multi-level JSON object with specific instructions, examples, and constraints.
    - **Advanced**: A highly detailed, professional-grade JSON object with persona instructions for the AI (e.g., "persona": "Act as an expert marketer..."), constraints, negative constraints (what to avoid), and a clear definition of the expected output format.
4.  The final JSON prompt should be highly creative and inspire a high-quality, detailed response from an AI.

Generate only the valid JSON object.
`,
});

const generateJsonPromptFlow = ai.defineFlow(
  {
    name: 'generateJsonPromptFlow',
    inputSchema: GeneratePromptInputSchema,
    outputSchema: JsonPromptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate a JSON prompt.');
    }
    return output;
  }
);
