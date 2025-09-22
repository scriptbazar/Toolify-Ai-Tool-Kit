
'use server';
/**
 * @fileOverview A flow for downloading videos from various platforms using the Cobalt API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VideoDownloaderInputSchema = z.object({
  url: z.string().url('Please enter a valid URL.'),
});
export type VideoDownloaderInput = z.infer<typeof VideoDownloaderInputSchema>;

const VideoDownloaderOutputSchema = z.object({
  status: z.string(),
  text: z.string(),
  url: z.string().optional(),
  title: z.string().optional(),
  picker: z.array(z.any()).optional(),
  audio: z.string().optional(),
  streamUrl: z.string().optional(),
});
export type VideoDownloaderOutput = z.infer<typeof VideoDownloaderOutputSchema>;


export async function downloadVideo(input: VideoDownloaderInput): Promise<VideoDownloaderOutput> {
    return videoDownloaderFlow(input);
}

const videoDownloaderFlow = ai.defineFlow(
  {
    name: 'videoDownloaderFlow',
    inputSchema: VideoDownloaderInputSchema,
    outputSchema: VideoDownloaderOutputSchema,
  },
  async ({ url }) => {
    try {
        const cobaltApiUrl = 'https://co.wuk.sh/api/json';

        const response = await fetch(cobaltApiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                isNoTTWatermark: true,
                isAudioOnly: false,
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to process video. Status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'error') {
            return {
                status: 'error',
                text: result.text || 'Could not find a downloadable video at this URL.',
            };
        }
        
        // The Cobalt API response can vary, so we'll return the whole thing
        return {
            status: result.status,
            text: result.text || 'Success',
            url: result.url,
            title: result.title,
            picker: result.picker,
            audio: result.audio,
            streamUrl: result.stream,
        };

    } catch (error: any) {
        console.error("Video Downloader Error:", error);
        return {
            status: 'error',
            text: error.message || 'An unknown error occurred while processing the video.',
        };
    }
  }
);



