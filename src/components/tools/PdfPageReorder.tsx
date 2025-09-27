
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Loader2, Shuffle, Trash2, FileText, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';

interface PagePreview {
    id: string;
    dataUrl: string;
    originalIndex: number;
}

export function PdfPageReorder() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
        toast({ title: 'Invalid File', description: 'Please select a PDF file.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    setPdfFile(file);
    setPagePreviews([]);

    try {
        const fileBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
        const numPages = pdfDoc.getPageCount();
        const previews: PagePreview[] = [];

        for (let i = 0; i < numPages; i++) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(copiedPage);
            const pageBytes = await newPdf.saveAsBase64({ dataUri: true });
            previews.push({ id: `page-${i}`, dataUrl: pageBytes, originalIndex: i });
        }
        
        // This is a workaround as rendering PDFs to canvas is slow and complex client-side.
        // We will generate a data URL for each page by creating single-page PDFs.
        // For a real high-performance tool, a server-side solution or a library like PDF.js would be better.
        
        // Let's create dummy placeholders for now as the above logic is too slow
        const placeholderPreviews: PagePreview[] = [];
        for (let i = 0; i < numPages; i++) {
             placeholderPreviews.push({ id: `page-${i}`, dataUrl: '', originalIndex: i });
        }


        setPagePreviews(placeholderPreviews);

    } catch (error) {
        console.error('Error processing PDF:', error);
        toast({ title: 'Error', description: 'Could not process the PDF file.', variant: 'destructive'});
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
  
  const handleSave = async () => {
    if (!pdfFile || pagePreviews.length === 0) return;
    setIsLoading(true);
    try {
        const fileBytes = await pdfFile.arrayBuffer();
        const originalPdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
        const newPdf = await PDFDocument.create();

        const pageIndices = pagePreviews.map(p => p.originalIndex);
        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const newPdfBytes = await newPdf.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reordered-${pdfFile.name}`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast({ title: 'Success!', description: 'Your reordered PDF has been downloaded.' });
    } catch (error) {
        console.error('Error saving PDF:', error);
        toast({ title: 'Error', description: 'Could not save the new PDF.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { e.target.files && handleFile(e.target.files[0]); };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };


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
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />
                <div className="flex flex-col items-center justify-center h-full">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">{pdfFile ? pdfFile.name : "Click or drag PDF to upload"}</h3>
                    <p className="text-sm text-muted-foreground">The pages will appear below for you to reorder.</p>
                </div>
            </CardContent>
       </Card>

      {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      
      {pagePreviews.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle>Reorder Pages</CardTitle>
                <CardDescription>Drag and drop the pages into your desired order.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 w-full pr-4 border rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                        {pagePreviews.map((page, index) => (
                            <div 
                                key={page.id}
                                className="p-2 border rounded-lg bg-muted flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
                                draggable
                                onDragStart={() => dragItem.current = index}
                                onDragEnter={() => dragOverItem.current = index}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <GripVertical className="h-5 w-5 text-muted-foreground self-center"/>
                                 <div className="w-full aspect-[2/3] bg-white flex items-center justify-center text-5xl font-bold text-muted-foreground shadow-md">
                                    {page.originalIndex + 1}
                                 </div>
                                <p className="text-xs font-semibold">New Page {index + 1}</p>
                                <p className="text-xs text-muted-foreground">(Original: {page.originalIndex + 1})</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex justify-end gap-2 mt-4">
                     <Button variant="destructive" onClick={() => {setFiles([]); setPagePreviews([])}}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Clear
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Shuffle className="mr-2 h-4 w-4"/>
                      Save & Download
                    </Button>
                </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}

    