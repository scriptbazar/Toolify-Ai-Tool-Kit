
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileMinus, Loader2, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';

// Helper to parse page ranges e.g., "1-5, 8, 10-12" into a set of zero-based indices
const parsePagesToRemove = (pagesStr: string, totalPages: number): number[] => {
    const pages = new Set<number>();
    if (!pagesStr.trim()) {
        return [];
    }

    const parts = pagesStr.split(',');
    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [start, end] = trimmedPart.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages && start <= end) {
                for (let i = start; i <= end; i++) {
                    pages.add(i - 1); // convert to zero-based index
                }
            }
        } else {
            const page = Number(trimmedPart);
            if (!isNaN(page) && page > 0 && page <= totalPages) {
                pages.add(page - 1); // convert to zero-based index
            }
        }
    }
    return Array.from(pages).sort((a, b) => b - a); // Sort descending to avoid index shifting issues
}

export function PdfPageRemover() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pagesToRemove, setPagesToRemove] = useState('');
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFile = async (file: File) => {
    if (file && file.type === 'application/pdf') {
        setIsLoading(true);
        setPdfFile(file);
        setPagesToRemove('');
        try {
            const fileBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
            setTotalPages(pdfDoc.getPageCount());
        } catch (error) {
            toast({ title: "Error reading PDF", description: "Could not read the page count. The file might be corrupted or encrypted.", variant: "destructive" });
            setTotalPages(null);
            setPdfFile(null);
        } finally {
            setIsLoading(false);
        }
    } else if (file) {
        toast({ title: 'Invalid File Type', description: 'Only PDF files are allowed.', variant: 'destructive'});
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if(e.target) e.target.value = '';
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

  const handleRemovePages = async () => {
    if (!pdfFile || !totalPages) {
      toast({ title: 'Please upload a PDF file first.', variant: 'destructive' });
      return;
    }
    
    const pagesIdxToRemove = parsePagesToRemove(pagesToRemove, totalPages);
    if (pagesToRemove.trim() !== '' && pagesIdxToRemove.length === 0) {
        toast({ title: 'Invalid Page Numbers', description: 'Please enter valid page numbers or ranges.', variant: 'destructive'});
        return;
    }
     if (pagesIdxToRemove.length >= totalPages) {
        toast({ title: 'Cannot remove all pages', description: 'You cannot remove all pages from the document.', variant: 'destructive'});
        return;
    }


    setIsLoading(true);
    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
        
        pagesIdxToRemove.forEach(pageIndex => {
            if (pageIndex < pdfDoc.getPageCount()) {
                pdfDoc.removePage(pageIndex);
            }
        });

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `modified-${pdfFile.name}`;
        link.click();
        URL.revokeObjectURL(link.href);

        toast({ title: 'Pages Removed!', description: 'Your new PDF has been downloaded.'});
        
    } catch (error: any) {
        console.error("PDF Page Removal Error:", error);
        toast({ title: 'Error', description: error.message || 'Could not process the PDF.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setPdfFile(null);
    setPagesToRemove('');
    setTotalPages(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-6">
        <Card 
            className={cn(
                "transition-colors",
                isDragging && 'border-primary bg-primary/10'
            )}
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
                    <p className="text-sm text-muted-foreground">Select the PDF file you want to modify.</p>
                </div>
            </CardContent>
        </Card>
      
        {pdfFile && (
            <Card className="animate-in fade-in-50">
                <CardHeader>
                    <CardTitle>File Details & Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-muted rounded-md flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-5 w-5 text-primary shrink-0"/>
                            <span className="font-medium text-sm truncate">{pdfFile.name}</span>
                        </div>
                        {totalPages && <span className="text-xs text-muted-foreground shrink-0">({totalPages} pages)</span>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pages-to-remove">Pages to Remove</Label>
                        <Input
                            id="pages-to-remove"
                            value={pagesToRemove}
                            onChange={(e) => setPagesToRemove(e.target.value)}
                            placeholder="e.g., 2, 5-7, 10"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter page numbers or ranges, separated by commas.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleRemovePages} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileMinus className="mr-2 h-4 w-4" />}
                            Remove Pages & Download
                        </Button>
                         <Button onClick={handleClear} variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" /> Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
