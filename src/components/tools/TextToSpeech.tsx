
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Volume2, Loader2, PlayCircle, User, UserCog, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';


const voices = [
  { value: 'Algenib', label: 'Female Voice 1', gender: 'Female' },
  { value: 'Muscida', label: 'Female Voice 2', gender: 'Female' },
  { value: 'Achernar', label: 'Male Voice 1', gender: 'Male' },
  { value: 'Enif', label: 'Male Voice 2', gender: 'Male' },
  { value: 'Hadar', label: 'Male Voice 3', gender: 'Male' },
];


export function TextToSpeech() {
  const [text, setText] = useState('');
  const [selectedGender, setSelectedGender] = useState<'Female' | 'Male'>('Female');
  const [selectedVoice, setSelectedVoice] = useState('Algenib');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sampleLoading, setSampleLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredVoices = voices.filter(v => v.gender === selectedGender);
  
  useEffect(() => {
    // When gender changes, reset the selected voice to the first one in the new list
    const firstVoiceOfGender = filteredVoices[0]?.value;
    if (firstVoiceOfGender) {
        setSelectedVoice(firstVoiceOfGender);
    }
  }, [selectedGender]);

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      toast({ title: 'Please enter some text.', variant: 'destructive'});
      return;
    }
    setIsLoading(true);
    setAudioUrl(null);
    try {
      const result = await textToSpeech({ text, voice: selectedVoice });
      setAudioUrl(result.audioDataUri);
    } catch (error: any) {
      console.error("Text to speech error:", error);
      toast({ title: 'Error generating audio', description: 'Could not generate audio. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };
  
  const playSample = async (voice: string) => {
    if (sampleLoading) return;
    setSampleLoading(voice);
    try {
        const result = await textToSpeech({ text: "Hello, you can select this voice to generate your audio.", voice });
        const audio = new Audio(result.audioDataUri);
        audio.play();
        audio.onended = () => setSampleLoading(null);
    } catch (error) {
        toast({ title: 'Error', description: 'Could not play voice sample.', variant: 'destructive'});
        setSampleLoading(null);
    }
  }


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
       <div className="space-y-4">
          <div className="space-y-2">
            <Label>1. Select Voice Gender</Label>
            <div className="grid grid-cols-2 gap-4">
                <Button variant={selectedGender === 'Female' ? 'default' : 'outline'} onClick={() => setSelectedGender('Female')}>
                    <User className="mr-2 h-5 w-5"/> Female
                </Button>
                <Button variant={selectedGender === 'Male' ? 'default' : 'outline'} onClick={() => setSelectedGender('Male')}>
                    <UserCog className="mr-2 h-5 w-5"/> Male
                </Button>
            </div>
          </div>
           <div className="space-y-2">
            <Label>2. Select Voice Model</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredVoices.map(v => (
                    <Card 
                        key={v.value} 
                        onClick={() => setSelectedVoice(v.value)}
                        className={cn("cursor-pointer transition-all", selectedVoice === v.value ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50')}
                    >
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Bot className="h-6 w-6 text-primary"/>
                                <span className="font-semibold">{v.label}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); playSample(v.value); }} disabled={!!sampleLoading}>
                                {sampleLoading === v.value ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5"/>}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
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
    </div>
  );
}
