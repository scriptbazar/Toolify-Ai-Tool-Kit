
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { Construction } from 'lucide-react';

type DataFormat = 'json' | 'csv' | 'xml' | 'yaml';

export function UniversalFileConverter() {
  const [fromFormat, setFromFormat] = useState<DataFormat>('json');
  const [toFormat, setToFormat] = useState<DataFormat>('csv');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const { toast } = useToast();

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast({ title: 'Input is empty', description: 'Please enter data to convert.', variant: 'destructive' });
      return;
    }

    try {
      let result = '';
      // JSON to CSV
      if (fromFormat === 'json' && toFormat === 'csv') {
        const data = JSON.parse(inputText);
        if (!Array.isArray(data)) throw new Error('Input for JSON to CSV must be an array of objects.');
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
          const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '""');
            return `"${escaped}"`;
          });
          csvRows.push(values.join(','));
        }
        result = csvRows.join('\n');
      } 
      // CSV to JSON
      else if (fromFormat === 'csv' && toFormat === 'json') {
        const lines = inputText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj: { [key: string]: string } = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          data.push(obj);
        }
        result = JSON.stringify(data, null, 2);
      }
      // Other conversions are not supported yet
      else {
        toast({ title: 'Conversion Not Supported', description: `Conversion from ${fromFormat.toUpperCase()} to ${toFormat.toUpperCase()} is not yet available.`, variant: 'default' });
        return;
      }

      setOutputText(result);

    } catch (error: any) {
      toast({ title: 'Conversion Error', description: error.message || 'Please check your input data and format.', variant: 'destructive' });
    }
  };

  const handleSwap = () => {
    const tempFormat = fromFormat;
    setFromFormat(toFormat);
    setToFormat(tempFormat);
    setInputText(outputText);
    setOutputText(inputText);
  };
  
  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const handleClear = () => {
    setInputText('');
    setOutputText('');
  }

  const renderComingSoon = () => (
    <Card className="flex flex-col items-center justify-center min-h-[300px] bg-muted/50">
      <CardContent className="text-center">
        <Construction className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">Conversion Coming Soon!</h3>
        <p className="text-sm text-muted-foreground mt-2">
          This conversion type is under development.
        </p>
      </CardContent>
    </Card>
  );

  const isConversionSupported = (fromFormat === 'json' && toFormat === 'csv') || (fromFormat === 'csv' && toFormat === 'json');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
        <div className="space-y-2">
          <Label>From</Label>
          <Select value={fromFormat} onValueChange={(val) => setFromFormat(val as DataFormat)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={handleSwap} className="mt-6"><ArrowRightLeft className="h-4 w-4" /></Button>
        <div className="space-y-2">
          <Label>To</Label>
          <Select value={toFormat} onValueChange={(val) => setToFormat(val as DataFormat)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          <Label htmlFor="input-text">Input</Label>
          {isConversionSupported ? (
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Paste your ${fromFormat.toUpperCase()} data here...`}
              className="min-h-[300px] font-mono"
            />
          ) : renderComingSoon()}
        </div>
        <div className="space-y-2">
          <Label htmlFor="output-text">Output</Label>
          {isConversionSupported ? (
            <Textarea
              id="output-text"
              value={outputText}
              readOnly
              placeholder={`Converted ${toFormat.toUpperCase()} will appear here...`}
              className="min-h-[300px] font-mono bg-muted"
            />
          ) : renderComingSoon()}
        </div>
      </div>
      
       <div className="flex flex-col sm:flex-row gap-2">
         <Button onClick={handleConvert} disabled={!isConversionSupported} className="w-full">Convert</Button>
        <Button variant="outline" onClick={handleCopy} disabled={!outputText} className="w-full">
            <Copy className="mr-2 h-4 w-4" />
            Copy Result
        </Button>
        <Button variant="destructive" onClick={handleClear} disabled={!inputText && !outputText} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
        </Button>
      </div>

    </div>
  );
}
