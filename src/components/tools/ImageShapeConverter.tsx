
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Loader2, Circle, Heart, Star as StarIcon, Hexagon, Triangle, VenetianMask, Cross, Frame, Badge, MessageSquare, Octagon, Bot, Diamond } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

const shapes = [
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'oval', name: 'Oval', icon: VenetianMask },
    { id: 'heart', name: 'Heart', icon: Heart },
    { id: 'star', name: 'Star', icon: StarIcon },
    { id: 'hexagon', name: 'Hexagon', icon: Hexagon },
    { id: 'octagon', name: 'Octagon', icon: Octagon },
    { id: 'triangle', name: 'Triangle', icon: Triangle },
    { id: 'rhombus', name: 'Rhombus', icon: Diamond },
    { id: 'cross', name: 'Cross', icon: Cross },
    { id: 'frame', name: 'Frame', icon: Frame },
    { id: 'badge', name: 'Badge', icon: Badge },
    { id: 'message', name: 'Message', icon: MessageSquare },
    { id: 'bot', name: 'Bot Head', icon: Bot },
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
    
    const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: string, w: number, h: number) => {
      ctx.beginPath();
      switch (shape) {
        case 'circle':
          ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
          break;
        case 'oval':
          ctx.ellipse(w / 2, h / 2, w / 2, h / 2.5, 0, 0, Math.PI * 2);
          break;
        case 'heart':
            const dHeart = Math.min(w, h);
            ctx.moveTo(dHeart / 2, dHeart / 4);
            ctx.quadraticCurveTo(dHeart, 0, dHeart, dHeart / 4);
            ctx.quadraticCurveTo(dHeart, dHeart / 2, dHeart / 2, dHeart * 0.75);
            ctx.quadraticCurveTo(0, dHeart / 2, 0, dHeart / 4);
            ctx.quadraticCurveTo(0, 0, dHeart / 2, dHeart / 4);
            break;
        case 'star':
            const spikes = 5; let rot = Math.PI / 2 * 3; let x = w / 2; let y = h / 2;
            const step = Math.PI / spikes; const outerRadius = w / 2; const innerRadius = w / 4;
            ctx.moveTo(x, y - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = w/2 + Math.cos(rot) * outerRadius; y = h/2 + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y); rot += step;
                x = w/2 + Math.cos(rot) * innerRadius; y = h/2 + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y); rot += step;
            }
            ctx.lineTo(w/2, h/2 - outerRadius);
            break;
        case 'hexagon':
            for (let i = 0; i < 6; i++) { ctx.lineTo(w/2 + w/2 * Math.cos(Math.PI / 3 * i), h/2 + h/2 * Math.sin(Math.PI / 3 * i));}
            break;
        case 'octagon':
            for (let i = 0; i < 8; i++) { ctx.lineTo(w/2 + w/2 * Math.cos(Math.PI / 4 * i), h/2 + h/2 * Math.sin(Math.PI / 4 * i));}
            break;
        case 'triangle':
           ctx.moveTo(w / 2, 0); ctx.lineTo(w, h); ctx.lineTo(0, h);
           break;
        case 'rhombus':
            ctx.moveTo(w / 2, 0); ctx.lineTo(w, h / 2); ctx.lineTo(w / 2, h); ctx.lineTo(0, h / 2);
            break;
        case 'cross':
            ctx.moveTo(w * 0.3, 0); ctx.lineTo(w * 0.7, 0); ctx.lineTo(w * 0.7, h * 0.3); ctx.lineTo(w, h * 0.3);
            ctx.lineTo(w, h * 0.7); ctx.lineTo(w * 0.7, h * 0.7); ctx.lineTo(w * 0.7, h); ctx.lineTo(w * 0.3, h);
            ctx.lineTo(w * 0.3, h * 0.7); ctx.lineTo(0, h * 0.7); ctx.lineTo(0, h * 0.3); ctx.lineTo(w * 0.3, h * 0.3);
            break;
        case 'frame':
            ctx.rect(0, 0, w, h);
            ctx.rect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
            break;
        case 'badge':
            ctx.moveTo(0, h * 0.25); ctx.lineTo(w * 0.5, 0); ctx.lineTo(w, h * 0.25);
            ctx.lineTo(w, h * 0.75); ctx.quadraticCurveTo(w / 2, h, 0, h * 0.75);
            break;
        case 'message':
            ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.8);
            ctx.lineTo(w * 0.6, h * 0.8); ctx.lineTo(w * 0.5, h); ctx.lineTo(w * 0.4, h * 0.8);
            ctx.lineTo(0, h * 0.8);
            break;
        case 'bot':
            ctx.arc(w/2, h/2, w/2, Math.PI, 0); // half circle
            ctx.lineTo(w, h); ctx.lineTo(0, h); // bottom part
            break;
      }
      ctx.closePath();
    }, []);

    useEffect(() => {
        if (!imagePreview) return;
        setIsLoading(true);

        const img = document.createElement('img');
        img.src = imagePreview;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) { setIsLoading(false); return; }
            
            const size = Math.min(img.width, img.height, 512);
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
         img.onerror = () => {
            setIsLoading(false);
            toast({ title: "Error", description: "Could not load the source image. It might be protected.", variant: 'destructive'});
         }
    }, [imagePreview, selectedShape, drawShape, toast]);

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
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
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
                     {!isLoading && convertedImage ? (
                        <Image src={convertedImage} alt="Converted shape" width={512} height={512} className="max-w-full max-h-full object-contain" />
                     ) : (
                         !isLoading && <p className="text-muted-foreground text-center">Your converted image will appear here.</p>
                     )}
                 </div>
                 <Button onClick={handleDownload} disabled={!convertedImage || isLoading} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download Shaped Image
                </Button>
            </div>
        </div>
    );
}
