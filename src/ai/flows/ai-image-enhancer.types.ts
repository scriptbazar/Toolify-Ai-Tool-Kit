import { z } from 'zod';

export const EnhanceImageInputSchema = z.object({
  imageDataUri: z.string().describe("A photo of an object, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  userId: z.string().describe('The ID of the user requesting the image enhancement.'),
  upscaleFactor: z.enum(['2x', '4x']).describe('The factor by which to enhance the image resolution.'),
});
export type EnhanceImageInput = z.infer<typeof EnhanceImageInputSchema>;

export const EnhanceImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The resulting enhanced image as a data URI.'),
});
export type EnhanceImageOutput = z.infer<typeof EnhanceImageOutputSchema>;
