'use server';

/**
 * @fileOverview An AI agent that extracts text from an image using OCR.
 *
 * - extractTextFromImage - The main function for OCR.
 * - ImageTextExtractorInput - The input type for the function.
 * - ImageTextExtractorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { 
    ImageTextExtractorInputSchema, 
    ImageTextExtractorOutputSchema,
    type ImageTextExtractorInput,
    type ImageTextExtractorOutput,
} from './image-text-extractor.types';


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
