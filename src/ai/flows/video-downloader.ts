
'use server';
/**
 * @fileOverview A flow for downloading videos from various platforms using the Cobalt API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VideoDownloaderInputSchema = z.object({
  url: z.string().url('Please enter a valid URL.'),
  platform: z.enum(['youtube', 'instagram', 'x', 'threads', 'pinterest', 'linkedin']).optional(),
});
export type VideoDownloaderInput = z.infer<typeof VideoDownloaderInputSchema>;

const VideoDownloaderOutputSchema = z.object({
  status: z.string(),
  text: z.string().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
  picker: z.array(z.any()).optional(),
  audio: z.string().optional(),
  streamUrl: z.string().optional(),
  success: z.boolean(),
  downloadUrl: z.string().optional().describe('The direct URL for downloading the media.'),
  message: z.string().optional(),
});
export type VideoDownloaderOutput = z.infer<typeof VideoDownloaderOutputSchema>;


export async function downloadVideo(input: VideoDownloaderInput): Promise<VideoDownloaderOutput> {
    try {
        const cobaltApiUrl = 'https://co.wuk.sh/api/json';

        const response = await fetch(cobaltApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: JSON.stringify({
                url: input.url,
                isNoTTWatermark: true,
            })
        });
        
        if (!response.ok) {
             throw new Error(`Failed to process video. Status: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.status === 'error') {
            return {
                status: 'error',
                success: false,
                message: result.text || 'Could not find a downloadable video at this URL.',
            };
        }
        
        // For YouTube channel logo/banner, Cobalt returns different fields
        const downloadUrl = result.url || result.streamUrl || result.audio;

        return {
            status: result.status,
            text: result.text,
            url: result.url,
            title: result.title,
            picker: result.picker,
            audio: result.audio,
            streamUrl: result.streamUrl,
            success: true,
            downloadUrl: downloadUrl,
            message: 'Your download is ready.',
        };

    } catch (error: any) {
        console.error("Video Downloader Error:", error);
        return {
            status: 'error',
            success: false,
            message: error.message || 'An unknown error occurred while processing the video.',
        };
    }
}
