
'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Crop, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps: React.DependencyList,
) {
  React.useEffect(() => {
    const t = setTimeout(() => {
      fn();
    }, waitTime);

    return () => {
      clearTimeout(t);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}


export function ImageCropper() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<CropType>();
    const [completedCrop, setCompletedCrop] = useState<CropType | null>(null);
    const [aspect, setAspect] = useState<number | undefined>(1);
    const [isLoading, setIsLoading] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Reset crop on new image
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setImageSrc(reader.result?.toString() || ''),
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const newCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, aspect || 1, width, height),
            width,
            height,
        );
        setCrop(newCrop);
    }
    
     React.useEffect(() => {
        if (imgRef.current) {
            const { width, height } = imgRef.current;
            // Force a re-render of the crop selection on aspect change by resetting it.
            // This is a workaround for a potential bug in react-image-crop where the
            // aspect ratio doesn't visually update correctly on its own.
            setCrop(undefined); 
            const newCrop = centerCrop(
                makeAspectCrop({ unit: '%', width: 90 }, aspect || 1, width, height),
                width,
                height
            );
            setCrop(newCrop);
        }
    }, [aspect]);

     useDebounceEffect(
        async () => {
        if (
            completedCrop?.width &&
            completedCrop?.height &&
            imgRef.current &&
            previewCanvasRef.current
        ) {
            await canvasPreview(
                imgRef.current,
                previewCanvasRef.current,
                completedCrop,
            );
        }
        },
        100,
        [completedCrop],
    );

    const canvasPreview = async (
        image: HTMLImageElement,
        canvas: HTMLCanvasElement,
        crop: CropType,
    ) => {
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const pixelRatio = window.devicePixelRatio;

        canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
        canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = 'high';

        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;
        const cropWidth = crop.width * scaleX;
        const cropHeight = crop.height * scaleY;

        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight,
        );
    }
    
    const handleDownload = () => {
        const canvas = previewCanvasRef.current;
        if (!completedCrop || !canvas) {
            toast({ title: 'Crop is not complete.', variant: 'destructive'});
            return;
        }
        
        canvas.toBlob((blob) => {
            if (!blob) {
                toast({ title: 'Failed to create blob.', variant: 'destructive'});
                return;
            }
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'cropped-image.png';
            link.click();
            URL.revokeObjectURL(link.href);
        }, 'image/png', 1);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
                <div 
                    className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-background"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {imageSrc ? (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            minHeight={50}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img ref={imgRef} alt="Crop preview" src={imageSrc} style={{ maxHeight: '70vh' }} onLoad={onImageLoad} />
                        </ReactCrop>
                    ) : (
                        <div className="flex flex-col items-center">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
                        </div>
                    )}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                    <Select value={aspect ? String(aspect) : 'free'} onValueChange={v => setAspect(v === 'free' ? undefined : Number(v))}>
                        <SelectTrigger id="aspect-ratio">
                            <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Common Ratios</SelectLabel>
                                <SelectItem value="free">Freeform</SelectItem>
                                <SelectItem value="1">1:1 (Square)</SelectItem>
                                <SelectItem value={String(4/3)}>4:3 (Landscape)</SelectItem>
                                <SelectItem value={String(3/2)}>3:2 (Photography)</SelectItem>
                                <SelectItem value={String(16/9)}>16:9 (Widescreen)</SelectItem>
                                <SelectItem value={String(3/4)}>3:4 (Portrait)</SelectItem>
                                <SelectItem value={String(2/3)}>2:3 (Portrait)</SelectItem>
                                <SelectItem value={String(5/4)}>5:4 (Large Format)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>Social Media</SelectLabel>
                                <SelectItem value={String(1.91/1)}>Facebook/X Post</SelectItem>
                                <SelectItem value={String(4/5)}>Instagram Portrait</SelectItem>
                                <SelectItem value={String(9/16)}>Stories/Reels</SelectItem>
                                <SelectItem value={String(851/315)}>Facebook Cover</SelectItem>
                                <SelectItem value={String(3/1)}>Twitter Header</SelectItem>
                                <SelectItem value={String(4/1)}>LinkedIn Banner</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>Print</SelectLabel>
                                <SelectItem value={String(210/297)}>A4 Portrait</SelectItem>
                                <SelectItem value={String(297/210)}>A4 Landscape</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                 </div>
            </div>
            
            <div className="space-y-4">
                 <Label>Cropped Preview</Label>
                 <Card>
                    <CardContent className="p-4">
                        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            <canvas ref={previewCanvasRef} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                        </div>
                    </CardContent>
                 </Card>
                 <Button onClick={handleDownload} disabled={!completedCrop} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download Cropped Image
                </Button>
            </div>
        </div>
    );
}
