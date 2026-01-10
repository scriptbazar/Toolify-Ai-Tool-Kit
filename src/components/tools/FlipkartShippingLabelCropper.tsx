
'use client';

import { PDFDocument } from 'pdf-lib';
import { ShippingLabelCropper } from './ShippingLabelCropper';

const cropFlipkartLabel = async (pdfDoc: PDFDocument): Promise<PDFDocument> => {
    const newPdfDoc = await PDFDocument.create();
    const labelWidth = 4 * 72;
    const labelHeight = 6 * 72;
    
    const pageIndicesToCopy = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndicesToCopy);

    for (const copiedPage of copiedPages) {
        const { width, height } = copiedPage.getSize();
        copiedPage.setCropBox(0, height - labelHeight, labelWidth, labelHeight);
        const newPage = newPdfDoc.addPage([labelWidth, labelHeight]);
        newPage.drawPage(copiedPage);
    }
    
    return newPdfDoc;
};

export function FlipkartShippingLabelCropper() {
  return (
    <ShippingLabelCropper
      platform="Flipkart"
      description="Upload the standard PDF label you downloaded from Flipkart."
      cropFunction={cropFlipkartLabel}
    />
  );
}
