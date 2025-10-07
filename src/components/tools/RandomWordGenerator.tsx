
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Trash2, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { wordList } from '@/lib/word-list';


export function RandomWordGenerator() {
  const [count, setCount] = useState(10);
  const [generatedWords, setGeneratedWords] = useState('');
  const { toast } = useToast();

  const handleGenerate = () => {
    let words = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      words.push(wordList[randomIndex]);
    }
    setGeneratedWords(words.join(', '));
  };

  const handleCopy = () => {
    if (!generatedWords) return;
    navigator.clipboard.writeText(generatedWords);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setGeneratedWords('');
    setCount(10);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <Label htmlFor="word-count">Number of Words</Label>
          <Input
            id="word-count"
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10)) || 1)}
            min="1"
          />
        </div>
        <Button onClick={handleGenerate} className="w-full">
            <Shuffle className="mr-2 h-4 w-4" />
            Generate Words
        </Button>
      </div>
      <div>
        <Label htmlFor="output-words">Generated Words</Label>
        <Textarea
          id="output-words"
          value={generatedWords}
          readOnly
          className="min-h-[200px] bg-muted"
        />
      </div>
       <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button variant="outline" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
        <Button variant="destructive" size="icon" onClick={handleClear}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
