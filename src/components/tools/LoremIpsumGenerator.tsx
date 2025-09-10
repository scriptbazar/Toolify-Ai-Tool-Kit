
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const loremIpsumParagraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const loremIpsumWords = loremIpsumParagraph.split(' ');

export function LoremIpsumGenerator() {
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [type, setType] = useState('paragraphs');
  const { toast } = useToast();

  const handleGenerate = () => {
    let result = '';
    switch (type) {
        case 'paragraphs':
            result = Array(count).fill(loremIpsumParagraph).join('\n\n');
            break;
        case 'sentences':
            // Simple sentence generation for demo
            result = loremIpsumParagraph.repeat(count).split('. ').slice(0, count).join('. ');
            break;
        case 'words':
            result = loremIpsumWords.slice(0, count).join(' ');
            break;
    }
    setText(result);
    toast({
        title: 'Generated!',
        description: `Generated ${count} ${type} of Lorem Ipsum text.`
    });
  };

  const handleCopy = () => {
    if (!text) {
      toast({
        title: 'Nothing to copy!',
        description: 'Please generate some text first.',
        variant: 'destructive',
      });
      return;
    }
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  const handleClear = () => {
    setText('');
    setCount(5);
    setType('paragraphs');
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
               <Label htmlFor="type-select">Generate Type</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type-select">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="paragraphs">Paragraphs</SelectItem>
                        <SelectItem value="sentences">Sentences</SelectItem>
                        <SelectItem value="words">Words</SelectItem>
                    </SelectContent>
                </Select>
           </div>
           <div className="space-y-2">
               <Label htmlFor="count-input">Amount</Label>
               <Input 
                 id="count-input"
                 type="number"
                 value={count}
                 onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                 min="1"
               />
           </div>
       </div>
       <Button onClick={handleGenerate} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate
        </Button>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor="text-output">Generated Text</Label>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copy to clipboard">
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                </Button>
                <Button variant="destructive" size="icon" onClick={handleClear} title="Clear text">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Clear</span>
                </Button>
            </div>
        </div>
        <Textarea
          id="text-output"
          value={text}
          readOnly
          placeholder="Generated text will appear here..."
          className="min-h-[200px] resize-y bg-muted"
        />
      </div>
    </div>
  );
}
