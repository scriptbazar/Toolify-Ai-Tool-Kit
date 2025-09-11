
'use server';

/**
 * @fileOverview An AI agent that generates high-quality code with setup instructions and explanations.
 * - aiCodeGenerator - The main function for code generation.
 */

import { ai } from '@/ai/genkit';
import {
    AiCodeGeneratorInputSchema,
    AiCodeGeneratorOutputSchema,
    type AiCodeGeneratorInput,
    type AiCodeGeneratorOutput,
} from './ai-code-generator.types';

export async function aiCodeGenerator(input: AiCodeGeneratorInput): Promise<AiCodeGeneratorOutput> {
  return aiCodeGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeGeneratorPrompt',
  input: { schema: AiCodeGeneratorInputSchema },
  output: { schema: AiCodeGeneratorOutputSchema },
  prompt: `You are an expert software developer and a brilliant teacher. Your task is to generate high-quality code based on a user's request and provide comprehensive guidance.

User's Request: "{{{prompt}}}"
Programming Language: {{{language}}}

**Instructions:**

1.  **Generate High-Quality Code:**
    *   Write clean, efficient, and well-documented code that directly addresses the user's request.
    *   If the user asks for a web component (HTML/CSS/JS), you MUST provide separate and complete code for HTML, CSS, and JavaScript in their respective output fields ('html', 'css', 'javascript'). Do not combine them.
    *   For other languages (e.g., Python, Java), provide the complete code in the 'code' output field.
    *   The code should be ready to use.

2.  **Provide Setup Instructions:**
    *   Write clear, step-by-step instructions on how to set up and use the generated code.
    *   Assume the user has a basic understanding but needs clear guidance.
    *   For web code, explain where to place the HTML, how to link the CSS, and where to include the JavaScript. Mention any dependencies if applicable.
    *   For other languages, explain how to compile/run the code and list any required libraries or dependencies.
    *   Format this section with headings and bullet points for readability.

3.  **Explain the Code:**
    *   Provide a detailed, line-by-line or block-by-block explanation of how the code works.
    *   Explain the "why" behind the code, not just the "what."
    *   Describe the logic, the purpose of key functions or classes, and how different parts of the code interact.
    *   This section should be educational and help the user learn from the generated code.

Your response must be structured according to the output schema, containing 'generatedCode', 'setupInstructions', and 'codeExplanation'.
`,
});

const aiCodeGeneratorFlow = ai.defineFlow(
  {
    name: 'aiCodeGeneratorFlow',
    inputSchema: AiCodeGeneratorInputSchema,
    outputSchema: AiCodeGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate any code or instructions. Please try rephrasing your request.");
    }
    return output;
  }
);
