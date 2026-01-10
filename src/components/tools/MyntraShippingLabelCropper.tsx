
'use client';

import { PDFDocument } from 'pdf-lib';
import { ShippingLabelCropper } from './ShippingLabelCropper';

const cropMyntraLabel = async (pdfDoc: PDFDocument): Promise<PDFDocument> => {
    const newPdfDoc = await PDFDocument.create();
    const labelWidth = 4 * 72;
    const labelHeight = 6 * 72;

    for (const page of pdfDoc.getPages()) {
        const { width, height } = page.getSize();
        page.setCropBox(0, height - labelHeight, labelWidth, labelHeight);
        
        const [embeddedPage] = await newPdfDoc.embedPdf(pdfDoc, [pdfDoc.getPages().indexOf(page)]);
        
        const newPage = newPdfDoc.addPage([labelWidth, labelHeight]);
        newPage.drawPage(embeddedPage, { x: 0, y: 0 });
    }

    return newPdfDoc;
};

export function MyntraShippingLabelCropper() {
  return (
    <ShippingLabelCropper
      platform="Myntra"
      description="Upload the standard PDF label you downloaded from Myntra."
      cropFunction={cropMyntraLabel}
    />
  );
}
