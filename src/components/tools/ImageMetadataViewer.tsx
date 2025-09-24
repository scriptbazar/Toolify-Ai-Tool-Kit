
'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UploadCloud, Camera, FileText, Globe2, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import exifr from 'exifr';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { Skeleton } from '../ui/skeleton';

interface Metadata {
    [key: string]: any;
}

export function ImageMetadataViewer() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setMetadata(null); // Clear previous metadata
            await extractMetadata(file);
        } else if (file) {
            toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
        }
    };
    
    const extractMetadata = async (file: File) => {
        setIsLoading(true);
        try {
            const exifData = await exifr.parse(file);
            const basicData = {
                FileName: file.name,
                FileSize: `${(file.size / 1024).toFixed(2)} KB`,
                FileType: file.type,
                LastModified: new Date(file.lastModified).toLocaleString(),
            };
            setMetadata({ ...basicData, ...exifData });
        } catch (error) {
            console.error("Metadata extraction error:", error);
            toast({ title: 'Metadata Error', description: 'Could not extract EXIF data from this image. It might not contain any.', variant: 'default' });
            setMetadata({ FileName: file.name, FileSize: `${(file.size / 1024).toFixed(2)} KB`, FileType: file.type });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: 'Copied to clipboard!' });
    };

    const renderMetadataSection = (title: string, icon: React.ElementType, keys: string[]) => {
        if (!metadata) return null;
        
        const relevantData = keys.reduce((acc, key) => {
            if (metadata[key] !== undefined && metadata[key] !== null) {
                acc[key] = metadata[key];
            }
            return acc;
        }, {} as Metadata);

        if (Object.keys(relevantData).length === 0) return null;
        
        const Icon = icon;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5"/> {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            {Object.entries(relevantData).map(([key, value]) => (
                                <TableRow key={key}>
                                    <TableCell className="font-medium text-muted-foreground">{key}</TableCell>
                                    <TableCell className="font-mono text-xs break-all">
                                         <div className="flex items-center justify-between gap-2">
                                            <span>{String(value)}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy(String(value))}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div 
                    className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Uploaded preview" layout="fill" objectFit="contain" className="p-2"/>
                    ) : (
                        <div className="flex flex-col items-center">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
                        </div>
                    )}
                </div>
                {isLoading && <Skeleton className="h-96 w-full"/>}
                {!isLoading && metadata && (
                    <div className="space-y-4 animate-in fade-in-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {renderMetadataSection('File Info', FileText, ['FileName', 'FileSize', 'FileType', 'LastModified'])}
                           {renderMetadataSection('Image Info', Camera, ['ImageWidth', 'ImageHeight', 'XResolution', 'YResolution', 'Orientation'])}
                        </div>
                        {renderMetadataSection('Camera Info', Camera, ['Make', 'Model', 'FNumber', 'ISO', 'ExposureTime', 'FocalLength', 'LensModel'])}
                        {renderMetadataSection('GPS Info', Globe2, ['latitude', 'longitude'])}
                    </div>
                )}
            </div>
        </div>
    );
}
