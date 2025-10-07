import { z } from 'zod';

export const SplitPdfInputSchema = z.object({
  pdfDataUri: z.string().describe("The PDF file to be split, as a data URI."),
  splitMode: z.enum(['ranges', 'fixed', 'extract']),
  ranges: z.string().optional().describe("Comma-separated page ranges (e.g., '1-5, 8, 11-12'). Used in 'ranges' mode."),
  fixedRangeSize: z.number().int().min(1).optional().describe("Number of pages per file. Used in 'fixed' mode."),
  extractPages: z.string().optional().describe("Comma-separated list of pages to extract into a single file. Used in 'extract' mode."),
});
export type SplitPdfInput = z.infer<typeof SplitPdfInputSchema>;

export const SplitPdfOutputSchema = z.object({
  zipDataUri: z.string().describe("A data URI of the ZIP file containing the split PDFs."),
});
export type SplitPdfOutput = z.infer<typeof SplitPdfOutputSchema>;
