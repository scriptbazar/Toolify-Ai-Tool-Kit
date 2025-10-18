
'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Palette, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function ImageGrayscaleConverter() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setConvertedImage(null);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleConvert = () => {
    if (!imagePreview) return;
    setIsLoading(true);

    const img = new window.Image();
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsLoading(false);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
      }
      ctx.putImageData(imageData, 0, 0);
      setConvertedImage(canvas.toDataURL('image/png'));
      setIsLoading(false);
    };
    img.onerror = () => {
        setIsLoading(false);
        toast({ title: 'Error', description: 'Could not load the image.', variant: 'destructive'});
    }
  };

  const handleDownload = () => {
    if (!convertedImage || !imageFile) return;
    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = `grayscale-${imageFile.name.split('.')[0]}.png`;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
            <Label>Original Image</Label>
            <div 
                className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
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
            <Button onClick={handleConvert} disabled={!imageFile || isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Palette className="mr-2 h-4 w-4" />}
                Convert to Grayscale
            </Button>
        </div>
        <div className="space-y-4">
             <Label>Grayscale Image</Label>
             <div className="w-full aspect-video border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {convertedImage ? (
                    <Image src={convertedImage} alt="Converted Preview" width={500} height={300} className="w-full h-auto object-contain p-2"/>
                ) : (
                    <p className="text-sm text-muted-foreground">Preview will appear here</p>
                )}
             </div>
             <Button onClick={handleDownload} disabled={!convertedImage} className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download Grayscale Image
            </Button>
        </div>
    </div>
  );
}

    