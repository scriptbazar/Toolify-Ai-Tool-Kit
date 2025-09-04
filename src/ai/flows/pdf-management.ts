
'use server';

/**
 * @fileOverview Manages PDF-related operations like merging.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PDFDocument } from 'pdf-lib';

const MergePdfsInputSchema = z.object({
  pdfDataUris: z.array(z.string()).describe('An array of PDF files as data URIs.'),
});
export type MergePdfsInput = z.infer<typeof MergePdfsInputSchema>;

const MergePdfsOutputSchema = z.object({
  mergedPdfDataUri: z.string().describe('The merged PDF file as a data URI.'),
});
export type MergePdfsOutput = z.infer<typeof MergePdfsOutputSchema>;

export async function mergePdfs(input: MergePdfsInput): Promise<MergePdfsOutput> {
  return mergePdfsFlow(input);
}

const mergePdfsFlow = ai.defineFlow(
  {
    name: 'mergePdfsFlow',
    inputSchema: MergePdfsInputSchema,
    outputSchema: MergePdfsOutputSchema,
  },
  async ({ pdfDataUris }) => {
    const mergedPdf = await PDFDocument.create();

    for (const pdfDataUri of pdfDataUris) {
      const pdfBytes = Buffer.from(pdfDataUri.split(',')[1], 'base64');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBase64 = Buffer.from(mergedPdfBytes).toString('base64');
    
    return {
      mergedPdfDataUri: `data:application/pdf;base64,${mergedPdfBase64}`,
    };
  }
);
