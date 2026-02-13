
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, FileText, Loader2, FileDown, Image as ImageIcon, CheckCheck, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import Image from 'next/image';
import * as pdfjsLib from 'pdfjs-dist';

// Standardized worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PagePreview {
    id: string;
    dataUrl: string;
    selected: boolean;
}

export function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [quality, setQuality] = useState(90);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setIsLoading(true);
      setPagePreviews([]);

      try {
        const fileBytes = await selectedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: fileBytes });
        const pdf = await loadingTask.promise;
        
        const previews: PagePreview[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            previews.push({
              id: `page-${i}`,
              dataUrl: canvas.toDataURL('image/jpeg'),
              selected: true,
            });
          }
        }
        setPagePreviews(previews);
      } catch (error) {
        toast({ title: 'Error processing PDF', description: 'The file might be corrupted or encrypted.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({ title: 'Invalid File', description: 'Please upload a valid PDF file.', variant: 'destructive' });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
    if (e.target) e.target.value = '';
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

  const handleToggleSelectAll = (checked: boolean) => {
    setPagePreviews(previews => previews.map(p => ({ ...p, selected: checked })));
  };

  const handlePageSelect = (id: string) => {
    setPagePreviews(previews => previews.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };
  
  const handleConvertAndDownload = async () => {
    if (!file) return;
    const selectedPages = pagePreviews.filter(p => p.selected);
    if (selectedPages.length === 0) {
      toast({ title: "No pages selected", description: "Please select at least one page to convert.", variant: "destructive"});
      return;
    }

    setIsLoading(true);
    try {
        const fileBytes = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: fileBytes }).promise;
        const zip = new JSZip();
        
        const conversionPromises = selectedPages.map(async (p) => {
            const pageNum = parseInt(p.id.split('-')[1]);
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 }); 
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
            if (context) {
                await page.render({ canvasContext: context, viewport }).promise;
                const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
                return { name: `page_${pageNum}.jpg`, data: dataUrl.split(',')[1] };
            }
            return null;
        });

        const results = await Promise.all(conversionPromises);
        const validResults = results.filter((r): r is { name: string; data: string } => r !== null);

        if (validResults.length === 1 && validResults[0]) {
            const link = document.createElement('a');
            link.href = `data:image/jpeg;base64,${validResults[0].data}`;
            link.download = validResults[0].name;
            link.click();
        } else if (validResults.length > 1) {
            validResults.forEach(res => {
                zip.file(res.name, res.data, { base64: true });
            });
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `${file.name.split('.')[0]}-images.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
        }

        toast({ title: 'Conversion successful!', description: `Converted ${validResults.length} pages.`});
    } catch (e) {
        toast({ title: "Conversion Failed", description: "Could not convert the PDF pages.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPagePreviews([]);
    setIsLoading(false);
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
            <h3 className="text-lg font-semibold">{file ? file.name : "Click or drag PDF file to upload"}</h3>
            <p className="text-sm text-muted-foreground">Each page of your PDF will be converted to a high-quality JPG image.</p>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && pagePreviews.length === 0 && (
          <div className="text-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto"/>
              <p className="text-muted-foreground mt-2">Analyzing your PDF...</p>
          </div>
      )}

      {pagePreviews.length > 0 && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Select Pages & Quality</CardTitle>
            <CardDescription>Choose which pages to convert and set the image quality.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox id="select-all" checked={pagePreviews.every(p => p.selected)} onCheckedChange={(checked) => handleToggleSelectAll(Boolean(checked))} />
                    <Label htmlFor="select-all">Select All ({pagePreviews.filter(p => p.selected).length} / {pagePreviews.length})</Label>
                </div>
                 <div className="w-48 space-y-1">
                    <Label>JPG Quality: {quality}%</Label>
                    <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={10} max={100} step={10} />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2 border rounded-md">
              {pagePreviews.map((page, index) => (
                <div key={page.id} className="relative group cursor-pointer" onClick={() => handlePageSelect(page.id)}>
                   <div className={cn("absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity", page.selected ? 'opacity-0 group-hover:opacity-100' : 'opacity-60')}>
                        <CheckCheck className={cn("h-12 w-12 text-white transition-opacity", page.selected ? 'opacity-0' : 'opacity-100')}/>
                   </div>
                   <div className={cn("absolute inset-0 ring-4 ring-primary rounded-lg transition-opacity", page.selected ? 'opacity-100' : 'opacity-0')} />
                   <Image src={page.dataUrl} alt={`Page ${index + 1}`} width={150} height={212} className="w-full h-auto rounded-md shadow-md"/>
                   <div className="absolute bottom-1 right-1 bg-background/80 text-foreground text-xs font-bold px-1.5 py-0.5 rounded-sm">{index + 1}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button onClick={handleConvertAndDownload} disabled={isLoading || pagePreviews.filter(p=>p.selected).length === 0} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4"/>}
                    Convert & Download
                </Button>
                <Button onClick={handleClear} variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4"/> Clear
                </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
