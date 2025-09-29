
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Loader2, Circle, Heart, Star as StarIcon, Hexagon, Triangle, VenetianMask, Cross, Frame, Badge, MessageSquare, Octagon, Bot, Diamond, Pentagon, ArrowRight, ZoomIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';
import { Slider } from '../ui/slider';

const shapes = [
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'oval', name: 'Oval', icon: VenetianMask },
    { id: 'heart', name: 'Heart', icon: Heart },
    { id: 'star', name: 'Star', icon: StarIcon },
    { id: 'hexagon', name: 'Hexagon', icon: Hexagon },
    { id: 'octagon', name: 'Octagon', icon: Octagon },
    { id: 'triangle', name: 'Triangle', icon: Triangle },
    { id: 'rhombus', name: 'Rhombus', icon: Diamond },
    { id: 'pentagon', name: 'Pentagon', icon: Pentagon },
    { id: 'cross', name: 'Cross', icon: Cross },
    { id: 'frame', name: 'Frame', icon: Frame },
    { id: 'badge', name: 'Badge', icon: Badge },
    { id: 'message', name: 'Message', icon: MessageSquare },
    { id: 'bot', name: 'Bot Head', icon: Bot },
    { id: 'arrow-right', name: 'Arrow', icon: ArrowRight },
];

export function ImageShapeConverter() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedShape, setSelectedShape] = useState('circle');
    const [convertedImage, setConvertedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [zoom, setZoom] = useState(100);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
            };
            reader.readAsDataURL(file);
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
          ctx.ellipse(w / 2, h / 2, w / 2, h * 0.4, 0, 0, Math.PI * 2);
          break;
        case 'heart':
            ctx.moveTo(w/2, h*0.35);
            ctx.bezierCurveTo(w/2, h*0.3, w*0.4, h*0.15, w/2, h*0.15);
            ctx.bezierCurveTo(w*0.1, h*0.15, 0, h*0.625, 0, h*0.625);
            ctx.bezierCurveTo(0, h*0.8, w*0.15, h*0.9, w/2, h);
            ctx.bezierCurveTo(w*0.85, h*0.9, w, h*0.8, w, h*0.625);
            ctx.bezierCurveTo(w, h*0.625, w*0.9, h*0.15, w/2, h*0.15);
            ctx.bezierCurveTo(w*0.6, h*0.15, w/2, h*0.3, w/2, h*0.35);
            break;
        case 'star':
            const spikes = 5; let rot = Math.PI / 2 * 3;
            const step = Math.PI / spikes; const outerRadius = w / 2; const innerRadius = w / 4;
            ctx.moveTo(w/2, h/2 - outerRadius);
            for (let i = 0; i < spikes; i++) {
                ctx.lineTo(w/2 + Math.cos(rot) * outerRadius, h/2 + Math.sin(rot) * outerRadius);
                rot += step;
                ctx.lineTo(w/2 + Math.cos(rot) * innerRadius, h/2 + Math.sin(rot) * innerRadius);
                rot += step;
            }
            ctx.closePath();
            break;
        case 'hexagon':
            for (let i = 0; i < 6; i++) { ctx.lineTo(w/2 + w/2 * Math.cos(Math.PI / 3 * i), h/2 + h/2 * Math.sin(Math.PI / 3 * i));}
            break;
        case 'octagon':
            for (let i = 0; i < 8; i++) { ctx.lineTo(w/2 + w/2 * Math.cos(Math.PI / 4 * i + Math.PI/8), h/2 + h/2 * Math.sin(Math.PI / 4 * i + Math.PI/8));}
            break;
        case 'pentagon':
            for (let i = 0; i < 5; i++) { ctx.lineTo(w / 2 + (w / 2) * Math.sin(2 * Math.PI * i / 5), h / 2 - (h / 2) * Math.cos(2 * Math.PI * i / 5)); }
            break;
        case 'triangle':
           ctx.moveTo(w / 2, 0); ctx.lineTo(w, h); ctx.lineTo(0, h);
           break;
        case 'rhombus':
            ctx.moveTo(w / 2, 0); ctx.lineTo(w, h / 2); ctx.lineTo(w / 2, h); ctx.lineTo(0, h / 2);
            break;
        case 'cross':
            ctx.moveTo(w * 0.3, 0); ctx.lineTo(w * 0.7, 0);
            ctx.lineTo(w * 0.7, h * 0.3); ctx.lineTo(w, h * 0.3);
            ctx.lineTo(w, h * 0.7); ctx.lineTo(w * 0.7, h * 0.7);
            ctx.lineTo(w * 0.7, h); ctx.lineTo(w * 0.3, h);
            ctx.lineTo(w * 0.3, h * 0.7); ctx.lineTo(0, h * 0.7);
            ctx.lineTo(0, h * 0.3); ctx.lineTo(w * 0.3, h * 0.3);
            break;
        case 'frame':
            ctx.rect(0, 0, w, h);
            ctx.rect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
            ctx.closePath();
            return; // Use fill with even-odd rule
        case 'badge':
            ctx.moveTo(0, h * 0.25); ctx.lineTo(w * 0.5, 0); ctx.lineTo(w, h * 0.25);
            ctx.lineTo(w, h * 0.75); ctx.quadraticCurveTo(w / 2, h, 0, h * 0.75);
            break;
        case 'message':
            ctx.moveTo(w * 0.1, 0); ctx.lineTo(w * 0.9, 0);
            ctx.quadraticCurveTo(w, 0, w, h * 0.1);
            ctx.lineTo(w, h * 0.9);
            ctx.quadraticCurveTo(w, h, w * 0.9, h);
            ctx.lineTo(w * 0.2, h);
            ctx.lineTo(0, h * 0.7);
            ctx.lineTo(w * 0.1, h);
            ctx.quadraticCurveTo(0, h, 0, h * 0.9);
            ctx.lineTo(0, h * 0.1);
            ctx.quadraticCurveTo(0, 0, w * 0.1, 0);
            break;
        case 'bot':
            ctx.arc(w/2, h/2, w/2, Math.PI, 0);
            ctx.lineTo(w, h); ctx.lineTo(0, h);
            break;
        case 'arrow-right':
            ctx.moveTo(0, h * 0.25);
            ctx.lineTo(w * 0.6, h * 0.25);
            ctx.lineTo(w * 0.6, 0);
            ctx.lineTo(w, h * 0.5);
            ctx.lineTo(w * 0.6, h);
            ctx.lineTo(w * 0.6, h * 0.75);
            ctx.lineTo(0, h * 0.75);
            break;
      }
      ctx.closePath();
    }, []);

    const processImage = useCallback(() => {
        const img = imageRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;

        setIsLoading(true);
        
        const size = Math.min(img.naturalWidth, img.naturalHeight, 512);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setIsLoading(false); return; }
        
        ctx.clearRect(0, 0, size, size);
        
        ctx.save();
        drawShape(ctx, selectedShape, size, size);

        if (selectedShape === 'frame') {
            ctx.fill('evenodd');
        }
        
        ctx.clip();
        
        const zoomFactor = zoom / 100;
        // Start with 'contain' logic and then apply zoom
        const ratio = Math.min(size / img.naturalWidth, size / img.naturalHeight) * zoomFactor;
        const imgWidth = img.naturalWidth * ratio;
        const imgHeight = img.naturalHeight * ratio;

        const x = (size - imgWidth) / 2;
        const y = (size - imgHeight) / 2;
        
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
        ctx.restore();
        
        setConvertedImage(canvas.toDataURL('image/png'));
        setIsLoading(false);
    }, [selectedShape, drawShape, zoom]);


    useEffect(() => {
        if (imagePreview && imageRef.current) {
            processImage();
        }
    }, [imagePreview, selectedShape, processImage, zoom]);

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
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
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
                 <div className="space-y-4 pt-4 border-t">
                    <Label htmlFor="zoom-slider" className="flex items-center gap-2"><ZoomIn className="h-4 w-4"/>Zoom: {zoom}%</Label>
                    <Slider id="zoom-slider" value={[zoom]} onValueChange={([val]) => setZoom(val)} min={100} max={200} step={5} disabled={!imageFile}/>
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
