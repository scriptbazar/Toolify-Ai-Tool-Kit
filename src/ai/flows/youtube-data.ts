
'use server';
/**
 * @fileOverview A flow for fetching live data from YouTube using public oEmbed services.
 */
import { z } from 'zod';

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


// This function now uses the public noembed.com service to avoid needing an API key.
export async function getVideoDetails(input: z.infer<typeof GetVideoDetailsInputSchema>): Promise<{
    title?: string;
    description?: string; // Note: oEmbed does not provide a standard description. This will be undefined.
    regionRestriction?: { allowed?: string[]; blocked?: string[] };
    error?: string;
}> {
    const { videoId } = GetVideoDetailsInputSchema.parse(input);

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`;

    try {
        const response = await fetch(oembedUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch video data. Status: ${response.status}`);
        }
        
        const data = await response.json();

        const validatedData = OEmbedResponseSchema.safeParse(data);
        
        if (!validatedData.success) {
            console.error("oEmbed response validation error:", validatedData.error);
            throw new Error('Invalid data received from oEmbed service.');
        }
        
        if (validatedData.data.error) {
             throw new Error(validatedData.data.error);
        }

        // oEmbed generally doesn't provide a full description, so we return a placeholder.
        // The title is available and is the main purpose of this function now.
        return {
            title: validatedData.data.title,
            description: "Full description extraction via this method is not available. Only the title can be reliably retrieved.",
            regionRestriction: undefined, // This information is not available via oEmbed
        };

    } catch (error: any) {
        console.error("YouTube Data Fetch Error:", error);
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
