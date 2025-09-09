
import { z } from 'zod';

export const AiWriterInputSchema = z.object({
  topic: z.string().describe('The topic or keywords for the AI to generate content about.'),
  length: z.enum(['Short', 'Medium', 'Long', 'Ultra Long']).describe('The desired length of the blog post.'),
  tone: z.enum(['Professional', 'Casual', 'Informative', 'Engaging', 'Humorous', 'Persuasive', 'Inspirational', 'Technical', 'Storytelling']).describe('The desired tone of voice for the content.'),
  language: z.string().optional().describe('The language in which the blog post should be written.'),
  wordCount: z.number().optional().describe('The desired word count for "Ultra Long" posts.'),
});
export type AiWriterInput = z.infer<typeof AiWriterInputSchema>;

export const AiWriterOutputSchema = z.object({
  content: z.string().describe('The generated article, blog post, or marketing copy.'),
});
export type AiWriterOutput = z.infer<typeof AiWriterOutputSchema>;

// New flow for Meta Description
export const GenerateMetaDescInputSchema = z.object({
    title: z.string().describe('The title of the blog post.'),
    content: z.string().describe('The full content of the blog post.'),
    targetKeyword: z.string().optional().describe('The primary keyword to focus on for SEO.'),
});
export type GenerateMetaDescInput = z.infer<typeof GenerateMetaDescInputSchema>;


export const GenerateMetaDescOutputSchema = z.object({
    metaDescription: z.string().describe('The generated meta description, optimized for SEO and under 160 characters.'),
});
export type GenerateMetaDescOutput = z.infer<typeof GenerateMetaDescOutputSchema>;

// New flow for Target Keywords
export const GenerateKeywordsInputSchema = z.object({
    title: z.string().describe('The title of the blog post.'),
    content: z.string().describe('The full content of the blog post.'),
});
export type GenerateKeywordsInput = z.infer<typeof GenerateKeywordsInputSchema>;

export const GenerateKeywordsOutputSchema = z.object({
    keywords: z.string().describe('A comma-separated string of 5-7 relevant, high-ranking keywords.'),
});
export type GenerateKeywordsOutput = z.infer<typeof GenerateKeywordsOutputSchema>;

// New flow for Product Description
export const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  targetAudience: z.string().describe('The intended customer for this product (e.g., students, developers, busy moms).'),
  tone: z.enum(['Persuasive', 'Playful', 'Professional', 'Luxury']).describe('The desired tone for the description.'),
  format: z.enum(['Paragraph with Bullets', 'Paragraph Only', 'Bulleted List Only']).describe('The desired format for the description.'),
  targetKeywords: z.string().optional().describe('Comma-separated SEO keywords to include.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

export const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated persuasive and SEO-friendly product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;
