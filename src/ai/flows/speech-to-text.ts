'use server';

/**
 * @fileOverview A flow for converting speech to text using Google's Gemini model.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z.string().describe('The audio file as a data URI.'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
    return speechToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'speechToTextPrompt',
  prompt: `You are an expert transcriptionist. Your task is to accurately transcribe the audio provided.

Instructions:
1.  Transcribe the speech verbatim, including any filler words like "um" or "uh."
2.  Ensure correct punctuation, including commas, periods, question marks, etc., to make the text readable.
3.  Use paragraph breaks where appropriate to structure the text logically, especially during pauses or when the topic shifts.
4.  Ignore background noise and focus only on the spoken words.
5.  If a word is unintelligible, use [unintelligible].

Here is the audio file to transcribe:
{{media url=audioDataUri}}`,
});

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      model: 'gemini-1.5-flash-latest',
      prompt: [
        { text: 'Transcribe the following audio with accurate punctuation and paragraphing:' },
        { media: { url: input.audioDataUri } }
      ],
    });

    if (!text) {
      throw new Error('The model did not return any transcribed text.');
    }

    return {
      transcribedText: text,
    };
  }
);
