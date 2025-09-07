
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Image as ImageIcon, Type, RotateCw, Fingerprint, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { addWatermarkToPdf } from '@/ai/flows/pdf-management';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '../ui/slider';

export function AddWatermarkToPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [size, setSize] = useState(50);
  const [rotation, setRotation] = useState(-45);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPdfFile(e.target.files[0]);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setWatermarkImage(e.target.files[0]);
    }
  };

  const handleApplyWatermark = async () => {
    if (!pdfFile) {
      toast({ title: 'Please upload a PDF file.', variant: 'destructive' });
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
      const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) resolve(event.target.result as string);
            else reject(new Error('Failed to read file.'));
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const pdfDataUri = await fileToDataUri(pdfFile);
      let imageDataUri: string | undefined = undefined;
      if (watermarkType === 'image' && watermarkImage) {
        imageDataUri = await fileToDataUri(watermarkImage);
      }

      const result = await addWatermarkToPdf({
        pdfDataUri,
        watermarkType,
        text: watermarkText,
        imageDataUri,
        opacity,
        size,
        position: 'center', // This can be extended
        rotation,
      });

      const link = document.createElement('a');
      link.href = result.watermarkedPdfDataUri;
      link.download = `watermarked-${pdfFile.name}`;
      link.click();

      toast({ title: 'Watermark applied successfully!', description: 'Your watermarked PDF has been downloaded.' });
    } catch (error: any) {
      toast({ title: 'Error applying watermark', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
        onClick={() => pdfInputRef.current?.click()}
      >
        <input type="file" ref={pdfInputRef} onChange={handlePdfChange} className="hidden" accept=".pdf" />
        <div className="flex flex-col items-center">
          <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{pdfFile ? `Selected: ${pdfFile.name}` : 'Click or drag PDF file to upload'}</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <RadioGroup value={watermarkType} onValueChange={(val) => setWatermarkType(val as any)} className="grid grid-cols-2 gap-4">
            <Label htmlFor="type-text" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center gap-2"><RadioGroupItem value="text" id="type-text" /><Type/>Text</Label>
            <Label htmlFor="type-image" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center gap-2"><RadioGroupItem value="image" id="type-image" /><ImageIcon/>Image</Label>
          </RadioGroup>
          
          {watermarkType === 'text' ? (
            <div className="space-y-2">
              <Label htmlFor="watermark-text">Watermark Text</Label>
              <Input id="watermark-text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
            </div>
          ) : (
             <div className="space-y-2">
                <Label>Watermark Image</Label>
                 <Button variant="outline" className="w-full" onClick={() => imageInputRef.current?.click()}>
                   {watermarkImage ? `Selected: ${watermarkImage.name}` : 'Select Image'}
                 </Button>
                <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                <Slider value={[opacity]} onValueChange={([val]) => setOpacity(val)} min={0} max={1} step={0.05} />
              </div>
               <div className="space-y-2">
                <Label>Size: {size}</Label>
                <Slider value={[size]} onValueChange={([val]) => setSize(val)} min={10} max={200} step={5} />
              </div>
          </div>
           <div className="space-y-2">
                <Label>Rotation: {rotation}°</Label>
                <Slider value={[rotation]} onValueChange={([val]) => setRotation(val)} min={-180} max={180} step={5} />
              </div>

        </CardContent>
      </Card>
      
      <Button onClick={handleApplyWatermark} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
        Apply Watermark
      </Button>
    </div>
  );
}
