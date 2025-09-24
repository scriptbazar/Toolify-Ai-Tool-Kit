
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, AspectRatio, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import imageCompression from 'browser-image-compression';

type ResizeMode = 'pixels' | 'percentage';
type OutputFormat = 'jpeg' | 'png' | 'webp';

export function ImageResizer() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });
  const [newWidth, setNewWidth] = useState(0);
  const [newHeight, setNewHeight] = useState(0);
  const [percentage, setPercentage] = useState(100);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('pixels');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(90);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          setImagePreview(img.src);
          setOriginalDims({ width: img.width, height: img.height });
          setNewWidth(img.width);
          setNewHeight(img.height);
          setPercentage(100);
        };
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: 'Invalid File', description: 'Please upload a valid image file.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (resizeMode === 'percentage' && originalDims.width > 0) {
      const newW = Math.round((originalDims.width * percentage) / 100);
      const newH = Math.round((originalDims.height * percentage) / 100);
      setNewWidth(newW);
      setNewHeight(newH);
    }
  }, [percentage, resizeMode, originalDims]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = Number(e.target.value);
    setNewWidth(width);
    if (maintainAspectRatio && originalDims.width > 0) {
      const ratio = originalDims.height / originalDims.width;
      setNewHeight(Math.round(width * ratio));
      setPercentage(Math.round((width / originalDims.width) * 100));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = Number(e.target.value);
    setNewHeight(height);
    if (maintainAspectRatio && originalDims.height > 0) {
      const ratio = originalDims.width / originalDims.height;
      setNewWidth(Math.round(height * ratio));
      setPercentage(Math.round((height / originalDims.height) * 100));
    }
  };

  const handleDownload = async () => {
    if (!imageFile) {
      toast({ title: 'No image selected', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
        const options = {
            maxSizeMB: undefined, // Let quality and dimensions dictate size
            maxWidthOrHeight: resizeMode === 'pixels' ? Math.max(newWidth, newHeight) : undefined,
            useWebWorker: true,
            initialQuality: (quality / 100),
            fileType: `image/${outputFormat}`,
            alwaysKeepResolution: resizeMode === 'percentage' && percentage === 100 ? true : !maintainAspectRatio,
        };
        
        const compressedFile = await imageCompression(imageFile, options);
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedFile);
        const originalName = imageFile.name.split('.')[0];
        link.download = `resized-${originalName}.${outputFormat}`;
        link.click();
        URL.revokeObjectURL(link.href);

        toast({ title: 'Success!', description: 'Your resized image has been downloaded.' });
    } catch (error) {
        console.error("Resizing error:", error);
        toast({ title: 'Error', description: 'Could not resize the image.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <div 
          className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          {imagePreview ? (
            <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="p-2" />
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
            </div>
          )}
        </div>
        {originalDims.width > 0 && <p className="text-sm text-muted-foreground text-center">Original Dimensions: {originalDims.width}px x {originalDims.height}px</p>}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resize Options</CardTitle>
          <CardDescription>Adjust the settings to resize your image.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <RadioGroup value={resizeMode} onValueChange={(val) => setResizeMode(val as ResizeMode)} className="grid grid-cols-2 gap-4">
              <Label htmlFor="mode-pixels" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
                <RadioGroupItem value="pixels" id="mode-pixels" className="sr-only"/>By Pixels
              </Label>
               <Label htmlFor="mode-percentage" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
                <RadioGroupItem value="percentage" id="mode-percentage" className="sr-only"/>By Percentage
              </Label>
            </RadioGroup>

            {resizeMode === 'pixels' ? (
                 <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="space-y-2"><Label htmlFor="width">Width (px)</Label><Input id="width" type="number" value={newWidth} onChange={handleWidthChange}/></div>
                    <div className="space-y-2"><Label htmlFor="height">Height (px)</Label><Input id="height" type="number" value={newHeight} onChange={handleHeightChange}/></div>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label>Percentage: {percentage}%</Label>
                    <Slider value={[percentage]} onValueChange={([val]) => setPercentage(val)} min={1} max={200} step={1} />
                </div>
            )}
            
            <div className="flex items-center space-x-2">
                <Checkbox id="aspect-ratio" checked={maintainAspectRatio} onCheckedChange={(checked) => setMaintainAspectRatio(Boolean(checked))} />
                <Label htmlFor="aspect-ratio">Maintain aspect ratio</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="output-format">Output Format</Label>
                    <Select value={outputFormat} onValueChange={(val) => setOutputFormat(val as OutputFormat)}>
                        <SelectTrigger id="output-format"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="webp">WEBP</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                     <div className="space-y-2">
                        <Label>Quality: {quality}%</Label>
                        <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={10} max={100} step={5} />
                    </div>
                 )}
            </div>

            <Button onClick={handleDownload} disabled={!imageFile || isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
               Resize & Download
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
