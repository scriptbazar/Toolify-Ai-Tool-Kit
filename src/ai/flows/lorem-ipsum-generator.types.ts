
import { z } from 'zod';

export const GenerateLoremIpsumInputSchema = z.object({
  topic: z.string().describe('The topic for the placeholder text.'),
  count: z.number().int().min(1).describe('The number of paragraphs, sentences, or words to generate.'),
  type: z.enum(['paragraphs', 'sentences', 'words']).describe('The type of text to generate.'),
});
export type GenerateLoremIpsumInput = z.infer<typeof GenerateLoremIpsumInputSchema>;

export const GenerateLoremIpsumOutputSchema = z.object({
  text: z.string().describe('The AI-generated placeholder text.'),
});
export type GenerateLoremIpsumOutput = z.infer<typeof GenerateLoremIpsumOutputSchema>;
