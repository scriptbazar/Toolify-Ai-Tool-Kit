
'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Image as ImageIcon, PenLine, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const PHOTO_WIDTH = 213;
const PHOTO_HEIGHT = 213;
const SIGNATURE_WIDTH = 400;
const SIGNATURE_HEIGHT = 200;
const MAX_PHOTO_SIZE_KB = 30;
const MAX_SIGNATURE_SIZE_KB = 60;
const PHOTO_DPI = 300;
const SIGNATURE_DPI = 600;

const ImageResizerBox = ({
  title,
  icon: Icon,
  targetWidth,
  targetHeight,
  maxSizeKb,
  dpi,
}: {
  title: string;
  icon: React.ElementType;
  targetWidth: number;
  targetHeight: number;
  maxSizeKb: number;
  dpi: number;
}) => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resizedPreview, setResizedPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setOriginalFile(file);
      setOriginalPreview(URL.createObjectURL(file));
      setResizedPreview(null);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleResize = () => {
    if (!originalPreview) return;
    setIsLoading(true);

    const img = document.createElement('img');
    img.src = originalPreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsLoading(false);
        return;
      }
      
      // Fill background with white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // Calculate aspect ratio to fit image inside canvas without stretching
      const hRatio = targetWidth / img.width;
      const vRatio = targetHeight / img.height;
      const ratio = Math.min(hRatio, vRatio);
      
      const centerShift_x = (targetWidth - img.width * ratio) / 2;
      const centerShift_y = (targetHeight - img.height * ratio) / 2;
      
      ctx.drawImage(img, 0, 0, img.width, img.height,
                    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);

      let quality = 0.9;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Simple loop to reduce quality if size is too large
      while (dataUrl.length > maxSizeKb * 1024 * 4/3 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      
      if (dataUrl.length > maxSizeKb * 1024 * 4/3) {
          toast({ title: "Warning", description: `Image size could not be reduced below ${maxSizeKb}KB. Result may be larger than required.`, variant: "default" });
      }

      setResizedPreview(dataUrl);
      setIsLoading(false);
      toast({ title: `${title} Resized!`, description: 'Your image is ready for download.'});
    };
    img.onerror = () => {
        setIsLoading(false);
        toast({ title: 'Error', description: 'Could not load the image to resize.', variant: 'destructive'});
    }
  };
  
  const handleDownload = () => {
      if (!resizedPreview || !originalFile) return;
      const link = document.createElement('a');
      link.href = resizedPreview;
      link.download = `uti-${title.toLowerCase()}-${Date.now()}.jpeg`;
      link.click();
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5 text-primary"/>{title}</CardTitle>
        <CardDescription>Upload, resize, and download your {title.toLowerCase()}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
            className="w-full aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
            onClick={() => fileInputRef.current?.click()}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            {originalPreview ? (
                <Image src={originalPreview} alt="Preview" fill objectFit="contain" className="p-2"/>
            ) : (
                <div className="flex flex-col items-center">
                    <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload {title}</p>
                    <p className="text-xs text-muted-foreground">Target: {targetWidth}x{targetHeight}px @ {dpi}DPI, &lt;{maxSizeKb}KB</p>
                </div>
            )}
        </div>

        <Button onClick={handleResize} disabled={!originalPreview || isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
            Resize {title}
        </Button>
        
        {resizedPreview && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-center">Resized Preview</h4>
            <div className="border rounded-lg p-2 bg-muted flex justify-center">
              <Image src={resizedPreview} alt="Resized Preview" width={targetWidth} height={targetHeight} />
            </div>
            <Button onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download {title}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export function UTIPANCardPhotoAndSignatureResizer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ImageResizerBox 
        title="Photo"
        icon={ImageIcon}
        targetWidth={PHOTO_WIDTH}
        targetHeight={PHOTO_HEIGHT}
        maxSizeKb={MAX_PHOTO_SIZE_KB}
        dpi={PHOTO_DPI}
      />
      <ImageResizerBox 
        title="Signature"
        icon={PenLine}
        targetWidth={SIGNATURE_WIDTH}
        targetHeight={SIGNATURE_HEIGHT}
        maxSizeKb={MAX_SIGNATURE_SIZE_KB}
        dpi={SIGNATURE_DPI}
      />
    </div>
  );
}
