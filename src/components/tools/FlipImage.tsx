
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Download, FlipHorizontal, FlipVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function FlipImage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (!imagePreview) return;
    
    const img = document.createElement('img');
    img.src = imagePreview;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (direction === 'horizontal') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
        }
        ctx.drawImage(img, 0, 0);
        
        const newImageDataUrl = canvas.toDataURL(imageFile?.type);
        setImagePreview(newImageDataUrl);
        // Also update the file for download
        canvas.toBlob(blob => {
            if (blob) setFileFromBlob(blob);
        }, imageFile?.type);
    }
  };
  
  const setFileFromBlob = (blob: Blob) => {
    const newFile = new File([blob], imageFile?.name || 'flipped-image', { type: blob.type });
    setImageFile(newFile);
  }

  const handleDownload = () => {
      if (!imagePreview || !imageFile) return;
      const link = document.createElement('a');
      link.href = imagePreview;
      link.download = `flipped-${imageFile.name}`;
      link.click();
  }

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        {imagePreview ? (
            <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" />
        ) : (
             <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
            </div>
        )}
      </div>
      
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => handleFlip('horizontal')} disabled={!imageFile}>
          <FlipHorizontal className="mr-2 h-4 w-4" /> Flip Horizontal
        </Button>
        <Button variant="outline" onClick={() => handleFlip('vertical')} disabled={!imageFile}>
          <FlipVertical className="mr-2 h-4 w-4" /> Flip Vertical
        </Button>
      </div>
      
      <Button onClick={handleDownload} disabled={!imageFile} className="w-full">
        <Download className="mr-2 h-4 w-4" /> Download Flipped Image
      </Button>
    </div>
  );
}
