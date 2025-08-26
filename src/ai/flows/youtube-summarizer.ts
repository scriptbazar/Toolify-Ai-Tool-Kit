'use server';

/**
 * @fileOverview A YouTube video summarization AI agent.
 *
 * - youtubeSummarizer - A function that handles the YouTube video summarization process.
 * - YoutubeSummarizerInput - The input type for the youtubeSummarizer function.
 * - YoutubeSummarizerOutput - The return type for the youtubeSummarizer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YoutubeSummarizerInputSchema = z.object({
  youtubeVideoUrl: z.string().describe('The URL of the YouTube video to summarize.'),
});
export type YoutubeSummarizerInput = z.infer<typeof YoutubeSummarizerInputSchema>;

const YoutubeSummarizerOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the YouTube video.'),
});
export type YoutubeSummarizerOutput = z.infer<typeof YoutubeSummarizerOutputSchema>;

export async function youtubeSummarizer(input: YoutubeSummarizerInput): Promise<YoutubeSummarizerOutput> {
  return youtubeSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'youtubeSummarizerPrompt',
  input: {schema: YoutubeSummarizerInputSchema},
  output: {schema: YoutubeSummarizerOutputSchema},
  prompt: `You are an expert summarizer of YouTube videos.

  You will be given the URL of a YouTube video, and you will provide a concise summary of the video's content.

  YouTube Video URL: {{{youtubeVideoUrl}}}`,
});

const youtubeSummarizerFlow = ai.defineFlow(
  {
    name: 'youtubeSummarizerFlow',
    inputSchema: YoutubeSummarizerInputSchema,
    outputSchema: YoutubeSummarizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
