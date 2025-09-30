
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Loader2, FileText, Bot, Copy, Trash2, ZoomIn, ZoomOut, Move, Languages, Text, Square, Sigma, Baseline } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { analyzeImageForText } from '@/ai/flows/text-recognizer';
import { type TextAnnotation } from '@/ai/flows/text-recognizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '../ui/table';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageTextExtractor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fullText, setFullText] = useState<string>('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [highlightedBox, setHighlightedBox] = useState<BoundingBox | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit for Vision API
            toast({ title: 'File too large', description: 'Please upload an image smaller than 10MB.', variant: 'destructive'});
            return;
        }
        setImageFile(file);
        setFullText('');
        setBlocks([]);
        setDetectedLanguage('');
        setHighlightedBox(null);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setImageSize({ width: img.width, height: img.height });
                setImagePreview(reader.result as string);
                handleAnalyze(file);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);

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
        if (result.fullTextAnnotation) {
          setFullText(result.fullTextAnnotation.text);
          setBlocks(result.fullTextAnnotation.pages[0]?.blocks || []);
          setDetectedLanguage(result.fullTextAnnotation.pages[0]?.property?.detectedLanguages?.[0]?.languageCode || 'N/A');
        } else {
          toast({ title: 'No Text Detected', description: 'The AI could not find any text in this image.', variant: 'default'});
        }
        setIsLoading(false);
      };
    } catch (error: any) {
      toast({ title: 'Analysis Failed', description: error.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied to clipboard!" }); };
  const handleClear = () => { setImageFile(null); setImagePreview(null); setFullText(''); setBlocks([]); setDetectedLanguage(''); if (fileInputRef.current) fileInputRef.current.value = ''; };
  
  // Panning and Zooming Logic
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { if (e.button === 0) { setIsPanning(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; }};
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => { if (isPanning) { const dx = e.clientX - lastMousePos.current.x; const dy = e.clientY - lastMousePos.current.y; setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); lastMousePos.current = { x: e.clientX, y: e.clientY }; }};
  const handleMouseUp = () => setIsPanning(false);
  const handleMouseLeave = () => setIsPanning(false);
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => { e.preventDefault(); const newZoom = zoom - e.deltaY * 0.001; setZoom(Math.max(0.1, Math.min(newZoom, 5))); };

  return (
    <div className="space-y-6">
        <div 
            className={cn("w-full h-48 border-2 border-dashed rounded-lg text-center cursor-pointer flex flex-col items-center justify-center relative transition-colors", 
                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:bg-muted/50'
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-semibold">Click or drag image to upload</h3>
            <p className="text-sm text-muted-foreground">(JPG, PNG, WEBP | Max 10MB)</p>
        </div>
        
        {isLoading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

        {(imagePreview && !isLoading) && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50">
                 <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">Image Preview
                        <div className="flex items-center gap-2">
                           <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}><ZoomOut className="h-4 w-4"/></Button>
                           <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(5, z + 0.1))}><ZoomIn className="h-4 w-4"/></Button>
                           <Button variant="outline" size="icon" onClick={() => {setZoom(1); setOffset({x:0, y:0})}}><Move className="h-4 w-4"/></Button>
                        </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent 
                        className={cn("relative w-full h-[500px] overflow-hidden bg-muted rounded-md", isPanning && "cursor-grabbing")}
                        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} onWheel={handleWheel}
                    >
                         {imagePreview && (
                            <div style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center center', width: imageSize.width, height: imageSize.height }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <img src={imagePreview} alt="Uploaded preview" />
                                {highlightedBox && (
                                    <div 
                                        className="absolute border-2 border-primary bg-primary/20"
                                        style={{ 
                                            left: `${highlightedBox.x}px`,
                                            top: `${highlightedBox.y}px`,
                                            width: `${highlightedBox.width}px`,
                                            height: `${highlightedBox.height}px`,
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader><CardTitle>Extracted Text Analysis</CardTitle></CardHeader>
                    <CardContent>
                        <Tabs defaultValue="full-text">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="full-text">Full Text</TabsTrigger>
                                <TabsTrigger value="by-block">By Block</TabsTrigger>
                            </TabsList>
                             <div className="flex items-center justify-between mt-4">
                                <Badge variant="outline" className="flex items-center gap-1.5"><Languages className="h-4 w-4"/> Detected: <span className="font-semibold">{detectedLanguage}</span></Badge>
                                <div className="flex gap-1">
                                    <Button variant="outline" size="sm" onClick={() => handleCopy(fullText)} disabled={!fullText}><Copy className="mr-2 h-4 w-4"/>Copy All</Button>
                                    <Button variant="destructive" size="sm" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
                                </div>
                            </div>
                            <TabsContent value="full-text" className="mt-4">
                                <ScrollArea className="h-[400px] w-full p-4 border rounded-md bg-muted">
                                    <p className="text-sm whitespace-pre-wrap">{fullText || "No text detected."}</p>
                                </ScrollArea>
                            </TabsContent>
                             <TabsContent value="by-block" className="mt-4">
                                <ScrollArea className="h-[400px] w-full border rounded-md">
                                    <div className="space-y-2 p-2">
                                        {blocks.map((block, index) => (
                                             <p key={index} 
                                                className="text-sm p-2 rounded-md hover:bg-primary/10 cursor-pointer"
                                                onMouseEnter={() => block.boundingBox && setHighlightedBox({ x: block.boundingBox.vertices[0].x, y: block.boundingBox.vertices[0].y, width: block.boundingBox.vertices[1].x - block.boundingBox.vertices[0].x, height: block.boundingBox.vertices[2].y - block.boundingBox.vertices[0].y })}
                                                onMouseLeave={() => setHighlightedBox(null)}
                                             >
                                                {block.paragraphs.map((p: any) => p.words.map((w: any) => w.symbols.map((s: any) => s.text).join('')).join(' ')).join('\n')}
                                            </p>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                 </Card>
            </div>
        )}
    </div>
  );
}
