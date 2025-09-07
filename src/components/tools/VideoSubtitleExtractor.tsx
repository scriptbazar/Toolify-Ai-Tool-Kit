
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Captions, Loader2, Copy } from 'lucide-react';
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
      setSubtitles(''); // Clear previous results
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid MP4, MKV, or WEBM video.", variant: "destructive" });
    }
  };

  const handleExtract = () => {
    if (!videoFile) {
      toast({ title: 'No video selected!', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    // This is a dummy implementation. A real app would send the file to a server for processing.
    setTimeout(() => {
      const dummySrt = `1
00:00:01,000 --> 00:00:04,000
- Hello, and welcome to our demonstration.

2
00:00:05,100 --> 00:00:08,500
- In this video, we'll be showcasing our new tool.

3
00:00:09,000 --> 00:00:12,000
- This is a simulated subtitle extraction.
`;
      setSubtitles(dummySrt);
      setIsLoading(false);
      toast({ title: 'Subtitles Extracted (Simulated)', description: 'The subtitles have been extracted from the video.' });
    }, 2000);
  };
  
  const handleCopy = () => {
    if (!subtitles) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(subtitles);
    toast({ title: 'Copied to clipboard!' });
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
        <div className="flex justify-between items-center">
          <Label htmlFor="subtitles-output">Extracted Subtitles (.srt format)</Label>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!subtitles}>
             <Copy className="mr-2 h-4 w-4"/> Copy
          </Button>
        </div>
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
