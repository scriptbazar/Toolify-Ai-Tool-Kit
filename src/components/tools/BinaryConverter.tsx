
'use client';

import { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Binary } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';

export function BinaryConverter() {
  const [text, setText] = useState('');
  const [binary, setBinary] = useState('');
  const [lastEdited, setLastEdited] = useState<'text' | 'binary' | null>(null);
  const { toast } = useToast();

  const toBinary = (str: string): string => {
    return str.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  };

  const fromBinary = (bin: string): string => {
    // Clean up binary string: remove non-binary characters and ensure proper spacing
    const cleanedBin = bin.replace(/[^01\s]/g, '').replace(/\s+/g, ' ').trim();
    if (!cleanedBin) return '';
    try {
      return cleanedBin.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
    } catch (e) {
      // Return an empty string or some error indicator if binary is invalid
      return 'Invalid binary string';
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setBinary(toBinary(newText));
    setLastEdited('text');
  };

  const handleBinaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBinary = e.target.value;
    setBinary(newBinary);
    const result = fromBinary(newBinary);
    if (result !== 'Invalid binary string') {
      setText(result);
    }
    setLastEdited('binary');
  };

  const handleCopy = (content: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setText('');
    setBinary('');
    setLastEdited(null);
  };

  return (
    <div className="space-y-4">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="text-input">Text</Label>
                <Textarea
                id="text-input"
                value={text}
                onChange={handleTextChange}
                placeholder="Enter text..."
                className="min-h-[250px] font-mono"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="binary-output">Binary</Label>
                <Textarea
                id="binary-output"
                value={binary}
                onChange={handleBinaryChange}
                placeholder="01001000 01100101 01101100 01101100 01101111"
                className="min-h-[250px] font-mono"
                />
            </div>
       </div>
       <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => handleCopy(lastEdited === 'binary' ? text : binary)} disabled={!text && !binary}>
            <Copy className="mr-2 h-4 w-4" /> Copy Result
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClear} disabled={!text && !binary}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
       </div>
    </div>
  );
}
