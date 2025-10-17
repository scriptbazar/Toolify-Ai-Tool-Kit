
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

type ImageFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'pdf' | 'avif' | 'jpg';

export function ImageConverter() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(90); // Default high quality
  const [originalSize, setOriginalSize] = useState<string | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<string | null>(null);
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

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        setImageFile(file);
        setOriginalSize(formatBytes(file.size));
        setImagePreview(URL.createObjectURL(file));
        setEstimatedSize(null); // Reset on new file
    } else if (file) {
        toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); if (e.target) e.target.value = ''; };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };


  const estimateSize = async () => {
    if (!imageFile) return;

    try {
      if (['gif', 'bmp', 'pdf', 'ico'].includes(targetFormat)) {
          setEstimatedSize("N/A for this format");
          return;
      }
      const options = {
        maxSizeMB: 20, // High limit to not resize unintentionally
        useWebWorker: true,
        initialQuality: quality / 100,
        fileType: `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
        exifOrientation: true,
      };

      const compressedFile = await imageCompression(imageFile, options);
      setEstimatedSize(formatBytes(compressedFile.size));
    } catch (error) {
      console.error("Size estimation error:", error);
      setEstimatedSize("N/A");
    }
  };

  useEffect(() => {
    if (imageFile) {
      estimateSize();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, targetFormat, imageFile]);

  const handleDownload = async (blob: Blob, format: ImageFormat) => {
     const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const originalName = imageFile?.name.split('.')[0] || 'converted';
      link.download = `${originalName}.${format}`;
      link.click();
      URL.revokeObjectURL(link.href);
  }

  const handleConvert = async () => {
    if (!imageFile || !imagePreview) {
      toast({ title: "No image uploaded", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
        if (targetFormat === 'pdf') {
            const imageBytes = await imageFile.arrayBuffer();
            const pdfDoc = await PDFDocument.create();
            const image = imageFile.type === 'image/jpeg' 
                ? await pdfDoc.embedJpg(imageBytes) 
                : await pdfDoc.embedPng(imageBytes);

            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            handleDownload(blob, 'pdf');

        } else if (['gif', 'bmp', 'avif'].includes(targetFormat)) {
            const img = document.createElement('img');
            img.src = imagePreview;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                if(!ctx) {
                    throw new Error("Could not get canvas context");
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        handleDownload(blob, targetFormat);
                    }
                }, `image/${targetFormat}`, quality / 100);
            }
      } else {
        const options = {
            maxSizeMB: 20,
            useWebWorker: true,
            initialQuality: quality / 100,
            fileType: `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
            exifOrientation: true,
        };
        const compressedFile = await imageCompression(imageFile, options);
        handleDownload(compressedFile, targetFormat);
      }
      
      toast({ title: `Converted to ${targetFormat.toUpperCase()} and downloaded!` });
    } catch (error: any) {
        toast({ title: 'Conversion Failed', description: error.message, variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleClear = () => {
      setImageFile(null);
      setImagePreview(null);
      setOriginalSize(null);
      setEstimatedSize(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Upload Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div 
                    className={cn(
                        "w-full aspect-video border-2 border-dashed rounded-lg text-center cursor-pointer flex items-center justify-center relative transition-colors",
                        isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
                 >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="p-2"/>
                    ) : (
                        <div className="flex flex-col items-center p-4">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
                            <p className="text-xs text-muted-foreground">(JPG, PNG, WEBP, etc.)</p>
                        </div>
                    )}
                </div>
                 {originalSize && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                           Original file size: <strong>{originalSize}</strong>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Conversion Settings</CardTitle>
                <CardDescription>Choose the output format and quality.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="target-format">Convert To:</Label>
                    <Select value={targetFormat} onValueChange={(val) => setTargetFormat(val as ImageFormat)}>
                        <SelectTrigger id="target-format">
                            <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jpg">JPG</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="webp">WEBP</SelectItem>
                            <SelectItem value="gif">GIF</SelectItem>
                            <SelectItem value="bmp">BMP</SelectItem>
                            <SelectItem value="avif">AVIF</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {(targetFormat === 'jpeg' || targetFormat === 'webp' || targetFormat === 'avif' || targetFormat === 'jpg') && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Quality: {quality}%</Label>
                            {estimatedSize && <span className="text-xs text-muted-foreground">Estimated size: ~{estimatedSize}</span>}
                        </div>
                        <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={10} max={100} step={5} />
                    </div>
                )}
                 <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleConvert} disabled={!imageFile || isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                        Convert & Download
                    </Button>
                     <Button variant="destructive" onClick={handleClear} className="w-full">
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

    