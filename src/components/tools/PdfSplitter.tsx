
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Loader2, Split, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { splitPdf } from '@/ai/flows/pdf-management';

type SplitMode = 'ranges' | 'fixed' | 'extract';

// This helper is now defined on the client-side for validation
const parsePages = (pagesStr: string, totalPages: number): number[] => {
    const pages = new Set<number>();
    if (!pagesStr.trim()) {
        for (let i = 1; i <= totalPages; i++) pages.add(i);
        return Array.from(pages);
    }

    const parts = pagesStr.split(',');
    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('-')) {
            const [start, end] = trimmedPart.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages && start <= end) {
                for (let i = start; i <= end; i++) {
                    pages.add(i);
                }
            }
        } else {
            const page = Number(trimmedPart);
            if (!isNaN(page) && page > 0 && page <= totalPages) {
                pages.add(page);
            }
        }
    }
    return Array.from(pages).sort((a, b) => a - b);
}


export function PdfSplitter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('ranges');
  const [ranges, setRanges] = useState('');
  const [fixedRangeSize, setFixedRangeSize] = useState('1');
  const [pagesToExtract, setPagesToExtract] = useState('');
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
            const { PDFDocument } = await import('pdf-lib');
            const fileBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
            setTotalPages(pdfDoc.getPageCount());
        } catch (error) {
            toast({ title: "Error reading PDF", description: "Could not read the page count.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    } else if (file) {
        toast({ title: 'Invalid File Type', description: 'Only PDF files are allowed.', variant: 'destructive'});
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); if(e.target) e.target.value = ''; };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

  const handleSplit = async () => {
    if (!pdfFile || !totalPages) {
        toast({ title: 'No PDF selected', variant: 'destructive' });
        return;
    }
    
    let options: any;
    switch (splitMode) {
        case 'ranges':
            if (!ranges.trim()) { toast({ title: 'Ranges are required', variant: 'destructive'}); return; }
            if (parsePages(ranges, totalPages).length === 0) {
                 toast({ title: 'Invalid Ranges', description: `Please enter page numbers between 1 and ${totalPages}.`, variant: 'destructive'}); return;
            }
            options = { ranges };
            break;
        case 'fixed':
            options = { fixedRangeSize: parseInt(fixedRangeSize, 10) };
            break;
        case 'extract':
             if (!pagesToExtract.trim()) { toast({ title: 'Pages are required', variant: 'destructive'}); return; }
             if (parsePages(pagesToExtract, totalPages).length === 0) {
                 toast({ title: 'Invalid Pages', description: `Please enter page numbers between 1 and ${totalPages}.`, variant: 'destructive'}); return;
            }
            options = { extractPages: pagesToExtract };
            break;
    }
    
    setIsLoading(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(pdfFile);
        reader.onloadend = async () => {
            const base64Pdf = reader.result as string;
            const result = await splitPdf({
                pdfDataUri: base64Pdf,
                splitMode,
                ...options,
            });

            if (result.zipDataUri) {
                const link = document.createElement('a');
                link.href = result.zipDataUri;
                link.download = `split-${pdfFile.name}.zip`;
                link.click();
                toast({ title: 'Success!', description: 'Your split PDFs have been downloaded as a ZIP file.'});
            } else {
                 throw new Error("The server did not return a valid file.");
            }
        };
        reader.onerror = () => { throw new Error("Could not read the PDF file."); };

    } catch (error: any) {
        console.error("PDF Splitting Error:", error);
        toast({ title: 'Split Failed', description: error.message || 'An unknown error occurred.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };

  const renderOptions = () => {
    switch(splitMode) {
      case 'ranges':
        return (
          <div className="space-y-2">
            <Label htmlFor="ranges-input">Custom Ranges</Label>
            <Input id="ranges-input" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g., 1-5, 8, 10-12"/>
            <p className="text-xs text-muted-foreground">Define multiple output PDFs with custom page ranges.</p>
          </div>
        );
      case 'fixed':
        return (
          <div className="space-y-2">
            <Label htmlFor="fixed-range-input">Split into files of</Label>
            <Input id="fixed-range-input" type="number" value={fixedRangeSize} onChange={(e) => setFixedRangeSize(e.target.value)} min="1" />
            <p className="text-xs text-muted-foreground">e.g., entering '2' will create files of 2 pages each.</p>
          </div>
        );
      case 'extract':
        return (
          <div className="space-y-2">
            <Label htmlFor="extract-pages-input">Extract Pages</Label>
            <Input id="extract-pages-input" value={pagesToExtract} onChange={(e) => setPagesToExtract(e.target.value)} placeholder="e.g., 2, 5, 8-10"/>
             <p className="text-xs text-muted-foreground">All extracted pages will be in a single new PDF.</p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Splitting Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 <RadioGroup value={splitMode} onValueChange={(val) => setSplitMode(val as SplitMode)} className="grid grid-cols-1 gap-2">
                    <Label htmlFor="mode-ranges" className="p-3 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center gap-3">
                        <RadioGroupItem value="ranges" id="mode-ranges" />
                        <div>
                            <p className="font-semibold">Split by ranges</p>
                            <p className="text-xs text-muted-foreground">Create multiple PDFs from custom ranges.</p>
                        </div>
                    </Label>
                    <Label htmlFor="mode-fixed" className="p-3 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center gap-3">
                        <RadioGroupItem value="fixed" id="mode-fixed" />
                        <div>
                            <p className="font-semibold">Split into fixed-size chunks</p>
                            <p className="text-xs text-muted-foreground">e.g., split into files of 2 pages each.</p>
                        </div>
                    </Label>
                    <Label htmlFor="mode-extract" className="p-3 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center gap-3">
                        <RadioGroupItem value="extract" id="mode-extract" />
                        <div>
                            <p className="font-semibold">Extract pages</p>
                            <p className="text-xs text-muted-foreground">Create a single PDF from selected pages.</p>
                        </div>
                    </Label>
                </RadioGroup>

                {renderOptions()}
                
                <Button onClick={handleSplit} disabled={!pdfFile || isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Split className="mr-2 h-4 w-4" />}
                    Split PDF & Download
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
