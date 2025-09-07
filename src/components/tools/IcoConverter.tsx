
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function IcoConverter() {
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
      toast({ title: "Invalid File", description: "Please upload a valid image file (PNG, JPG).", variant: "destructive" });
    }
  };

  const handleConvert = () => {
    if (!imagePreview) return;
    
    // For a real ICO converter, you'd need a library to handle multiple sizes and the ICO format structure.
    // This is a simplified version that creates a downloadable image.
    const img = document.createElement('img');
    img.src = imagePreview;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32; // Standard favicon size
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 32, 32);

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/x-icon');
        link.download = `${imageFile?.name.split('.')[0]}.ico`;
        link.click();
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-square max-w-xs mx-auto border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        {imagePreview ? (
            <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="p-4" />
        ) : (
             <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload image</p>
              <p className="text-xs text-muted-foreground">(Preferably square)</p>
            </div>
        )}
      </div>
      
      <Button onClick={handleConvert} disabled={!imageFile} className="w-full max-w-xs mx-auto">
        <Download className="mr-2 h-4 w-4" /> Convert & Download .ICO
      </Button>
    </div>
  );
}
