
'use server';

/**
 * @fileOverview A flow for converting text to speech using Google's AI models.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';
import { TextToSpeechInputSchema, TextToSpeechOutputSchema } from './text-to-speech.types';


// Helper function to convert PCM audio buffer to WAV format as a Base64 string
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function textToSpeechFlow(input: z.infer<typeof TextToSpeechInputSchema>): Promise<z.infer<typeof TextToSpeechOutputSchema>> {
  const { text, voice } = input;
  
  const { media } = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-preview-tts'),
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice || 'Algenib' },
        },
      },
    },
    prompt: text,
  });

  if (!media || !media.url) {
    throw new Error('Audio generation failed to return valid data.');
  }
  
  const audioBuffer = Buffer.from(
    media.url.substring(media.url.indexOf(',') + 1),
    'base64'
  );

  const wavBase64 = await toWav(audioBuffer);
  
  return {
    audioDataUri: `data:audio/wav;base64,${wavBase64}`,
  };
}
