
'use server';

/**
 * @fileOverview Manages PDF-related operations like watermarking.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

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
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();
        
        let watermarkImageBytes: Uint8Array | undefined;
        if (watermarkType === 'image' && imageDataUri) {
            watermarkImageBytes = Buffer.from(imageDataUri.split(',')[1], 'base64');
        }

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const watermarkImage = watermarkImageBytes ? await pdfDoc.embedPng(watermarkImageBytes) : undefined;

        for (const page of pages) {
            const { width, height } = page.getSize();
            
            if (watermarkType === 'text' && text) {
                // Dynamically adjust font size based on page width
                const fontSize = (width / text.length) * (size / 100) * 1.5;
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                const textHeight = font.heightAtSize(fontSize);
                
                page.drawText(text, {
                    x: width / 2 - textWidth / 2,
                    y: height / 2 - textHeight / 2,
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0),
                    opacity: opacity,
                    rotate: degrees(rotation),
                });
            } else if (watermarkType === 'image' && watermarkImage) {
                const imageDims = watermarkImage.scale(size / 100);
                
                page.drawImage(watermarkImage, {
                    x: width / 2 - imageDims.width / 2,
                    y: height / 2 - imageDims.height / 2,
                    width: imageDims.width,
                    height: imageDims.height,
                    opacity: opacity,
                    rotate: degrees(rotation),
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
