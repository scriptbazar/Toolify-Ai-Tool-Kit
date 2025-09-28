
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Loader2, Hash, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

// Helper to parse page ranges e.g., "1-5, 8, 10-12" into a set of zero-based indices
const parsePages = (pagesStr: string, totalPages: number): number[] => {
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


export function PdfPageNumberer() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [format, setFormat] = useState('Page {page} of {pages}');
  const [startNumber, setStartNumber] = useState('1');
  const [pagesToNumber, setPagesToNumber] = useState('');
  const [fontSize, setFontSize] = useState('12');
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
        toast({ title: 'Invalid File Type', variant: 'destructive'});
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { e.target.files && handleFile(e.target.files[0]); if (e.target) e.target.value = ''; };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

  const handleApplyNumbers = async () => {
    if (!pdfFile || !totalPages) {
      toast({ title: 'Please upload a PDF file first.', variant: 'destructive' });
      return;
    }

    const pagesToProcess = parsePages(pagesToNumber, totalPages);
    if (pagesToNumber.trim() !== '' && pagesToProcess.length === 0) {
      toast({ title: 'Invalid Page Selection', description: 'Please check your page numbers and ranges.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const numStart = parseInt(startNumber, 10);
      const size = parseInt(fontSize, 10);

      for (let i = 0; i < pagesToProcess.length; i++) {
        const pageIndex = pagesToProcess[i];
        if (pageIndex >= pdfDoc.getPageCount()) continue;

        const page = pdfDoc.getPage(pageIndex);
        const { width, height } = page.getSize();
        
        const pageCounter = numStart + i;
        const text = format.replace('{page}', String(pageCounter)).replace('{pages}', String(totalPages));
        const textWidth = font.widthOfTextAtSize(text, size);
        
        let x, y;
        const margin = 36;

        if (position.startsWith('top')) y = height - size - margin;
        else y = margin;

        if (position.endsWith('left')) x = margin;
        else if (position.endsWith('center')) x = width / 2 - textWidth / 2;
        else x = width - textWidth - margin;

        page.drawText(text, { x, y, font, size, color: rgb(0, 0, 0) });
      }

      const newPdfBytes = await pdfDoc.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `numbered-${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(link.href);
      
    } catch (error) {
      toast({ title: 'Error', description: 'Could not apply page numbers.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  

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
                    <p className="text-sm text-muted-foreground">The page count will be displayed instantly.</p>
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
                    <CardTitle>Numbering Options</CardTitle>
                    <CardDescription>Customize how the page numbers will appear.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="top-left">Top Left</SelectItem>
                                    <SelectItem value="top-center">Top Center</SelectItem>
                                    <SelectItem value="top-right">Top Right</SelectItem>
                                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                    <SelectItem value="bottom-center">Bottom Center</SelectItem>
                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="format">Format</Label>
                            <Select value={format} onValueChange={setFormat}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Page {page}">Page 1</SelectItem>
                                    <SelectItem value="Page {page} of {pages}">Page 1 of {totalPages || 'N'}</SelectItem>
                                    <SelectItem value="{page}">1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-number">Start Numbering From</Label>
                            <Input id="start-number" type="number" value={startNumber} onChange={e => setStartNumber(e.target.value)} min="1"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="font-size">Font Size</Label>
                            <Input id="font-size" type="number" value={fontSize} onChange={e => setFontSize(e.target.value)} min="6"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="pages-to-number">Apply to Pages (Optional)</Label>
                            <Input id="pages-to-number" value={pagesToNumber} onChange={e => setPagesToNumber(e.target.value)} placeholder="e.g. 2-5, 8"/>
                        </div>
                    </div>
                    
                    <Button onClick={handleApplyNumbers} disabled={!pdfFile || isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Hash className="mr-2 h-4 w-4"/>}
                        Add Numbers & Download
                    </Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
