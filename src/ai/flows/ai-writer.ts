
'use server';

/**
 * @fileOverview AI flows for content writing and generation.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';


const GenerateSampleTextInputSchema = z.object({
  topic: z.string().optional().describe('An optional topic for the sample text, like "inspirational quote" or "short poem about nature".'),
});

const GenerateSampleTextOutputSchema = z.object({
    sampleText: z.string().describe('A short, engaging piece of sample text, like a quote, a short poem, or a fun fact.'),
});

export async function generateSampleText(input?: z.infer<typeof GenerateSampleTextInputSchema>): Promise<z.infer<typeof GenerateSampleTextOutputSchema>> {
  return generateSampleTextFlow(input || {});
}

const generateSampleTextFlow = ai.defineFlow(
  {
    name: 'generateSampleTextFlow',
    inputSchema: GenerateSampleTextInputSchema,
    outputSchema: GenerateSampleTextOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Generate a short, interesting sample text. It could be a famous quote, a short poem, a fun fact, or a single witty sentence.
      ${input.topic ? `The topic should be related to: ${input.topic}.` : ''}
      The text should be suitable for demonstrating a handwriting font. Keep it concise.`,
      output: {
        schema: GenerateSampleTextOutputSchema,
      },
    });

    if (!output) {
        throw new Error('Failed to generate sample text.');
    }
    return output;
  }
);


const AiWriterInputSchema = z.object({
  topic: z.string().describe("The main topic or title of the blog post."),
  length: z.enum(['Short', 'Medium', 'Long']).describe("The desired length of the article."),
  tone: z.enum(['Formal', 'Casual', 'Informative', 'Humorous']).describe("The writing style or tone of the article."),
});

const AiWriterOutputSchema = z.object({
  content: z.string().describe("The generated blog post content in HTML format."),
});

export async function aiWriter(input: z.infer<typeof AiWriterInputSchema>): Promise<z.infer<typeof AiWriterOutputSchema>> {
  return aiWriterFlow(input);
}

const aiWriterFlow = ai.defineFlow(
  {
    name: 'aiWriterFlow',
    inputSchema: AiWriterInputSchema,
    outputSchema: AiWriterOutputSchema,
  },
  async ({ topic, length, tone }) => {
    const { output } = await ai.generate({
      prompt: `Write a ${length.toLowerCase()}, ${tone.toLowerCase()} blog post about "${topic}". The output should be a single string of well-structured HTML, including headings (h2, h3), paragraphs (p), and lists (ul, li).`,
      output: {
        schema: AiWriterOutputSchema,
      },
    });
     if (!output) {
      throw new Error('Failed to generate blog content.');
    }
    return output;
  }
);

const GenerateMetaDescriptionInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  targetKeyword: z.string().optional(),
});
const GenerateMetaDescriptionOutputSchema = z.object({
  metaDescription: z.string().max(160),
});

export async function generateMetaDescription(input: z.infer<typeof GenerateMetaDescriptionInputSchema>): Promise<z.infer<typeof GenerateMetaDescriptionOutputSchema>> {
    return generateMetaDescriptionFlow(input);
}

const generateMetaDescriptionFlow = ai.defineFlow({
    name: 'generateMetaDescriptionFlow',
    inputSchema: GenerateMetaDescriptionInputSchema,
    outputSchema: GenerateMetaDescriptionOutputSchema
}, async ({ title, content, targetKeyword }) => {
    const { output } = await ai.generate({
        prompt: `Based on the following blog post title and content, write a compelling, SEO-friendly meta description under 160 characters. ${targetKeyword ? `The target keyword is "${targetKeyword}".` : ''}
        
        Title: ${title}
        Content: ${content.substring(0, 1000)}...`,
        output: { schema: GenerateMetaDescriptionOutputSchema }
    });
     if (!output) {
      throw new Error('Failed to generate meta description.');
    }
    return output;
});

const GenerateTargetKeywordsInputSchema = z.object({
    title: z.string(),
    content: z.string(),
});
const GenerateTargetKeywordsOutputSchema = z.object({
    keywords: z.string().describe("A comma-separated list of 3-5 relevant SEO keywords."),
});

export async function generateTargetKeywords(input: z.infer<typeof GenerateTargetKeywordsInputSchema>): Promise<z.infer<typeof GenerateTargetKeywordsOutputSchema>> {
    return generateTargetKeywordsFlow(input);
}

const generateTargetKeywordsFlow = ai.defineFlow({
    name: 'generateTargetKeywordsFlow',
    inputSchema: GenerateTargetKeywordsInputSchema,
    outputSchema: GenerateTargetKeywordsOutputSchema
}, async ({ title, content }) => {
    const { output } = await ai.generate({
        prompt: `Based on the following blog post title and content, suggest a comma-separated list of 3-5 relevant SEO target keywords.
        
        Title: ${title}
        Content: ${content.substring(0, 1000)}...`,
        output: { schema: GenerateTargetKeywordsOutputSchema }
    });
    if (!output) {
      throw new Error('Failed to generate keywords.');
    }
    return output;
});
