
'use client';

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UploadCloud, Palette, Copy, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface ColorInfo {
  hex: string;
  rgb: string;
}

// Function to convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

// k-means clustering algorithm for color quantization
const getDominantColors = (imageData: ImageData, k: number = 10): ColorInfo[] => {
    const pixels = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > 128) { // Consider only opaque pixels
            pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
        }
    }

    // 1. Initialize centroids randomly
    let centroids: number[][] = [];
    const pixelSample = [...pixels]; // Create a mutable copy
    for (let i = 0; i < k; i++) {
        const randomIndex = Math.floor(Math.random() * pixelSample.length);
        centroids.push(pixelSample.splice(randomIndex, 1)[0]);
    }

    let clusters: number[][][] = [];
    const MAX_ITERATIONS = 20;

    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
        // 2. Assign each pixel to the closest centroid
        clusters = Array.from({ length: k }, () => []);
        for (const pixel of pixels) {
            let minDistance = Infinity;
            let closestCentroidIndex = 0;
            for (let i = 0; i < centroids.length; i++) {
                const distance = Math.sqrt(
                    Math.pow(pixel[0] - centroids[i][0], 2) +
                    Math.pow(pixel[1] - centroids[i][1], 2) +
                    Math.pow(pixel[2] - centroids[i][2], 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroidIndex = i;
                }
            }
            clusters[closestCentroidIndex].push(pixel);
        }

        // 3. Recalculate centroids as the mean of the pixels in each cluster
        let newCentroids: number[][] = [];
        let hasConverged = true;
        for (let i = 0; i < k; i++) {
            if (clusters[i].length === 0) {
                // If a cluster is empty, re-initialize its centroid
                newCentroids[i] = pixels[Math.floor(Math.random() * pixels.length)];
                continue;
            }

            const mean = clusters[i].reduce((acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]], [0, 0, 0]);
            const newCentroid = [Math.round(mean[0] / clusters[i].length), Math.round(mean[1] / clusters[i].length), Math.round(mean[2] / clusters[i].length)];
            
            if (JSON.stringify(newCentroid) !== JSON.stringify(centroids[i])) {
                hasConverged = false;
            }
            newCentroids[i] = newCentroid;
        }

        if (hasConverged) break;
        centroids = newCentroids;
    }

    // Sort clusters by size to get dominant colors
    clusters.sort((a, b) => b.length - a.length);

    return clusters.slice(0, k).map((cluster, index) => {
        const [r, g, b] = centroids[index];
        return {
            hex: rgbToHex(r, g, b),
            rgb: `rgb(${r}, ${g}, ${b})`,
        };
    });
};


export function ImageColorExtractor() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [palette, setPalette] = useState<ColorInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setPalette([]); // Clear previous palette
        } else if (file) {
            toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
        }
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
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
            
            // --- Performance Improvement ---
            // Resize image to a smaller thumbnail on canvas before processing
            const MAX_WIDTH = 100;
            const scaleRatio = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleRatio;
            // --------------------------------

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                setIsLoading(false);
                toast({ title: 'Error', description: 'Could not get canvas context.', variant: 'destructive'});
                return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const dominantColors = getDominantColors(imageData, 10);
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
                            className={cn("w-full aspect-video border-2 border-dashed rounded-lg text-center cursor-pointer flex flex-col items-center justify-center relative transition-colors", 
                                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:bg-muted/50'
                            )}
                            onClick={() => fileInputRef.current?.click()}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="p-2"/>
                            ) : (
                                <div className="flex flex-col items-center p-4">
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
                     {isLoading ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-3 border rounded-lg space-y-2">
                                    <Skeleton className="w-full h-16 rounded-md" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : palette.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {palette.map((color, index) => (
                                <div key={index} className="p-3 border rounded-lg bg-muted/50">
                                    <div style={{ backgroundColor: color.hex }} className="w-full h-16 rounded-md mb-2 border"/>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">HEX:</span>
                                            <div className="flex items-center gap-1 font-mono">
                                                {color.hex} <Copy className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => handleCopy(color.hex, 'HEX')} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">RGB:</span>
                                            <div className="flex items-center gap-1 font-mono">
                                                {color.rgb} <Copy className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => handleCopy(color.rgb, 'RGB')} />
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
