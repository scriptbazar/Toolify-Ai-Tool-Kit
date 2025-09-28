'use server';
/**
 * @fileOverview An AI agent for checking Search Engine Results Pages (SERP).
 * This flow uses an AI model to simulate real-time search results.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

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

const SerpCheckerOutputSchema = z.object({
    results: z.array(SerpResultSchema).describe('An array of the top 10 search results.'),
});
type SerpCheckerOutput = z.infer<typeof SerpCheckerOutputSchema>;

const serpPrompt = ai.definePrompt({
    name: 'serpCheckerPrompt',
    input: { schema: z.object({ keyword: z.string(), country: z.string(), domain: z.string().optional() }) },
    output: { schema: SerpCheckerOutputSchema },
    prompt: `You are a highly advanced search engine simulation. Your task is to generate a realistic and relevant list of the top 10 search engine results for a given keyword and country.

**Instructions:**
1.  **Keyword:** "{{{keyword}}}"
2.  **Country for Search:** {{{country}}}
3.  **Analyze Intent:** Determine the user's likely intent (informational, transactional, commercial, navigational) based on the keyword.
4.  **Generate Realistic Titles:** Create diverse, high-quality, and plausible titles for each search result. Include a mix of blog posts, commercial pages, informational sites, and official sources where appropriate.
5.  **Generate Plausible URLs:** Create realistic-looking URLs for each result. They should look authentic and match the title and snippet.
6.  **Write Snippets:** For each result, write a concise and descriptive snippet (1-2 sentences) that accurately summarizes the page content, just like Google does.
7.  **Check for User's Domain:** {{#if domain}}If the provided domain "{{{domain}}}" seems highly relevant to the keyword, you MUST include it as one of the top 10 results at a realistic position. If it is not relevant, you do not need to include it.{{/if}}
8.  **Positioning:** Ensure the 'position' field is numbered sequentially from 1 to 10.
9.  **Relevance is Key:** All results must be highly relevant to the keyword and the specified country.

Generate the top 10 search results now.
`
});


export async function getSerpResults(input: SerpCheckerInput): Promise<SerpResult[]> {
  const validatedInput = SerpCheckerInputSchema.parse(input);
  
  const { output } = await serpPrompt(validatedInput);

  if (!output?.results) {
    throw new Error('The AI failed to generate SERP results. Please try again.');
  }

  // Ensure domain is highlighted if present
  if (validatedInput.domain) {
      const domainToFind = validatedInput.domain.toLowerCase();
      let found = false;
      const processedResults = output.results.map(res => {
          if (res.url.toLowerCase().includes(domainToFind)) {
              found = true;
          }
          return res;
      });
      // If AI didn't include the domain, and it was provided, add it manually to demonstrate highlighting.
      if (!found) {
          processedResults[4] = {
              position: 5,
              title: `Your Awesome Page about ${validatedInput.keyword}`,
              url: `https://${validatedInput.domain}/relevant-page`,
              snippet: `A special snippet for your domain, highlighting the best content on ${validatedInput.keyword}.`,
          }
          return processedResults.slice(0, 10);
      }
      return processedResults;
  }

  return output.results;
}
