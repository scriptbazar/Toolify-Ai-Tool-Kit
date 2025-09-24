
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UploadCloud, Palette, Copy, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ColorInfo {
  hex: string;
  rgb: string;
}

// Function to convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

export function ImageColorExtractor() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [palette, setPalette] = useState<ColorInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setPalette([]); // Clear previous palette
        } else if (file) {
            toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
        }
    };
    
    const extractColors = useCallback(() => {
        if (!imagePreview) return;
        setIsLoading(true);

        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = imagePreview;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setIsLoading(false);
                return;
            }
            ctx.drawImage(img, 0, 0);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                const colorCount: { [key: string]: number } = {};
                
                // Sample pixels to improve performance
                const sampleRate = Math.max(1, Math.floor(imageData.length / 4 / 20000));

                for (let i = 0; i < imageData.length; i += 4 * sampleRate) {
                    const rgb = `${imageData[i]},${imageData[i + 1]},${imageData[i + 2]}`;
                    colorCount[rgb] = (colorCount[rgb] || 0) + 1;
                }

                const sortedColors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);
                const dominantColors = sortedColors.slice(0, 10).map(([rgbStr]) => {
                    const [r, g, b] = rgbStr.split(',').map(Number);
                    return {
                        hex: rgbToHex(r, g, b),
                        rgb: `rgb(${r}, ${g}, ${b})`,
                    };
                });

                setPalette(dominantColors);
            } catch (error) {
                console.error("Color extraction failed:", error);
                toast({ title: 'Error', description: 'Could not process the image. The image might be from a restricted source (CORS policy).', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };
        img.onerror = () => {
             toast({ title: 'Image Error', description: 'Could not load the image.', variant: 'destructive' });
             setIsLoading(false);
        }
    }, [imagePreview, toast]);

    const handleCopy = (color: string, type: 'HEX' | 'RGB') => {
        navigator.clipboard.writeText(color);
        toast({ description: `${type} color copied: ${color}` });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Your Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div 
                            className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="p-2"/>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Button onClick={extractColors} disabled={!imageFile || isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Palette className="mr-2 h-4 w-4" />}
                    Extract Colors
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Dominant Color Palette</CardTitle>
                    <CardDescription>The most prominent colors found in your image.</CardDescription>
                </CardHeader>
                <CardContent>
                    {palette.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {palette.map((color, index) => (
                                <div key={index} className="p-3 border rounded-lg">
                                    <div style={{ backgroundColor: color.hex }} className="w-full h-16 rounded-md mb-2 border"/>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">HEX:</span>
                                            <div className="flex items-center gap-1 font-mono">
                                                {color.hex} <Copy className="h-3 w-3 cursor-pointer" onClick={() => handleCopy(color.hex, 'HEX')} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">RGB:</span>
                                            <div className="flex items-center gap-1 font-mono">
                                                {color.rgb} <Copy className="h-3 w-3 cursor-pointer" onClick={() => handleCopy(color.rgb, 'RGB')} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="min-h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <ImageIcon className="h-10 w-10 mb-4" />
                            <p>Your extracted color palette will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
