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
  prompt: `You are a highly advanced Optical Character Recognition (OCR) expert with multilingual capabilities. Your task is to meticulously and accurately extract all text from the provided image, paying close attention to detail and original structure.

**Instructions:**

1.  **Identify Language and Style:** First, attempt to identify the language(s) present in the image. Also, determine if the text is printed, handwritten, or a mix. This context is crucial for accuracy.
2.  **Full Text Extraction:** Extract every piece of text visible in the image, from large headings to the smallest print.
3.  **Preserve Formatting:** Maintain the original formatting as closely as possible. This includes:
    *   Line breaks and paragraph separations.
    *   Indentation and spacing.
    *   Lists (bulleted or numbered).
4.  **Handle Noise and Distortion:** The image may be blurry, have poor lighting, or contain graphical elements. Do your best to distinguish text from the background and accurately transcribe it despite these challenges.
5.  **Transcription Accuracy:** Be precise. Do not guess words if they are illegible. If a word is unclear, you may represent it with '[illegible]'.

Image to process:
{{media url=imageDataUri}}

Extract all text present in the image now.
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
