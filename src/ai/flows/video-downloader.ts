
'use server';
/**
 * @fileOverview A flow for downloading videos from various platforms.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import ytdl from 'ytdl-core';

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
  async ({ url, platform }) => {
    console.log(`Received request to download from ${platform}: ${url}`);

    if (platform !== 'youtube') {
      return {
        success: false,
        message: `Downloading from ${platform} is not yet supported. Only YouTube is currently enabled.`,
      };
    }

    try {
        if (!ytdl.validateURL(url)) {
            return {
                success: false,
                message: 'Invalid YouTube URL provided.',
            };
        }

        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
        
        if (format) {
            return {
                success: true,
                message: 'Download link generated successfully.',
                downloadUrl: format.url,
                title: info.videoDetails.title,
            };
        } else {
             return {
                success: false,
                message: 'Could not find a suitable download format for this video.',
            };
        }

    } catch (error: any) {
        console.error(`Error fetching video info from YouTube:`, error);
        return {
            success: false,
            message: 'Failed to fetch video information. The video may be private, age-restricted, or removed.',
        };
    }
  }
);
