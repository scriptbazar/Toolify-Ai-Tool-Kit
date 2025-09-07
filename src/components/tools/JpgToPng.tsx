
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function JpgToPng() {
  const [jpgFile, setJpgFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      setJpgFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid JPG or JPEG file.", variant: "destructive" });
    }
  };

  const handleConvert = () => {
    if (!jpgFile || !imagePreview) return;
    
    const img = document.createElement('img');
    img.src = imagePreview;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${jpgFile.name.split('.')[0]}.png`;
        link.click();
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".jpg, .jpeg" />
        {imagePreview ? (
            <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" />
        ) : (
             <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag JPG/JPEG file to upload</p>
            </div>
        )}
      </div>
      
      <Button onClick={handleConvert} disabled={!jpgFile} className="w-full">
        <Download className="mr-2 h-4 w-4" /> Convert to PNG & Download
      </Button>
    </div>
  );
}
