
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif';

export function UniversalFileConverter() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
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
        link.href = canvas.toDataURL(`image/${targetFormat}`);
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

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="target-format">Convert To:</Label>
                <Select value={targetFormat} onValueChange={(val) => setTargetFormat(val as ImageFormat)}>
                    <SelectTrigger id="target-format">
                        <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="webp">WEBP</SelectItem>
                        <SelectItem value="gif">GIF</SelectItem>
                    </SelectContent>
                </Select>
            </div>
       </div>
      
      <Button onClick={handleConvert} disabled={!imageFile} className="w-full">
        <Download className="mr-2 h-4 w-4" /> Convert & Download
      </Button>
    </div>
  );
}
