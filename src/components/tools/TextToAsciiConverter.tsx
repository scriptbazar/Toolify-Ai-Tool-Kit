
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Binary, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TextToAsciiConverter() {
  const [textInput, setTextInput] = useState('');
  const [asciiOutput, setAsciiOutput] = useState('');
  const [separator, setSeparator] = useState(' ');
  const { toast } = useToast();

  const handleConvert = () => {
    if (!textInput.trim()) {
      toast({ title: 'Input is empty!', description: 'Please enter some text to convert.', variant: 'destructive' });
      return;
    }
    try {
      const ascii = textInput
        .split('')
        .map(char => char.charCodeAt(0))
        .join(separator);
      setAsciiOutput(ascii);
    } catch (e) {
      toast({ title: 'Conversion Error', description: 'Could not convert the input text.', variant: 'destructive' });
    }
  };

  const handleCopy = () => {
    if (!asciiOutput) return;
    navigator.clipboard.writeText(asciiOutput);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setTextInput('');
    setAsciiOutput('');
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
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Label htmlFor="separator">Separator:</Label>
                <select id="separator" value={separator} onChange={e => setSeparator(e.target.value)} className="p-2 border rounded-md">
                    <option value=" ">Space</option>
                    <option value=",">Comma</option>
                    <option value=";">Semicolon</option>
                </select>
            </div>
            <Button onClick={handleConvert}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Convert to ASCII
            </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ascii-output">ASCII Output</Label>
        <Textarea
          id="ascii-output"
          value={asciiOutput}
          readOnly
          placeholder="ASCII codes will appear here..."
          className="min-h-[250px] font-mono bg-muted"
        />
         <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!asciiOutput}>
                <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClear} disabled={!textInput && !asciiOutput}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
        </div>
      </div>
    </div>
  );
}

    