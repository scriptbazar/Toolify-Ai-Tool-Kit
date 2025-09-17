
'use server';

/**
 * @fileOverview An AI agent that provides a comprehensive analysis of a given code snippet.
 *
 * - aiCodeAnalyzer - The main function for code analysis.
 * - AiCodeAnalyzerInput - The input type for the function.
 * - AiCodeAnalyzerOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  AiCodeAnalyzerInputSchema,
  AiCodeAnalyzerOutputSchema,
  type AiCodeAnalyzerInput,
  type AiCodeAnalyzerOutput,
} from './ai-code-analyzer.types';

export async function aiCodeAnalyzer(
  input: AiCodeAnalyzerInput
): Promise<AiCodeAnalyzerOutput> {
  return aiCodeAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeAnalyzerPrompt',
  input: { schema: AiCodeAnalyzerInputSchema },
  output: { schema: AiCodeAnalyzerOutputSchema },
  prompt: `You are an expert software developer and code reviewer. Your task is to provide a comprehensive analysis of the following code snippet.

Code to Analyze:
---
{{{code}}}
---

**Instructions:**

1.  **Detect Language:** Identify the programming language of the code. If it's ambiguous, make your best guess.
2.  **Summarize:** Provide a concise, one-paragraph summary of what the code does. Explain its main purpose and functionality.
3.  **Explain:** Give a clear, step-by-step explanation of how the code works. Break down the logic, describe key functions or classes, and explain the flow of execution. This should be easy for a beginner to understand.
4.  **Suggest Improvements:** Analyze the code for potential bugs, style issues, performance bottlenecks, or areas where it could be made more readable, efficient, or robust. Provide a list of actionable improvement suggestions.

Your response must be structured according to the output schema.
`,
});

const aiCodeAnalyzerFlow = ai.defineFlow(
  {
    name: 'aiCodeAnalyzerFlow',
    inputSchema: AiCodeAnalyzerInputSchema,
    outputSchema: AiCodeAnalyzerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to analyze the code. Please try again.');
    }
    return output;
  }
);
