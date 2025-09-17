
import { z } from 'zod';

export const AiCodeAnalyzerInputSchema = z.object({
  code: z.string().describe('The code snippet to be analyzed.'),
});
export type AiCodeAnalyzerInput = z.infer<typeof AiCodeAnalyzerInputSchema>;

export const AiCodeAnalyzerOutputSchema = z.object({
  language: z
    .string()
    .describe('The detected programming language of the code.'),
  summary: z
    .string()
    .describe('A concise summary of what the code does.'),
  explanation: z
    .string()
    .describe('A step-by-step explanation of how the code works.'),
  improvements: z
    .string()
    .describe(
      'A list of actionable suggestions for improving the code (e.g., bug fixes, style improvements, performance optimizations).'
    ),
});
export type AiCodeAnalyzerOutput = z.infer<typeof AiCodeAnalyzerOutputSchema>;
