
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Loader2, Circle, Heart, Star as StarIcon, Hexagon, Triangle, VenetianMask } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

const shapes = [
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'heart', name: 'Heart', icon: Heart },
    { id: 'star', name: 'Star', icon: StarIcon },
    { id: 'hexagon', name: 'Hexagon', icon: Hexagon },
    { id: 'triangle', name: 'Triangle', icon: Triangle },
    { id: 'oval', name: 'Oval', icon: VenetianMask }, // Using a placeholder icon
    { id: 'rhombus', name: 'Rhombus', icon: Hexagon }, // Using a placeholder icon
];

export function ImageShapeConverter() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedShape, setSelectedShape] = useState('circle');
    const [convertedImage, setConvertedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setConvertedImage(null);
        } else if (file) {
            toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
        }
    };
    
    const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: string, width: number, height: number) => {
      ctx.beginPath();
      switch (shape) {
        case 'circle':
          ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
          break;
        case 'oval':
          ctx.ellipse(width / 2, height / 2, width / 2, height / 3, 0, 0, Math.PI * 2);
          break;
        case 'heart':
          const d = Math.min(width, height);
          const k = d/1.5;
          ctx.moveTo(k, k / 4);
          ctx.bezierCurveTo(k, k / 8, k / 2, 0, k / 4, k / 4);
          ctx.bezierCurveTo(0, k / 2, 0, 0.875 * k, 0, 0.875 * k);
          ctx.bezierCurveTo(0, 1.25 * k, k / 4, 1.4375 * k, k, 1.875 * k);
          ctx.bezierCurveTo(1.75 * k, 1.4375 * k, 2 * k, 1.25 * k, 2 * k, 0.875 * k);
          ctx.bezierCurveTo(2 * k, 0.875 * k, 2 * k, k / 2, 1.75 * k, k / 4);
          ctx.bezierCurveTo(1.5 * k, 0, k, k / 8, k, k / 4);
          break;
        case 'star':
          const spikes = 5;
          let rot = Math.PI / 2 * 3;
          let x = width/2;
          let y = height/2;
          const step = Math.PI / spikes;
          const outerRadius = width / 2;
          const innerRadius = width / 4;
          
          ctx.moveTo(x, y - outerRadius)
          for (let i = 0; i < spikes; i++) {
              x = width/2 + Math.cos(rot) * outerRadius;
              y = height/2 + Math.sin(rot) * outerRadius;
              ctx.lineTo(x, y)
              rot += step

              x = width/2 + Math.cos(rot) * innerRadius;
              y = height/2 + Math.sin(rot) * innerRadius;
              ctx.lineTo(x, y)
              rot += step
          }
          ctx.lineTo(width/2, height/2 - outerRadius);
          break;
        case 'hexagon':
          for (let i = 0; i <= 6; i++) {
            const angle = (i * 60) * Math.PI / 180;
            const x_ = width / 2 + (width / 2) * Math.cos(angle);
            const y_ = height / 2 + (height / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x_, y_); else ctx.lineTo(x_, y_);
          }
          break;
        case 'triangle':
           ctx.moveTo(width / 2, 0);
           ctx.lineTo(width, height);
           ctx.lineTo(0, height);
           break;
        case 'rhombus':
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width, height / 2);
            ctx.lineTo(width / 2, height);
            ctx.lineTo(0, height / 2);
            break;
      }
      ctx.closePath();
    }, []);

    useEffect(() => {
        if (!imagePreview) return;
        setIsLoading(true);

        const img = document.createElement('img');
        img.src = imagePreview;
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) { setIsLoading(false); return; }
            
            const size = Math.min(img.width, img.height);
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) { setIsLoading(false); return; }
            
            ctx.clearRect(0, 0, size, size);
            
            drawShape(ctx, selectedShape, size, size);
            ctx.clip();
            
            const ratio = Math.max(size / img.width, size / img.height);
            const x = (size - img.width * ratio) / 2;
            const y = (size - img.height * ratio) / 2;
            ctx.drawImage(img, x, y, img.width * ratio, img.height * ratio);
            
            setConvertedImage(canvas.toDataURL('image/png'));
            setIsLoading(false);
        };
         img.onerror = () => setIsLoading(false);
    }, [imagePreview, selectedShape, drawShape]);

    const handleDownload = () => {
        if (!convertedImage || !imageFile) return;
        const link = document.createElement('a');
        link.href = convertedImage;
        const shapeName = selectedShape.charAt(0).toUpperCase() + selectedShape.slice(1);
        link.download = `${shapeName}-${imageFile.name.split('.')[0]}.png`;
        link.click();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div 
                    className="w-full aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Original preview" layout="fill" objectFit="contain" className="p-2"/>
                    ) : (
                        <div className="flex flex-col items-center">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
                        </div>
                    )}
                </div>
                
                 <div className="space-y-2">
                    <Label>Select a Shape</Label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {shapes.map(shape => {
                            const Icon = shape.icon;
                            return (
                                <Button key={shape.id} variant={selectedShape === shape.id ? 'default' : 'outline'} onClick={() => setSelectedShape(shape.id)} className="flex flex-col h-16 gap-1">
                                    <Icon className="h-6 w-6"/>
                                    <span className="text-xs">{shape.name}</span>
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                 <div className="w-full aspect-square border rounded-lg flex items-center justify-center p-4">
                     <canvas ref={canvasRef} className="hidden" />
                     {isLoading && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
                     {!isLoading && convertedImage && (
                        <Image src={convertedImage} alt="Converted shape" width={512} height={512} className="max-w-full max-h-full object-contain" />
                     )}
                     {!isLoading && !convertedImage && (
                         <p className="text-muted-foreground text-center">Your converted image will appear here.</p>
                     )}
                 </div>
                 <Button onClick={handleDownload} disabled={!convertedImage || isLoading} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download Shaped Image
                </Button>
            </div>
        </div>
    );
}
