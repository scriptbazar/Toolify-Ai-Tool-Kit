
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Image as ImageIcon, Type, Fingerprint, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '../ui/slider';

export function ImageWatermarkAdder() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('ToolifyAI');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [size, setSize] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const watermarkImageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else if (file) {
        toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };
  
  const handleWatermarkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setWatermarkImage(e.target.files[0]);
    }
  };

  const handleApplyWatermark = async () => {
    if (!imageFile) {
      toast({ title: 'Please upload an image file.', variant: 'destructive' });
      return;
    }
    if (watermarkType === 'text' && !watermarkText) {
      toast({ title: 'Please enter watermark text.', variant: 'destructive' });
      return;
    }
    if (watermarkType === 'image' && !watermarkImage) {
      toast({ title: 'Please upload a watermark image.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");
        
        const mainImage = new Image();
        mainImage.src = URL.createObjectURL(imageFile);
        
        mainImage.onload = async () => {
            canvas.width = mainImage.width;
            canvas.height = mainImage.height;
            ctx.drawImage(mainImage, 0, 0);

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);

            if (watermarkType === 'text') {
                const fontSize = Math.min(canvas.width, canvas.height) * (size / 500);
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#000';
                ctx.fillText(watermarkText, 0, 0);
            } else if (watermarkImage) {
                const wmImage = new Image();
                wmImage.src = URL.createObjectURL(watermarkImage);
                wmImage.onload = () => {
                    const wmWidth = canvas.width * (size / 100);
                    const wmHeight = (wmImage.height / wmImage.width) * wmWidth;
                    ctx.drawImage(wmImage, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
                    downloadCanvas(canvas);
                }
            }
            ctx.restore();
            
            if (watermarkType === 'text') {
                downloadCanvas(canvas);
            }
        }
    } catch (error: any) {
      toast({ title: 'Error applying watermark', description: error.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const downloadCanvas = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `watermarked-${imageFile?.name || 'image'}.png`;
    link.click();
    setIsLoading(false);
    toast({ title: 'Watermark applied!', description: 'Your watermarked image has been downloaded.' });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div 
                className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
                onClick={() => imageInputRef.current?.click()}
            >
                <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                <div className="flex flex-col items-center">
                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{imageFile ? `Selected: ${imageFile.name}` : 'Click or drag image to upload'}</p>
                </div>
            </div>
             <Button onClick={handleApplyWatermark} disabled={isLoading || !imageFile} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
                Apply Watermark & Download
            </Button>
        </div>
        <Card>
            <CardContent className="p-6 space-y-6">
            <RadioGroup value={watermarkType} onValueChange={(val) => setWatermarkType(val as any)} className="grid grid-cols-2 gap-4">
                <Label htmlFor="type-text" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center justify-center gap-2"><RadioGroupItem value="text" id="type-text" /><Type/>Text</Label>
                <Label htmlFor="type-image" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center justify-center gap-2"><RadioGroupItem value="image" id="type-image" /><ImageIcon/>Image</Label>
            </RadioGroup>
            
            {watermarkType === 'text' ? (
                <div className="space-y-2">
                <Label htmlFor="watermark-text">Watermark Text</Label>
                <Input id="watermark-text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label>Watermark Image</Label>
                    <Button variant="outline" className="w-full" onClick={() => watermarkImageInputRef.current?.click()}>
                    {watermarkImage ? `Selected: ${watermarkImage.name}` : 'Select Image'}
                    </Button>
                    <input type="file" ref={watermarkImageInputRef} onChange={handleWatermarkImageChange} className="hidden" accept="image/png, image/jpeg" />
                </div>
            )}
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                    <Slider value={[opacity]} onValueChange={([val]) => setOpacity(val)} min={0} max={1} step={0.05} />
                </div>
                <div className="space-y-2">
                    <Label>Size: {size}%</Label>
                    <Slider value={[size]} onValueChange={([val]) => setSize(val)} min={10} max={200} step={5} />
                </div>
                <div className="space-y-2">
                    <Label>Rotation: {rotation}°</Label>
                    <Slider value={[rotation]} onValueChange={([val]) => setRotation(val)} min={-180} max={180} step={5} />
                </div>
            </div>
            </CardContent>
        </Card>
    </div>
  );
}
