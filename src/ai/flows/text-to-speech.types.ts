
import { z } from 'zod';

export const TextToSpeechInputSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty.'),
  voice: z.string().optional().default('Algenib'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string(),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;
