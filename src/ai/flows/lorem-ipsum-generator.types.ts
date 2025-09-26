
import { z } from 'zod';

export const LoremIpsumInputSchema = z.object({
  count: z.number().int().min(1).describe('The number of paragraphs, sentences, or words to generate.'),
  type: z.enum(['paragraphs', 'sentences', 'words']).describe('The type of text to generate.'),
  topic: z.string().optional().describe('An optional topic to theme the generated text around.'),
});
export type LoremIpsumInput = z.infer<typeof LoremIpsumInputSchema>;

export const LoremIpsumOutputSchema = z.object({
  text: z.string().describe('The generated Lorem Ipsum style text.'),
});
export type LoremIpsumOutput = z.infer<typeof LoremIpsumOutputSchema>;
