
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Loader2, RotateCw, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, degrees } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Helper to parse page ranges e.g., "1-5, 8, 10-12" into a set of zero-based indices
const parsePageRanges = (pagesStr: string, totalPages: number): number[] => {
    const pages = new Set<number>();
    if (!pagesStr.trim()) {
        for (let i = 0; i < totalPages; i++) pages.add(i);
        return Array.from(pages);
    }

    const parts = pagesStr.split(',');
    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [start, end] = trimmedPart.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages && start <= end) {
                for (let i = start; i <= end; i++) {
                    pages.add(i - 1);
                }
            }
        } else {
            const page = Number(trimmedPart);
            if (!isNaN(page) && page > 0 && page <= totalPages) {
                pages.add(page - 1);
            }
        }
    }
    return Array.from(pages).sort((a, b) => a - b);
}


export function RotatePdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [pagesToRotate, setPagesToRotate] = useState('');
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
        } finally {
            setIsLoading(false);
        }
    } else if (file) {
        toast({ title: 'Invalid File Type', description: 'Only PDF files are allowed.', variant: 'destructive'});
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { e.target.files && handleFile(e.target.files[0]); if (e.target) e.target.value = ''; };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

  const handleRotate = async () => {
    if (!pdfFile || !totalPages) {
      toast({ title: 'Please upload a PDF file first.', variant: 'destructive' });
      return;
    }

    const pagesToProcess = parsePageRanges(pagesToRotate, totalPages);
    if (pagesToRotate.trim() !== '' && pagesToProcess.length === 0) {
      toast({ title: 'Invalid Page Selection', description: 'Please check your page numbers and ranges.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      pagesToProcess.forEach(pageIndex => {
          if (pageIndex < pdfDoc.getPageCount()) {
              const page = pdfDoc.getPage(pageIndex);
              const currentRotation = page.getRotation().angle;
              page.setRotation(degrees(currentRotation + rotation));
          }
      });
      
      const newPdfBytes = await pdfDoc.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `rotated-${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(link.href);
      
    } catch (error) {
      toast({ title: 'Error', description: 'Could not rotate the PDF.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setPdfFile(null);
    setPagesToRotate('');
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
                </div>
            </CardContent>
        </Card>
        {totalPages && (
            <div className="p-3 bg-muted rounded-md flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-primary shrink-0"/>
                <span className="font-medium text-sm">Total Pages: {totalPages}</span>
            </div>
        )}
      
        {pdfFile && totalPages && (
            <Card className="animate-in fade-in-50">
                <CardHeader>
                    <CardTitle>Rotation Options</CardTitle>
                    <CardDescription>Choose how you want to rotate your PDF.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="rotation-angle">Rotation Angle</Label>
                            <Select value={String(rotation)} onValueChange={(v) => setRotation(Number(v) as 90 | 180 | 270)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="90">90° (Clockwise)</SelectItem>
                                    <SelectItem value="180">180° (Upside Down)</SelectItem>
                                    <SelectItem value="270">270° (Counter-clockwise)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pages-to-rotate">Apply to Pages (Optional)</Label>
                            <Input id="pages-to-rotate" value={pagesToRotate} onChange={e => setPagesToRotate(e.target.value)} placeholder="e.g., 2, 5-7 (all if empty)"/>
                        </div>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                        <Button onClick={handleRotate} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                            Rotate & Download
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
