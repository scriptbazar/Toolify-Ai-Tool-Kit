
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

const YouTubeChannelApiResponseSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    snippet: z.object({
      title: z.string(),
    }),
    brandingSettings: z.object({
      image: z.object({
        bannerExternalUrl: z.string().optional(),
      }).optional(),
    }).optional(),
  })).optional(),
  error: z.object({
    message: z.string(),
  }).optional(),
});


export async function getChannelDetails(input: z.infer<typeof GetChannelDetailsInputSchema>): Promise<{
    title?: string;
    bannerUrl?: string;
    error?: string;
}> {
    // This function still relies on an API key, but it's not being used by the currently broken tools.
    // Leaving it as is for now.
    const { channelId } = GetChannelDetailsInputSchema.parse(input);
    const { getSettings } = await import('@/ai/flows/settings-management');
    const settings = await getSettings();
    const apiKey = settings.general?.apiKeys?.googleApiKey;

    if (!apiKey) {
        throw new Error('YouTube Data API key is not configured in the admin settings.');
    }
    
    const apiUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
    apiUrl.searchParams.append('key', apiKey);
    apiUrl.searchParams.append('part', 'snippet,brandingSettings');

    // Determine if it's an ID or a username
    if (channelId.startsWith('UC')) {
        apiUrl.searchParams.append('id', channelId);
    } else {
        apiUrl.searchParams.append('forUsername', channelId);
    }

    try {
        const response = await fetch(apiUrl.toString());
        const data = await response.json();
        
        const validatedData = YouTubeChannelApiResponseSchema.safeParse(data);
        if (!validatedData.success) {
            console.error("YouTube Channel API response validation error:", validatedData.error);
            throw new Error('Invalid data received from YouTube Channel API.');
        }

        if (validatedData.data.error) {
             throw new Error(validatedData.data.error.message);
        }

        const channel = validatedData.data.items?.[0];
        if (!channel) {
            return { error: 'Channel not found.' };
        }

        return {
            title: channel.snippet.title,
            bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl,
        };

    } catch (error: any) {
        console.error("YouTube Channel Data API Error:", error);
        return { error: error.message || 'An unknown error occurred while fetching channel details.' };
    }
}
