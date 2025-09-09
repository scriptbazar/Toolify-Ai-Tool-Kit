
import { z } from 'zod';

export const AiVoiceCloneInputSchema = z.object({
  textToSpeak: z.string().describe('The text to be converted to speech using the cloned voice.'),
  voiceSampleDataUri: z.string().describe('The user\'s voice sample as a data URI.'),
});
export type AiVoiceCloneInput = z.infer<typeof AiVoiceCloneInputSchema>;

export const AiVoiceCloneOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
export type AiVoiceCloneOutput = z.infer<typeof AiVoiceCloneOutputSchema>;
