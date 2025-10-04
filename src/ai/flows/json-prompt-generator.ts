
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
  model: 'googleai/gemini-pro',
  input: { schema: GeneratePromptInputSchema },
  output: { schema: JsonPromptOutputSchema },
  prompt: `You are an expert prompt engineer specializing in creating highly detailed and structured JSON prompts. Your task is to expand a simple user-provided topic into a sophisticated, multi-level, and creative prompt in JSON format.

The final output must be a single, valid JSON object.

**User's Topic:**
"{{{topic}}}"

**Prompt Category:** {{{category}}}
**Desired Detail Level:** {{{detailLevel}}}

---

**JSON STRUCTURE & CONTENT INSTRUCTIONS:**

1.  **Root Object:** The root of the JSON must contain a "prompt" key. This key will hold the main prompt object.
2.  **Analyze User Input:** Deeply analyze the user's topic ("{{{topic}}}") and category ("{{{category}}}") to understand the core intent and entities.
3.  **Tailor by Category:** The structure and keys of the JSON object must be specifically tailored to the category.
    *   For **Image**:
        *   **Core Keys:** \`subject\`, \`setting\`, \`composition\`, \`lighting\`, \`mood\`, \`style\`.
        *   **Advanced Keys (for 'Detailed'/'Advanced' levels):** \`camera_details\` (e.g., lens, aperture), \`color_palette\` (array of hex codes or descriptive colors), \`negative_prompt\` (what to avoid).
        *   **Style:** The artistic style should be: **{{#if imageStyle}}{{{imageStyle}}}{{else}}Photorealistic{{/if}}**.
    *   For **Website**:
        *   **Core Keys:** \`purpose\`, \`target_audience\`, \`key_features\` (as an array), \`pages\` (array of objects with 'name' and 'purpose' keys).
        *   **Advanced Keys:** \`design_aesthetic\` (object with keys like 'color_scheme', 'typography', 'layout_style'), \`call_to_action\`, \`seo_keywords\` (array).
        *   **Style:** The design style should be: **{{#if websiteStyle}}{{{websiteStyle}}}{{else}}Modern{{/if}}**.
    *   For **App**:
        *   **Core Keys:** \`app_idea\`, \`target_user\`, \`platform\` (e.g., iOS, Android, Web), \`core_functionality\` (array of strings), \`user_flow\` (object describing steps).
        *   **Advanced Keys:** \`monetization_strategy\`, \`competitor_analysis\` (brief points), \`ui_ux_notes\` (object with 'design_aesthetic', 'accessibility_notes').
        *   **Style:** The design aesthetic should be: **{{#if appStyle}}{{{appStyle}}}{{else}}Clean{{/if}}**.
4.  **Adjust by Detail Level:** The complexity and depth of the JSON object must match the detail level.
    *   **Short:** A concise JSON object with 3-4 top-level keys and simple string values.
    *   **Medium:** A more detailed object with nested objects and arrays. Aim for 2 levels of nesting.
    *   **Detailed:** A comprehensive, multi-level JSON object (2-3 levels deep) with specific instructions, examples, and constraints.
    *   **Advanced:** A professional-grade, deeply nested (3+ levels) JSON object. It MUST include a "persona" key (e.g., "Act as an expert marketer..."), detailed constraints, negative constraints (what to avoid), and a clear definition of the expected output format (e.g., "Output a markdown-formatted report").
5.  **Be Creative & Specific:** Do not just list keys. Populate them with highly creative, descriptive, and inspiring values based on the user's topic. For example, for an 'Image' of a 'magic forest', the setting shouldn't just be "forest"; it should be "An ancient, bioluminescent forest at twilight, with glowing mushrooms and moss-covered trees."

Generate only the valid JSON object as your response. Do not include any text before or after the JSON.
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
