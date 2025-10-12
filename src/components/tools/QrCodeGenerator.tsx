
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Download, SlidersHorizontal, QrCode, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { Switch } from '../ui/switch';
import Image from 'next/image';

export function QrCodeGenerator() {
  const [value, setValue] = useState('https://toolifyai.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H'); // Higher correction for logo
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // New state for logo
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(48);
  const [logoPadding, setLogoPadding] = useState(4);
  
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        toast({ title: 'Invalid File', description: 'Please select an image file.' });
    }
  };


  const handleDownload = useCallback(async (format: 'png' | 'jpeg' | 'svg') => {
    if (!qrCodeRef.current) {
      toast({ title: "Error", description: "QR Code reference not found.", variant: "destructive" });
      return;
    }

    try {
      let dataUrl;
      const downloadOptions = { backgroundColor: bgColor };
      
      switch (format) {
        case 'png':
          dataUrl = await toPng(qrCodeRef.current, downloadOptions);
          break;
        case 'jpeg':
          dataUrl = await toJpeg(qrCodeRef.current, { ...downloadOptions, quality: 0.95 });
          break;
        case 'svg':
          dataUrl = await toSvg(qrCodeRef.current, downloadOptions);
          break;
      }
      
      const link = document.createElement('a');
      link.download = `qrcode.${format}`;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error(err);
      toast({ title: "Download Failed", description: "Could not generate the image file.", variant: "destructive"});
    }
  }, [bgColor, toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Enter your data and customize the QR code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="value-input">Data to Encode</Label>
                    <Input id="value-input" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter text or URL"/>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="advanced-toggle" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                    <Label htmlFor="advanced-toggle" className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4"/>Advanced Options</Label>
                </div>
                {showAdvanced && (
                    <div className="space-y-6 pt-4 border-t">
                        <div className="space-y-2">
                            <Label>Size: {size}px</Label>
                            <Slider value={[size]} onValueChange={([val]) => setSize(val)} min={64} max={1024} step={32} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="level-select">Error Correction Level</Label>
                            <Select value={level} onValueChange={(val: 'L' | 'M' | 'Q' | 'H') => setLevel(val)}>
                                <SelectTrigger id="level-select"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L">Low (L)</SelectItem>
                                    <SelectItem value="M">Medium (M)</SelectItem>
                                    <SelectItem value="Q">Quartile (Q)</SelectItem>
                                    <SelectItem value="H">High (H)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fg-color">Foreground Color</Label>
                                <Input id="fg-color" type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="bg-color">Background Color</Label>
                                <Input id="bg-color" type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                            </div>
                        </div>

                         <div className="space-y-4 pt-4 border-t">
                            <Label className="flex items-center gap-2 font-semibold">
                                <UploadCloud className="h-5 w-5"/> Logo Options
                            </Label>
                            <Button variant="outline" onClick={() => logoInputRef.current?.click()} className="w-full">
                                {logoImage ? 'Change Logo' : 'Upload Logo'}
                            </Button>
                            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*"/>
                             {logoImage && (
                                <>
                                  <div className="space-y-2">
                                    <Label>Logo Size: {logoSize}px</Label>
                                    <Slider value={[logoSize]} onValueChange={([val]) => setLogoSize(val)} min={16} max={128} step={4} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Logo Padding: {logoPadding}px</Label>
                                    <Slider value={[logoPadding]} onValueChange={([val]) => setLogoPadding(val)} min={0} max={16} step={2} />
                                  </div>
                                </>
                            )}
                        </div>

                    </div>
                )}
            </CardContent>
        </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>QR Code Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div ref={qrCodeRef} className="p-4 inline-block relative" style={{ background: bgColor }}>
                <QRCode
                    value={value}
                    size={size}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level={level}
                />
                 {logoImage && (
                    <div 
                        className="absolute bg-white" 
                        style={{ 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)',
                            width: logoSize,
                            height: logoSize,
                            padding: logoPadding,
                        }}
                    >
                        <Image src={logoImage} alt="QR Code Logo" layout="fill" objectFit="contain" />
                    </div>
                )}
            </div>
            <div className="w-full space-y-2">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleDownload('png')} className="flex-1"><Download className="mr-2 h-4 w-4" />Download PNG</Button>
                    <Button variant="outline" onClick={() => handleDownload('jpeg')} className="flex-1"><Download className="mr-2 h-4 w-4" />Download JPG</Button>
                </div>
                <Button variant="outline" onClick={() => handleDownload('svg')} className="w-full"><Download className="mr-2 h-4 w-4" />Download SVG</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

