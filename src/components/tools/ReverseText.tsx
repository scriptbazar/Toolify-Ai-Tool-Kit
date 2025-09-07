
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ReverseText() {
  const [inputText, setInputText] = useState('');
  const { toast } = useToast();

  const reverseAll = () => setInputText(inputText.split('').reverse().join(''));
  const reverseWords = () => setInputText(inputText.split(' ').reverse().join(' '));
  const reverseLetters = () => setInputText(inputText.split(' ').map(word => word.split('').reverse().join('')).join(' '));
  const flipText = () => {
    const flipDict: { [key: string]: string } = { 'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'y': 'ʎ', 'z': 'z', 'A': '∀', 'C': 'Ɔ', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H', 'J': 'ſ', 'K': 'K', 'L': '˥', 'M': 'W', 'P': 'P', 'T': '┴', 'U': '∩', 'V': 'Λ', 'Y': '⅄', '.': '˙', ',': "'", "'": ',', '`': ',', '"': ',,', '_': '‾', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '?': '¿', '!': '¡', '&': '⅋', '<': '>', '>': '<' };
    setInputText(inputText.split('').map(char => flipDict[char] || char).reverse().join(''));
  };

  const handleCopy = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setInputText('');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="input-text">Your Text</Label>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste text to be reversed here..."
          className="min-h-[250px]"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button onClick={reverseAll}>Reverse Text</Button>
        <Button onClick={reverseWords}>Reverse Words</Button>
        <Button onClick={reverseLetters}>Reverse Letters</Button>
        <Button onClick={flipText}>Flip Text</Button>
      </div>
       <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button variant="outline" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
        <Button variant="destructive" size="icon" onClick={handleClear}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
