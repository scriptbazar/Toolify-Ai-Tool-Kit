
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';
import Image from 'next/image';

export function ImageCompressor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setOriginalSize(file.size);
      setImagePreview(URL.createObjectURL(file));
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleCompress = () => {
    if (!imagePreview) return;
    
    const img = document.createElement('img');
    img.src = imagePreview;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(blob => {
            if (blob) {
                const compressedUrl = URL.createObjectURL(blob);
                setCompressedSize(blob.size);
                
                const link = document.createElement('a');
                link.href = compressedUrl;
                link.download = `compressed-${imageFile?.name}`;
                link.click();
                URL.revokeObjectURL(compressedUrl);
            }
        }, imageFile?.type || 'image/jpeg', quality);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <Label>Upload Image</Label>
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
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
            <Label>Compression Quality: {Math.round(quality * 100)}%</Label>
            <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={0.1} max={1} step={0.05} />
        </div>
        
        {originalSize > 0 && (
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 border rounded-md"><p className="text-sm text-muted-foreground">Original Size</p><p className="font-bold">{formatBytes(originalSize)}</p></div>
                <div className="p-2 border rounded-md"><p className="text-sm text-muted-foreground">Compressed Size</p><p className="font-bold">{compressedSize > 0 ? formatBytes(compressedSize) : '...'}</p></div>
            </div>
        )}

        <Button onClick={handleCompress} disabled={!imageFile} className="w-full">
          <Download className="mr-2 h-4 w-4" /> Compress & Download
        </Button>
      </div>
    </div>
  );
}
