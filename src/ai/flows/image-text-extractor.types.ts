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
