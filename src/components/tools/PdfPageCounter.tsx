
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Loader2, FileText } from 'lucide-react';
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
            setPdfFile(null);
            setTotalPages(null);
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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card 
            className={cn(
                "transition-colors h-full",
                isDragging && 'border-primary bg-primary/10'
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
             <CardContent 
                className="p-6 text-center cursor-pointer h-full flex items-center justify-center"
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
      
        <Card className="min-h-[220px]">
            <CardHeader>
                <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 {pdfFile && (
                    <div className="p-3 bg-muted rounded-md flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-5 w-5 text-primary shrink-0"/>
                            <span className="font-medium text-sm truncate">{pdfFile.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{((pdfFile.size || 0) / 1024).toFixed(1)} KB</span>
                    </div>
                 )}
                 <div className="text-center p-6 border-2 border-dashed rounded-lg">
                    {isLoading ? (
                        <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                    ) : totalPages !== null ? (
                        <>
                            <p className="text-6xl font-bold text-primary">{totalPages}</p>
                            <p className="text-lg text-muted-foreground">pages</p>
                        </>
                    ) : (
                         <p className="text-muted-foreground">Upload a PDF to see the page count.</p>
                    )}
                 </div>
            </CardContent>
        </Card>
    </div>
  );
}
