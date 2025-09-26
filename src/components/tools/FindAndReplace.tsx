
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Trash2, SearchCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FindAndReplace() {
  const [inputText, setInputText] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const { toast } = useToast();

  const handleReplace = () => {
    if (!inputText || !findText) {
      toast({
        title: 'Input required',
        description: 'Please provide the text to search in and the text to find.',
        variant: 'destructive',
      });
      return;
    }
    try {
        const flags = isCaseSensitive ? 'g' : 'gi';
        const regex = new RegExp(findText, flags);
        const newText = inputText.replace(regex, replaceText);
        setOutputText(newText);
        toast({ title: 'Text Replaced!' });
    } catch (error) {
        toast({ title: 'Invalid Find Text', description: 'The text in the "Find" field is not a valid regular expression.', variant: 'destructive' });
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setInputText('');
    setFindText('');
    setReplaceText('');
    setOutputText('');
  };

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="input-text">Original Text</Label>
                <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the text you want to modify here..."
                className="min-h-[200px]"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="output-text">Replaced Text</Label>
                <Textarea
                id="output-text"
                value={outputText}
                readOnly
                placeholder="The result will appear here..."
                className="min-h-[200px] bg-muted"
                />
            </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="find-text">Find</Label>
          <Input
            id="find-text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Text to find"
          />
        </div>
        <div>
          <Label htmlFor="replace-text">Replace With</Label>
          <Input
            id="replace-text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Text to replace with"
          />
        </div>
      </div>
       <div className="flex items-center space-x-2">
            <Checkbox id="case-sensitive" checked={isCaseSensitive} onCheckedChange={(checked) => setIsCaseSensitive(Boolean(checked))} />
            <Label htmlFor="case-sensitive">Case Sensitive</Label>
        </div>
       <Button onClick={handleReplace} className="w-full">
            <SearchCode className="mr-2 h-4 w-4" />
            Find & Replace All
        </Button>
       <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button variant="outline" size="icon" onClick={handleCopy} disabled={!outputText}>
            <Copy className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={handleClear} disabled={!inputText && !outputText}>
            <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
