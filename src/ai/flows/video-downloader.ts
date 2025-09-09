
'use server';
/**
 * @fileOverview A flow for downloading videos from various platforms using the Cobalt API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VideoDownloaderInputSchema = z.object({
  url: z.string().url('Please enter a valid URL.'),
  platform: z.enum(['youtube', 'x', 'instagram', 'threads', 'linkedin', 'pinterest']),
});
export type VideoDownloaderInput = z.infer<typeof VideoDownloaderInputSchema>;

const VideoDownloaderOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  downloadUrl: z.string().url().optional(),
  title: z.string().optional(),
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
        
        if (result.status === 'error' || !result.url) {
            return {
                success: false,
                message: result.text || 'Could not find a downloadable video at this URL.',
            };
        }

        return {
            success: true,
            message: 'Your video is ready for download!',
            downloadUrl: result.url,
            title: result.picker?.find((p: any) => p.type === 'video')?.filename || 'video.mp4',
        };

    } catch (error: any) {
        console.error("Video Downloader Error:", error);
        return {
            success: false,
            message: error.message || 'An unknown error occurred while processing the video.',
        };
    }
  }
);
