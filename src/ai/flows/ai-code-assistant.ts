
'use server';
/**
 * @fileOverview An AI agent that assists with code generation, debugging, and explanation.
 *
 * - aiCodeAssistant - The main function for code assistance.
 * - AiCodeAssistantInput - The input type for the function.
 * - AiCodeAssistantOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
    AiCodeAssistantInputSchema,
    AiCodeAssistantOutputSchema,
    type AiCodeAssistantInput,
    type AiCodeAssistantOutput,
} from './ai-code-assistant.types';

export async function aiCodeAssistant(input: AiCodeAssistantInput): Promise<AiCodeAssistantOutput> {
  return aiCodeAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeAssistantPrompt',
  input: {schema: AiCodeAssistantInputSchema},
  output: {schema: AiCodeAssistantOutputSchema},
  prompt: `You are an expert AI Code Assistant. Your task is to help a developer with their code based on their request.
The programming language is: {{language}}.

The user's request type is: {{requestType}}.

{{#if (eq requestType "generate")}}
You must generate a code snippet based on the user's instructions.
The user wants you to generate the following:
---
{{{code}}}
---
Please provide only the raw code as a response, without any explanation or markdown formatting.
{{/if}}

{{#if (eq requestType "debug")}}
You must analyze the following code snippet, identify any bugs or errors, and provide a corrected version along with a brief explanation of the fix.
---
{{{code}}}
---
Your response should be formatted as follows:
[EXPLANATION OF THE BUG]
---
[CORRECTED CODE]
{{/if}}

{{#if (eq requestType "explain")}}
You must explain the following code snippet in a clear, concise, and easy-to-understand way for a beginner.
---
{{{code}}}
---
Your response should be a step-by-step explanation of what the code does.
{{/if}}

{{#if (eq requestType "minify")}}
You must minify the following {{language}} code. Remove all unnecessary characters, whitespace, and comments without altering the functionality. Provide only the minified code as the response.
---
{{{code}}}
---
{{/if}}
`,
});

const aiCodeAssistantFlow = ai.defineFlow(
  {
    name: 'aiCodeAssistantFlow',
    inputSchema: AiCodeAssistantInputSchema,
    outputSchema: AiCodeAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
