
'use server';
/**
 * @fileOverview A flow for converting video to MP3 audio.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import lamejs from 'lamejs';

const VideoToMp3InputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type VideoToMp3Input = z.infer<typeof VideoToMp3InputSchema>;

const VideoToMp3OutputSchema = z.object({
  audioDataUri: z.string().describe('The extracted audio as an MP3 data URI.'),
});
export type VideoToMp3Output = z.infer<typeof VideoToMp3OutputSchema>;

async function toMp3(wavBuffer: Buffer): Promise<string> {
    const wavHeader = wav.Reader.readHeader(wavBuffer);
    const pcmData = wavBuffer.slice(wavHeader.dataOffset);
    
    // Convert buffer to Int16Array
    const samples = new Int16Array(
        pcmData.buffer, 
        pcmData.byteOffset, 
        pcmData.length / Int16Array.BYTES_PER_ELEMENT
    );

    const mp3encoder = new lamejs.Mp3Encoder(wavHeader.channels, wavHeader.sampleRate, 128); // 128kbps
    const mp3Data = [];

    const sampleBlockSize = 1152; // 1152 samples per frame

    for (let i = 0; i < samples.length; i += sampleBlockSize) {
        const sampleChunk = samples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }
    
    const mp3Buffer = Buffer.from(mp3Data.flat());
    return mp3Buffer.toString('base64');
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
