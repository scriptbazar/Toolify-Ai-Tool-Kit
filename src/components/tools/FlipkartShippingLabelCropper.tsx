
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Scissors, Loader2, FileUp, FileText, ArrowRight, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

export function FlipkartShippingLabelCropper() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFileChange({ target: { files: e.dataTransfer.files } } as any); };

  const handleCrop = async () => {
    if (!pdfFile) {
      toast({ title: 'No PDF selected', description: 'Please upload a PDF file to crop.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
      const newPdfDoc = await PDFDocument.create();

      const labelWidth = 4 * 72;  // 4 inches in points
      const labelHeight = 6 * 72; // 6 inches in points
      
      const pageIndicesToCopy = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndicesToCopy);

      for (const copiedPage of copiedPages) {
          const { width, height } = copiedPage.getSize();
          
          // Crop from top left
          copiedPage.setCropBox(0, height - labelHeight, labelWidth, labelHeight);
          
          // Set media box for the new page to be the size of the crop box
          const newPage = newPdfDoc.addPage([labelWidth, labelHeight]);
          
          // Draw the cropped page onto the new page
          newPage.drawPage(copiedPage);
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
      toast({ title: 'Error', description: error.message || 'Could not crop the PDF. Please ensure it is a valid Flipkart label.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
            <Card
              className={cn(
                "transition-colors h-full",
                isDragging && 'border-primary bg-primary/10'
              )}
              onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileUp className="h-5 w-5"/>Step 1: Upload Your Label</CardTitle>
                    <CardDescription>Upload the standard PDF label you downloaded from Flipkart.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div 
                        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />
                        <div className="flex flex-col items-center">
                        <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click or drag PDF label to upload</p>
                        </div>
                    </div>
                     {pdfFile && (
                        <div className="mt-4 p-2 bg-muted rounded-md flex items-center gap-2">
                           <FileText className="h-5 w-5 text-primary"/>
                           <span className="text-sm font-medium truncate">{pdfFile.name}</span>
                           <span className="text-xs text-muted-foreground ml-auto">{(pdfFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
           <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5"/>Step 2: Preview & Crop</CardTitle>
                    <CardDescription>Your label will be cropped to a perfect 4" x 6" size, ready for your thermal printer.</CardDescription>
                </CardHeader>
                 <CardContent className="flex flex-col items-center gap-4">
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                            <FileUp className="h-20 w-20 text-muted-foreground"/>
                            <Badge>Original PDF</Badge>
                        </div>
                        <ArrowRight className="h-8 w-8 text-primary"/>
                        <div className="flex flex-col items-center">
                             <Printer className="h-20 w-20 text-muted-foreground"/>
                             <Badge>4" x 6" Label</Badge>
                        </div>
                     </div>
                     <Button onClick={handleCrop} disabled={isLoading || !pdfFile} className="w-full mt-4">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scissors className="mr-2 h-4 w-4" />}
                        Crop Flipkart Label
                    </Button>
                 </CardContent>
            </Card>
        </div>
    </div>
  );
}
