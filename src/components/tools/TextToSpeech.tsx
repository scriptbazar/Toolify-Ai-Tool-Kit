
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Volume2, Loader2, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TextToSpeech() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      toast({ title: 'Please enter some text.', variant: 'destructive'});
      return;
    }
    setIsLoading(true);
    setAudioUrl(null);
    // This would be a call to an AI flow in a real app
    await new Promise(resolve => setTimeout(resolve, 1500));
    // const result = await textToSpeechFlow({ text });
    // setAudioUrl(result.audioDataUri);
    toast({ title: 'Audio generation is not implemented yet.' });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tts-input">Text to Convert</Label>
        <Textarea
          id="tts-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="min-h-[150px] resize-y"
        />
      </div>
      <Button onClick={handleGenerateAudio} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
        Generate Audio
      </Button>

      {audioUrl && (
        <div className="pt-4 border-t">
          <Label>Generated Audio</Label>
          <audio controls src={audioUrl} className="w-full mt-2">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
       {!audioUrl && !isLoading && (
         <div className="pt-4 border-t flex flex-col items-center justify-center text-muted-foreground h-24">
            <PlayCircle className="h-8 w-8 mb-2" />
            <p>Your audio will appear here</p>
        </div>
       )}
    </div>
  );
}
