
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Loader2, Shuffle, Trash2, GripVertical, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PagePreview {
    id: string;
    dataUrl: string;
    originalDocIndex: number;
    originalPageIndex: number;
    rotation: number; // in degrees
}

export function PdfOrganizer() {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleFile = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newPdfFiles = Array.from(selectedFiles).filter(file => file.type === 'application/pdf');
    if (newPdfFiles.length === 0) {
        toast({ title: 'No valid PDF files selected.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    setPdfFiles(prev => [...prev, ...newPdfFiles]);

    try {
      for (const file of newPdfFiles) {
        const fileBytes = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: fileBytes });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const currentDocIndex = pdfFiles.length + newPdfFiles.indexOf(file);

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            setPagePreviews(prev => [...prev, {
              id: `doc${currentDocIndex}-page${i}`,
              dataUrl: canvas.toDataURL('image/png'),
              originalDocIndex: currentDocIndex,
              originalPageIndex: i - 1,
              rotation: 0
            }]);
          }
        }
      }
    } catch (error) {
        console.error('Error processing PDF:', error);
        toast({ title: 'Error', description: 'Could not process one or more PDF files.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newPreviews = [...pagePreviews];
    const draggedItemContent = newPreviews.splice(dragItem.current, 1)[0];
    newPreviews.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setPagePreviews(newPreviews);
  };
  
  const handleRotatePage = (index: number) => {
    setPagePreviews(prev => {
        const newPreviews = [...prev];
        const currentPage = newPreviews[index];
        newPreviews[index] = { ...currentPage, rotation: (currentPage.rotation + 90) % 360 };
        return newPreviews;
    });
  };

  const handleRemovePage = (index: number) => {
    setPagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (pagePreviews.length === 0) return;
    setIsLoading(true);
    try {
        const newPdf = await PDFDocument.create();

        for (const preview of pagePreviews) {
            const originalFile = pdfFiles[preview.originalDocIndex];
            const fileBytes = await originalFile.arrayBuffer();
            const originalPdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
            
            const [copiedPage] = await newPdf.copyPages(originalPdf, [preview.originalPageIndex]);
            copiedPage.setRotation(copiedPage.getRotation()); // Ensure original rotation is respected
            copiedPage.rotate(copiedPage.getRotation().angle + preview.rotation); // Apply new rotation
            newPdf.addPage(copiedPage);
        }
        
        const newPdfBytes = await newPdf.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `organized-${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast({ title: 'Success!', description: 'Your organized PDF has been downloaded.' });
    } catch (error) {
        console.error('Error saving PDF:', error);
        toast({ title: 'Error', description: 'Could not save the new PDF.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { handleFile(e.target.files); };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFile(e.dataTransfer.files); };

  const handleClear = () => {
    setPdfFiles([]);
    setPagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }


  return (
    <div className="space-y-6">
       <Card 
            className={cn("transition-colors", isDragging && 'border-primary bg-primary/10')}
            onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
        >
            <CardContent 
                className="p-6 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
                <div className="flex flex-col items-center justify-center h-full">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Click or drag PDF files to upload</h3>
                    <p className="text-sm text-muted-foreground">You can upload multiple PDFs to merge and organize.</p>
                </div>
            </CardContent>
       </Card>
      
      {isLoading && pagePreviews.length === 0 && (
          <div className="text-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto"/>
              <p className="text-muted-foreground mt-2">Processing PDF(s)...</p>
          </div>
      )}

      {pagePreviews.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle>Organize Pages</CardTitle>
                <CardDescription>Drag pages to reorder. Use the buttons on each page to rotate or delete.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[70vh] w-full pr-4 border rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                        {pagePreviews.map((page, index) => (
                            <div 
                                key={page.id} 
                                className="p-1 border rounded-lg bg-muted flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
                                draggable
                                onDragStart={() => dragItem.current = index}
                                onDragEnter={() => dragOverItem.current = index}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <GripVertical className="h-5 w-5 text-muted-foreground self-center shrink-0"/>
                                 <div className="w-full aspect-[2/3] bg-white flex items-center justify-center text-5xl font-bold text-muted-foreground shadow-md relative">
                                    <Image 
                                      src={page.dataUrl} 
                                      alt={`Page ${page.originalIndex + 1}`} 
                                      layout="fill" 
                                      objectFit="contain" 
                                      style={{ transform: `rotate(${page.rotation}deg)` }}
                                    />
                                 </div>
                                <p className="text-xs text-muted-foreground">Page {index + 1}</p>
                                <div className="flex gap-1 w-full">
                                    <Button variant="outline" size="icon" className="h-7 w-7 flex-1" onClick={() => handleRotatePage(index)}>
                                        <RotateCw className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="destructive" size="icon" className="h-7 w-7 flex-1" onClick={() => handleRemovePage(index)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex justify-end gap-2 mt-4">
                     <Button variant="secondary" onClick={handleClear}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Clear All
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                      Save & Download PDF
                    </Button>
                </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
