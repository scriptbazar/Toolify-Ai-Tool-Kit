'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Image as ImageIcon, Type, Fingerprint, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
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
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      
      let watermarkImageBytes: ArrayBuffer | undefined;
      if (watermarkType === 'image' && watermarkImage) {
        watermarkImageBytes = await watermarkImage.arrayBuffer();
      }

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const watermarkImageEmbed = watermarkImageBytes ? await pdfDoc.embedPng(watermarkImageBytes) : undefined;

      for (const page of pages) {
          const { width, height } = page.getSize();
          
          if (watermarkType === 'text' && watermarkText) {
              const fontSize = (width / watermarkText.length) * (size / 100) * 1.5;
              const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
              const textHeight = font.heightAtSize(fontSize);
              
              page.drawText(watermarkText, {
                  x: width / 2 - textWidth / 2,
                  y: height / 2 - textHeight / 2,
                  size: fontSize,
                  font: font,
                  color: rgb(0, 0, 0),
                  opacity: opacity,
                  rotate: degrees(rotation),
              });
          } else if (watermarkType === 'image' && watermarkImageEmbed) {
              const imageDims = watermarkImageEmbed.scale(size / 100);
              
              page.drawImage(watermarkImageEmbed, {
                  x: width / 2 - imageDims.width / 2,
                  y: height / 2 - imageDims.height / 2,
                  width: imageDims.width,
                  height: imageDims.height,
                  opacity: opacity,
                  rotate: degrees(rotation),
              });
          }
      }

      const watermarkedPdfBytes = await pdfDoc.save();
      const blob = new Blob([watermarkedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `watermarked-${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({ title: 'Watermark applied successfully!', description: 'Your watermarked PDF has been downloaded.' });
    } catch (error: any) {
      toast({ title: 'Error applying watermark', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
             <Button onClick={handleApplyWatermark} disabled={isLoading || !pdfFile} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
                Apply Watermark & Download
            </Button>
        </div>
        <Card>
            <CardContent className="p-6 space-y-6">
            <RadioGroup value={watermarkType} onValueChange={(val) => setWatermarkType(val as any)} className="grid grid-cols-2 gap-4">
                <Label htmlFor="type-text" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center justify-center gap-2"><RadioGroupItem value="text" id="type-text" /><Type/>Text</Label>
                <Label htmlFor="type-image" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary flex items-center justify-center gap-2"><RadioGroupItem value="image" id="type-image" /><ImageIcon/>Image</Label>
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
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                    <Slider value={[opacity]} onValueChange={([val]) => setOpacity(val)} min={0} max={1} step={0.05} />
                </div>
                <div className="space-y-2">
                    <Label>Size: {size}%</Label>
                    <Slider value={[size]} onValueChange={([val]) => setSize(val)} min={10} max={200} step={5} />
                </div>
                <div className="space-y-2">
                    <Label>Rotation: {rotation}°</Label>
                    <Slider value={[rotation]} onValueChange={([val]) => setRotation(val)} min={-180} max={180} step={5} />
                </div>
            </div>
            </CardContent>
        </Card>
    </div>
  );
}
