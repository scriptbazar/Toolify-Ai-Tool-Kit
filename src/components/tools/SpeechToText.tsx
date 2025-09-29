
'use client';

import { useState, useRef, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Copy, Mic, Loader2, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { speechToText } from '@/ai/flows/speech-to-text';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function SpeechToText() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && (file.type.startsWith('audio/') || file.type === 'video/mp4')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast({ title: 'File too large', description: 'Please upload an audio file smaller than 10MB.', variant: 'destructive'});
            return;
        }
        setAudioFile(file);
        setTranscribedText('');
    } else {
        toast({ title: 'Invalid File Type', description: 'Please upload a valid audio or MP4 video file.', variant: 'destructive'});
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
          handleFile(file);
      }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      toast({ title: 'Audio file required', description: 'Please upload an audio file to transcribe.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setTranscribedText('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioFile);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await speechToText({
          audioDataUri: base64Audio,
        });
        setTranscribedText(result.extractedText);
        setIsLoading(false);
      };
      reader.onerror = (error) => {
        console.error("File reading error:", error);
        throw new Error("Failed to read the audio file.");
      }
    } catch (error: any) {
      console.error("Transcription process error:", error);
      toast({ title: 'Transcription Failed', description: error.message || 'Could not transcribe the audio.', variant: 'destructive' });
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!transcribedText) return;
    navigator.clipboard.writeText(transcribedText);
    toast({ title: "Copied to clipboard!" });
  };
  
  const handleClear = () => {
    setAudioFile(null);
    setTranscribedText('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>Upload Your Audio</CardTitle>
            </CardHeader>
            <CardContent>
                <div 
                    className={cn("w-full aspect-video border-2 border-dashed rounded-lg text-center cursor-pointer flex items-center justify-center relative transition-colors", 
                        isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:bg-muted/50'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*,video/mp4" />
                    {audioFile ? (
                        <div className="p-4 text-center">
                            <FileText className="mx-auto h-12 w-12 text-primary mb-2" />
                            <p className="font-semibold truncate">{audioFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click or drag audio file to upload</p>
                            <p className="text-xs text-muted-foreground">(MP3, WAV, WEBM, MP4 | Max 10MB)</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
        <Button onClick={handleTranscribe} disabled={isLoading || !audioFile} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
            Transcribe Audio
        </Button>
      </div>

       {(isLoading || transcribedText) && (
            <Card>
                <CardHeader>
                    <CardTitle>Transcribed Text</CardTitle>
                    <CardDescription>The text recognized from your audio will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        id="transcribed-text"
                        value={transcribedText}
                        readOnly
                        placeholder={isLoading ? "Analyzing your audio, please wait..." : "Transcription will appear here..."}
                        className="min-h-[300px] bg-muted"
                    />
                    {isLoading && (
                        <div className="space-y-2 mt-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={handleCopy} disabled={!transcribedText || isLoading}>
                            <Copy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleClear} disabled={!audioFile && !transcribedText}>
                            <Trash2 className="mr-2 h-4 w-4" /> Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>
       )}
    </div>
  );
}
