
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Loader2, Link as LinkIcon, ScanLine, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import jsQR from 'jsqr';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';

export function QrCodeScanner() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [decodedText, setDecodedText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    setImagePreview(img.src);
                    scanQrCode(img);
                };
            };
            reader.readAsDataURL(file);
        } else {
            toast({ title: "Invalid File Type", description: "Please upload a valid image file.", variant: "destructive" });
        }
    };
    
    const scanQrCode = (img: HTMLImageElement) => {
        setIsLoading(true);
        setDecodedText(null);
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsLoading(false);
            return;
        }
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            setDecodedText(code.data);
            toast({ title: 'QR Code Scanned!', description: 'Content has been extracted.' });
        } else {
            toast({ title: 'No QR Code Found', description: 'Could not detect a QR code in the uploaded image.', variant: 'default' });
        }
        setIsLoading(false);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); };
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

    const handleCopy = () => {
        if (!decodedText) return;
        navigator.clipboard.writeText(decodedText);
        toast({ title: 'Copied to clipboard!' });
    };

    const handleClear = () => {
        setImageFile(null);
        setImagePreview(null);
        setDecodedText(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isUrl = (text: string | null) => {
        if (!text) return false;
        try {
            new URL(text);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    return (
        <div className="space-y-6">
            <Card 
                className={cn(
                    "transition-colors",
                    isDragging ? 'border-primary bg-primary/10' : 'border-border'
                )}
                onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
            >
                <CardContent 
                    className="p-6 text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <div className="flex flex-col items-center justify-center h-full">
                         {imagePreview ? (
                            <div className="relative w-full max-w-sm aspect-square">
                                <Image src={imagePreview} alt="Uploaded QR Code Preview" layout="fill" objectFit="contain" />
                            </div>
                        ) : (
                             <div className="flex flex-col items-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">Click or drag QR code image to upload</h3>
                                <p className="text-sm text-muted-foreground">The tool will automatically scan for a QR code.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {(isLoading || decodedText) && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ScanLine />Scan Result</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading && (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            </div>
                        )}
                        {decodedText && (
                            <>
                                <Textarea value={decodedText} readOnly className="min-h-[100px] bg-muted"/>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button onClick={handleCopy} className="w-full"><Copy className="mr-2 h-4 w-4"/>Copy Text</Button>
                                    {isUrl(decodedText) && (
                                        <Button asChild className="w-full">
                                            <a href={decodedText!} target="_blank" rel="noopener noreferrer">
                                                <LinkIcon className="mr-2 h-4 w-4"/>Open Link
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="destructive" onClick={handleClear} className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
