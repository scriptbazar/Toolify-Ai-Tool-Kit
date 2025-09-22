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

type ConversionType = 
  | 'json-csv' | 'csv-json'
  | 'yaml-json' | 'yaml-csv'
  | 'csv-yaml' | 'json-yaml'
  | 'json-xml' | 'csv-xml'
  | 'yaml-xml' | 'xml-json'
  | 'xml-yaml' | 'xml-csv';

const conversionOptions: { value: ConversionType; label: string }[] = [
    { value: 'json-csv', label: 'JSON to CSV' },
    { value: 'csv-json', label: 'CSV to JSON' },
    { value: 'yaml-json', label: 'YAML to JSON' },
    { value: 'yaml-csv', label: 'YAML to CSV' },
    { value: 'csv-yaml', label: 'CSV to YAML' },
    { value: 'json-yaml', label: 'JSON to YAML' },
    { value: 'json-xml', label: 'JSON to XML' },
    { value: 'csv-xml', label: 'CSV to XML' },
    { value: 'yaml-xml', label: 'YAML to XML' },
    { value: 'xml-json', label: 'XML to JSON' },
    { value: 'xml-yaml', label: 'XML to YAML' },
    { value: 'xml-csv', label: 'XML to CSV' },
];

export function UniversalFileConverter() {
  const [conversionType, setConversionType] = useState<ConversionType>('json-csv');
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
      const [fromFormat, toFormat] = conversionType.split('-');
      
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
      else if (fromFormat === 'csv' && toFormat === 'json') {
        const lines = inputText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: { [key: string]: string } = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          data.push(obj);
        }
        result = JSON.stringify(data, null, 2);
      }
      else {
        toast({ title: 'Conversion Not Supported', description: `Conversion from ${fromFormat.toUpperCase()} to ${toFormat.toUpperCase()} is not yet available.`, variant: 'default' });
        return;
      }
      setOutputText(result);
    } catch (error: any) {
      toast({ title: 'Conversion Error', description: error.message || 'Please check your input data and format.', variant: 'destructive' });
    }
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

  const isConversionSupported = conversionType === 'json-csv' || conversionType === 'csv-json';

  const [fromFormat, toFormat] = conversionType.split('-');

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Select Conversion Type</Label>
          <Select value={conversionType} onValueChange={(val) => setConversionType(val as ConversionType)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              {conversionOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleConvert} disabled={!isConversionSupported} className="self-end w-full">Convert</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          <Label htmlFor="input-text">Input ({fromFormat.toUpperCase()})</Label>
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
          <Label htmlFor="output-text">Output ({toFormat.toUpperCase()})</Label>
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
        <Button variant="outline" onClick={handleCopy} disabled={!outputText || !isConversionSupported} className="w-full">
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
