'use server';
/**
 * @fileOverview An AI agent that answers questions about a PDF document.
 *
 * - pdfQA - A function that handles the PDF question answering process.
 * - PdfQAInput - The input type for the pdfQA function.
 * - PdfQAOutput - The return type for the pdfQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PdfQAInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  question: z.string().describe('The question to ask about the PDF document.'),
});
export type PdfQAInput = z.infer<typeof PdfQAInputSchema>;

const PdfQAOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the PDF document.'),
});
export type PdfQAOutput = z.infer<typeof PdfQAOutputSchema>;

export async function pdfQA(input: PdfQAInput): Promise<PdfQAOutput> {
  return pdfQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pdfQAPrompt',
  input: {schema: PdfQAInputSchema},
  output: {schema: PdfQAOutputSchema},
  prompt: `You are an expert in understanding PDF documents and answering questions about them.

  Use the following PDF document to answer the question.

  PDF Document: {{media url=pdfDataUri}}

  Question: {{{question}}}

  Answer:`,
});

const pdfQAFlow = ai.defineFlow(
  {
    name: 'pdfQAFlow',
    inputSchema: PdfQAInputSchema,
    outputSchema: PdfQAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
