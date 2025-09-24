
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Slider } from '../ui/slider';

type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif';

export function ImageConverter() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(0.8);
  const [estimatedSize, setEstimatedSize] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setEstimatedSize(null);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const estimateSize = () => {
    if (!imagePreview) return;
    const img = document.createElement('img');
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (targetFormat === 'jpeg') {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      // Get data URL with specified quality for estimation
      const dataUrl = canvas.toDataURL(`image/${targetFormat}`, quality);
      // Rough estimation of file size from data URL length
      const sizeInBytes = Math.round(dataUrl.length * 3 / 4);
      setEstimatedSize(formatBytes(sizeInBytes));
    };
  };

  useEffect(() => {
    if (targetFormat === 'jpeg' || targetFormat === 'webp') {
      estimateSize();
    } else {
      setEstimatedSize(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, targetFormat, imagePreview]);


  const handleConvert = () => {
    if (!imagePreview) {
        toast({ title: "No image uploaded", variant: "destructive" });
        return;
    };
    
    const img = document.createElement('img');
    img.src = imagePreview;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // For formats that don't support transparency like JPEG, fill with white.
        if (targetFormat === 'jpeg') {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const link = document.createElement('a');
        link.href = canvas.toDataURL(`image/${targetFormat}`, quality);
        const originalName = imageFile?.name.split('.')[0] || 'converted';
        link.download = `${originalName}.${targetFormat}`;
        link.click();
        toast({ title: `Converted to ${targetFormat.toUpperCase()} and downloaded!` });
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        {imagePreview ? (
            <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="p-2" />
        ) : (
             <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
            </div>
        )}
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
                <Label htmlFor="target-format">Convert To:</Label>
                <Select value={targetFormat} onValueChange={(val) => setTargetFormat(val as ImageFormat)}>
                    <SelectTrigger id="target-format">
                        <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WEBP</SelectItem>
                        <SelectItem value="gif">GIF</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {(targetFormat === 'jpeg' || targetFormat === 'webp') && (
                <div className="space-y-2">
                    <Label>Quality: {Math.round(quality * 100)}% {estimatedSize && `(~${estimatedSize})`}</Label>
                    <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={0.1} max={1} step={0.05} />
                </div>
            )}
       </div>
      
      <Button onClick={handleConvert} disabled={!imageFile} className="w-full">
        <Download className="mr-2 h-4 w-4" /> Convert & Download
      </Button>
    </div>
  );
}
