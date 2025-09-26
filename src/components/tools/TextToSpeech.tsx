
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Volume2, Loader2, PlayCircle, User, UserCog, Bot, Mic, Speaker, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const allVoices = [
  { value: 'Algenib', label: 'Male Voice 1', gender: 'Male' },
  { value: 'Canopus', label: 'Male Voice 2', gender: 'Male' },
  { value: 'Sirius', label: 'Male Voice 3', gender: 'Male' },
  { value: 'Procyon', label: 'Male Voice 4', gender: 'Male' },
  { value: 'Achernar', label: 'Female Voice 1', gender: 'Female' },
  { value: 'Cygni', label: 'Female Voice 2', gender: 'Female' },
  { value: 'Electra', label: 'Female Voice 3', gender: 'Female' },
  { value: 'Navi', label: 'Female Voice 4', gender: 'Female' },
  { value: 'Salm', label: 'Female Voice 5', gender: 'Female' },
  { value: 'Shaula', label: 'Female Voice 6', gender: 'Female' },
];

interface SpeakerConfig {
  [key: string]: { name: string; gender: string; };
}

export function TextToSpeech() {
  const [text, setText] = useState('');
  const [isMultiSpeaker, setIsMultiSpeaker] = useState(false);
  const [singleVoice, setSingleVoice] = useState('Algenib');
  const [speakerConfig, setSpeakerConfig] = useState<SpeakerConfig>({
      'Speaker1': { name: 'Algenib', gender: 'Male' },
      'Speaker2': { name: 'Achernar', gender: 'Female' },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sampleLoading, setSampleLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      toast({ title: 'Please enter some text.', variant: 'destructive'});
      return;
    }
    setIsLoading(true);
    setAudioUrl(null);
    try {
      const input = {
          text,
          isMultiSpeaker,
          ...(isMultiSpeaker ? { multiSpeakerConfig: speakerConfig } : { singleVoice: singleVoice }),
      };
      const result = await textToSpeech(input);
      setAudioUrl(result.audioDataUri);
    } catch (error: any) {
      console.error("Text to speech error:", error);
      toast({ title: 'Error generating audio', description: error.message || 'Could not generate audio. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };
  
  const playSample = async (voice: string) => {
    if (sampleLoading) return;
    setSampleLoading(voice);
    try {
        const result = await textToSpeech({ text: "Hello, you can select this voice to generate your audio.", singleVoice: voice });
        const audio = new Audio(result.audioDataUri);
        audio.play();
        audio.onended = () => setSampleLoading(null);
    } catch (error) {
        toast({ title: 'Error', description: 'Could not play voice sample.', variant: 'destructive'});
        setSampleLoading(null);
    }
  }

  const handleSpeakerVoiceChange = (speaker: string, voiceName: string, voiceGender: string) => {
      setSpeakerConfig(prev => ({ ...prev, [speaker]: { name: voiceName, gender: voiceGender } }));
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Enter Your Text</CardTitle>
          <CardDescription>Type or paste the text you want to convert to speech.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="tts-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isMultiSpeaker ? "Speaker1: Hello, how are you?\nSpeaker2: I'm fine, thank you!" : "Enter text to convert to speech..."}
            className="min-h-[150px] resize-y"
          />
        </CardContent>
       </Card>

       <Card>
          <CardHeader>
            <CardTitle>Configure Voice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="multi-speaker-toggle" className="text-base font-medium flex items-center">
                      <Speaker className="mr-2 h-5 w-5"/>
                      Enable Multi-Speaker Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                      Use "Speaker1:", "Speaker2:", etc., in your text.
                  </p>
                </div>
                <Switch id="multi-speaker-toggle" checked={isMultiSpeaker} onCheckedChange={setIsMultiSpeaker} />
              </div>
              
              {!isMultiSpeaker ? (
                  <div className="space-y-2">
                    <Label>Select Voice Model</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allVoices.map(v => (
                            <Card 
                                key={v.value} 
                                onClick={() => setSingleVoice(v.value)}
                                className={cn("cursor-pointer transition-all", singleVoice === v.value ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50')}
                            >
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {v.gender === 'Male' ? <UserCog className="h-6 w-6 text-primary"/> : <User className="h-6 w-6 text-primary"/>}
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
              ) : (
                  <div className="space-y-4">
                     {Object.entries(speakerConfig).map(([speaker, voice]) => (
                        <div key={speaker} className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                           <p className="font-semibold">{speaker}</p>
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        {voice.name} ({voice.gender})
                                        <ChevronDown className="ml-2 h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {allVoices.map(v => (
                                        <DropdownMenuItem key={v.value} onSelect={() => handleSpeakerVoiceChange(speaker, v.value, v.gender)}>
                                            {v.label} ({v.gender})
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                     ))}
                  </div>
              )}
          </CardContent>
       </Card>

      <Button onClick={handleGenerateAudio} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
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
