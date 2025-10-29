
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Loader2, Trash2, Image as ImageIcon, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Slider } from '../ui/slider';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { ScrollArea } from '../ui/scroll-area';

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
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(90);
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
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFiles(e.dataTransfer.files); };
  
  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    URL.revokeObjectURL(fileToRemove.previewUrl);
    setFiles(prev => prev.filter((_, i) => i !== index));
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
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
                 <Card 
                    className={cn("transition-colors", isDragging && 'border-primary bg-primary/10')}
                    onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
                >
                    <CardContent 
                        className="p-6 text-center cursor-pointer h-48 flex items-center justify-center"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                        <div className="flex flex-col items-center justify-center h-full">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <h3 className="text-lg font-semibold">Click or drag images to upload</h3>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle>Conversion Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="target-format">Convert To:</Label>
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
                                <Label>Quality: {quality}%</Label>
                                <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={10} max={100} step={10} />
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Button onClick={handleConvert} disabled={files.length === 0 || isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                    Convert Images
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Output</CardTitle>
                    <CardDescription>Your converted images will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    {files.length > 0 && (
                        <Button onClick={handleClear} variant="destructive" size="sm" className="mb-4">
                            <Trash2 className="mr-2 h-4 w-4"/> Clear Queue
                        </Button>
                    )}
                    <ScrollArea className="h-[70vh] w-full pr-4 border rounded-lg">
                        <div className="grid grid-cols-2 gap-4 p-4">
                            {convertedFiles.length > 0 ? convertedFiles.map((item) => (
                                <div key={item.name} className="p-2 border rounded-lg bg-muted flex flex-col items-center gap-2">
                                    <div className="w-full aspect-square bg-white flex items-center justify-center shadow-md relative">
                                        <Image src={item.previewUrl} alt={`Preview ${item.name}`} layout="fill" objectFit="contain" />
                                    </div>
                                    <p className="text-xs font-medium truncate w-full text-center">{item.name}</p>
                                    <Button size="sm" className="w-full" onClick={() => handleIndividualDownload(item)}>
                                        <Download className="mr-2 h-4 w-4"/>Download
                                    </Button>
                                </div>
                            )) : (
                                <div className="col-span-2 text-center text-muted-foreground py-10">
                                    <p>Your converted images will appear here.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    {convertedFiles.length > 0 && (
                         <Button onClick={handleDownloadAll} className="w-full mt-4">
                            <Download className="mr-2 h-4 w-4"/> Download All as ZIP
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
