'use server';
/**
 * @fileOverview A set of flows for manipulating and managing PDF documents.
 */

import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { type SplitPdfInput, SplitPdfInputSchema, type SplitPdfOutput } from './pdf-management.types';


// Helper to parse page ranges e.g., "1-5, 8, 10-12" into an array of zero-based indices
const parsePageRanges = (rangesStr: string, totalPages: number): number[][] => {
    if (!rangesStr.trim()) return [];

    return rangesStr.split(',').map(part => {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [start, end] = trimmedPart.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages && start <= end) {
                return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
            }
        } else {
            const page = Number(trimmedPart);
            if (!isNaN(page) && page > 0 && page <= totalPages) {
                return [page - 1];
            }
        }
        return [];
    }).filter(range => range.length > 0);
};

export async function splitPdf(input: SplitPdfInput): Promise<SplitPdfOutput> {
    const { pdfDataUri, splitMode, ranges, fixedRangeSize, extractPages } = SplitPdfInputSchema.parse(input);
    
    try {
        const pdfBytes = Buffer.from(pdfDataUri.split(',')[1], 'base64');
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const totalPages = pdfDoc.getPageCount();
        const zip = new JSZip();

        if (splitMode === 'ranges') {
            const parsedRanges = parsePageRanges(ranges || '', totalPages);
            if (parsedRanges.length === 0) throw new Error("Invalid or empty page ranges provided.");

            for (const [i, pageIndices] of parsedRanges.entries()) {
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
                copiedPages.forEach(page => newPdf.addPage(page));
                const newPdfBytes = await newPdf.save();
                zip.file(`range-${i + 1}_pages_${pageIndices.map(p => p + 1).join('-')}.pdf`, newPdfBytes);
            }
        } else if (splitMode === 'fixed') {
            const size = fixedRangeSize || 1;
            for (let i = 0; i < totalPages; i += size) {
                const newPdf = await PDFDocument.create();
                const pageIndices = Array.from({ length: Math.min(size, totalPages - i) }, (_, k) => i + k);
                const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
                copiedPages.forEach(page => newPdf.addPage(page));
                const newPdfBytes = await newPdf.save();
                zip.file(`split_part-${Math.floor(i / size) + 1}.pdf`, newPdfBytes);
            }
        } else if (splitMode === 'extract') {
            const pagesToExtractIndices = parsePageRanges(extractPages || '', totalPages).flat();
            if (pagesToExtractIndices.length === 0) throw new Error("No valid pages specified for extraction.");
            
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtractIndices);
            copiedPages.forEach(page => newPdf.addPage(page));
            const newPdfBytes = await newPdf.save();
            zip.file(`extracted_pages.pdf`, newPdfBytes);
        } else {
            throw new Error("Invalid split mode provided.");
        }
        
        const zipAsBase64 = await zip.generateAsync({ type: "base64" });
        return {
            zipDataUri: `data:application/zip;base64,${zipAsBase64}`
        };

    } catch (error: any) {
        console.error("PDF splitting failed:", error);
        throw new Error(error.message || "An unexpected error occurred while splitting the PDF.");
    }
}
