
'use server';
/**
 * @fileOverview A flow for converting video to MP3 audio.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import Lame from 'lame';
import { PassThrough } from 'stream';

const VideoToMp3InputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VideoToMp3Input = z.infer<typeof VideoToMp3InputSchema>;

const VideoToMp3OutputSchema = z.object({
  audioDataUri: z.string().describe('The extracted audio as an MP3 data URI.'),
});
export type VideoToMp3Output = z.infer<typeof VideoToMp3OutputSchema>;

async function toMp3(pcmData: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const encoder = new Lame({
            'output': 'buffer',
            'bitrate': 128
        }).setBuffer(pcmData);

        encoder.encode();
        const mp3Buffer = encoder.getBuffer();
        resolve(mp3Buffer.toString('base64'));
    });
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const chunks: Buffer[] = [];
    writer.on('data', (chunk) => chunks.push(chunk));
    writer.on('end', () => resolve(Buffer.concat(chunks)));
    writer.on('error', reject);

    writer.end(pcmData);
  });
}


export async function videoToMp3(
  input: VideoToMp3Input
): Promise<VideoToMp3Output> {
  const { media } = await ai.generate({
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `Extract the full audio track from this video.`,
    config: {
        responseModalities: ['AUDIO'],
    },
    input: {
        media: {
            url: input.videoDataUri,
        }
    }
  });

  if (!media) {
    throw new Error('No audio media was returned from the model.');
  }

  const pcmAudioBuffer = Buffer.from(
    media.url.substring(media.url.indexOf(',') + 1),
    'base64'
  );
  
  // First, convert the raw PCM to a valid WAV format buffer.
  const wavBuffer = await toWav(pcmAudioBuffer);
  
  // Then, encode the WAV buffer to MP3.
  const mp3Base64 = await toMp3(wavBuffer);

  return {
    audioDataUri: 'data:audio/mpeg;base64,' + mp3Base64,
  };
}
