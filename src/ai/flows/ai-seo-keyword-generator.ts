'use server';
/**
 * @fileOverview An AI agent that generates SEO keywords for a given topic by fetching live suggestions from Google.
 * 
 * - aiSeoKeywordGenerator - The main function for generating keywords.
 */

import { ai } from '@/ai/genkit';
import {
    AiSeoKeywordGeneratorInputSchema,
    AiSeoKeywordGeneratorOutputSchema,
    type AiSeoKeywordGeneratorInput,
    type AiSeoKeywordGeneratorOutput,
} from './ai-seo-keyword-generator.types';
import { z } from 'zod';

// Helper function to call Google Suggest API
async function getGoogleSuggestions(query: string): Promise<string[]> {
    try {
        const response = await fetch(`http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        return data[1] || [];
    } catch (error) {
        console.error("Error fetching Google suggestions:", error);
        return [];
    }
}


export async function aiSeoKeywordGenerator(input: AiSeoKeywordGeneratorInput): Promise<AiSeoKeywordGeneratorOutput> {
  return aiSeoKeywordGeneratorFlow(input);
}


// This new flow combines live data with AI for better results.
const aiSeoKeywordGeneratorFlow = ai.defineFlow(
  {
    name: 'aiSeoKeywordGeneratorFlow',
    inputSchema: AiSeoKeywordGeneratorInputSchema,
    outputSchema: AiSeoKeywordGeneratorOutputSchema,
  },
  async ({ topic, targetAudience }) => {
    // 1. Get live primary and long-tail keywords from Google Autocomplete
    const [primarySuggestions, longTailSuggestions] = await Promise.all([
      getGoogleSuggestions(topic),
      Promise.all([
          getGoogleSuggestions(`how to ${topic}`),
          getGoogleSuggestions(`best ${topic} for`),
          getGoogleSuggestions(`what is ${topic}`),
          getGoogleSuggestions(`why is ${topic}`),
          getGoogleSuggestions(`${topic} vs`),
          getGoogleSuggestions(`${topic} for beginners`),
          getGoogleSuggestions(`${topic} examples`),
          getGoogleSuggestions(`alternatives to ${topic}`),
      ])
    ]);
    
    // Clean and prepare live data
    const primaryKeywords = [...new Set([topic, ...primarySuggestions])].slice(0, 10);
    const longTailKeywords = [...new Set(longTailSuggestions.flat())].slice(0, 20);
    
    // 2. Use AI to generate secondary keywords based on the live primary keywords
    const secondaryKeywordPrompt = ai.definePrompt({
        name: 'generateSecondaryKeywords',
        input: { schema: z.object({ pks: z.array(z.string()), topic: z.string(), audience: z.string() }) },
        output: { schema: z.object({ keywords: z.array(z.string()) }) },
        prompt: `You are an SEO expert. Based on the main topic "{{topic}}", the target audience "{{audience}}", and these primary keywords [{{{pks}}}], generate a list of 15-20 semantically related "body" or secondary keywords (2-3 words). These should be topically related sub-themes, not just variations of the primary keywords.`,
    });

    const { output } = await secondaryKeywordPrompt({ pks: primaryKeywords, topic: topic, audience: targetAudience });
    const secondaryKeywords = output?.keywords || [];

    if (!primaryKeywords.length && !secondaryKeywords.length && !longTailKeywords.length) {
        throw new Error("Could not generate any keywords. Please try a different topic.");
    }
    
    return {
        primaryKeywords,
        secondaryKeywords,
        longTailKeywords,
    };
  }
);
    
