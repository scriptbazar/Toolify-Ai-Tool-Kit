
'use client';

import { useState, useRef, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Copy, Loader2, ScanText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromImage } from '@/ai/flows/image-text-extractor';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function ImageTextExtractor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ title: 'File too large', description: 'Please upload an image smaller than 5MB.', variant: 'destructive'});
            return;
        }
        setImageFile(file);
        setExtractedText('');
        setImagePreview(URL.createObjectURL(file));
    } else {
        toast({ title: 'Invalid File Type', description: 'Please upload a valid image file.', variant: 'destructive'});
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleExtractText = async () => {
    if (!imageFile) {
      toast({ title: 'Image required', description: 'Please upload an image to extract text.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setExtractedText('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        const result = await extractTextFromImage({
          imageDataUri: base64Image,
        });
        setExtractedText(result.extractedText);
        setIsLoading(false);
      };
      reader.onerror = (error) => {
        console.error("File reading error:", error);
        throw new Error("Failed to read the image file.");
      }
    } catch (error: any) {
      console.error("Extraction process error:", error);
      toast({ title: 'Extraction Failed', description: error.message || 'Could not extract text from the image.', variant: 'destructive' });
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    toast({ title: "Copied to clipboard!" });
  };
  
  const handleClear = () => {
    setImageFile(null);
    setImagePreview(null);
    setExtractedText('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Your Image</CardTitle>
                </CardHeader>
                <CardContent>
                    <div 
                        className={cn("w-full aspect-video border-2 border-dashed rounded-lg text-center cursor-pointer flex items-center justify-center relative transition-colors", 
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
                            <Image src={imagePreview} alt="Uploaded preview" layout="fill" objectFit="contain" className="p-2"/>
                        ) : (
                            <div className="flex flex-col items-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
                                <p className="text-xs text-muted-foreground">(JPG, PNG, WEBP | Max 5MB)</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
             <Button onClick={handleExtractText} disabled={isLoading || !imageFile} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanText className="mr-2 h-4 w-4" />}
                Extract Text
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Extracted Text</CardTitle>
                <CardDescription>The text recognized from your image will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Textarea
                    id="extracted-text"
                    value={extractedText}
                    readOnly
                    placeholder={isLoading ? "Analyzing your image, please wait..." : "Extracted text will appear here..."}
                    className="min-h-[300px] bg-muted"
                />
                {isLoading && (
                    <div className="space-y-2 mt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                 <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={handleCopy} disabled={!extractedText || isLoading}>
                        <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleClear} disabled={!imageFile && !extractedText}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
