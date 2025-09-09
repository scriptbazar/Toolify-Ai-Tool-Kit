
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, UploadCloud, Mic, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiVoiceClone } from '@/ai/flows/ai-voice-cloning';

export function AiVoiceCloning() {
  const [textToSpeak, setTextToSpeak] = useState('Hello, this is a sample of my cloned voice.');
  const [voiceSample, setVoiceSample] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav' || file.type === 'audio/webm')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: 'File too large', description: 'Please upload an audio file smaller than 5MB.', variant: 'destructive'});
        return;
      }
      setVoiceSample(file);
    } else if (file) {
      toast({ title: 'Invalid File Type', description: 'Please upload a valid audio file (MP3, WAV, WEBM).', variant: 'destructive'});
    }
  };

  const handleGenerate = async () => {
    if (!voiceSample) {
      toast({ title: 'Voice sample required', description: 'Please upload an audio sample of your voice.', variant: 'destructive' });
      return;
    }
    if (!textToSpeak.trim()) {
      toast({ title: 'Text is required', description: 'Please enter some text to generate speech.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setAudioUrl(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(voiceSample);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await aiVoiceClone({
          textToSpeak,
          voiceSampleDataUri: base64Audio,
        });
        setAudioUrl(result.audioDataUri);
        toast({ title: 'Speech Generated!', description: 'Your cloned voice has spoken.' });
      };
    } catch (error: any) {
      toast({ title: 'Generation Failed', description: error.message || 'Could not generate speech.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voice-sample-upload" className="flex items-center gap-2"><Mic className="h-5 w-5"/>1. Upload Voice Sample</Label>
             <div 
                className="w-full aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/mpeg,audio/wav,audio/webm" />
                {voiceSample ? (
                    <div className="p-4 text-center">
                        <User className="mx-auto h-12 w-12 text-primary mb-2" />
                        <p className="font-semibold truncate">{voiceSample.name}</p>
                        <p className="text-xs text-muted-foreground">{(voiceSample.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click or drag audio file</p>
                        <p className="text-xs text-muted-foreground">(MP3, WAV, WEBM | Max 5MB)</p>
                    </div>
                )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-speak">2. Enter Text to Speak</Label>
            <Textarea
              id="text-to-speak"
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              placeholder="Enter the text you want the cloned voice to say..."
              className="min-h-[150px] resize-y"
            />
          </div>
          <Button onClick={handleGenerate} disabled={isLoading || !voiceSample} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Speech
          </Button>
        </div>
      </div>

       {audioUrl && (
        <div className="pt-4 border-t">
          <Label className="text-lg font-semibold">Generated Audio</Label>
          <audio controls src={audioUrl} className="w-full mt-2">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
