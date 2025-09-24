'use server';

/**
 * @fileOverview Manages PDF-related operations like merging and watermarking.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const MergePdfsInputSchema = z.object({
  files: z.array(z.object({
      pdfDataUri: z.string().describe('A PDF file as a data URI.'),
      pages: z.string().optional().describe('A string representing pages to include, e.g., "1-5, 8, 10-12".'),
  })),
});
export type MergePdfsInput = z.infer<typeof MergePdfsInputSchema>;

const MergePdfsOutputSchema = z.object({
  mergedPdfDataUri: z.string().describe('The merged PDF file as a data URI.'),
});
export type MergePdfsOutput = z.infer<typeof MergePdfsOutputSchema>;

// Helper to parse page ranges e.g., "1-5, 8, 10-12" into a set of numbers
const parsePages = (pagesStr: string, totalPages: number): number[] => {
    const pages = new Set<number>();
    if (!pagesStr) {
        for (let i = 1; i <= totalPages; i++) pages.add(i);
        return Array.from(pages);
    }

    const parts = pagesStr.split(',');
    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [start, end] = trimmedPart.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (i > 0 && i <= totalPages) pages.add(i);
                }
            }
        } else {
            const page = Number(trimmedPart);
            if (!isNaN(page) && page > 0 && page <= totalPages) {
                pages.add(page);
            }
        }
    }
    return Array.from(pages).sort((a, b) => a - b);
}


export async function mergePdfs(input: MergePdfsInput): Promise<MergePdfsOutput> {
  return mergePdfsFlow(input);
}

const mergePdfsFlow = ai.defineFlow(
  {
    name: 'mergePdfsFlow',
    inputSchema: MergePdfsInputSchema,
    outputSchema: MergePdfsOutputSchema,
  },
  async ({ files }) => {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const pdfBytes = Buffer.from(file.pdfDataUri.split(',')[1], 'base64');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const totalPages = pdfDoc.getPageCount();
      const pagesToCopyIndices = parsePages(file.pages || '', totalPages).map(p => p - 1); // convert to 0-based index
      
      if (pagesToCopyIndices.length > 0) {
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pagesToCopyIndices);
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBase64 = Buffer.from(mergedPdfBytes).toString('base64');
    
    return {
      mergedPdfDataUri: `data:application/pdf;base64,${mergedPdfBase64}`,
    };
  }
);


const WatermarkInputSchema = z.object({
    pdfDataUri: z.string().describe('The PDF file as a data URI.'),
    watermarkType: z.enum(['text', 'image']),
    text: z.string().optional(),
    imageDataUri: z.string().optional(),
    opacity: z.number().min(0).max(1),
    size: z.number(),
    position: z.enum(['center', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight']),
    rotation: z.number(),
});
export type WatermarkInput = z.infer<typeof WatermarkInputSchema>;

const WatermarkOutputSchema = z.object({
  watermarkedPdfDataUri: z.string().describe('The watermarked PDF file as a data URI.'),
});
export type WatermarkOutput = z.infer<typeof WatermarkOutputSchema>;

export async function addWatermarkToPdf(input: WatermarkInput): Promise<WatermarkOutput> {
    return addWatermarkToPdfFlow(input);
}

const addWatermarkToPdfFlow = ai.defineFlow(
    {
        name: 'addWatermarkToPdfFlow',
        inputSchema: WatermarkInputSchema,
        outputSchema: WatermarkOutputSchema,
    },
    async ({ pdfDataUri, watermarkType, text, imageDataUri, opacity, size, position, rotation }) => {
        const pdfBytes = Buffer.from(pdfDataUri.split(',')[1], 'base64');
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        
        let watermarkImageBytes: Uint8Array | undefined;
        if (watermarkType === 'image' && imageDataUri) {
            watermarkImageBytes = Buffer.from(imageDataUri.split(',')[1], 'base64');
        }

        for (const page of pages) {
            const { width, height } = page.getSize();
            const rotationAngle = (rotation * Math.PI) / 180;
            
            if (watermarkType === 'text' && text) {
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                page.drawText(text, {
                    x: width / 2, // These positions should be adjusted based on the `position` input
                    y: height / 2,
                    size: size,
                    font: font,
                    color: rgb(0, 0, 0),
                    opacity: opacity,
                    rotate: { angle: rotationAngle, type: 'degrees' },
                });
            } else if (watermarkType === 'image' && watermarkImageBytes) {
                const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);
                const imageDims = watermarkImage.scale(size / 100);
                page.drawImage(watermarkImage, {
                    x: width / 2 - imageDims.width / 2, // Adjust for position
                    y: height / 2 - imageDims.height / 2,
                    width: imageDims.width,
                    height: imageDims.height,
                    opacity: opacity,
                    rotate: { angle: rotationAngle, type: 'degrees' },
                });
            }
        }

        const watermarkedPdfBytes = await pdfDoc.save();
        const watermarkedPdfBase64 = Buffer.from(watermarkedPdfBytes).toString('base64');

        return {
            watermarkedPdfDataUri: `data:application/pdf;base64,${watermarkedPdfBase64}`,
        };
    }
);
