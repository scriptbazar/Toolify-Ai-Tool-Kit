
'use server';
/**
 * @fileOverview AI Writer tool that generates articles, blog posts, or marketing copy based on user input.
 *
 * - aiWriter - A function that generates content based on the provided topic or keywords.
 * - generateMetaDescription - Generates an SEO-friendly meta description for a blog post.
 * - generateTargetKeywords - Generates a list of SEO-friendly keywords for a blog post.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AiWriterInputSchema = z.object({
  topic: z.string().describe('The topic or keywords for the AI to generate content about.'),
});
export type AiWriterInput = z.infer<typeof AiWriterInputSchema>;

const AiWriterOutputSchema = z.object({
  content: z.string().describe('The generated article, blog post, or marketing copy.'),
});
export type AiWriterOutput = z.infer<typeof AiWriterOutputSchema>;

export async function aiWriter(input: AiWriterInput): Promise<AiWriterOutput> {
  return aiWriterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWriterPrompt',
  input: {schema: AiWriterInputSchema},
  output: {schema: AiWriterOutputSchema},
  prompt: `You are an expert content writer. Generate an original and relevant article, blog post, or marketing copy based on the following topic or keywords: {{{topic}}}.`,
});

const aiWriterFlow = ai.defineFlow(
  {
    name: 'aiWriterFlow',
    inputSchema: AiWriterInputSchema,
    outputSchema: AiWriterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


// New flow for Meta Description
const GenerateMetaDescInputSchema = z.object({
    title: z.string().describe('The title of the blog post.'),
    content: z.string().describe('The full content of the blog post.'),
    targetKeyword: z.string().optional().describe('The primary keyword to focus on for SEO.'),
});
export type GenerateMetaDescInput = z.infer<typeof GenerateMetaDescInputSchema>;


const GenerateMetaDescOutputSchema = z.object({
    metaDescription: z.string().describe('The generated meta description, optimized for SEO and under 160 characters.'),
});
export type GenerateMetaDescOutput = z.infer<typeof GenerateMetaDescOutputSchema>;


export async function generateMetaDescription(input: GenerateMetaDescInput): Promise<GenerateMetaDescOutput> {
    return generateMetaDescriptionFlow(input);
}

const metaDescPrompt = ai.definePrompt({
    name: 'generateMetaDescPrompt',
    input: { schema: GenerateMetaDescInputSchema },
    output: { schema: GenerateMetaDescOutputSchema },
    prompt: `You are an SEO expert specializing in creating compelling meta descriptions. Your task is to generate a meta description for a blog post.

The description must be:
- Under 160 characters.
- Engaging and entice users to click.
- Naturally include the target keyword if provided.
- Accurately summarize the blog post's content.

Blog Post Title:
"{{{title}}}"

Target Keyword:
"{{{targetKeyword}}}"

Blog Post Content:
---
{{{content}}}
---
`,
});


const generateMetaDescriptionFlow = ai.defineFlow({
    name: 'generateMetaDescriptionFlow',
    inputSchema: GenerateMetaDescInputSchema,
    outputSchema: GenerateMetaDescOutputSchema,
}, async (input) => {
    const { output } = await metaDescPrompt(input);
    if (!output) {
        throw new Error("Failed to generate a meta description.");
    }
    return output;
});


// New flow for Target Keywords
const GenerateKeywordsInputSchema = z.object({
    title: z.string().describe('The title of the blog post.'),
    content: z.string().describe('The full content of the blog post.'),
});
export type GenerateKeywordsInput = z.infer<typeof GenerateKeywordsInputSchema>;

const GenerateKeywordsOutputSchema = z.object({
    keywords: z.string().describe('A comma-separated string of 5-7 relevant, high-ranking keywords.'),
});
export type GenerateKeywordsOutput = z.infer<typeof GenerateKeywordsOutputSchema>;

export async function generateTargetKeywords(input: GenerateKeywordsInput): Promise<GenerateKeywordsOutput> {
    return generateTargetKeywordsFlow(input);
}

const keywordsPrompt = ai.definePrompt({
    name: 'generateKeywordsPrompt',
    input: { schema: GenerateKeywordsInputSchema },
    output: { schema: GenerateKeywordsOutputSchema },
    prompt: `You are an SEO keyword specialist. Based on the blog post title and content, generate a list of 5-7 relevant, high-ranking, and long-tail keywords that will help this post rank well in search engines.

The keywords should be highly relevant to the main topic. Provide the output as a single comma-separated string.

Blog Post Title:
"{{{title}}}"

Blog Post Content:
---
{{{content}}}
---
`,
});

const generateTargetKeywordsFlow = ai.defineFlow({
    name: 'generateTargetKeywordsFlow',
    inputSchema: GenerateKeywordsInputSchema,
    outputSchema: GenerateKeywordsOutputSchema,
}, async (input) => {
    const { output } = await keywordsPrompt(input);
    if (!output) {
        throw new Error("Failed to generate target keywords.");
    }
    return output;
});
