
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, ArrowRightLeft, Volume2, Lightbulb, Pause, Play, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { morseCodeMap } from '@/lib/morse-code';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';

export function TextToMorseCode() {
  const [textInput, setTextInput] = useState('');
  const [morseOutput, setMorseOutput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [wpm, setWpm] = useState(20);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    translateToMorse();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textInput]);

  const translateToMorse = () => {
    const morse = textInput
      .toUpperCase()
      .split('')
      .map(char => {
        if (morseCodeMap[char]) {
          return morseCodeMap[char];
        } else if (char === ' ') {
          return '/';
        }
        return '';
      })
      .join(' ')
      .replace(/ \/ /g, '/'); // Remove extra spaces around slashes
    setMorseOutput(morse);
  };
  
  const playMorseCode = async () => {
      if (isPlaying) {
          stopPlayback();
          return;
      }

      setIsPlaying(true);
      if (!audioContextRef.current) {
          audioContextRef.current = new window.AudioContext();
      }
      const audioCtx = audioContextRef.current;
      
      const dot = 1.2 / wpm;
      const dash = dot * 3;
      const symbolGap = dot;
      const letterGap = dot * 3;
      const wordGap = dot * 7;
      
      let currentTime = audioCtx.currentTime;

      for (const char of morseOutput) {
          switch(char) {
              case '.':
                  playTone(currentTime, dot);
                  setIsFlashing(true);
                  await sleep(dot * 1000);
                  setIsFlashing(false);
                  currentTime += dot;
                  break;
              case '-':
                  playTone(currentTime, dash);
                  setIsFlashing(true);
                  await sleep(dash * 1000);
                  setIsFlashing(false);
                  currentTime += dash;
                  break;
              case ' ':
                  await sleep(letterGap * 1000);
                  currentTime += letterGap;
                  break;
              case '/':
                  await sleep(wordGap * 1000);
                  currentTime += wordGap;
                  break;
          }
          await sleep(symbolGap * 1000);
          currentTime += symbolGap;
          
          if (!isPlaying) break; // Check if stop was requested during sleep
      }
      stopPlayback();
  };

  const playTone = (startTime: number, duration: number) => {
      const audioCtx = audioContextRef.current;
      if (!audioCtx) return;

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(1, startTime + 0.01);
      
      oscillator.frequency.value = 600; // A common morse code frequency
      oscillator.type = 'sine';
      oscillator.start(startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);
      oscillator.stop(startTime + duration);
  };
  
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsFlashing(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const sleep = (ms: number) => {
      return new Promise(resolve => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(resolve, ms);
      });
  }


  const handleCopy = () => {
    if (!morseOutput) return;
    navigator.clipboard.writeText(morseOutput);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setTextInput('');
    setMorseOutput('');
  };
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTextInput(text);
    } catch (err) {
      toast({ title: 'Paste Error', description: 'Could not read from clipboard.', variant: 'destructive'});
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="text-input">Text to Translate</Label>
                <Textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text here..."
                className="min-h-[250px]"
                />
            </div>
             <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handlePaste}><ClipboardPaste className="mr-2 h-4 w-4"/>Paste</Button>
                <Button variant="destructive" onClick={handleClear} disabled={!textInput}><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
            </div>
        </div>
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="morse-output">Morse Code Output</Label>
                <Textarea
                    id="morse-output"
                    value={morseOutput}
                    readOnly
                    placeholder=".... . .-.. .-.. --- / .-- --- .-. .-.. -.."
                    className="min-h-[250px] bg-muted font-mono"
                />
            </div>
            <div className="flex justify-between items-center gap-4">
                 <Button variant="outline" onClick={handleCopy} disabled={!morseOutput} className="flex-1">
                    <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button onClick={playMorseCode} disabled={!morseOutput} className="flex-1">
                    {isPlaying ? <Pause className="mr-2 h-4 w-4"/> : <Volume2 className="mr-2 h-4 w-4" />}
                    {isPlaying ? 'Stop' : 'Play Sound'}
                </Button>
            </div>
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-5 w-5"/>Visual Signal</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="w-full h-16 rounded-md flex items-center justify-center bg-muted">
                        <div className={cn("w-12 h-12 rounded-full transition-colors", isFlashing ? 'bg-yellow-300' : 'bg-foreground/20')}/>
                    </div>
                     <div className="space-y-2 mt-4">
                        <Label>Speed: {wpm} WPM</Label>
                        <Slider value={[wpm]} onValueChange={([val]) => setWpm(val)} min={5} max={40} step={1} />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
