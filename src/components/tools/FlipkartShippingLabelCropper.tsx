
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Scissors, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

export function FlipkartShippingLabelCropper() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid PDF file.", variant: "destructive" });
    }
  };

  const handleCrop = async () => {
    if (!pdfFile) {
      toast({ title: 'No PDF selected', description: 'Please upload a PDF file to crop.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const newPdfDoc = await PDFDocument.create();

      const labelWidth = 4 * 72;  // 4 inches
      const labelHeight = 6 * 72; // 6 inches

      for (const page of pdfDoc.getPages()) {
        const { width, height } = page.getSize();
        page.setCropBox(0, height - labelHeight, labelWidth, labelHeight);
        
        const [embeddedPage] = await newPdfDoc.embedPdf(pdfDoc, [pdfDoc.getPages().indexOf(page)]);
        
        const newPage = newPdfDoc.addPage([labelWidth, labelHeight]);
        newPage.drawPage(embeddedPage, { x: 0, y: 0 });
      }

      const newPdfBytes = await newPdfDoc.save();

      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cropped-flipkart-${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({ title: 'Success!', description: 'Your Flipkart shipping label has been cropped.' });

    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not crop the PDF.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />
        <div className="flex flex-col items-center">
          <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{pdfFile ? `Selected: ${pdfFile.name}` : 'Click or drag Flipkart label PDF to upload'}</p>
          <p className="text-xs text-muted-foreground">Crops standard labels to 4x6" format.</p>
        </div>
      </div>
      
      <Button onClick={handleCrop} disabled={isLoading || !pdfFile} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scissors className="mr-2 h-4 w-4" />}
        Crop Flipkart Label
      </Button>
    </div>
  );
}
