'use server';
/**
 * @fileOverview An AI agent for checking Search Engine Results Pages (SERP).
 * This flow now uses the Google Custom Search Engine API to fetch live results.
 */

import { z } from 'zod';

const SerpResultSchema = z.object({
  position: z.number().int().positive().describe('The ranking position of the search result, starting from 1.'),
  title: z.string().describe('The main title of the search result link.'),
  url: z.string().url().describe('The full URL of the resulting page.'),
  snippet: z.string().describe('A brief, descriptive summary of the page content, as seen in a search result.'),
});
export type SerpResult = z.infer<typeof SerpResultSchema>;

const SerpCheckerInputSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required.'),
  country: z.string().default('US').describe('The 2-letter country code for the search region (e.g., US, IN, GB).'),
  domain: z.string().optional().describe('A specific domain to look for and highlight in the results.'),
});
type SerpCheckerInput = z.infer<typeof SerpCheckerInputSchema>;

const GoogleSearchApiResponseSchema = z.object({
    items: z.array(z.object({
        title: z.string(),
        link: z.string(),
        snippet: z.string(),
    })).optional(),
});


export async function getSerpResults(input: SerpCheckerInput): Promise<SerpResult[]> {
  const validatedInput = SerpCheckerInputSchema.parse(input);
  const { keyword, country, domain } = validatedInput;

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    throw new Error('Google Search API is not configured on the server. Please provide an API key and Custom Search Engine ID.');
  }

  const apiUrl = new URL('https://www.googleapis.com/customsearch/v1');
  apiUrl.searchParams.append('key', apiKey);
  apiUrl.searchParams.append('cx', cx);
  apiUrl.searchParams.append('q', keyword);
  apiUrl.searchParams.append('gl', country); // Geolocation
  apiUrl.searchParams.append('num', '10'); // Fetch top 10 results

  try {
    const response = await fetch(apiUrl.toString());
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Search API Error:", errorData);
        throw new Error(`Failed to fetch search results. Status: ${response.status}. Message: ${errorData.error?.message || 'Unknown API error'}`);
    }

    const data = await response.json();
    const validatedData = GoogleSearchApiResponseSchema.safeParse(data);

    if (!validatedData.success || !validatedData.data.items) {
        console.error("Google Search API response validation error:", validatedData.error);
        throw new Error('Received invalid data from Google Search API.');
    }
    
    return validatedData.data.items.map((item, index) => ({
      position: index + 1,
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    }));
    
  } catch (error: any) {
    console.error("SERP Checker Error:", error);
    throw new Error(error.message || 'An unexpected error occurred while fetching SERP data.');
  }
}
