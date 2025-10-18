'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Binary, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TextToBinary() {
  const [textInput, setTextInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const { toast } = useToast();

  const handleConvert = () => {
    if (!textInput.trim()) {
      toast({ title: 'Input is empty!', description: 'Please enter some text to convert.', variant: 'destructive' });
      return;
    }
    try {
      const binary = textInput
        .split('')
        .map(char => {
          return char.charCodeAt(0).toString(2).padStart(8, '0');
        })
        .join(' ');
      setBinaryOutput(binary);
    } catch (e) {
      toast({ title: 'Conversion Error', description: 'Could not convert the input text.', variant: 'destructive' });
    }
  };

  const handleCopy = () => {
    if (!binaryOutput) return;
    navigator.clipboard.writeText(binaryOutput);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setTextInput('');
    setBinaryOutput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-2">
        <Label htmlFor="text-input">Text Input</Label>
        <Textarea
          id="text-input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="e.g., Hello"
          className="min-h-[250px] font-mono"
        />
        <Button onClick={handleConvert} className="w-full">
            <ArrowRight className="mr-2 h-4 w-4" />
            Convert to Binary
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="binary-output">Binary Output</Label>
        <Textarea
          id="binary-output"
          value={binaryOutput}
          readOnly
          placeholder="Binary code will appear here..."
          className="min-h-[250px] font-mono bg-muted"
        />
         <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!binaryOutput}>
                <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClear} disabled={!textInput && !binaryOutput}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
        </div>
      </div>
    </div>
  );
}
