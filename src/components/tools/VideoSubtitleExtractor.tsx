
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Captions, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

export function VideoSubtitleExtractor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'video/mp4' || file.type === 'video/mkv' || file.type === 'video/webm')) {
      setVideoFile(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid MP4, MKV, or WEBM video.", variant: "destructive" });
    }
  };

  const handleExtract = () => {
     if (!videoFile) {
        toast({ title: 'No video selected!', variant: 'destructive'});
        return;
    }
    toast({ title: 'Coming Soon!', description: 'Subtitle extraction functionality is under development.' });
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/mp4,video/mkv,video/webm" />
        <div className="flex flex-col items-center">
            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{videoFile ? `Selected: ${videoFile.name}` : 'Click or drag video file (MP4, MKV) to upload'}</p>
        </div>
      </div>
      
      <Button onClick={handleExtract} disabled={isLoading || !videoFile} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Captions className="mr-2 h-4 w-4" />}
        Extract Subtitles
      </Button>

       <div className="space-y-2">
            <Label htmlFor="subtitles-output">Extracted Subtitles (.srt)</Label>
            <Textarea
              id="subtitles-output"
              value={subtitles}
              readOnly
              placeholder="Extracted subtitles will appear here..."
              className="min-h-[200px] bg-muted font-mono"
            />
        </div>
    </div>
  );
}
