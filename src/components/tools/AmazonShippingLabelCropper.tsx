'use client';

import { PDFDocument } from 'pdf-lib';
import { ShippingLabelCropper } from './ShippingLabelCropper';

const cropAmazonLabel = async (pdfDoc: PDFDocument): Promise<PDFDocument> => {
    const newPdfDoc = await PDFDocument.create();
    const firstPage = pdfDoc.getPage(0);
    const { width, height } = firstPage.getSize();
    
    const labelHeight = height / 2;
    const labelWidth = width;
    
    const [topEmbeddedPage] = await newPdfDoc.embedPdf(pdfDoc, [0]);
    const topPage = newPdfDoc.addPage([4 * 72, 6 * 72]);
    topPage.drawPage(topEmbeddedPage, {
      x: - (labelWidth - (4 * 72)) / 2,
      y: - (height - labelHeight) - (labelHeight - (6*72))/2,
      width: labelWidth,
      height: height
    });
    
    const [bottomEmbeddedPage] = await newPdfDoc.embedPdf(pdfDoc, [0]);
    const bottomPage = newPdfDoc.addPage([4 * 72, 6 * 72]);
    bottomPage.drawPage(bottomEmbeddedPage, {
       x: - (labelWidth - (4 * 72)) / 2,
       y: - (labelHeight - (6*72))/2,
       width: labelWidth,
       height: height
    });

    return newPdfDoc;
};

export function AmazonShippingLabelCropper() {
  return (
    <ShippingLabelCropper
      platform="Amazon"
      description="Upload the standard 8.5 x 11 inch PDF label you downloaded from Amazon Seller Central."
      cropFunction={cropAmazonLabel}
    />
  );
}
