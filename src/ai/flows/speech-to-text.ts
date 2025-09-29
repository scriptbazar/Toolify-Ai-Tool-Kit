'use server';

/**
 * @fileOverview A flow for converting speech to text using Google's Gemini model.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';


const SpeechToTextInputSchema = z.object({
  audioDataUri: z.string().describe('The audio file as a data URI.'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
    const { text } = await ai.transcribe({
      model: googleAI.model('gemini-1.5-flash-latest'),
      media: {
        url: input.audioDataUri,
      },
    });

    if (!text) {
      throw new Error('The model did not return any transcribed text.');
    }

    return {
      transcribedText: text,
    };
}
