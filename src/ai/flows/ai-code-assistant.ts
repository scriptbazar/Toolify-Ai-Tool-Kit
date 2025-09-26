
'use server';

/**
 * @fileOverview An AI agent that provides a comprehensive analysis of a given code snippet.
 *
 * - aiCodeAssistant - The main function for code analysis.
 * - AiCodeAssistantInput - The input type for the function.
 * - AiCodeAssistantOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  AiCodeAssistantInputSchema,
  AiCodeAssistantOutputSchema,
  type AiCodeAssistantInput,
  type AiCodeAssistantOutput,
} from './ai-code-assistant.types';

export async function aiCodeAssistant(
  input: AiCodeAssistantInput
): Promise<AiCodeAssistantOutput> {
  return aiCodeAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeAssistantPrompt',
  input: { schema: AiCodeAssistantInputSchema },
  output: { schema: AiCodeAssistantOutputSchema },
  prompt: `You are an expert software architect and a senior code reviewer with a specialization in security and performance. Your task is to provide an in-depth, multi-faceted analysis of the following code snippet.

Code to Analyze:
---
{{{code}}}
---

**Instructions:**

Your response must be structured according to the output schema.

1.  **Detect Language:** Identify all programming languages present in the code. If multiple languages are present (e.g., HTML with embedded JavaScript and CSS), list them all, separated by commas. Count the total number of unique languages and provide it in the 'count' field.

2.  **Detailed Summary:** Provide a detailed, one-paragraph executive summary of what the code does. Explain its main purpose, functionality, and how the different parts interact.

3.  **Detailed Explanation:** Give a clear, step-by-step, and in-depth explanation of how the code works. Break down the logic, describe every function, class, and variable, and explain the flow of execution in great detail. Use markdown for code blocks and formatting to make this easy for a beginner to understand.

4.  **Performance Analysis (Big O Notation):**
    *   Analyze the time complexity (Big O) of the main operations or the entire snippet.
    *   Analyze the space complexity (Big O).
    *   Explain your reasoning for the Big O analysis. For example, "The time complexity is O(n^2) because of the nested loop that iterates through the list twice."

5.  **Security Analysis:**
    *   Identify potential security vulnerabilities (e.g., SQL injection, XSS, insecure handling of secrets, buffer overflows, etc.).
    *   For each vulnerability, provide a brief explanation of the risk.
    *   If no vulnerabilities are found, state "No obvious security vulnerabilities were detected."

6.  **Suggest Improvements:**
    *   Analyze the code for potential bugs, style issues, or areas where it could be made more readable, efficient, or robust following best practices.
    *   Provide a numbered list of actionable improvement suggestions. Each suggestion should include a "before" and "after" code snippet to clearly illustrate the proposed change. Use markdown for code formatting.
`,
});

const aiCodeAssistantFlow = ai.defineFlow(
  {
    name: 'aiCodeAssistantFlow',
    inputSchema: AiCodeAssistantInputSchema,
    outputSchema: AiCodeAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to analyze the code. Please try again.');
    }
    return output;
  }
);

