
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function JsonFormatter() {
  const [jsonInput, setJsonInput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleFormat = () => {
    if (!jsonInput.trim()) {
        setIsValid(null);
        return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setIsValid(true);
      toast({ title: "JSON successfully formatted!" });
    } catch (e) {
      setIsValid(false);
      toast({ title: "Invalid JSON", description: "Please check your JSON syntax.", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    if (!jsonInput) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(jsonInput);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setJsonInput('');
    setIsValid(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="json-input">JSON Input/Output</Label>
        <div className="relative">
            <Textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setIsValid(null);
              }}
              placeholder="Paste your JSON here..."
              className={cn("min-h-[300px] resize-y font-mono pr-12", 
                isValid === true && 'border-green-500',
                isValid === false && 'border-red-500'
              )}
            />
            <div className="absolute top-3 right-3">
              {isValid === true && <CheckCircle className="h-5 w-5 text-green-500" />}
              {isValid === false && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
        <Button onClick={handleFormat}>Format JSON</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
          <Button variant="destructive" size="icon" onClick={handleClear}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
