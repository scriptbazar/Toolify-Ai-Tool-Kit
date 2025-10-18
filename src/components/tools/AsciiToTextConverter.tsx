
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Binary, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AsciiToTextConverter() {
  const [asciiInput, setAsciiInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const { toast } = useToast();

  const handleConvert = () => {
    if (!asciiInput.trim()) {
      toast({ title: 'Input is empty!', description: 'Please enter some ASCII code to convert.', variant: 'destructive' });
      return;
    }
    try {
      const text = asciiInput
        .split(/[\s,]+/)
        .filter(code => code !== '')
        .map(code => String.fromCharCode(parseInt(code, 10)))
        .join('');
      setTextOutput(text);
    } catch (e) {
      toast({ title: 'Conversion Error', description: 'Invalid ASCII format. Ensure values are numbers separated by spaces or commas.', variant: 'destructive' });
    }
  };

  const handleCopy = () => {
    if (!textOutput) return;
    navigator.clipboard.writeText(textOutput);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setAsciiInput('');
    setTextOutput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-2">
        <Label htmlFor="ascii-input">ASCII Input</Label>
        <Textarea
          id="ascii-input"
          value={asciiInput}
          onChange={(e) => setAsciiInput(e.target.value)}
          placeholder="e.g., 72 101 108 108 111"
          className="min-h-[250px] font-mono"
        />
        <Button onClick={handleConvert} className="w-full">
            <ArrowRight className="mr-2 h-4 w-4" />
            Convert to Text
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="text-output">Text Output</Label>
        <Textarea
          id="text-output"
          value={textOutput}
          readOnly
          placeholder="Text will appear here..."
          className="min-h-[250px] font-mono bg-muted"
        />
         <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!textOutput}>
                <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClear} disabled={!asciiInput && !textOutput}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
        </div>
      </div>
    </div>
  );
}

    