
import { z } from 'zod';

export const AiCodeGeneratorInputSchema = z.object({
  prompt: z.string().describe('The user\'s request describing the code to be generated.'),
  language: z.string().describe('The programming language for the code generation.'),
});
export type AiCodeGeneratorInput = z.infer<typeof AiCodeGeneratorInputSchema>;

export const GeneratedCodeSchema = z.object({
    html: z.string().optional().describe('The generated HTML code.'),
    css: z.string().optional().describe('The generated CSS code.'),
    javascript: z.string().optional().describe('The generated JavaScript code.'),
    code: z.string().optional().describe('The generated code for languages other than web (HTML/CSS/JS).')
});

export const AiCodeGeneratorOutputSchema = z.object({
  generatedCode: GeneratedCodeSchema.describe('An object containing the generated code, separated by language.'),
  setupInstructions: z.string().describe('Step-by-step instructions on how to use or set up the generated code.'),
  codeExplanation: z.string().describe('A detailed explanation of how the generated code works.'),
});
export type AiCodeGeneratorOutput = z.infer<typeof AiCodeGeneratorOutputSchema>;
