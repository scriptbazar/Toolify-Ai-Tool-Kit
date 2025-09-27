
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Loader2, Shuffle, Trash2, GripVertical, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import * as pdfjsLib from 'pdfjs-dist';

// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

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
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/chunks/pdf.worker.min.mjs';
        const fileBytes = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: fileBytes });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const previews: PagePreview[] = Array.from({ length: numPages }, (_, i) => ({
            id: `page-${i}`,
            dataUrl: '', // Initially empty
            originalIndex: i,
        }));
        setPagePreviews(previews);

        // Render pages one by one to avoid blocking the main thread
        for (let i = 0; i < numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const viewport = page.getViewport({ scale: 0.5 }); // Use a smaller scale for performance
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
            
            if (context) {
                 const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                await page.render(renderContext).promise;
                const dataUrl = canvas.toDataURL('image/png');
                setPagePreviews(prev => {
                    const newPreviews = [...prev];
                    newPreviews[i] = { ...newPreviews[i], dataUrl };
                    return newPreviews;
                });
            }
        }
    } catch (error) {
        console.error('Error processing PDF:', error);
        toast({ title: 'Error', description: 'Could not process the PDF file.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newFiles = [...pagePreviews];
    const draggedItemContent = newFiles.splice(dragItem.current, 1)[0];
    newFiles.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setPagePreviews(newFiles);
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

  const handleClear = () => {
    setPdfFile(null);
    setPagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }


  return (
    <div className="space-y-6">
       <Card 
            className={cn(
                "transition-colors",
                isDragging && 'border-primary bg-primary/10'
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
                                 <div className="w-full aspect-[2/3] bg-white flex items-center justify-center text-5xl font-bold text-muted-foreground shadow-md relative">
                                    {page.dataUrl ? (
                                        <Image src={page.dataUrl} alt={`Page ${page.originalIndex + 1}`} layout="fill" objectFit="contain" />
                                    ) : (
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    )}
                                 </div>
                                <p className="text-xs font-semibold">New Page {index + 1}</p>
                                <p className="text-xs text-muted-foreground">(Original: {page.originalIndex + 1})</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex justify-end gap-2 mt-4">
                     <Button variant="destructive" onClick={handleClear}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Clear
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Shuffle className="mr-2 h-4 w-4"/>}
                      Save & Download
                    </Button>
                </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
