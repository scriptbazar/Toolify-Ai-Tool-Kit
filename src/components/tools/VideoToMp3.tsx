
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Download, Loader2, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { videoToMp3 } from '@/ai/flows/video-to-mp3';

export function VideoToMp3() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [mp3Url, setMp3Url] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoSrc(URL.createObjectURL(file));
      setMp3Url(null); // Clear previous results
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid video file.", variant: "destructive" });
    }
  };

  const handleExtract = async () => {
    if (!videoFile) {
        toast({ title: 'No video selected!', variant: 'destructive'});
        return;
    }
    setIsLoading(true);
    setMp3Url(null);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(videoFile);
        reader.onload = async () => {
            const videoDataUri = reader.result as string;
            try {
                const result = await videoToMp3({ videoDataUri });
                setMp3Url(result.audioDataUri);
                toast({ title: 'Extraction Complete!', description: 'Your MP3 file is ready for download.'});
            } catch (innerError: any) {
                 toast({ title: 'Extraction Failed', description: innerError.message || 'Could not extract audio from the video.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = (error) => {
            console.error("File reading error:", error);
            toast({ title: 'File Error', description: 'Could not read the uploaded file.', variant: 'destructive' });
            setIsLoading(false);
        };
    } catch (error: any) {
        console.error("Error setting up file reader:", error);
        toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        setIsLoading(false);
    }
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

      <Button onClick={handleExtract} disabled={isLoading || !videoFile} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Music className="mr-2 h-4 w-4" />}
        Extract MP3
      </Button>

      {mp3Url && (
        <div className="pt-4 border-t">
          <Label>Generated Audio</Label>
          <audio controls src={mp3Url} className="w-full mt-2">
            Your browser does not support the audio element.
          </audio>
           <a href={mp3Url} download={`extracted-audio-${Date.now()}.mp3`}>
                <Button className="w-full mt-2">
                    <Download className="mr-2 h-4 w-4"/> Download MP3
                </Button>
            </a>
        </div>
      )}
    </div>
  );
}
