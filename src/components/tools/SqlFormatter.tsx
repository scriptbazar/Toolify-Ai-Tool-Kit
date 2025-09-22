
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formatSql = (sql: string, indent: string): string => {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON'];
  let formatted = sql.replace(/\s+/g, ' ').trim();

  keywords.forEach(keyword => {
    formatted = formatted.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), `\n${indent}${keyword}`);
  });
  
  // A simple attempt to indent selected columns
  formatted = formatted.replace(/\n\s*SELECT\s+/, `\nSELECT\n${indent}${indent}`);
  formatted = formatted.replace(/,\s/g, `,\n${indent}${indent}`);

  return formatted.trim();
}

export function SqlFormatter() {
  const [sqlInput, setSqlInput] = useState('');
  const [formattedSql, setFormattedSql] = useState('');
  const [dialect, setDialect] = useState('sql');
  const [indentation, setIndentation] = useState('2');
  const { toast } = useToast();

  const handleFormat = () => {
    if (!sqlInput.trim()) {
      toast({ title: 'Input is empty!', description: 'Please enter some SQL to format.', variant: 'destructive' });
      return;
    }
    const indentString = ' '.repeat(parseInt(indentation));
    const result = formatSql(sqlInput, indentString);
    setFormattedSql(result);
  };

  const handleCopy = () => {
    if (!formattedSql) return;
    navigator.clipboard.writeText(formattedSql);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setSqlInput('');
    setFormattedSql('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dialect-select">SQL Dialect</Label>
            <Select value={dialect} onValueChange={setDialect}>
              <SelectTrigger id="dialect-select"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="sql">Standard SQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="tsql">MS SQL (T-SQL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
             <Label htmlFor="indent-select">Indentation</Label>
            <Select value={indentation} onValueChange={setIndentation}>
              <SelectTrigger id="indent-select"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Spaces</SelectItem>
                <SelectItem value="4">4 Spaces</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          <Label htmlFor="sql-input">Unformatted SQL</Label>
          <Textarea
            id="sql-input"
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            placeholder="Paste your SQL query here..."
            className="min-h-[300px] font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="formatted-sql">Formatted SQL</Label>
          <Textarea
            id="formatted-sql"
            value={formattedSql}
            readOnly
            className="min-h-[300px] font-mono bg-muted"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
         <Button onClick={handleFormat} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" /> Format SQL
        </Button>
        <Button variant="outline" onClick={handleCopy} disabled={!formattedSql} className="w-full">
            <Copy className="mr-2 h-4 w-4" /> Copy Formatted SQL
        </Button>
         <Button variant="destructive" onClick={handleClear} disabled={!sqlInput && !formattedSql} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  );
}
