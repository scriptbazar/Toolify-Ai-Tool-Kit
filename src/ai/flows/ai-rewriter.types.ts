
import { z } from 'zod';

export const AiRewriterInputSchema = z.object({
  textToRewrite: z.string().describe('The original text provided by the user.'),
  goal: z.enum([
      'Improve Clarity', 
      'Make it Formal', 
      'Make it Casual', 
      'Fix Grammar & Spelling', 
      'Shorten', 
      'Expand'
    ]).describe('The user\'s objective for the rewrite.'),
});
export type AiRewriterInput = z.infer<typeof AiRewriterInputSchema>;

export const AiRewriterOutputSchema = z.object({
  rewrittenText: z.string().describe('The AI-generated rewritten text.'),
});
export type AiRewriterOutput = z.infer<typeof AiRewriterOutputSchema>;
