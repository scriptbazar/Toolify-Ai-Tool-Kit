
'use client';

import * as React from 'react';
import { PDFDocument } from 'pdf-lib';
import { ShippingLabelCropper } from './ShippingLabelCropper';

const cropAmazonLabel = async (pdfDoc: PDFDocument): Promise<PDFDocument> => {
    const newPdfDoc = await PDFDocument.create();
    const firstPage = pdfDoc.getPage(0);
    const { width, height } = firstPage.getSize();
    
    const labelHeight = height / 2;
    const labelWidth = width;
    
    const [topEmbeddedPage] = await newPdfDoc.embedPdf(pdfDoc, [0]);
    const topPage = newPdfDoc.addPage([288, 432]);
    topPage.drawPage(topEmbeddedPage, {
      x: - (labelWidth - 288) / 2,
      y: - (height - labelHeight) - (labelHeight - 432) / 2,
      width: labelWidth,
      height: height
    });
    
    const [bottomEmbeddedPage] = await newPdfDoc.embedPdf(pdfDoc, [0]);
    const bottomPage = newPdfDoc.addPage([288, 432]);
    bottomPage.drawPage(bottomEmbeddedPage, {
       x: - (labelWidth - 288) / 2,
       y: - (labelHeight - 432) / 2,
       width: labelWidth,
       height: height
    });

    return newPdfDoc;
};

export default function AmazonShippingLabelCropper() {
  return (
    <ShippingLabelCropper
      platform="Amazon"
      description="Upload the standard 8.5 x 11 inch PDF label you downloaded from Amazon Seller Central."
      cropFunction={cropAmazonLabel}
    />
  );
}
