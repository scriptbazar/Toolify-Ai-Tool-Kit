
import { z } from 'zod';

export const AiCodeAssistantInputSchema = z.object({
  language: z.string().describe('The programming language of the code.'),
  requestType: z.enum(['generate', 'debug', 'explain']).describe('The type of assistance requested.'),
  code: z.string().describe('The code snippet or a description of the code to generate.'),
});
export type AiCodeAssistantInput = z.infer<typeof AiCodeAssistantInputSchema>;

export const AiCodeAssistantOutputSchema = z.object({
  response: z.string().describe('The generated code, explanation, or debugging suggestions.'),
});
export type AiCodeAssistantOutput = z.infer<typeof AiCodeAssistantOutputSchema>;
