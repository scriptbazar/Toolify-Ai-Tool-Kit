
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, FlipHorizontal, FlipVertical, RotateCcw, Trash2, Loader2, Image as ImageIcon, CornerUpLeft, CornerUpRight, RotateCw, CornerDownLeft, CornerDownRight, ListOrdered } from 'lucide-react';
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

      const w = img.width;
      const h = img.height;
      
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
      
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      
      setFlippedImage(canvas.toDataURL());
      setIsLoading(false);
    };
    img.onerror = () => {
        setIsLoading(false);
        toast({ title: 'Error loading image for transformation.', variant: 'destructive'});
    }

  }, [imagePreview, flipState, rotation, toast]);
  
  useEffect(() => {
    if(imagePreview) {
      applyTransformations();
    }
  }, [applyTransformations, imagePreview, flipState, rotation]);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFlippedImage(null);
      setFlipState({ horizontal: false, vertical: false });
      setRotation(0);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    setFlipState(prev => ({ ...prev, [direction]: !prev[direction] }));
  };
  
  const handleRotate = (deg: number) => {
    setRotation(prev => (prev + deg + 360) % 360);
  };
  
  const handleDiagonalFlip = (type: 'main' | 'anti') => {
      if (type === 'main') { // Top-left to bottom-right
          setRotation(prev => (prev + 90) % 360);
          setFlipState(prev => ({...prev, horizontal: !prev.horizontal}));
      } else { // Top-right to bottom-left
          setRotation(prev => (prev + 90) % 360);
          setFlipState(prev => ({...prev, vertical: !prev.vertical}));
      }
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
    <div className="space-y-8">
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
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" onClick={() => handleFlip('horizontal')} disabled={!imageFile}><FlipHorizontal className="mr-2 h-4 w-4" /> Horizontal</Button>
                    <Button variant="outline" onClick={() => handleFlip('vertical')} disabled={!imageFile}><FlipVertical className="mr-2 h-4 w-4" /> Vertical</Button>
                    <Button variant="outline" onClick={() => handleRotate(-90)} disabled={!imageFile}><RotateCcw className="mr-2 h-4 w-4" /> Rotate Left</Button>
                    <Button variant="outline" onClick={() => handleRotate(90)} disabled={!imageFile}><RotateCw className="mr-2 h-4 w-4" /> Rotate Right</Button>
                    <Button variant="outline" onClick={() => handleDiagonalFlip('main')} disabled={!imageFile} className="md:col-span-2"><CornerDownRight className="mr-2 h-4 w-4" />Diagonal Flip (Main)</Button>
                    <Button variant="outline" onClick={() => handleDiagonalFlip('anti')} disabled={!imageFile} className="md:col-span-2"><CornerDownLeft className="mr-2 h-4 w-4" />Diagonal Flip (Anti)</Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Transformed Image</CardTitle>
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
       <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered /> How to Use the Flip Image Tool?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">1</div>
                      <div className="flex-1">
                          <h3 className="font-semibold">Upload Image</h3>
                          <p className="text-muted-foreground">Click on the upload area to select an image from your device.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">2</div>
                      <div className="flex-1">
                          <h3 className="font-semibold">Apply Transformations</h3>
                          <p className="text-muted-foreground">Use the buttons to flip or rotate the image. You will see a live preview of the result.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">3</div>
                      <div className="flex-1">
                          <h3 className="font-semibold">Download Your Image</h3>
                          <p className="text-muted-foreground">Once you are happy with the result, click the "Download Image" button to save it.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">4</div>
                      <div className="flex-1">
                          <h3 className="font-semibold">Clear and Start Over</h3>
                          <p className="text-muted-foreground">Click the "Clear" button to remove the current image and start again.</p>
                      </div>
                  </div>
              </div>
            </CardContent>
        </Card>
    </div>
  );
}
