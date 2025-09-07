
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Image as ImageIcon, Type, Fingerprint, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '../ui/slider';

export function AddWatermarkToVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('Your Watermark');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [opacity, setOpacity] = useState(0.7);
  const [size, setSize] = useState(10);
  const [position, setPosition] = useState('bottom-right');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setWatermarkImage(e.target.files[0]);
    }
  };

  const handleApplyWatermark = async () => {
    if (!videoFile) {
      toast({ title: 'Please upload a video file.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Coming Soon!', description: 'Video processing functionality is under development.' });
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => videoInputRef.current?.click()}
      >
        <input type="file" ref={videoInputRef} onChange={handleVideoChange} className="hidden" accept="video/*" />
        {videoFile ? (
            <video src={URL.createObjectURL(videoFile)} className="w-full h-full object-contain" controls />
        ) : (
             <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag video file to upload</p>
            </div>
        )}
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
                <Label>Size: {size}% of video height</Label>
                <Slider value={[size]} onValueChange={([val]) => setSize(val)} min={2} max={50} step={1} />
              </div>
          </div>
           <div className="space-y-2">
                <Label>Position</Label>
                <RadioGroup value={position} onValueChange={setPosition} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Label className="p-2 border rounded-md cursor-pointer text-center has-[:checked]:bg-muted">Top-Left<RadioGroupItem value="top-left" className="sr-only"/></Label>
                    <Label className="p-2 border rounded-md cursor-pointer text-center has-[:checked]:bg-muted">Top-Right<RadioGroupItem value="top-right" className="sr-only"/></Label>
                    <Label className="p-2 border rounded-md cursor-pointer text-center has-[:checked]:bg-muted">Bottom-Left<RadioGroupItem value="bottom-left" className="sr-only"/></Label>
                    <Label className="p-2 border rounded-md cursor-pointer text-center has-[:checked]:bg-muted">Bottom-Right<RadioGroupItem value="bottom-right" className="sr-only"/></Label>
                </RadioGroup>
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
