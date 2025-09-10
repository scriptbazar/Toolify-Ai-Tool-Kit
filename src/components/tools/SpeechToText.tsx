
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Copy, Mic, Loader2, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { speechToText } from '@/ai/flows/speech-to-text';

export function SpeechToText() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav' || file.type === 'audio/webm' || file.type === 'audio/mp4')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: 'File too large', description: 'Please upload an audio file smaller than 10MB.', variant: 'destructive'});
        return;
      }
      setAudioFile(file);
      setTranscribedText('');
    } else if (file) {
      toast({ title: 'Invalid File Type', description: 'Please upload a valid audio file (MP3, WAV, WEBM, MP4).', variant: 'destructive'});
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
        setTranscribedText(result.transcribedText);
      };
    } catch (error: any) {
      toast({ title: 'Transcription Failed', description: error.message || 'Could not transcribe the audio.', variant: 'destructive' });
    } finally {
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
  }

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*" />
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

      <Button onClick={handleTranscribe} disabled={isLoading || !audioFile} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
        Transcribe Audio
      </Button>

      <div className="space-y-2">
        <Label htmlFor="transcribed-text">Transcribed Text</Label>
        <Textarea
          id="transcribed-text"
          value={transcribedText}
          readOnly
          placeholder="Transcription will appear here..."
          className="min-h-[200px] bg-muted"
        />
        <div className="flex justify-end gap-2">
           <Button variant="outline" size="sm" onClick={handleCopy} disabled={!transcribedText}>
                <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClear} disabled={!audioFile && !transcribedText}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
        </div>
      </div>
    </div>
  );
}
