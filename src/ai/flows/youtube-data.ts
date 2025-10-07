
'use server';
/**
 * @fileOverview A flow for fetching live data from the YouTube Data API.
 */
import { z } from 'zod';
import { getSettings } from '@/ai/flows/settings-management';

const GetVideoDetailsInputSchema = z.object({
    videoId: z.string().min(1, 'Video ID is required.'),
});

const YouTubeApiResponseSchema = z.object({
    items: z.array(z.object({
        snippet: z.object({
            title: z.string(),
            description: z.string(),
        }),
        contentDetails: z.object({
            regionRestriction: z.object({
                allowed: z.array(z.string()).optional(),
                blocked: z.array(z.string()).optional(),
            }).optional(),
        }).optional(),
    })).optional(),
    error: z.object({
        message: z.string(),
    }).optional(),
});


export async function getVideoDetails(input: z.infer<typeof GetVideoDetailsInputSchema>): Promise<{
    title?: string;
    description?: string;
    regionRestriction?: { allowed?: string[]; blocked?: string[] };
    error?: string;
}> {
    const { videoId } = GetVideoDetailsInputSchema.parse(input);
    const settings = await getSettings();
    const apiKey = settings.general?.apiKeys?.googleApiKey;

    if (!apiKey) {
        throw new Error('YouTube Data API key is not configured in the admin settings.');
    }

    const apiUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    apiUrl.searchParams.append('key', apiKey);
    apiUrl.searchParams.append('id', videoId);
    apiUrl.searchParams.append('part', 'snippet,contentDetails');

    try {
        const response = await fetch(apiUrl.toString());
        const data = await response.json();

        const validatedData = YouTubeApiResponseSchema.safeParse(data);
        
        if (!validatedData.success) {
            console.error("YouTube API response validation error:", validatedData.error);
            throw new Error('Invalid data received from YouTube API.');
        }
        
        if (validatedData.data.error) {
             throw new Error(validatedData.data.error.message);
        }

        const video = validatedData.data.items?.[0];

        if (!video) {
            return { error: 'Video not found or access is restricted.' };
        }

        return {
            title: video.snippet.title,
            description: video.snippet.description,
            regionRestriction: video.contentDetails?.regionRestriction,
        };

    } catch (error: any) {
        console.error("YouTube Data API Error:", error);
        return { error: error.message || 'An unknown error occurred while fetching video details.' };
    }
}
