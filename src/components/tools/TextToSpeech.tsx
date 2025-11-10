
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Loader2, Play, Pause, Download, Wand2 } from 'lucide-react';
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
            
            const audio = new Audio(result.audioDataUri);
            audioRef.current = audio;
            audio.play();
            setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);

        } catch (error: any) {
             toast({ title: 'Speech Generation Failed', description: error.message, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isSpeaking) {
            audioRef.current.pause();
            setIsSpeaking(false);
        } else {
            audioRef.current.play();
            setIsSpeaking(true);
        }
    };

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
                            {availableVoices.map((v) => <SelectItem key={v.name} value={v.name}>{v.name} ({v.gender})</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
                <Button onClick={audioUrl ? handlePlayPause : handleGenerateSpeech} className="flex-1" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isSpeaking ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Generating...' : (isSpeaking ? 'Pause' : (audioUrl ? 'Play Again' : 'Listen'))}
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
