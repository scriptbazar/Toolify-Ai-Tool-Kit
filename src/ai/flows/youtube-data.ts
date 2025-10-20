
'use server';
/**
 * @fileOverview A flow for fetching live data from YouTube using public oEmbed services.
 */
import { z } from 'zod';
import { getSettings } from '@/ai/flows/settings-management';


const GetChannelDetailsInputSchema = z.object({
    channelId: z.string().min(1, 'Channel ID or handle is required.'),
});

interface YouTubeApiResponse {
    items?: {
        id?: {
            channelId?: string;
        };
        snippet?: {
            title?: string;
            thumbnails?: {
                high?: {
                    url?: string;
                };
            };
            customUrl?: string;
        };
        brandingSettings?: {
            image?: {
                bannerExternalUrl?: string;
            };
        };
    }[];
    error?: any;
}


export async function getChannelDetails(input: z.infer<typeof GetChannelDetailsInputSchema>): Promise<{
    title?: string;
    logoUrl?: string;
    bannerUrl?: string;
    error?: string;
}> {
    const { channelId } = GetChannelDetailsInputSchema.parse(input);
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return { error: "YouTube API key is not configured on the server." };
    }
    
    let searchParams: URLSearchParams;

    if (channelId.startsWith('@')) {
        // It's a handle, search for it. Note: API expects the handle without the '@'.
        searchParams = new URLSearchParams({
            part: 'snippet',
            q: channelId.substring(1),
            type: 'channel',
            key: apiKey,
        });
        
        try {
            const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`);
            const searchData: YouTubeApiResponse = await searchResponse.json();
            
            if (searchData.error) {
                throw new Error(searchData.error?.errors?.[0]?.message || 'Failed to search for channel.');
            }

            const foundChannelId = searchData.items?.[0]?.id?.channelId;

            if (!foundChannelId) {
                throw new Error('Channel not found with that handle.');
            }
            // Now use the found channel ID for the main query
            searchParams = new URLSearchParams({
                part: 'snippet,brandingSettings',
                id: foundChannelId,
                key: apiKey,
            });
            
        } catch (error: any) {
             return { error: error.message || 'An error occurred while searching for the channel.' };
        }

    } else {
        // It's likely a channel ID (UC...)
        searchParams = new URLSearchParams({
            part: 'snippet,brandingSettings',
            id: channelId,
            key: apiKey,
        });
    }

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?${searchParams.toString()}`);
        const data: YouTubeApiResponse = await response.json();
        
        if (data.error || !data.items || data.items.length === 0) {
            throw new Error(data.error?.errors?.[0]?.message || 'Channel not found.');
        }

        const channel = data.items[0];
        
        return {
            title: channel.snippet?.title,
            logoUrl: channel.snippet?.thumbnails?.high?.url,
            bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl,
        };

    } catch (error: any) {
        console.error("YouTube Data API Fetch Error:", error);
        return { error: error.message || 'An unknown error occurred while fetching channel details.' };
    }
}


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
