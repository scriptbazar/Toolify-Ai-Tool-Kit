
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent, useCallback, useEffect, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Image as ImageIcon, Type, Fingerprint, Loader2, Download, Move, ZoomIn, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '../ui/slider';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function ImageWatermarkAdder() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('ToolifyAI');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [size, setSize] = useState(20);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Center position in percentage
  const [isPanning, setIsPanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleWatermarkImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWatermarkImage(file);
      const reader = new FileReader();
      reader.onload = (event) => setWatermarkImagePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPanning(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !previewContainerRef.current) return;
    const containerRect = previewContainerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - lastMousePos.current.x) / containerRect.width) * 100;
    const dy = ((e.clientY - lastMousePos.current.y) / containerRect.height) * 100;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setPosition(prev => ({
        x: Math.max(0, Math.min(100, prev.x + dx)),
        y: Math.max(0, Math.min(100, prev.y + dy))
    }));
  };
  
  const handleMouseUp = () => setIsPanning(false);

  const applyAndDownload = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not create canvas context");

        const mainImage = new window.Image();
        mainImage.src = URL.createObjectURL(imageFile);
        await new Promise((resolve, reject) => { mainImage.onload = resolve; mainImage.onerror = reject; });

        canvas.width = mainImage.width;
        canvas.height = mainImage.height;
        ctx.drawImage(mainImage, 0, 0);

        ctx.save();
        ctx.globalAlpha = opacity;
        
        const posX = canvas.width * (position.x / 100);
        const posY = canvas.height * (position.y / 100);

        ctx.translate(posX, posY);
        ctx.rotate(rotation * Math.PI / 180);
        
        if (watermarkType === 'text') {
            const fontSize = Math.min(canvas.width, canvas.height) * (size / 500);
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = fontSize / 15;
            ctx.strokeText(watermarkText, 0, 0);
            ctx.fillText(watermarkText, 0, 0);
        } else if (watermarkImage) {
            const wmImage = new window.Image();
            wmImage.src = URL.createObjectURL(watermarkImage);
            await new Promise((resolve, reject) => { wmImage.onload = resolve; wmImage.onerror = reject; });

            const wmWidth = canvas.width * (size / 100);
            const wmHeight = (wmImage.height / wmImage.width) * wmWidth;
            ctx.drawImage(wmImage, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
        }
        ctx.restore();
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `watermarked-${imageFile.name}.png`;
        link.click();
        
        toast({ title: 'Image Watermarked!' });

    } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>1. Upload Your Image</CardTitle>
                </CardHeader>
                <CardContent>
                    <div 
                        className="w-full aspect-video border-2 border-dashed flex items-center justify-center cursor-pointer relative bg-muted hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        {imagePreview ? (
                            <Image src={imagePreview} alt="Upload Preview" layout="fill" objectFit="contain" className="p-2"/>
                        ) : (
                            <div className="flex flex-col items-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
                            </div>
                        )}
                    </div>
                </CardContent>
             </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>2. Watermark Type</CardTitle></CardHeader>
                <CardContent>
                    <RadioGroup value={watermarkType} onValueChange={(val) => setWatermarkType(val as any)} className="grid grid-cols-2 gap-4">
                        <Label htmlFor="type-text" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center justify-center gap-2"><RadioGroupItem value="text" id="type-text" /><Type/>Text</Label>
                        <Label htmlFor="type-image" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center justify-center gap-2"><RadioGroupItem value="image" id="type-image" /><ImageIcon/>Image</Label>
                    </RadioGroup>
                    <div className="mt-4">
                         {watermarkType === 'text' ? (
                            <div className="space-y-2">
                                <Label htmlFor="watermark-text">Watermark Text</Label>
                                <Input id="watermark-text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Watermark Image</Label>
                                <Button variant="outline" className="w-full" onClick={() => watermarkInputRef.current?.click()}>
                                {watermarkImage ? `Selected: ${watermarkImage.name}` : 'Select Image'}
                                </Button>
                                <input type="file" ref={watermarkInputRef} onChange={handleWatermarkImageChange} className="hidden" accept="image/png, image/jpeg" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle>3. Customize</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                        <Slider value={[opacity]} onValueChange={([val]) => setOpacity(val)} min={0} max={1} step={0.05} />
                    </div>
                    <div className="space-y-2">
                        <Label>Size: {size}%</Label>
                        <Slider value={[size]} onValueChange={([val]) => setSize(val)} min={5} max={150} step={5} />
                    </div>
                    <div className="space-y-2">
                        <Label>Rotation: {rotation}°</Label>
                        <Slider value={[rotation]} onValueChange={([val]) => setRotation(val)} min={-180} max={180} step={5} />
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>4. Preview & Download</CardTitle>
                    <CardDescription>Drag the watermark to position it on the image.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div 
                        ref={previewContainerRef}
                        className="w-full aspect-video border rounded-lg bg-muted flex items-center justify-center overflow-hidden relative cursor-move"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {imagePreview ? (
                            <>
                                <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" />
                                {watermarkType === 'text' && watermarkText && (
                                    <div 
                                        className="absolute select-none pointer-events-none"
                                        style={{
                                            left: `${position.x}%`,
                                            top: `${position.y}%`,
                                            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                                            opacity: opacity,
                                            fontSize: `${size / 2}px`,
                                            color: 'white',
                                            textShadow: '0 0 5px black',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {watermarkText}
                                    </div>
                                )}
                                {watermarkType === 'image' && watermarkImagePreview && (
                                     <div
                                         className="absolute select-none pointer-events-none"
                                         style={{
                                            left: `${position.x}%`,
                                            top: `${position.y}%`,
                                            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                                            opacity: opacity,
                                            width: `${size}%`,
                                        }}
                                     >
                                        <Image src={watermarkImagePreview} alt="Watermark preview" layout="responsive" width={100} height={100} objectFit="contain" />
                                     </div>
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground text-center">Upload an image to see the preview.</p>
                        )}
                    </div>
                </CardContent>
             </Card>
             <Button onClick={applyAndDownload} disabled={isLoading || !imageFile} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Watermarked Image
            </Button>
        </div>
    </div>
  );
}
