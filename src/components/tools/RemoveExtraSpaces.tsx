
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Eraser, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';

export function RemoveExtraSpaces() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [removeLineBreaks, setRemoveLineBreaks] = useState(false);
  const { toast } = useToast();

  const handleClean = () => {
    let cleanedText = inputText.replace(/\s+/g, ' ').trim();
    if (removeLineBreaks) {
      cleanedText = cleanedText.replace(/\n/g, ' ');
    }
    setOutputText(cleanedText);
    toast({ title: 'Spaces removed!' });
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-2">
        <Label htmlFor="input-text">Original Text</Label>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste text with extra spaces here..."
          className="min-h-[300px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="output-text">Cleaned Text</Label>
        <Textarea
          id="output-text"
          value={outputText}
          readOnly
          className="min-h-[300px] bg-muted"
        />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center space-x-2">
            <Checkbox id="remove-lines" checked={removeLineBreaks} onCheckedChange={(checked) => setRemoveLineBreaks(Boolean(checked))} />
            <Label htmlFor="remove-lines">Also remove all line breaks</Label>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
             <Button onClick={handleClean} className="w-full">
                <Eraser className="mr-2 h-4 w-4" />
                Remove Extra Spaces
            </Button>
            <Button variant="outline" onClick={handleCopy} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Result
            </Button>
            <Button variant="destructive" onClick={handleClear} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
            </Button>
        </div>
      </div>
    </div>
  );
}
