
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, RotateCcw, RotateCw, Download, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { Slider } from '../ui/slider';

export function RotateImage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const drawImageOnCanvas = useCallback(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

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
  }, [rotation]);

  useEffect(() => {
    if (imagePreview && imageRef.current) {
        drawImageOnCanvas();
    }
  }, [imagePreview, rotation, drawImageOnCanvas]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setIsLoading(true);
        setImageFile(file);
        setRotation(0);
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                imageRef.current = img;
                setImagePreview(img.src);
                setIsLoading(false);
            };
            img.onerror = () => {
                toast({ title: 'Error', description: 'Could not load the image.', variant: 'destructive'});
                setIsLoading(false);
            }
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
    const canvas = canvasRef.current;
    if (!canvas || !imageFile) return;
    
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png'); // Always download as PNG to support transparency
    link.download = `rotated-${imageFile.name.split('.')[0]}.png`;
    link.click();
  }

  const handleClear = () => {
      setImageFile(null);
      setImagePreview(null);
      setRotation(0);
      imageRef.current = null;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      if(fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
                <Label>Original Image</Label>
                 <div 
                    className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Original Preview" layout="fill" objectFit="contain" className="p-2"/>
                    ) : (
                        <div className="flex flex-col items-center">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                <Label>Transformed Image</Label>
                <div className="w-full aspect-video border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    ) : imagePreview ? (
                        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
                    ) : (
                         <p className="text-sm text-muted-foreground">Preview will appear here</p>
                    )}
                </div>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label>Rotate: {rotation}°</Label>
                    <Slider value={[rotation]} onValueChange={([val]) => setRotation(val)} min={0} max={360} step={1} disabled={!imageFile}/>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" onClick={() => rotate(-90)} disabled={!imageFile}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Rotate Left
                    </Button>
                    <Button variant="outline" onClick={() => rotate(90)} disabled={!imageFile}>
                        <RotateCw className="mr-2 h-4 w-4" /> Rotate Right
                    </Button>
                     <Button onClick={handleDownload} disabled={!imagePreview || isLoading} className="col-span-2 md:col-span-1">
                        <Download className="mr-2 h-4 w-4" /> Download Image
                    </Button>
                    <Button onClick={handleClear} variant="destructive" className="col-span-2 md:col-span-1" disabled={!imageFile}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
