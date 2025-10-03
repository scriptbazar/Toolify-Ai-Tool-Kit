
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, FileArchive, Loader2, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import imageCompression from 'browser-image-compression';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


type CompressionLevel = 'low' | 'medium' | 'high';

export function CompressPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type === 'application/pdf') {
        setPdfFile(file);
        setOriginalSize(file.size);
        setCompressedSize(null);
    } else {
      toast({ title: 'Invalid File', description: 'Please upload a valid PDF file.', variant: 'destructive' });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); if (e.target) e.target.value = ''; };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

  const handleCompress = async () => {
    if (!pdfFile) {
      toast({ title: 'Please upload a PDF file first.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setCompressedSize(null);

    try {
        const qualityMap = { low: 0.85, medium: 0.6, high: 0.4 };
        const quality = qualityMap[compressionLevel];

        const fileBytes = await pdfFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: fileBytes });
        const pdf = await loadingTask.promise;
        const newPdfDoc = await PDFDocument.create();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); // Use a reasonable scale
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
            if (!context) continue;

            await page.render({ canvasContext: context, viewport }).promise;

            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const imageBytes = await fetch(dataUrl).then(res => res.arrayBuffer());
            const embeddedImage = await newPdfDoc.embedJpg(imageBytes);

            const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
            newPage.drawImage(embeddedImage, {
                x: 0,
                y: 0,
                width: viewport.width,
                height: viewport.height,
            });
        }
      
      const newPdfBytes = await newPdfDoc.save();
      
      const newBlob = new Blob([newPdfBytes], { type: 'application/pdf' });
      setCompressedSize(newBlob.size);

      const link = document.createElement('a');
      link.href = URL.createObjectURL(newBlob);
      link.download = `compressed-${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({ title: 'Success!', description: 'Your PDF has been compressed and downloaded.' });
    } catch (error: any) {
      console.error("PDF Compression Error:", error);
      toast({ title: 'Compression Failed', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setPdfFile(null);
    setOriginalSize(null);
    setCompressedSize(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <Card 
        className={cn(
            "transition-colors",
            isDragging ? 'border-primary bg-primary/10' : 'border-border'
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
            <p className="text-sm text-muted-foreground">Reduce the file size of your PDF document.</p>
          </div>
        </CardContent>
      </Card>
      
      {pdfFile && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Compression Settings</CardTitle>
            <CardDescription>Choose a compression level. Higher compression may reduce image quality.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={compressionLevel} onValueChange={(val) => setCompressionLevel(val as CompressionLevel)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Label htmlFor="comp-low" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
                <RadioGroupItem value="low" id="comp-low" className="sr-only"/>
                <p className="font-semibold">Low Compression</p>
                <p className="text-xs text-muted-foreground">Best quality, larger size</p>
              </Label>
              <Label htmlFor="comp-medium" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
                <RadioGroupItem value="medium" id="comp-medium" className="sr-only"/>
                <p className="font-semibold">Medium Compression</p>
                <p className="text-xs text-muted-foreground">Good balance</p>
              </Label>
              <Label htmlFor="comp-high" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
                <RadioGroupItem value="high" id="comp-high" className="sr-only"/>
                <p className="font-semibold">High Compression</p>
                <p className="text-xs text-muted-foreground">Smallest size, lower quality</p>
              </Label>
            </RadioGroup>
            
            {(originalSize !== null && compressedSize !== null && compressedSize > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-md"><p className="text-sm text-muted-foreground">Original Size</p><p className="font-bold">{formatBytes(originalSize)}</p></div>
                  <div className="p-3 bg-muted rounded-md"><p className="text-sm text-muted-foreground">Compressed Size</p><p className="font-bold">{formatBytes(compressedSize)}</p></div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-md"><p className="text-sm text-green-700 dark:text-green-400">You Saved</p><p className="font-bold text-green-600 dark:text-green-400">{((originalSize - compressedSize) / originalSize * 100).toFixed(2)}%</p></div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button onClick={handleCompress} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileArchive className="mr-2 h-4 w-4" />}
                Compress & Download
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
