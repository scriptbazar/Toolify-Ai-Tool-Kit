
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Volume2, XCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reverseMorseCodeMap } from '@/lib/morse-code';

export function MorseToTextTranslator() {
  const [morseInput, setMorseInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    translateToText();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morseInput]);

  const translateToText = () => {
    if (!morseInput.trim()) {
      setTextOutput('');
      setError(null);
      return;
    }
    
    const words = morseInput.trim().split(' / ');
    let decodedText = '';
    let invalidCode = null;

    for (const word of words) {
        const letters = word.split(' ');
        let decodedWord = '';
        for (const letter of letters) {
            if (reverseMorseCodeMap[letter]) {
                decodedWord += reverseMorseCodeMap[letter];
            } else if (letter.trim() !== '') {
                invalidCode = letter;
                break;
            }
        }
        if (invalidCode) break;
        decodedText += decodedWord + ' ';
    }

    if (invalidCode) {
      setError(`Invalid Morse code sequence: "${invalidCode}"`);
      setTextOutput('');
    } else {
      setError(null);
      setTextOutput(decodedText.trim());
    }
  };

  const handleCopy = () => {
    if (!textOutput) return;
    navigator.clipboard.writeText(textOutput);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setMorseInput('');
    setTextOutput('');
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="morse-input" className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary"/> Morse Code
                </Label>
                <Textarea
                id="morse-input"
                value={morseInput}
                onChange={(e) => setMorseInput(e.target.value)}
                placeholder=".... . .-.. .-.. --- / .-- --- .-. .-.. -.."
                className="min-h-[250px] font-mono"
                />
                {error && (
                    <div className="text-sm text-red-500 flex items-center gap-1">
                        <XCircle className="h-4 w-4" /> {error}
                    </div>
                )}
            </div>
             <div className="flex flex-wrap gap-2">
                <Button variant="destructive" onClick={handleClear} disabled={!morseInput}><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="text-output">Translated Text</Label>
            <Textarea
                id="text-output"
                value={textOutput}
                readOnly
                placeholder="Text will appear here"
                className="min-h-[250px] bg-muted"
            />
            <div className="flex justify-end">
                <Button variant="outline" onClick={handleCopy} disabled={!textOutput}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
            </div>
        </div>
    </div>
  );
}
