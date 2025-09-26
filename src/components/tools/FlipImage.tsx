
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, FlipHorizontal, FlipVertical, RotateCcw, Trash2, Loader2, Image as ImageIcon, RotateCw, CornerDownLeft, CornerDownRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';

export function FlipImage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [flipState, setFlipState] = useState({ horizontal: false, vertical: false });
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const applyTransformations = () => {
      if (!imageRef.current) return;
      setIsLoading(true);

      const img = imageRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsLoading(false);
        toast({ title: "Error", description: "Could not create canvas context.", variant: "destructive" });
        return;
      }
      
      const rad = rotation * Math.PI / 180;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      
      // Adjust canvas size for rotation
      if (rotation === 90 || rotation === 270) {
          canvas.width = h;
          canvas.height = w;
      } else {
          canvas.width = w;
          canvas.height = h;
      }
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);

      const scaleH = flipState.horizontal ? -1 : 1;
      const scaleV = flipState.vertical ? -1 : 1;
      ctx.scale(scaleH, scaleV);
      
      ctx.drawImage(img, -w / 2, -h / 2);
      
      setTransformedImage(canvas.toDataURL());
      setIsLoading(false);
    };

    if (imagePreview && imageRef.current) {
        applyTransformations();
    }
  }, [imagePreview, flipState, rotation, toast]);


   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          imageRef.current = img;
          setImagePreview(img.src);
        };
        img.onerror = () => {
            toast({
                title: 'Image Load Error',
                description: 'There was a problem loading the image. Please try a different file.',
                variant: 'destructive',
            });
        };
      };
      reader.readAsDataURL(file);
      setFlipState({ horizontal: false, vertical: false });
      setRotation(0);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (!imageFile) return;
    setFlipState(prev => ({ ...prev, [direction]: !prev[direction] }));
  };
  
  const handleRotate = (deg: number) => {
    if (!imageFile) return;
    setRotation(prev => (prev + deg + 360) % 360);
  };
  
  const handleDiagonalFlip = (type: 'main' | 'anti') => {
      if (!imageFile) return;
      if (type === 'main') { // Top-left to bottom-right
          setRotation(prev => (prev + 90) % 360);
          setFlipState(prev => ({...prev, horizontal: !prev.horizontal}));
      } else { // Top-right to bottom-left
          setRotation(prev => (prev + 90) % 360);
          setFlipState(prev => ({...prev, vertical: !prev.vertical}));
      }
  }


  const handleDownload = () => {
      if (!transformedImage || !imageFile) return;
      const link = document.createElement('a');
      link.href = transformedImage;
      link.download = `transformed-${imageFile.name}`;
      link.click();
  }
  
  const handleClear = () => {
      setImageFile(null);
      setImagePreview(null);
      setTransformedImage(null);
      imageRef.current = null;
      setFlipState({ horizontal: false, vertical: false });
      setRotation(0);
      if(fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Original Image</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Transformed Image</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full aspect-video border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    ) : transformedImage && imageFile ? (
                        <Image src={transformedImage} alt="Transformed Preview" width={500} height={500} className="w-full h-full object-contain p-2"/>
                    ) : (
                         <div className="flex flex-col items-center p-4 text-center">
                            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Your transformed image will appear here.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
      <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" onClick={() => handleFlip('horizontal')} disabled={!imageFile}>
                  <FlipHorizontal className="mr-2 h-4 w-4" /> Horizontal Flip
                </Button>
                <Button variant="outline" onClick={() => handleFlip('vertical')} disabled={!imageFile}>
                  <FlipVertical className="mr-2 h-4 w-4" /> Vertical Flip
                </Button>
                <Button variant="outline" onClick={() => handleRotate(-90)} disabled={!imageFile}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Rotate Left
                </Button>
                <Button variant="outline" onClick={() => handleRotate(90)} disabled={!imageFile}>
                  <RotateCw className="mr-2 h-4 w-4" /> Rotate Right
                </Button>
                <Button variant="outline" onClick={() => handleDiagonalFlip('main')} disabled={!imageFile} className="md:col-span-2">
                  <CornerDownRight className="mr-2 h-4 w-4" />Diagonal Flip (Main)
                </Button>
                <Button variant="outline" onClick={() => handleDiagonalFlip('anti')} disabled={!imageFile} className="md:col-span-2">
                  <CornerDownLeft className="mr-2 h-4 w-4" />Diagonal Flip (Anti)
                </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleDownload} disabled={!transformedImage || isLoading} className="w-full">
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
