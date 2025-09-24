
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, FileArchive, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import imageCompression from 'browser-image-compression';

type CompressionType = 'lossy' | 'lossless';

export function ImageCompressor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(80); // Quality as a percentage
  const [compressionType, setCompressionType] = useState<CompressionType>('lossy');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setOriginalSize(file.size);
      setCompressedSize(0);
      setImagePreview(URL.createObjectURL(file));
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleCompress = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setCompressedSize(0);

    try {
        let compressedFile: File;
        if (compressionType === 'lossy') {
            const options = {
                maxSizeMB: (imageFile.size / 1024 / 1024) * (quality / 100),
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: quality / 100,
            };
            compressedFile = await imageCompression(imageFile, options);
        } else {
            // For "lossless", we still need to process it to some extent.
            // Using a very high quality setting in the library is the closest we can get to a browser-based "lossless" feel
            // without complex server-side tooling. This will optimize metadata and encoding without visible quality loss.
            const options = {
                maxSizeMB: 20, // High limit to prevent accidental resizing
                initialQuality: 1.0,
                alwaysKeepResolution: true,
            };
             compressedFile = await imageCompression(imageFile, options);
        }
        
        setCompressedSize(compressedFile.size);
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedFile);
        link.download = `compressed-${imageFile.name}`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast({ title: 'Success!', description: 'Your compressed image has been downloaded.' });
    } catch (error) {
        console.error("Compression error:", error);
        toast({ title: "Compression Failed", description: "Could not compress the image.", variant: "destructive"});
    } finally {
        setIsLoading(false);
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
                <p className="text-xs text-muted-foreground">(JPG, PNG, WEBP, GIF)</p>
              </div>
          )}
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Compression Type</Label>
            <RadioGroup value={compressionType} onValueChange={(val) => setCompressionType(val as CompressionType)} className="grid grid-cols-2 gap-4">
              <Label htmlFor="lossless" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
                <RadioGroupItem value="lossless" id="lossless" className="sr-only"/>
                <p className="font-semibold">Lossless</p>
                <p className="text-xs text-muted-foreground">Best quality, larger size</p>
              </Label>
              <Label htmlFor="lossy" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
                <RadioGroupItem value="lossy" id="lossy" className="sr-only"/>
                 <p className="font-semibold">Lossy</p>
                <p className="text-xs text-muted-foreground">Smaller size, adjustable quality</p>
              </Label>
            </RadioGroup>
        </div>

        {compressionType === 'lossy' && (
             <div className="space-y-2">
                <Label>Quality: {quality}%</Label>
                <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={10} max={100} step={5} />
            </div>
        )}
        
        {originalSize > 0 && (
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 border rounded-md"><p className="text-sm text-muted-foreground">Original Size</p><p className="font-bold">{formatBytes(originalSize)}</p></div>
                <div className="p-2 border rounded-md"><p className="text-sm text-muted-foreground">Compressed Size</p><p className="font-bold">{isLoading ? <Loader2 className="h-4 w-4 animate-spin inline-block"/> : (compressedSize > 0 ? formatBytes(compressedSize) : '...')}</p></div>
            </div>
        )}

        <Button onClick={handleCompress} disabled={!imageFile || isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileArchive className="mr-2 h-4 w-4" />}
           Compress & Download
        </Button>
      </div>
    </div>
  );
}
