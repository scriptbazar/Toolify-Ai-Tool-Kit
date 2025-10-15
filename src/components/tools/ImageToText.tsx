
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Loader2, FileText, Bot, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { analyzeImageForText } from '@/ai/flows/text-recognizer';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

export function ImageToText() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit for Vision API
            toast({ title: 'File too large', description: 'Please upload an image smaller than 10MB.', variant: 'destructive'});
            return;
        }
        setImageFile(file);
        setExtractedText('');
        setImagePreview(URL.createObjectURL(file));
        handleAnalyze(file);
    } else {
        toast({ title: 'Invalid File Type', variant: 'destructive'});
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); if(e.target) e.target.value = ''; };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

  const handleAnalyze = async (fileToAnalyze: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(fileToAnalyze);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        const result = await analyzeImageForText({ imageDataUri: base64Image });
        if (result.fullTextAnnotation && result.fullTextAnnotation.text) {
          setExtractedText(result.fullTextAnnotation.text);
          toast({ title: 'Success!', description: 'Text has been extracted from the image.'});
        } else {
          setExtractedText('');
          toast({ title: 'No Text Found', description: 'Could not detect any text in the image.', variant: 'default'});
        }
        setIsLoading(false);
      };
    } catch (error: any) {
      toast({ title: 'Analysis Failed', description: error.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(extractedText); toast({ title: "Copied to clipboard!" }); };
  const handleClear = () => { setImageFile(null); setImagePreview(null); setExtractedText(''); if (fileInputRef.current) fileInputRef.current.value = ''; };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
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
                    <div className="flex flex-col items-center justify-center h-full aspect-video">
                        {imagePreview ? (
                            <Image src={imagePreview} alt="Uploaded preview" layout="fill" objectFit="contain" className="p-2"/>
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
        <div className="space-y-4">
             <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/>Extracted Text</CardTitle>
                        <CardDescription>Text recognized by the AI.</CardDescription>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={handleCopy} disabled={!extractedText}><Copy className="mr-2 h-4 w-4"/>Copy</Button>
                        <Button variant="destructive" size="sm" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72 w-full p-4 border rounded-md bg-muted">
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : (
                           <p className="text-sm whitespace-pre-wrap">{extractedText || "Upload an image to see the extracted text here."}</p>
                        )}
                    </ScrollArea>
                </CardContent>
             </Card>
        </div>
    </div>
  );
}
