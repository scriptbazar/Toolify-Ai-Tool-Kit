
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
  model: 'googleai/gemini-pro',
  input: { schema: GeneratePromptInputSchema },
  output: { schema: GeneratePromptOutputSchema },
  prompt: `You are an expert prompt engineer. Your task is to expand a simple user-provided topic into a detailed, well-structured, and creative prompt suitable for an AI model.

The generated prompt should be descriptive and provide clear instructions to the AI, incorporating the specified category, style, and detail level.

User's Topic:
"{{{topic}}}"

Prompt Category: {{{category}}}
Desired Detail Level: {{{detailLevel}}}

Instructions:
1.  Analyze the user's topic and the selected category to understand the core concept.
2.  Based on the **category**, tailor the prompt with specific, actionable instructions:
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
    - If **Social Media Ad**: Describe the target platform (e.g., Instagram, Facebook, TikTok), the product/service, the target audience, the key message, a clear call-to-action, and the desired tone. Include requests for ad copy (headline, body text) and visual ideas.
    {{#if socialMediaAdStyle}}
    The tone/style for the ad should be: **{{{socialMediaAdStyle}}}**.
    {{/if}}
    - If **Video Script**: Describe the video type (e.g., tutorial, commercial, vlog, explainer), the core message, target audience, desired length, and tone. Include instructions for scene-by-scene descriptions, dialogue/voiceover text, and on-screen graphics or text overlays.
    {{#if videoScriptStyle}}
    The video type should be: **{{{videoScriptStyle}}}**.
    {{/if}}
    - If **Marketing Copy**: Describe the product/service, target audience, unique selling proposition (USP), desired emotional response, key benefits to highlight, and the specific format (e.g., email newsletter, landing page headline, product description).
     {{#if marketingCopyStyle}}
    The tone for the marketing copy should be: **{{{marketingCopyStyle}}}**.
    {{/if}}
    - If **Creative Writing**: Describe the genre (e.g., fantasy, sci-fi, horror), a basic plot summary, key characters with brief descriptions, the desired setting or atmosphere, and the narrative style (e.g., first-person, third-person).
     {{#if creativeWritingStyle}}
    The genre for the creative writing should be: **{{{creativeWritingStyle}}}**.
    {{/if}}
    - If **General**: Create a universally applicable, detailed prompt that encourages a comprehensive and well-structured response.
3.  Adjust the length and complexity based on the **detail level**:
    - **Short**: A concise, single-paragraph prompt with the main instructions.
    - **Medium**: A few paragraphs with bullet points for key elements.
    - **Detailed**: A comprehensive, multi-paragraph prompt with specific instructions, examples, and constraints.
    - **Advanced**: A highly detailed, professional-grade prompt with persona instructions for the AI (e.g., "Act as an expert marketer..."), constraints, negative constraints (what to avoid), and a clear definition of the expected output format.
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
