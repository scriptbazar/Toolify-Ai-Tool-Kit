
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, AspectRatio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import Image from 'next/image';

export function ImageResizer() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });
  const [newWidth, setNewWidth] = useState(0);
  const [newHeight, setNewHeight] = useState(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
            setImagePreview(img.src);
            setOriginalDims({ width: img.width, height: img.height });
            setNewWidth(img.width);
            setNewHeight(img.height);
        }
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const width = Number(e.target.value);
      setNewWidth(width);
      if (maintainAspectRatio && originalDims.width > 0) {
          const ratio = originalDims.height / originalDims.width;
          setNewHeight(Math.round(width * ratio));
      }
  }
  
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const height = Number(e.target.value);
      setNewHeight(height);
      if (maintainAspectRatio && originalDims.height > 0) {
          const ratio = originalDims.width / originalDims.height;
          setNewWidth(Math.round(height * ratio));
      }
  }
  
  const handleDownload = () => {
    if (!imagePreview) return;
    const img = document.createElement('img');
    img.src = imagePreview;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        const link = document.createElement('a');
        link.href = canvas.toDataURL(imageFile?.type);
        link.download = `resized-${imageFile?.name}`;
        link.click();
    }
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
              <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="p-2"/>
          ) : (
               <div className="flex flex-col items-center">
                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
              </div>
          )}
        </div>
        {originalDims.width > 0 && <p className="text-sm text-muted-foreground text-center">Original: {originalDims.width}x{originalDims.height}</p>}
      </div>
      <div className="space-y-4">
        <Label>Resize Options</Label>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="width">Width</Label><Input id="width" type="number" value={newWidth} onChange={handleWidthChange}/></div>
            <div className="space-y-2"><Label htmlFor="height">Height</Label><Input id="height" type="number" value={newHeight} onChange={handleHeightChange}/></div>
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="aspect-ratio" checked={maintainAspectRatio} onCheckedChange={(checked) => setMaintainAspectRatio(Boolean(checked))} />
            <Label htmlFor="aspect-ratio">Maintain aspect ratio</Label>
        </div>
        <Button onClick={handleDownload} disabled={!imageFile} className="w-full">
          <Download className="mr-2 h-4 w-4" /> Resize & Download
        </Button>
      </div>
    </div>
  );
}
