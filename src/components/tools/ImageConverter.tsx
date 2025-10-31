
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { UploadCloud, FileDown, Loader2, Trash2, Wand2, FileImage, X, ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Slider } from '../ui/slider';
import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { Label } from '../ui/label';
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
    originalSize: number;
}

const ITEMS_PER_PAGE = 5;

export function ImageConverter() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('webp');
  const [quality, setQuality] = useState(80);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [queueCurrentPage, setQueueCurrentPage] = useState(1);
  const [convertedCurrentPage, setConvertedCurrentPage] = useState(1);
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
    setConvertedCurrentPage(1);
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
        const remainingFiles = prev.filter(f => f.id !== id);
        const totalPages = Math.ceil(remainingFiles.length / ITEMS_PER_PAGE);
        if (queueCurrentPage > totalPages) {
            setQueueCurrentPage(totalPages || 1);
        }
        return remainingFiles;
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({ title: 'No images to convert', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setConvertedFiles([]);
    setConvertedCurrentPage(1);

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
                return { name: `${originalName}.pdf`, blob, previewUrl: item.previewUrl, originalSize: item.file.size };
            } else {
                const options = {
                    maxSizeMB: 20,
                    useWebWorker: true,
                    initialQuality: quality / 100,
                    fileType: `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
                };
                const compressedFile = await imageCompression(item.file, options);
                return { name: `${originalName}.${targetFormat}`, blob: compressedFile, previewUrl: item.previewUrl, originalSize: item.file.size };
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
      setQueueCurrentPage(1);
      setConvertedCurrentPage(1);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }
  
  const paginatedQueueFiles = useMemo(() => {
    const startIndex = (queueCurrentPage - 1) * ITEMS_PER_PAGE;
    return files.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [files, queueCurrentPage]);

  const totalQueuePages = Math.ceil(files.length / ITEMS_PER_PAGE);

  const paginatedConvertedFiles = useMemo(() => {
    const startIndex = (convertedCurrentPage - 1) * ITEMS_PER_PAGE;
    return convertedFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [convertedFiles, convertedCurrentPage]);

  const totalConvertedPages = Math.ceil(convertedFiles.length / ITEMS_PER_PAGE);

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
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
          <div className="flex flex-col items-center justify-center h-full">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Click or drag files to upload</h3>
            <p className="text-sm text-muted-foreground">Select one or more images to convert.</p>
          </div>
        </CardContent>
      </Card>
      
      {files.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Conversion Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
                 <Button onClick={handleConvert} disabled={files.length === 0 || isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                    Convert Images
                </Button>
            </CardContent>
        </Card>
      )}

      {files.length > 0 && convertedFiles.length === 0 && !isLoading && (
        <Card className="animate-in fade-in-50">
            <CardHeader>
                <CardTitle>Image Queue ({files.length})</CardTitle>
                <CardDescription>These images are ready to be converted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {paginatedQueueFiles.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-1.5 bg-muted rounded-md text-sm">
                            <Image src={item.previewUrl} alt={item.file.name} width={32} height={32} className="rounded-sm object-cover w-8 h-8"/>
                            <div className="flex-1 overflow-hidden"><p className="font-medium truncate">{item.file.name}</p></div>
                            <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(item.id)}><X className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>
                {totalQueuePages > 1 && (
                    <div className="flex items-center justify-end space-x-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setQueueCurrentPage(p => Math.max(p - 1, 1))} disabled={queueCurrentPage === 1}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                        <span className="text-sm text-muted-foreground">Page {queueCurrentPage} of {totalQueuePages}</span>
                        <Button variant="outline" size="sm" onClick={() => setQueueCurrentPage(p => Math.min(p + 1, totalQueuePages))} disabled={queueCurrentPage === totalQueuePages}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

      {isLoading && convertedFiles.length === 0 && (
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Converting images, please wait...</p>
        </div>
      )}

      {convertedFiles.length > 0 && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Converted Images</CardTitle>
              <CardDescription>Your images have been successfully converted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {paginatedConvertedFiles.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="flex items-center gap-4 p-2 bg-muted rounded-md">
                            <Image src={item.previewUrl} alt="Original" width={48} height={48} className="rounded-md object-cover w-12 h-12"/>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatBytes(item.originalSize)} &rarr; <span className="font-semibold text-primary">{formatBytes(item.blob.size)}</span>
                                </p>
                            </div>
                            <Badge variant="outline">{(((item.originalSize - item.blob.size) / item.originalSize) * 100).toFixed(0)}% smaller</Badge>
                            <Button size="sm" onClick={() => handleIndividualDownload(item)}>
                               <Download className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                </div>
                {totalConvertedPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setConvertedCurrentPage(p => Math.max(p - 1, 1))} disabled={convertedCurrentPage === 1}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                        <span className="text-sm text-muted-foreground">Page {convertedCurrentPage} of {totalConvertedPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setConvertedCurrentPage(p => Math.min(p + 1, totalConvertedPages))} disabled={convertedCurrentPage === totalConvertedPages}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button onClick={handleDownloadAll} disabled={convertedFiles.length === 0 || isLoading} className="w-full sm:w-auto">
                    <FileDown className="mr-2 h-4 w-4"/> Download All as ZIP
                </Button>
                <Button onClick={handleClear} variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4"/> Clear All
                </Button>
            </CardFooter>
          </Card>
      )}
    </div>
  );
}
