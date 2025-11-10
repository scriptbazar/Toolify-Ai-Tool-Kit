
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '../ui/select';
import { Slider } from '../ui/slider';
import { Loader2, Play, Pause, Download, Wand2, RefreshCw } from 'lucide-react';
import { generateSampleText } from '@/ai/flows/ai-writer';
import { textToSpeechFlow } from '@/ai/flows/text-to-speech';

// Pre-defined voices available in the Google TTS model with gender
const availableVoices = [
  { name: 'Algenib', gender: 'Male' },
  { name: 'Achernar', gender: 'Male' },
  { name: 'Enif', gender: 'Female' },
  { name: 'Erakis', gender: 'Female' },
  { name: 'Canopus', gender: 'Male' },
  { name: 'Hadar', gender: 'Male' },
  { name: 'Rigel', gender: 'Male' },
  { name: 'Antares', gender: 'Male' },
  { name: 'Arcturus', gender: 'Male' },
  { name: 'Spica', gender: 'Female' },
];

const maleVoices = availableVoices.filter(v => v.gender === 'Male');
const femaleVoices = availableVoices.filter(v => v.gender === 'Female');


export function TextToSpeechTool() {
    const [text, setText] = useState('Hello, welcome to ToolifyAI. You can convert any text into natural-sounding speech.');
    const [voice, setVoice] = useState<string>('Algenib');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Cleanup audio object on component unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Reset audio when text or voice changes
    useEffect(() => {
        setAudioUrl(null);
        setIsSpeaking(false);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [text, voice]);


    const handleGenerateSample = async () => {
        setIsLoading(true);
        try {
            const result = await generateSampleText();
            setText(result.sampleText);
            toast({ title: 'Sample Text Generated!' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateSpeech = async () => {
        if (!text.trim()) {
            toast({ title: 'No text to speak', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        setIsSpeaking(false);
        setAudioUrl(null);
        if (audioRef.current) {
            audioRef.current.pause();
        }

        try {
            const result = await textToSpeechFlow({ text, voice });
            setAudioUrl(result.audioDataUri);
            toast({ title: 'Speech Generated!', description: 'Click the Play button to listen.'});

        } catch (error: any) {
             toast({ title: 'Speech Generation Failed', description: error.message, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayPause = () => {
        if (!audioUrl) {
            handleGenerateSpeech().then(() => {
                // The new audio URL will be set, let's use an effect to play it.
            });
            return;
        }

        if (!audioRef.current || audioRef.current.src !== audioUrl) {
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onended = () => setIsSpeaking(false);
        }
        
        if (isSpeaking) {
            audioRef.current.pause();
            setIsSpeaking(false);
        } else {
            audioRef.current.play();
            setIsSpeaking(true);
        }
    };
    
    // Effect to auto-play after generation if it was triggered by the play button
    useEffect(() => {
        if (audioUrl && !isSpeaking && !isLoading) {
           // This logic is simplified; direct play is handled in handlePlayPause now.
        }
    }, [audioUrl, isSpeaking, isLoading]);


    const handleDownload = () => {
        if (!audioUrl) return;
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = 'speech.wav'; // The flow now generates WAV
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="text-input">Text to Convert</Label>
                 <div className="relative">
                    <Textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter the text you want to convert to speech..."
                        className="min-h-[200px]"
                    />
                     <Button onClick={handleGenerateSample} variant="ghost" size="icon" className="absolute bottom-2 right-2 h-8 w-8" disabled={isLoading}>
                         {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
                     </Button>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 <div className="space-y-2">
                    <Label htmlFor="voice-select">Voice</Label>
                    <Select value={voice} onValueChange={setVoice}>
                        <SelectTrigger id="voice-select"><SelectValue placeholder="Select a voice..."/></SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Male Voices</SelectLabel>
                                {maleVoices.map((v) => <SelectItem key={v.name} value={v.name}>{v.name} (Male)</SelectItem>)}
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>Female Voices</SelectLabel>
                                {femaleVoices.map((v) => <SelectItem key={v.name} value={v.name}>{v.name} (Female)</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                 <Button onClick={handleGenerateSpeech} className="flex-1" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Generating...' : 'Generate Speech'}
                </Button>
                <Button onClick={handlePlayPause} className="flex-1" disabled={!audioUrl || isLoading}>
                    {isSpeaking ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4" />}
                    {isSpeaking ? 'Pause' : 'Play'}
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={!audioUrl || isLoading}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Audio
                </Button>
            </div>
        </div>
    );
}

export default TextToSpeechTool;
