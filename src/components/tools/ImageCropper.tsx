
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Crop, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ImageCropper() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleCropAction = () => {
    if (!imageSrc || !imgRef.current) return;
    
    // This is a simplified crop. A real implementation would use a library for a better UX.
    // For now, we'll just crop the center square.
    const img = imgRef.current;
    const size = Math.min(img.naturalWidth, img.naturalHeight);
    const x = (img.naturalWidth - size) / 2;
    const y = (img.naturalHeight - size) / 2;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, x, y, size, size, 0, 0, size, size);

    toast({ title: 'Image Cropped', description: 'A square from the center has been cropped. Download it below.' });
  }

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL();
    link.download = 'cropped-image.png';
    link.click();
  }

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        {imageSrc ? (
            <img ref={imgRef} src={imageSrc} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
             <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
            </div>
        )}
      </div>
      
      <div className="flex justify-center gap-4">
        <Button onClick={handleCropAction} disabled={!imageSrc}>
          <Crop className="mr-2 h-4 w-4" /> Crop Center Square
        </Button>
      </div>

      <div className="pt-4 border-t">
          <Label>Cropped Result</Label>
          <div className="w-full aspect-square mt-2 border rounded-lg bg-muted flex items-center justify-center">
            <canvas ref={canvasRef} />
          </div>
          <Button onClick={handleDownload} disabled={!canvasRef.current || canvasRef.current.width === 0} className="w-full mt-4">
              <Download className="mr-2 h-4 w-4" /> Download Cropped Image
          </Button>
      </div>
    </div>
  );
}
