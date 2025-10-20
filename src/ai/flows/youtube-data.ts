
'use server';
/**
 * @fileOverview A flow for fetching live data from YouTube using public oEmbed services.
 */
import { z } from 'zod';
import { getSettings } from '@/ai/flows/settings-management';

const GetVideoDetailsInputSchema = z.object({
    videoId: z.string().min(1, 'Video ID is required.'),
});


export async function getVideoDetails(input: z.infer<typeof GetVideoDetailsInputSchema>): Promise<{
    title?: string;
    description?: string;
    regionRestriction?: { allowed?: string[]; blocked?: string[] };
    error?: string;
}> {
    const { videoId } = GetVideoDetailsInputSchema.parse(input);
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        // Fallback to noembed.com if API key is not available
        console.warn("YouTube API key not configured. Using fallback service.");
        const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
        try {
            const oembedResponse = await fetch(oembedUrl);
            if (!oembedResponse.ok) {
                const errorData = await oembedResponse.json();
                throw new Error(errorData.error || 'Failed to fetch video data from fallback service.');
            }
            const data = await oembedResponse.json();
            return {
                title: data.title,
                description: "Full description extraction via this method is not available. Please configure the YouTube API Key in Admin > Settings > Site Settings for full details.",
            };
        } catch (error: any) {
            return { error: error.message || 'An unknown error occurred while fetching video details.' };
        }
    }


    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            let message = `Failed to fetch video data. Status: ${response.status}`;
            if (errorData.error?.message) {
                message = errorData.error.message;
            }
            throw new Error(message);
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found or access is restricted.');
        }

        const item = data.items[0];
        
        return {
            title: item.snippet?.title,
            description: item.snippet?.description,
            regionRestriction: item.contentDetails?.regionRestriction,
        };

    } catch (error: any) {
        console.error("YouTube Data API Fetch Error:", error);
        return { error: error.message || 'An unknown error occurred while fetching video details.' };
    }
}
