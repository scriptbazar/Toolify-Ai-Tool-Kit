
'use server';
/**
 * @fileOverview AI Writer tool that generates articles, blog posts, or marketing copy based on user input.
 *
 * - aiWriter - A function that generates content based on the provided topic or keywords.
 * - generateMetaDescription - Generates an SEO-friendly meta description for a blog post.
 * - generateTargetKeywords - Generates a list of SEO-friendly keywords for a blog post.
 * - generateProductDescription - Generates a persuasive product description.
 */

import {ai} from '@/ai/genkit';
import Handlebars from 'handlebars';
import {
    AiWriterInputSchema,
    AiWriterOutputSchema,
    GenerateMetaDescInputSchema,
    GenerateMetaDescOutputSchema,
    GenerateKeywordsInputSchema,
    GenerateKeywordsOutputSchema,
    GenerateProductDescriptionInputSchema,
    GenerateProductDescriptionOutputSchema,
    type AiWriterInput,
    type AiWriterOutput,
    type GenerateMetaDescInput,
    type GenerateMetaDescOutput,
    type GenerateKeywordsInput,
    type GenerateKeywordsOutput,
    type GenerateProductDescriptionInput,
    type GenerateProductDescriptionOutput,
} from './ai-writer.types';

export async function aiWriter(input: AiWriterInput): Promise<AiWriterOutput> {
  return aiWriterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWriterPrompt',
  input: {schema: AiWriterInputSchema},
  output: {schema: AiWriterOutputSchema},
  prompt: `You are an expert content writer and SEO specialist. Your task is to generate a comprehensive, engaging, and well-structured blog post based on the provided topic, desired length, and tone. The output must be in HTML format.

{{#if language}}
The blog post must be written in the following language: **{{{language}}}**.
{{/if}}

Topic: "{{{topic}}}"
Desired Length: {{{length}}} 
{{#if isShort}}
(Aim for ~300 words)
{{/if}}
{{#if isMedium}}
(Aim for ~700 words)
{{/if}}
{{#if isLong}}
(Aim for ~1200 words)
{{/if}}
{{#if isUltraLong}}
(Aim for ~{{{wordCount}}} words)
{{/if}}
Tone of Voice: {{{tone}}}

Instructions:
1.  **Title:** Create a compelling and SEO-friendly \`<h1>\` title for the blog post that reflects the topic and tone.
2.  **Introduction:** Write a captivating introductory paragraph that hooks the reader and briefly explains what the post is about, keeping the chosen tone in mind. Use a single \`<p>\` tag for the introduction.
3.  **Body:**
    *   Structure the main content with multiple sections using \`<h2>\` headings for each key point.
    *   Write detailed, informative, and easy-to-read paragraphs using \`<p>\` tags for each paragraph.
    *   Use bullet points (\`<ul><li>...\`</li></ul>\`) for lists where appropriate to improve readability.
    *   Ensure the content length aligns with the user's "Desired Length" request.
4.  **Conclusion:** End with a strong concluding paragraph that summarizes the main points and provides a final thought or call-to-action consistent with the post's tone. Use a single \`<p>\` tag for the conclusion.

Ensure the entire output is a single HTML block, starting with \`<h1>\` and ending with the final \`</p>\`. Do not include \`<html>\` or \`<body>\` tags. Do not add extra line breaks between paragraphs.`,
});

const aiWriterFlow = ai.defineFlow(
  {
    name: 'aiWriterFlow',
    inputSchema: AiWriterInputSchema,
    outputSchema: AiWriterOutputSchema,
  },
  async input => {
    const promptData = {
        ...input,
        isShort: input.length === 'Short',
        isMedium: input.length === 'Medium',
        isLong: input.length === 'Long',
        isUltraLong: input.length === 'Ultra Long',
    };
    const {output} = await prompt(promptData);
    if (!output) {
      throw new Error("The AI failed to generate content. Please try again.");
    }
    return output;
  }
);


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


export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  prompt: `You are an expert e-commerce copywriter and SEO specialist. Your task is to write a compelling, persuasive, and benefit-oriented product description in HTML format based on the provided details.

First, use your internal knowledge to research the product based on its name to understand its key features and specifications.

Product Name: {{{productName}}}
Target Audience: {{{targetAudience}}}
Desired Tone: {{{tone}}}
Desired Format: {{{format}}}
{{#if targetKeywords}}
SEO Keywords to include: {{{targetKeywords}}}
{{/if}}

Instructions:
1.  **Headline:** Start with a catchy and benefit-driven headline for the product, wrapped in an \`<h3>\` tag.
2.  **Opening:** Write an engaging opening paragraph that connects with the target audience and introduces the product's main value. Wrap this in a \`<p>\` tag.
3.  **Feature-to-Benefit:** Based on your research of the product, identify its key features and convert each one into a clear benefit for the user. Explain how it solves a problem or improves their life.
4.  **Formatting:** Structure the output according to the "Desired Format" using HTML tags:
    *   If "Paragraph with Bullets", write a few paragraphs (\`<p>\` tags) followed by a bulleted list (\`<ul><li>...\`</li></ul>\`) of the key benefits.
    *   If "Paragraph Only", write several detailed paragraphs (\`<p>\` tags).
    *   If "Bulleted List Only", provide a concise introductory sentence in a \`<p>\` tag, followed by a detailed bulleted list (\`<ul><li>...\`</li></ul>\`).
5.  **Tone & Keywords:** Maintain the specified "Tone" throughout the copy. If "SEO Keywords" are provided, weave them naturally into the description.
6.  **Call-to-Action:** End with a strong and persuasive call-to-action that encourages the user to buy, wrapped in a final \`<p>\` tag.
7.  **Output:** Provide a single, clean block of HTML. Do NOT use markdown like \`**\` or \`###\`.
`,
});

const generateProductDescriptionFlow = ai.defineFlow({
  name: 'generateProductDescriptionFlow',
  inputSchema: GenerateProductDescriptionInputSchema,
  outputSchema: GenerateProductDescriptionOutputSchema,
}, async (input) => {
  const { output } = await productDescriptionPrompt(input);
  if (!output) {
    throw new Error('Failed to generate a product description.');
  }
  return output;
});
