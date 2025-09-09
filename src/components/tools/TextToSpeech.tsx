
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Volume2, Loader2, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';


const voices = [
  { value: 'Algenib', label: 'Female Voice 1', group: 'Female' },
  { value: 'Muscida', label: 'Female Voice 2', group: 'Female' },
  { value: 'Achernar', label: 'Male Voice 1', group: 'Male' },
  { value: 'Enif', label: 'Male Voice 2', group: 'Male' },
  { value: 'Hadar', label: 'Male Voice 3', group: 'Male' },
];


export function TextToSpeech() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Algenib');
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
    try {
      const result = await textToSpeech({ text, voice });
      setAudioUrl(result.audioDataUri);
    } catch (error: any) {
      console.error("Text to speech error:", error);
      toast({ title: 'Error generating audio', description: 'Could not generate audio. Please try again.', variant: 'destructive' });
    }
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
       <div className="space-y-2">
        <Label htmlFor="voice-select">Select Voice</Label>
        <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger id="voice-select">
                <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Female Voices</SelectLabel>
                    {voices.filter(v => v.group === 'Female').map(v => (
                         <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Male Voices</SelectLabel>
                     {voices.filter(v => v.group === 'Male').map(v => (
                         <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
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
