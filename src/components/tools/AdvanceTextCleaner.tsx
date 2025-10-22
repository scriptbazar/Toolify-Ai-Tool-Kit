
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdvanceTextCleaner() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const { toast } = useToast();

  const handleCleanText = () => {
    if (!inputText.trim()) {
      toast({ title: "Input is empty!", description: "Please enter some text to clean.", variant: "destructive" });
      return;
    }

    let cleanedText = inputText;

    // LaTeX commands
    cleanedText = cleanedText.replace(/\\text\{[^\}]*\}/g, '');
    cleanedText = cleanedText.replace(/\\[a-zA-Z]+(\s|{.*})?/g, '');
    
    // Math symbols
    cleanedText = cleanedText.replace(/\$\$|\$/g, '');

    // Formatting markers like **
    cleanedText = cleanedText.replace(/\*\*/g, '');
    
    // Unnecessary brackets
    cleanedText = cleanedText.replace(/\{|\}/g, '');

    // Whitespace optimization
    cleanedText = cleanedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
      
    cleanedText = cleanedText.replace(/\s+/g, ' ');
    cleanedText = cleanedText.replace(/\s+([.,;:—])/g, '$1');

    setOutputText(cleanedText);
    toast({ title: 'Text Cleaned!', description: 'Unnecessary code and formatting have been removed.' });
  };

  const handleCopy = () => {
    if (!outputText) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(outputText);
    toast({ title: '✅ Clean Text Copy हो गया है!', description: 'अब Facebook पर Paste करें।' });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <Card>
        <CardHeader>
            <CardTitle>Codes वाला Text Paste करें</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your formatted or coded text here..."
              className="min-h-[300px]"
            />
            <Button onClick={handleCleanText} className="w-full">
                <Wand2 className="mr-2 h-4 w-4" /> Clean Text Generate करें
            </Button>
        </CardContent>
      </Card>
      
      <Card>
         <CardHeader>
            <CardTitle>Copy करने के लिए Clean Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea
                id="output-text"
                value={outputText}
                readOnly
                placeholder="Saaf kiya gaya text yahan dikhega..."
                className="min-h-[300px] bg-muted"
            />
             <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCopy} disabled={!outputText} className="w-full">
                    <Copy className="mr-2 h-4 w-4" /> Clean Text Copy करें
                </Button>
                <Button variant="destructive" onClick={handleClear} disabled={!inputText && !outputText} className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvanceTextCleaner;

  