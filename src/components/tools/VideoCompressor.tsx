
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';
import { Card, CardContent } from '../ui/card';

export function VideoCompressor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setOriginalSize(file.size);
      setVideoSrc(URL.createObjectURL(file));
      setCompressedSize(0); // Reset on new file
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid video file.", variant: "destructive" });
    }
  };

  const handleCompress = () => {
    if (!videoFile) {
        toast({ title: "No video selected!", variant: "destructive"});
        return;
    }
    // This is a placeholder for a complex server-side operation.
    // A real implementation would upload the file and process it.
    setIsLoading(true);
    setTimeout(() => {
        const newSize = originalSize * quality * 0.5; // Simulate compression
        setCompressedSize(newSize);
        setIsLoading(false);
        toast({ title: "Compression Finished (Simulated)", description: "You can now download the file."});
    }, 2000);
  };
  
  const handleDownload = () => {
       toast({ title: "Download is not available in this demo.", variant: "default"});
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*" />
        {videoSrc ? (
            <video src={videoSrc} className="w-full h-full object-contain" controls />
        ) : (
             <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag video file to upload</p>
            </div>
        )}
      </div>

       <Card>
        <CardContent className="p-4 space-y-4">
           <div className="space-y-2">
                <Label>Compression Level</Label>
                <Slider value={[quality]} onValueChange={([val]) => setQuality(val)} min={0.1} max={1} step={0.1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Lower Quality</span>
                    <span>Higher Quality</span>
                </div>
            </div>
            {originalSize > 0 && (
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-2 border rounded-md"><p className="text-sm text-muted-foreground">Original Size</p><p className="font-bold">{formatBytes(originalSize)}</p></div>
                    <div className="p-2 border rounded-md"><p className="text-sm text-muted-foreground">Compressed Size</p><p className="font-bold">{compressedSize > 0 ? formatBytes(compressedSize) : '...'}</p></div>
                </div>
            )}
        </CardContent>
       </Card>

        <div className="flex gap-2">
            <Button onClick={handleCompress} disabled={isLoading || !videoFile} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Compress Video
            </Button>
            <Button onClick={handleDownload} disabled={compressedSize === 0} className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download
            </Button>
        </div>
    </div>
  );
}
