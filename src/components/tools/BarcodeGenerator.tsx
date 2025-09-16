
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Download, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';

type HtmlToImageLibrary = {
    toPng: (node: HTMLElement, options?: any) => Promise<string>;
    toJpeg: (node: HTMLElement, options?: any) => Promise<string>;
    toSvg: (node: HTMLElement, options?: any) => Promise<string>;
};

export function BarcodeGenerator() {
  const [value, setValue] = useState('https://toolifyai.com');
  const [format, setFormat] = useState('CODE128');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [lineColor, setLineColor] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const barcodeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [htmlToImage, setHtmlToImage] = useState<HtmlToImageLibrary | null>(null);

  useEffect(() => {
    import('html-to-image').then((module) => {
      setHtmlToImage(module);
    });
  }, []);

  const handleDownload = useCallback(async (format: 'png' | 'jpeg' | 'svg') => {
    if (!barcodeRef.current) {
      toast({ title: "Error", description: "Barcode reference not found.", variant: "destructive" });
      return;
    }
    
    if (!htmlToImage) {
        toast({ title: "Library not loaded", description: "Image generation library is still loading, please try again in a moment.", variant: "destructive" });
        return;
    }

    try {
      let dataUrl;
      const downloadOptions = { backgroundColor: background };
      
      switch (format) {
        case 'png':
          dataUrl = await htmlToImage.toPng(barcodeRef.current, downloadOptions);
          break;
        case 'jpeg':
          dataUrl = await htmlToImage.toJpeg(barcodeRef.current, { ...downloadOptions, quality: 0.95 });
          break;
        case 'svg':
          dataUrl = await htmlToImage.toSvg(barcodeRef.current, downloadOptions);
          break;
      }
      
      const link = document.createElement('a');
      link.download = `barcode.${format}`;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error(err);
      toast({ title: "Download Failed", description: "Could not generate the image file.", variant: "destructive"});
    }
  }, [background, htmlToImage, toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Enter your data and customize the barcode.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="value-input">Data to Encode</Label>
                    <Input id="value-input" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter data or URL"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="format-select">Barcode Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger id="format-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CODE128">Code 128</SelectItem>
                            <SelectItem value="CODE39">Code 39</SelectItem>
                            <SelectItem value="EAN13">EAN-13</SelectItem>
                            <SelectItem value="EAN8">EAN-8</SelectItem>
                            <SelectItem value="UPC">UPC</SelectItem>
                            <SelectItem value="ITF14">ITF-14</SelectItem>
                            <SelectItem value="MSI">MSI</SelectItem>
                            <SelectItem value="pharmacode">Pharmacode</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="advanced-toggle" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                    <Label htmlFor="advanced-toggle" className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4"/>Advanced Options</Label>
                </div>
                {showAdvanced && (
                    <div className="space-y-6 pt-4 border-t">
                        <div className="space-y-2">
                            <Label>Bar Width: {width}px</Label>
                            <Slider value={[width]} onValueChange={([val]) => setWidth(val)} min={1} max={4} step={1} />
                        </div>
                        <div className="space-y-2">
                            <Label>Bar Height: {height}px</Label>
                            <Slider value={[height]} onValueChange={([val]) => setHeight(val)} min={20} max={150} step={5} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="line-color">Line Color</Label>
                                <Input id="line-color" type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="bg-color">Background Color</Label>
                                <Input id="bg-color" type="color" value={background} onChange={e => setBackground(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="display-value" checked={displayValue} onCheckedChange={setDisplayValue} />
                            <Label htmlFor="display-value">Display Value</Label>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Barcode Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div ref={barcodeRef} className="p-4" style={{ background }}>
                <Barcode 
                    value={value} 
                    format={format} 
                    width={width}
                    height={height}
                    displayValue={displayValue}
                    lineColor={lineColor}
                    background={background}
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => handleDownload('png')}><Download className="mr-2 h-4 w-4" />Download PNG</Button>
                <Button variant="outline" onClick={() => handleDownload('jpeg')}><Download className="mr-2 h-4 w-4" />Download JPG</Button>
                <Button variant="outline" onClick={() => handleDownload('svg')}><Download className="mr-2 h-4 w-4" />Download SVG</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
