
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Eraser } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function EmojiRemover() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const { toast } = useToast();

  const handleRemoveEmojis = () => {
    if (!inputText.trim()) {
      toast({ title: "Input is empty!", description: "Please enter some text to remove emojis.", variant: "destructive" });
      return;
    }
    // Comprehensive regex to remove most emojis and symbols
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    const cleanedText = inputText.replace(emojiRegex, '');
    setOutputText(cleanedText);
    toast({ title: 'Emojis Removed!' });
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
    <div className="space-y-6">
       <Card>
        <CardHeader>
            <CardTitle>Emoji Remover Tool</CardTitle>
            <CardDescription>Paste your text below to instantly remove all emojis.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
                <Label htmlFor="input-text">Original Text</Label>
                <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste text with emojis here... 😀👍🎉"
                className="min-h-[250px]"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="output-text">Text Without Emojis</Label>
                <Textarea
                id="output-text"
                value={outputText}
                readOnly
                placeholder="Cleaned text will appear here..."
                className="min-h-[250px] bg-muted"
                />
            </div>
        </CardContent>
       </Card>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleRemoveEmojis} className="w-full">
                <Eraser className="mr-2 h-4 w-4" /> Remove Emojis
            </Button>
            <Button variant="outline" onClick={handleCopy} disabled={!outputText} className="w-full">
                <Copy className="mr-2 h-4 w-4" /> Copy Result
            </Button>
            <Button variant="destructive" onClick={handleClear} disabled={!inputText && !outputText} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All
            </Button>
        </div>
    </div>
  );
}
