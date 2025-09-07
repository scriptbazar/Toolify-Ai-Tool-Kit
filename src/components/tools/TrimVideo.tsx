
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Scissors, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';

export function TrimVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('0');
  const [endTime, setEndTime] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          setEndTime(videoRef.current!.duration.toFixed(2));
        };
      }
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid video file.", variant: "destructive" });
    }
  };

  const handleTrim = async () => {
    toast({ title: 'Coming Soon!', description: 'Video processing functionality is under development.' });
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*" />
        {videoSrc ? (
            <video ref={videoRef} src={videoSrc} className="w-full h-full object-contain" controls />
        ) : (
             <div className="flex flex-col items-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag video file to upload</p>
            </div>
        )}
      </div>
      
      {videoSrc && (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="start-time">Start Time (seconds)</Label>
                <Input id="start-time" type="number" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="end-time">End Time (seconds)</Label>
                <Input id="end-time" type="number" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
        </div>
      )}
      
      <Button onClick={handleTrim} disabled={isLoading || !videoFile} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scissors className="mr-2 h-4 w-4" />}
        Trim Video & Download
      </Button>
    </div>
  );
}
