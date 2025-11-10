
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

export function TextToSpeechTool() {
    const [text, setText] = useState('Hello, welcome to ToolifyAI. You can convert any text into natural-sounding speech.');
    const [voice, setVoice] = useState<string | undefined>(undefined);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [pitch, setPitch] = useState(1);
    const [rate, setRate] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const { toast } = useToast();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
                setVoice(defaultVoice?.name);
            }
        };

        loadVoices();
        // Voices may load asynchronously
        window.speechSynthesis.onvoiceschanged = loadVoices;
        
        return () => {
             window.speechSynthesis.cancel();
        }
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
    
    const handlePlay = () => {
        if (isSpeaking) {
            window.speechSynthesis.pause();
            setIsSpeaking(false);
            return;
        }

        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsSpeaking(true);
            return;
        }

        if (!text.trim()) {
            toast({ title: 'No text to speak', variant: 'destructive' });
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices.find(v => v.name === voice);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.pitch = pitch;
        utterance.rate = rate;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech Synthesis Error:", e);
            toast({ title: 'Speech Error', description: e.error, variant: 'destructive'});
            setIsSpeaking(false);
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
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
                            {voices.map((v) => <SelectItem key={v.name} value={v.name}>{v.name} ({v.lang})</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Rate: {rate.toFixed(1)}x</Label>
                        <Slider value={[rate]} onValueChange={([val]) => setRate(val)} min={0.5} max={2} step={0.1} />
                     </div>
                     <div className="space-y-2">
                        <Label>Pitch: {pitch.toFixed(1)}</Label>
                        <Slider value={[pitch]} onValueChange={([val]) => setPitch(val)} min={0.5} max={2} step={0.1} />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handlePlay} className="flex-1">
                    {isSpeaking ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isSpeaking ? 'Pause' : 'Play'}
                </Button>
                <Button variant="outline" className="flex-1" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Download MP3 (Coming Soon)
                </Button>
            </div>
        </div>
    );
}

export default TextToSpeechTool;
