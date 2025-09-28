
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, CheckCircle, XCircle, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export function JsonFormatter() {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!jsonInput.trim()) {
      setIsValid(null);
      return;
    }
    try {
      JSON.parse(jsonInput);
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
    }
  }, [jsonInput]);

  const handleFormat = () => {
    if (!jsonInput.trim()) {
      setJsonOutput('');
      toast({ title: "Input is empty!", variant: "destructive" });
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonOutput(formatted);
      setIsValid(true);
      toast({ title: "JSON successfully formatted!" });
    } catch (e) {
      setJsonOutput('Invalid JSON format. Please check your input.');
      setIsValid(false);
      toast({ title: "Invalid JSON", description: "Please check your JSON syntax.", variant: "destructive" });
    }
  };

  const handleCopy = (content: string) => {
    if (!content) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setJsonInput('');
    setJsonOutput('');
    setIsValid(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="json-input" className="flex items-center gap-2">Input 
                 {isValid === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                 {isValid === false && <XCircle className="h-4 w-4 text-red-500" />}
                </Label>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(jsonInput)} title="Copy Input"><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setJsonInput('')} title="Clear Input"><Trash2 className="h-4 w-4" /></Button>
                </div>
            </div>
            <Textarea
            id="json-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{ "key": "value" }'
            className={cn("min-h-[300px] resize-y font-mono", 
                isValid === true && 'border-green-500 focus-visible:ring-green-500',
                isValid === false && 'border-red-500 focus-visible:ring-red-500'
            )}
            />
        </div>
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="json-output">Output</Label>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(jsonOutput)} title="Copy Output" disabled={!jsonOutput || !isValid}><Copy className="h-4 w-4" /></Button>
            </div>
            <Textarea
            id="json-output"
            value={jsonOutput}
            readOnly
            placeholder="Formatted JSON will appear here..."
            className="min-h-[300px] resize-y font-mono bg-muted"
            />
        </div>
      </div>
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
        <Button onClick={handleFormat} className="w-full sm:w-auto">
            <Wand2 className="mr-2 h-4 w-4" />
            Validate & Format
        </Button>
        <Button variant="destructive" onClick={handleClear} className="w-full sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
        </Button>
      </div>
    </div>
  );
}
