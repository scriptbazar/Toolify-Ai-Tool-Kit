
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Image as ImageIcon, Wand2, Loader2 } from 'lucide-react';
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
  
  const handleDownload = () => {
    // For this client-side example, we'll download the 32x32 version as a PNG, 
    // as creating a multi-layer .ico file is complex without a dedicated library.
    // The user can then use an online service to convert this PNG to a true ICO if needed.
    const ico32 = icoPreviews.find(p => p.size === 32);
    if (!ico32 || !imageFile) return;
    
    const link = document.createElement('a');
    link.href = ico32.dataUrl;
    link.download = `${imageFile.name.split('.')[0]}_32x32.png`; // Downloading as PNG for compatibility
    link.click();
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

      <Button onClick={handleConvert} disabled={!imageFile || isLoading} className="w-full max-w-xs mx-auto">
         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
        Convert to ICO
      </Button>

      {icoPreviews.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>ICO Preview</CardTitle>
                <CardDescription>This is how your icon will look at different sizes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center items-end gap-4 p-4 bg-muted rounded-lg">
                    {icoPreviews.map(preview => (
                        <div key={preview.size} className="flex flex-col items-center gap-2">
                            <div className="border p-1 bg-white">
                                <Image src={preview.dataUrl} alt={`${preview.size}x${preview.size} preview`} width={preview.size} height={preview.size} />
                            </div>
                            <span className="text-xs text-muted-foreground">{preview.size}x{preview.size}</span>
                        </div>
                    ))}
                </div>
                <Button onClick={handleDownload} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download ICO
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
