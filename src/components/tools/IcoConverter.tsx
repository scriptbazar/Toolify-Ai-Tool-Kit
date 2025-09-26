
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Download, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface IcoPreview {
    size: number;
    dataUrl: string;
}

export function IcoConverter() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [icoPreviews, setIcoPreviews] = useState<IcoPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIcoPreviews([]); // Clear previous previews
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file (PNG, JPG).", variant: "destructive" });
    }
  };

  const handleConvert = () => {
    if (!imagePreview) return;
    
    setIsLoading(true);
    const img = document.createElement('img');
    img.src = imagePreview;
    img.onload = () => {
        const sizes = [48, 32, 16];
        const previews: IcoPreview[] = sizes.map(size => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return { size, dataUrl: ''};
            ctx.drawImage(img, 0, 0, size, size);
            return { size, dataUrl: canvas.toDataURL('image/png') };
        }).filter(p => p.dataUrl);

        setIcoPreviews(previews);
        setIsLoading(false);
        toast({ title: "Preview Generated", description: "Your ICO previews are ready."});
    };
    img.onerror = () => {
        setIsLoading(false);
        toast({ title: "Error", description: "Could not load the image for conversion.", variant: "destructive"});
    }
  };
  
  const handleDownload = (size: number) => {
    const ico = icoPreviews.find(p => p.size === size);
    if (!ico || !imageFile) return;
    
    const link = document.createElement('a');
    link.href = ico.dataUrl;
    link.download = `${imageFile.name.split('.')[0]}_${size}x${size}.png`; // Downloading as PNG for compatibility
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Upload Your Image</CardTitle>
                    <CardDescription>Click on the box to upload an image. Square images work best.</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            <Button onClick={handleConvert} disabled={!imageFile || isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                Convert to ICO
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Step 2: Preview & Download</CardTitle>
                <CardDescription>This is how your icon will look at different standard sizes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg flex justify-center items-end gap-6 h-[160px]">
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    ) : icoPreviews.length > 0 ? (
                        icoPreviews.map(preview => (
                            <div key={preview.size} className="flex flex-col items-center gap-2">
                                <div className="border p-1 bg-white shadow-md">
                                    <Image src={preview.dataUrl} alt={`${preview.size}x${preview.size} preview`} width={preview.size} height={preview.size} />
                                </div>
                                <span className="text-xs text-muted-foreground">{preview.size}x{preview.size}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">Previews will appear here after conversion.</p>
                    )}
                </div>
                {icoPreviews.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button onClick={() => handleDownload(48)} variant="outline"><Download className="mr-2 h-4 w-4"/>48x48</Button>
                        <Button onClick={() => handleDownload(32)}><Download className="mr-2 h-4 w-4"/>32x32</Button>
                        <Button onClick={() => handleDownload(16)} variant="outline"><Download className="mr-2 h-4 w-4"/>16x16</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
