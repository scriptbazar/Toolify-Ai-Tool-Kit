'use server';

/**
 * @fileOverview Manages AI prompt templates for different AI tools.
 *
 * - getPromptTemplate - Retrieves a prompt template by name.
 * - savePromptTemplate - Saves or updates a prompt template.
 * - AiPromptTemplateInput - The input type for prompt templates.
 * - AiPromptTemplateOutput - The return type for prompt templates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPromptTemplateInputSchema = z.object({
  name: z.string().describe('The name of the prompt template.'),
  content: z.string().describe('The content of the prompt template.'),
  description: z.string().optional().describe('A description of the prompt template.'),
});
export type AiPromptTemplateInput = z.infer<typeof AiPromptTemplateInputSchema>;

const AiPromptTemplateOutputSchema = z.object({
  name: z.string().describe('The name of the prompt template.'),
  content: z.string().describe('The content of the prompt template.'),
  description: z.string().optional().describe('A description of the prompt template.'),
});
export type AiPromptTemplateOutput = z.infer<typeof AiPromptTemplateOutputSchema>;

export async function getPromptTemplate(name: string): Promise<AiPromptTemplateOutput | undefined> {
  return getPromptTemplateFlow(name);
}

export async function savePromptTemplate(input: AiPromptTemplateInput): Promise<AiPromptTemplateOutput> {
  return savePromptTemplateFlow(input);
}

const getPromptTemplateFlow = ai.defineFlow(
  {
    name: 'getPromptTemplateFlow',
    inputSchema: z.string(),
    outputSchema: AiPromptTemplateOutputSchema.optional(),
  },
  async name => {
    // TODO: Replace with actual database lookup
    const template = promptTemplates.find(template => template.name === name);
    return template;
  }
);

const savePromptTemplateFlow = ai.defineFlow(
  {
    name: 'savePromptTemplateFlow',
    inputSchema: AiPromptTemplateInputSchema,
    outputSchema: AiPromptTemplateOutputSchema,
  },
  async input => {
    // TODO: Replace with actual database save/update logic
    const existingIndex = promptTemplates.findIndex(template => template.name === input.name);
    if (existingIndex > -1) {
      promptTemplates[existingIndex] = input;
    } else {
      promptTemplates.push(input);
    }
    return input;
  }
);

// In-memory storage for prompt templates (replace with database)
const promptTemplates: AiPromptTemplateOutput[] = [];
