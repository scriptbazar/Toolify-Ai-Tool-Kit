
'use server';

/**
 * @fileOverview A flow for converting speech to text using Google's Gemini model.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z.string().describe('The audio file as a data URI.'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
    const { text } = await ai.generate({
      model: 'gemini-1.5-flash',
      prompt: [
        { text: 'Transcribe the following audio with accurate punctuation and paragraphing:' },
        { media: { url: input.audioDataUri } }
      ],
      config: {
        responseMimeType: 'text/plain',
      },
    });

    if (!text) {
      throw new Error('The model did not return any transcribed text.');
    }

    return {
      transcribedText: text,
    };
}
