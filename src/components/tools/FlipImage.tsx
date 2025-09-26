
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Download, FlipHorizontal, FlipVertical, RotateCcw, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';

export function FlipImage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [flippedImage, setFlippedImage] = useState<string | null>(null);
  const [flipState, setFlipState] = useState({ horizontal: false, vertical: false });
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFlippedImage(null);
      setFlipState({ horizontal: false, vertical: false });
      setRotation(0);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const applyTransformations = useCallback(() => {
    if (!imagePreview) return;
    setIsLoading(true);

    const img = document.createElement('img');
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsLoading(false);
        return;
      }

      const rad = rotation * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      canvas.width = Math.abs(img.width * cos) + Math.abs(img.height * sin);
      canvas.height = Math.abs(img.width * sin) + Math.abs(img.height * cos);
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      
      const scaleH = flipState.horizontal ? -1 : 1;
      const scaleV = flipState.vertical ? -1 : 1;
      ctx.scale(scaleH, scaleV);
      
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      setFlippedImage(canvas.toDataURL());
      setIsLoading(false);
    };
    img.onerror = () => {
        setIsLoading(false);
        toast({ title: 'Error loading image for transformation.', variant: 'destructive'});
    }

  }, [imagePreview, flipState, rotation]);
  
  useEffect(() => {
    applyTransformations();
  }, [applyTransformations]);


  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    setFlipState(prev => ({ ...prev, [direction]: !prev[direction] }));
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  }

  const handleDownload = () => {
      if (!flippedImage || !imageFile) return;
      const link = document.createElement('a');
      link.href = flippedImage;
      link.download = `transformed-${imageFile.name}`;
      link.click();
  }
  
  const handleClear = () => {
      setImageFile(null);
      setImagePreview(null);
      setFlippedImage(null);
      setFlipState({ horizontal: false, vertical: false });
      setRotation(0);
      if(fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Original Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                 <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => handleFlip('horizontal')} disabled={!imageFile}>
                        <FlipHorizontal className="mr-2 h-4 w-4" /> Flip Horizontal
                    </Button>
                    <Button variant="outline" onClick={() => handleFlip('vertical')} disabled={!imageFile}>
                        <FlipVertical className="mr-2 h-4 w-4" /> Flip Vertical
                    </Button>
                     <Button variant="outline" onClick={handleRotate} disabled={!imageFile}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Rotate 90°
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Flipped Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="w-full aspect-video border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    ) : flippedImage ? (
                        <Image src={flippedImage} alt="Flipped Preview" layout="fill" objectFit="contain" className="p-2"/>
                    ) : (
                         <div className="flex flex-col items-center p-4 text-center">
                            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Your transformed image will appear here.</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleDownload} disabled={!flippedImage || isLoading} className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Download Image
                    </Button>
                     <Button onClick={handleClear} variant="destructive" className="w-full" disabled={!imageFile}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
