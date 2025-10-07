
'use server';

/**
 * @fileOverview A server-side flow to analyze website content for redirects and word counts.
 */
import { z } from 'zod';

const AnalyzeUrlInputSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  analysisType: z.enum(['redirect', 'word-count']),
});

type AnalyzeUrlInput = z.infer<typeof AnalyzeUrlInputSchema>;

interface RedirectStep {
  url: string;
  status: number;
}

interface AnalyzeUrlOutput {
  redirectChain?: RedirectStep[];
  wordCount?: number;
  error?: string;
}

export async function analyzeUrl(input: AnalyzeUrlInput): Promise<AnalyzeUrlOutput> {
  const { url, analysisType } = input;
  let currentUrl = url;
  const redirectChain: RedirectStep[] = [];
  const MAX_REDIRECTS = 10;

  try {
    for (let i = 0; i < MAX_REDIRECTS; i++) {
      const response = await fetch(currentUrl, { redirect: 'manual', headers: { 'User-Agent': 'ToolifyAI-Bot/1.0' } });
      const status = response.status;
      redirectChain.push({ url: currentUrl, status });

      if (status >= 300 && status < 400) {
        const location = response.headers.get('location');
        if (location) {
          currentUrl = new URL(location, currentUrl).href;
        } else {
          break; // Stop if there's a redirect status but no location header.
        }
      } else {
        // Not a redirect, we've reached the final destination.
        if (analysisType === 'word-count') {
          if (!response.ok) {
            throw new Error(`Failed to fetch content. Status: ${status}`);
          }
          const text = await response.text();
          // A simple regex to count words. It's not perfect but good for an estimate.
          const words = text.match(/\b\w+\b/g) || [];
          return { wordCount: words.length };
        }
        break; // Stop for redirect analysis
      }
    }

    if (redirectChain.length >= MAX_REDIRECTS) {
        return { redirectChain, error: 'Exceeded maximum redirects (10).' };
    }

    if (analysisType === 'redirect') {
      return { redirectChain };
    }

    // Fallback for word-count if it didn't return inside the loop
    return { error: "Could not retrieve final content for word count." };
    
  } catch (error: any) {
    console.error(`Error analyzing URL ${url}:`, error);
    return { error: error.message || 'An unknown error occurred while analyzing the URL.' };
  }
}
