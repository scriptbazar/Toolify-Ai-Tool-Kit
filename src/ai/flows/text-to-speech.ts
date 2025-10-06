
'use server';
/**
 * @fileOverview A flow for converting text to speech.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

const VoiceConfigSchema = z.object({
    name: z.string(),
    gender: z.string(),
});

const SpeakerVoiceMappingSchema = z.record(VoiceConfigSchema);

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  isMultiSpeaker: z.boolean().optional(),
  singleVoice: z.string().optional().describe('The single voice to use for the speech synthesis.'),
  multiSpeakerConfig: SpeakerVoiceMappingSchema.optional().describe('A mapping of speaker names to voices for multi-speaker synthesis.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

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

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  
  let speechConfig: any;

  if (input.isMultiSpeaker && input.multiSpeakerConfig) {
      const speakerConfigs = Object.entries(input.multiSpeakerConfig).map(([speaker, voice]) => ({
          speaker: speaker,
          voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice.name },
          }
      }));
      speechConfig = { multiSpeakerVoiceConfig: { speakerVoiceConfigs: speakerConfigs } };
  } else {
      speechConfig = {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: input.singleVoice || 'Algenib' },
          }
      };
  }


  const { media } = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-preview-tts'),
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: speechConfig,
    },
    prompt: input.text,
  });

  if (!media) {
    throw new Error('no media returned');
  }

  const audioBuffer = Buffer.from(
    media.url.substring(media.url.indexOf(',') + 1),
    'base64'
  );

  return {
    audioDataUri: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
  };
}
