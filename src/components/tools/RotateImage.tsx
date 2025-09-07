
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, RotateCcw, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';

export function RotateImage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };
  
  const rotate = (deg: number) => {
      setRotation(prev => (prev + deg) % 360);
  }
  
  const handleDownload = () => {
    if (!imageSrc) return;
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const rad = rotation * Math.PI / 180;
      const newWidth = Math.abs(img.width * Math.cos(rad)) + Math.abs(img.height * Math.sin(rad));
      const newHeight = Math.abs(img.width * Math.sin(rad)) + Math.abs(img.height * Math.cos(rad));
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = `rotated-image.png`;
      link.click();
    };
  }

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        {imageSrc ? (
            <Image src={imageSrc} alt="Preview" layout="fill" objectFit="contain" style={{ transform: `rotate(${rotation}deg)` }} />
        ) : (
             <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
            </div>
        )}
      </div>
      
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => rotate(-90)} disabled={!imageSrc}>
          <RotateCcw className="mr-2 h-4 w-4" /> Rotate Left
        </Button>
        <Button variant="outline" onClick={() => rotate(90)} disabled={!imageSrc}>
          <RotateCw className="mr-2 h-4 w-4" /> Rotate Right
        </Button>
      </div>

      <Button onClick={handleDownload} disabled={!imageSrc} className="w-full">
        Download Rotated Image
      </Button>
    </div>
  );
}
