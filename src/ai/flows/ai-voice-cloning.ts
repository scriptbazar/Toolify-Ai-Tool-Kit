
'use server';
/**
 * @fileOverview An AI agent that clones a voice from an audio sample and generates speech.
 */

import { ai } from '@/ai/genkit';
import {
  AiVoiceCloneInputSchema,
  AiVoiceCloneOutputSchema,
  type AiVoiceCloneInput,
  type AiVoiceCloneOutput,
} from './ai-voice-cloning.types';
import wav from 'wav';

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

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

// In a real application, this would involve a complex process:
// 1. A flow to upload and save a user's voice sample.
// 2. A call to a voice cloning service API to create a custom voice model.
// 3. Storing the reference to the cloned voice model against the user's profile.
// 4. Using that voice model ID to generate speech.
// For now, we will simulate this by using a pre-built voice.
export async function aiVoiceClone(input: AiVoiceCloneInput): Promise<AiVoiceCloneOutput> {
  const { textToSpeak, voiceSampleDataUri } = input;

  // Simulate using the voice sample by just using a default voice
  const simulatedVoice = 'Algenib'; // This would be dynamic in a real app

  const { media } = await ai.generate({
    model: 'googleai/gemini-2.5-flash-preview-tts',
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: simulatedVoice },
        },
      },
    },
    prompt: textToSpeak,
  });

  if (!media || !media.url) {
    throw new Error('No audio was generated.');
  }

  const audioBuffer = Buffer.from(
    media.url.substring(media.url.indexOf(',') + 1),
    'base64'
  );

  return {
    audioDataUri: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
  };
}
