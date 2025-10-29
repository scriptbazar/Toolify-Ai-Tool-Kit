'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, FileDown, Loader2, Trash2, Wand2, FileImage, X, Folder, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Slider } from '../ui/slider';
import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

type ImageFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'pdf' | 'avif' | 'jpg';

interface FileWithPreview {
  file: File;
  previewUrl: string;
  id: string;
}

interface ConvertedFile {
    name: string;
    blob: Blob;
    previewUrl: string;
}

export function ImageConverter() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('webp');
  const [quality, setQuality] = useState(80);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFiles = (selectedFiles: FileList) => {
    const newImageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
    
    if (newImageFiles.length === 0) {
        toast({ title: 'No valid image files selected.', variant: 'destructive'});
        return;
    }
    
    const newFilesWithPreview = newImageFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${Math.random()}`
    }));
    
    setFiles(prev => [...prev, ...newFilesWithPreview]);
    setConvertedFiles([]); // Clear old conversions
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    if (e.target) e.target.value = '';
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFiles(e.dataTransfer.files); };
  
  const removeFile = (id: string) => {
    setFiles(prev => {
        const fileToRemove = prev.find(f => f.id === id);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        return prev.filter(f => f.id !== id);
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({ title: 'No images to convert', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setConvertedFiles([]);

    try {
        const conversionPromises = files.map(async (item) => {
            const originalName = item.file.name.split('.')[0] || 'image';
            
            if (targetFormat === 'pdf') {
                const imageBytes = await item.file.arrayBuffer();
                const pdfDoc = await PDFDocument.create();
                const image = item.file.type === 'image/jpeg' ? await pdfDoc.embedJpg(imageBytes) : await pdfDoc.embedPng(imageBytes);
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                return { name: `${originalName}.pdf`, blob, previewUrl: item.previewUrl };
            } else {
                const options = {
                    maxSizeMB: 20,
                    useWebWorker: true,
                    initialQuality: quality / 100,
                    fileType: `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
                };
                const compressedFile = await imageCompression(item.file, options);
                return { name: `${originalName}.${targetFormat}`, blob: compressedFile, previewUrl: item.previewUrl };
            }
        });

        const results = await Promise.all(conversionPromises);
        setConvertedFiles(results);
        toast({ title: 'Conversion Complete!', description: `Converted ${results.length} images.` });

    } catch (error: any) {
        toast({ title: 'Conversion Failed', description: error.message, variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };

  const handleIndividualDownload = (file: ConvertedFile) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file.blob);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  const handleDownloadAll = async () => {
    if (convertedFiles.length === 0) return;
    const zip = new JSZip();
    convertedFiles.forEach(file => {
        zip.file(file.name, file.blob);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'converted-images.zip';
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  const handleClear = () => {
      files.forEach(f => URL.revokeObjectURL(f.previewUrl));
      setFiles([]);
      setConvertedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div 
        className={cn(
            "w-full h-32 border-2 border-dashed rounded-lg text-center cursor-pointer flex flex-col items-center justify-center transition-colors",
            isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:bg-muted/50'
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
        <div className="flex items-center gap-2 text-muted-foreground">
            <Folder className="h-6 w-6 text-primary"/>
            <p className="font-semibold">Drag & Drop images here or click to upload</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Image Queue</Label>
          <ScrollArea className="h-32 w-full pr-4 border rounded-lg p-2">
              <div className="space-y-2">
              {files.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-1.5 bg-muted rounded-md text-sm">
                      <Image src={item.previewUrl} alt={item.file.name} width={32} height={32} className="rounded-sm object-cover w-8 h-8"/>
                      <div className="flex-1 overflow-hidden"><p className="font-medium truncate">{item.file.name}</p></div>
                      <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(item.id)}><X className="h-4 w-4" /></Button>
                  </div>
              ))}
              </div>
          </ScrollArea>
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <Label htmlFor="target-format">Convert to:</Label>
                  <Select value={targetFormat} onValueChange={(val) => setTargetFormat(val as ImageFormat)}>
                      <SelectTrigger id="target-format"><SelectValue placeholder="Select format" /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="jpg">JPG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="webp">WEBP</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              {(targetFormat === 'jpeg' || targetFormat === 'webp' || targetFormat === 'jpg') && (
                  <div className="space-y-2">
                      <Label>Compression Quality: {quality}%</Label>
                      <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={10} max={100} step={10} />
                  </div>
              )}
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleConvert} disabled={files.length === 0 || isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                  Convert Images
              </Button>
              <Button onClick={handleDownloadAll} disabled={convertedFiles.length === 0}>
                  <Download className="mr-2 h-4 w-4"/> Download All
              </Button>
           </div>
           <Button onClick={handleClear} disabled={files.length === 0} variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4"/> Clear
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
          <div className="p-4 bg-muted rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin"/>
              <span className="text-sm font-medium">Converting images, please wait...</span>
          </div>
      )}
      
      {convertedFiles.length > 0 && (
           <div className="space-y-2">
              <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4"/>
                  <span className="text-sm font-medium">Conversion complete! You can download individual files or use 'Download All'.</span>
              </div>
              {convertedFiles.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Image src={item.previewUrl} alt="Original" width={32} height={32} className="rounded-sm object-cover w-8 h-8"/>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="flex-1 overflow-hidden">
                         <p className="text-sm font-medium truncate">{item.name}</p>
                      </div>
                      <Badge variant="outline">{formatBytes(item.blob.size)}</Badge>
                      <Button size="sm" onClick={() => handleIndividualDownload(item)}>Download</Button>
                  </div>
              ))}
           </div>
      )}
    </div>
  );
}
