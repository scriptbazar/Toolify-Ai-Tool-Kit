
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Loader2, FileText, ListOrdered } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';

export function PdfPageCounter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file && file.type === 'application/pdf') {
        setIsLoading(true);
        setPdfFile(file);
        setTotalPages(null);
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
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); };
  
  return (
    <div className="space-y-6 max-w-lg mx-auto">
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
                    <p className="text-sm text-muted-foreground">The page count will be displayed instantly.</p>
                </div>
            </CardContent>
        </Card>
      
      {(isLoading || totalPages !== null) && (
        <Card className="animate-in fade-in-50 text-center">
            <CardHeader>
                <CardTitle>Page Count Result</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                ) : (
                    <>
                        <p className="text-6xl font-bold text-primary">{totalPages}</p>
                        <p className="text-lg text-muted-foreground">pages</p>
                    </>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
