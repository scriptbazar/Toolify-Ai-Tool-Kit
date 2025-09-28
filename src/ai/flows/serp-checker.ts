'use server';
/**
 * @fileOverview An AI agent for checking Search Engine Results Pages (SERP).
 * NOTE: This flow currently returns dummy data and does not integrate with a real SERP API.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const SerpResultSchema = z.object({
  position: z.number().int().positive(),
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
});
export type SerpResult = z.infer<typeof SerpResultSchema>;

const SerpCheckerInputSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required.'),
  country: z.string().default('US'),
  domain: z.string().optional(),
});
type SerpCheckerInput = z.infer<typeof SerpCheckerInputSchema>;

const SerpCheckerOutputSchema = z.array(SerpResultSchema);
type SerpCheckerOutput = z.infer<typeof SerpCheckerOutputSchema>;

export async function getSerpResults(input: SerpCheckerInput): Promise<SerpCheckerOutput> {
  // In a real application, you would make an API call to a SERP provider here.
  // For this demo, we will generate realistic dummy data.
  
  const validatedInput = SerpCheckerInputSchema.parse(input);
  const { keyword, domain } = validatedInput;

  const dummyData: SerpResult[] = Array.from({ length: 20 }, (_, i) => {
    const position = i + 1;
    const isYourDomain = domain && (position === 6 || position === 14); // Place the user's domain at a couple of positions for demo
    
    const randomSite = `site${Math.floor(Math.random() * 100)}.com`;
    const url = isYourDomain ? `https://${domain}/relevant-page-${i}` : `https://www.${randomSite}/page`;

    return {
      position,
      title: isYourDomain ? `Your Awesome Page about ${keyword}` : `Result ${position} for "${keyword}"`,
      url,
      snippet: `This is a descriptive snippet for position #${position}, discussing various aspects of ${keyword}. This result comes from ${new URL(url).hostname}.`,
    };
  });
  
  // Ensure the user's domain is in the results if provided
  if (domain && !dummyData.some(d => d.url.includes(domain))) {
      const randomPosition = Math.floor(Math.random() * 10) + 5;
      dummyData[randomPosition] = {
           position: randomPosition + 1,
           title: `Your Awesome Page about ${keyword}`,
           url: `https://${domain}/relevant-page`,
           snippet: `A special snippet for your domain, highlighting the best content on ${keyword}.`,
      }
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return SerpCheckerOutputSchema.parse(dummyData);
}
