
'use server';

/**
 * @fileOverview An AI agent that extracts text from an image using OCR.
 *
 * - extractTextFromImage - The main function for OCR.
 * - ImageTextExtractorInput - The input type for the function.
 * - ImageTextExtractorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ImageTextExtractorInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageTextExtractorInput = z.infer<typeof ImageTextExtractorInputSchema>;

export const ImageTextExtractorOutputSchema = z.object({
  extractedText: z.string().describe('The complete text extracted from the image.'),
});
export type ImageTextExtractorOutput = z.infer<typeof ImageTextExtractorOutputSchema>;


export async function extractTextFromImage(input: ImageTextExtractorInput): Promise<ImageTextExtractorOutput> {
  return extractTextFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageTextExtractorPrompt',
  input: { schema: ImageTextExtractorInputSchema },
  output: { schema: ImageTextExtractorOutputSchema },
  prompt: `You are an Optical Character Recognition (OCR) expert. Your task is to accurately extract all text from the provided image. Preserve the original formatting, including line breaks, as much as possible.

Image to process:
{{media url=imageDataUri}}

Extract all text present in the image.
`,
});


const extractTextFromImageFlow = ai.defineFlow(
  {
    name: 'extractTextFromImageFlow',
    inputSchema: ImageTextExtractorInputSchema,
    outputSchema: ImageTextExtractorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to extract any text from the image.');
    }
    return output;
  }
);
