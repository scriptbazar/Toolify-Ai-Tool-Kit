
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Slider } from '../ui/slider';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import JSZip from 'jszip';
import { ScrollArea } from '../ui/scroll-area';

type ImageFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'pdf' | 'avif' | 'jpg';

interface FileWithPreview {
  file: File;
  previewUrl: string;
  id: string;
}

export function ImageConverter() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
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


  const convertAndDownload = async () => {
    if (files.length === 0) {
      toast({ title: 'No images to convert', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
        const zip = new JSZip();
        let convertedCount = 0;

        for (const item of files) {
            const originalName = item.file.name.split('.')[0] || 'image';
            
            if (targetFormat === 'pdf') {
                const imageBytes = await item.file.arrayBuffer();
                const pdfDoc = await PDFDocument.create();
                const image = item.file.type === 'image/jpeg' ? await pdfDoc.embedJpg(imageBytes) : await pdfDoc.embedPng(imageBytes);
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
                const pdfBytes = await pdfDoc.save();
                zip.file(`${originalName}.pdf`, pdfBytes);
                convertedCount++;
            } else {
                const options = {
                    maxSizeMB: 20,
                    useWebWorker: true,
                    initialQuality: quality / 100,
                    fileType: `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
                };
                const compressedFile = await imageCompression(item.file, options);
                zip.file(`${originalName}.${targetFormat}`, compressedFile);
                convertedCount++;
            }
        }
        
        if (convertedCount > 0) {
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `converted-images.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
            toast({ title: 'Success!', description: `${convertedCount} images converted and zipped.` });
        } else {
             toast({ title: 'Conversion Failed', description: 'No images were converted.', variant: 'destructive'});
        }
    } catch (error: any) {
        toast({ title: 'Conversion Failed', description: error.message, variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleClear = () => {
      files.forEach(f => URL.revokeObjectURL(f.previewUrl));
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
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
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple/>
                    <div className="flex flex-col items-center justify-center h-full">
                        <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click or drag images to upload</p>
                        <p className="text-xs text-muted-foreground">(JPG, PNG, WEBP, etc.)</p>
                    </div>
                </CardContent>
            </Card>
             {files.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Image Queue ({files.length})</CardTitle></CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72 w-full pr-4">
                            <div className="space-y-2">
                                {files.map((f, index) => (
                                    <div key={f.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                        <Image src={f.previewUrl} alt={f.file.name} width={40} height={40} className="w-10 h-10 object-cover rounded-md"/>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-medium truncate">{f.file.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatBytes(f.file.size)}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(index)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
             )}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Conversion Settings</CardTitle>
                <CardDescription>Choose the output format and quality.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="target-format">Convert To:</Label>
                    <Select value={targetFormat} onValueChange={(val) => setTargetFormat(val as ImageFormat)}>
                        <SelectTrigger id="target-format"><SelectValue placeholder="Select format" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jpg">JPG</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="webp">WEBP</SelectItem>
                            <SelectItem value="gif">GIF</SelectItem>
                            <SelectItem value="bmp">BMP</SelectItem>
                            <SelectItem value="avif">AVIF</SelectItem>
                            <SelectItem value="pdf">PDF (Single image per page)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {(targetFormat === 'jpeg' || targetFormat === 'webp' || targetFormat === 'avif' || targetFormat === 'jpg') && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Quality: {quality}%</Label>
                        </div>
                        <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={10} max={100} step={5} />
                    </div>
                )}
                 <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    <Button onClick={convertAndDownload} disabled={files.length === 0 || isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                        Convert & Download
                    </Button>
                     <Button variant="destructive" onClick={handleClear} className="w-full">
                        <Trash2 className="mr-2 h-4 w-4"/> Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}