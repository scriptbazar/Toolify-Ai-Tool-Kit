
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Repeat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export function TextRepeater() {
  const [inputText, setInputText] = useState('');
  const [repeatCount, setRepeatCount] = useState(5);
  const [addNewLine, setAddNewLine] = useState(true);
  const [outputText, setOutputText] = useState('');
  const { toast } = useToast();

  const handleRepeat = () => {
    if (!inputText.trim()) {
        toast({ title: 'Input is empty!', description: 'Please enter some text to repeat.', variant: 'destructive'});
        return;
    }
    if (repeatCount <= 0) {
         toast({ title: 'Invalid count!', description: 'Repetition count must be greater than zero.', variant: 'destructive'});
        return;
    }

    const separator = addNewLine ? '\n' : ' ';
    const result = Array(repeatCount).fill(inputText).join(separator);
    setOutputText(result);
  };

  const handleCopy = () => {
    if (!outputText) {
      toast({
        title: 'Nothing to copy!',
        description: 'Please generate some text first.',
        variant: 'destructive',
      });
      return;
    }
    navigator.clipboard.writeText(outputText);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="input-text">Text to Repeat</Label>
                    <Textarea
                    id="input-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g., Hello World"
                    className="min-h-[100px]"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="repeat-count">How many times to repeat?</Label>
                        <Input 
                            id="repeat-count"
                            type="number"
                            value={repeatCount}
                            onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            min="1"
                        />
                    </div>
                    <div className="flex items-center space-x-2 pb-2">
                        <Checkbox id="add-new-line" checked={addNewLine} onCheckedChange={(checked) => setAddNewLine(Boolean(checked))} />
                        <Label htmlFor="add-new-line" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Add new line
                        </Label>
                    </div>
                </div>
                 <Button onClick={handleRepeat} className="w-full">
                    <Repeat className="mr-2 h-4 w-4" />
                    Repeat Text
                </Button>
            </CardContent>
        </Card>
      
        <Card>
             <CardHeader>
                <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Textarea
                    id="text-output"
                    value={outputText}
                    readOnly
                    placeholder="Repeated text will appear here..."
                    className="min-h-[300px] resize-y bg-muted"
                    />
                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={handleCopy} disabled={!outputText}>
                        <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button variant="destructive" onClick={handleClear} disabled={!inputText && !outputText}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
