
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BinaryConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const { toast } = useToast();

  const toBinary = (text: string) => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  };

  const fromBinary = (binary: string) => {
    return binary.split(' ').map(bin => {
      return String.fromCharCode(parseInt(bin, 2));
    }).join('');
  };

  const handleEncode = () => {
    setOutputText(toBinary(inputText));
  };
  
  const handleDecode = () => {
      try {
        setOutputText(fromBinary(inputText));
      } catch (e) {
          toast({ title: 'Invalid Binary', description: 'Please check your binary string.', variant: 'destructive'});
      }
  }

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="input-text">Input (Text or Binary)</Label>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text or binary code..."
          className="min-h-[150px] font-mono"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleEncode} className="flex-1">Text to Binary</Button>
        <Button onClick={handleDecode} className="flex-1">Binary to Text</Button>
      </div>
      <div>
        <Label htmlFor="output-text">Output</Label>
        <Textarea
          id="output-text"
          value={outputText}
          readOnly
          className="min-h-[150px] font-mono bg-muted"
        />
      </div>
       <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button variant="outline" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
        <Button variant="destructive" size="icon" onClick={handleClear}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
