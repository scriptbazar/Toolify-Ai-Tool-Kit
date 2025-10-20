
'use server';
/**
 * @fileOverview A flow for fetching live data from YouTube using public oEmbed services.
 */
import { z } from 'zod';
import { getSettings } from './settings-management';

const GetVideoDetailsInputSchema = z.object({
    videoId: z.string().min(1, 'Video ID is required.'),
});

const OEmbedResponseSchema = z.object({
    title: z.string().optional(),
    author_name: z.string().optional(),
    provider_name: z.string().optional(),
    thumbnail_url: z.string().url().optional(),
    html: z.string().optional(),
    error: z.string().optional(),
});


export async function getVideoDetails(input: z.infer<typeof GetVideoDetailsInputSchema>): Promise<{
    title?: string;
    description?: string;
    regionRestriction?: { allowed?: string[]; blocked?: string[] };
    error?: string;
}> {
    const { videoId } = GetVideoDetailsInputSchema.parse(input);
    const settings = await getSettings();
    const apiKey = settings.general?.apiKeys?.youtubeApiKey;

    if (!apiKey) {
        throw new Error('YouTube API key is not configured in Admin > Settings > Site Settings.');
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            const message = errorData.error?.message || `Failed to fetch video data. Status: ${response.status}`;
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

const GetChannelDetailsInputSchema = z.object({
    channelId: z.string().min(1, 'Channel ID is required.'),
});

const ChannelOEmbedResponseSchema = z.object({
    author_name: z.string().optional(),
    author_url: z.string().url().optional(),
    error: z.string().optional(),
});


export async function getChannelDetails(input: z.infer<typeof GetChannelDetailsInputSchema>): Promise<{
    title?: string;
    bannerUrl?: string; // Note: Banner URL is not available via public oEmbed
    error?: string;
}> {
    const { channelId } = GetChannelDetailsInputSchema.parse(input);
    let channelUrl = '';

    // Construct URL based on ID or username format
    if (channelId.startsWith('UC')) {
        channelUrl = `https://www.youtube.com/channel/${channelId}`;
    } else {
        channelUrl = `https://www.youtube.com/${channelId.startsWith('@') ? '' : 'c/'}${channelId}`;
    }

    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(channelUrl)}`;

    try {
        const response = await fetch(oembedUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch channel data. Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const validatedData = ChannelOEmbedResponseSchema.safeParse(data);
        if (!validatedData.success || validatedData.data.error) {
            console.error("Channel oEmbed response validation error:", validatedData.error);
            throw new Error(validatedData.data.error || 'Invalid data received from oEmbed service for the channel.');
        }
        
        // Public oEmbed does not provide banner images. We can return a placeholder or notify the user.
        return {
            title: validatedData.data.author_name,
            bannerUrl: undefined, // Set to undefined as it's not available
        };

    } catch (error: any) {
        console.error("YouTube Channel Data Fetch Error:", error);
        return { error: error.message || 'An unknown error occurred while fetching channel details.' };
    }
}
