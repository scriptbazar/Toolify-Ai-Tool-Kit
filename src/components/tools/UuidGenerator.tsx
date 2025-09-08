
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export function UuidGenerator() {
  const [count, setCount] = useState(1);
  const [generatedUuids, setGeneratedUuids] = useState('');
  const { toast } = useToast();

  const handleGenerate = () => {
    const uuids = Array.from({ length: count }, () => uuidv4()).join('\n');
    setGeneratedUuids(uuids);
  };

  const handleCopy = () => {
    if (!generatedUuids) return;
    navigator.clipboard.writeText(generatedUuids);
    toast({ title: 'Copied to clipboard!' });
  };
  
  useEffect(() => {
    // Generate one UUID on initial load
    handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <Label htmlFor="uuid-count">Number of UUIDs to Generate</Label>
          <Input
            id="uuid-count"
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10)) || 1)}
            min="1"
          />
        </div>
        <Button onClick={handleGenerate} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate UUIDs
        </Button>
      </div>
      <div>
        <Label htmlFor="output-uuids">Generated UUID(s)</Label>
        <Textarea
          id="output-uuids"
          value={generatedUuids}
          readOnly
          className="min-h-[250px] bg-muted font-mono"
        />
      </div>
       <div className="flex items-center justify-end pt-4 border-t">
        <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedUuids}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
        </Button>
      </div>
    </div>
  );
}
