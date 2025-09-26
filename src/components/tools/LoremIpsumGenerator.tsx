
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { generateLoremIpsum } from '@/ai/flows/lorem-ipsum-generator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function LoremIpsumGenerator() {
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateLoremIpsum({
        count,
        type,
        topic: topic || undefined,
      });
      setText(result.text);
      toast({
        title: 'Generated!',
        description: `Generated ${count} ${type} of text.`,
      });
    } catch (error: any) {
        toast({
            title: 'Generation Failed',
            description: error.message || 'Could not generate text.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
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
    setTopic('');
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="topic-input">Topic (Optional)</Label>
                    <Input 
                        id="topic-input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., space exploration, ancient Rome"
                    />
                     <p className="text-xs text-muted-foreground">Leave blank for traditional "Lorem Ipsum".</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type-select">Generate Type</Label>
                            <Select value={type} onValueChange={(val) => setType(val as any)}>
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
            </CardContent>
        </Card>
       <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Text
        </Button>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor="text-output">Generated Text</Label>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copy to clipboard" disabled={!text}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                </Button>
                <Button variant="destructive" size="icon" onClick={handleClear} title="Clear text" disabled={!text}>
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
