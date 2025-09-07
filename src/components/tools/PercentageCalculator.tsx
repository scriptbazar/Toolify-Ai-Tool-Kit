
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PercentageCalculator() {
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('whatIsXOfY');

  const calculate = () => {
    const num1 = parseFloat(val1);
    const num2 = parseFloat(val2);
    if (isNaN(num1) || isNaN(num2)) {
        setResult(null);
        return;
    }
    
    let res = '';
    switch(activeTab) {
        case 'whatIsXOfY':
            res = ((num1 / 100) * num2).toString();
            break;
        case 'xIsWhatPercentOfY':
            if (num2 === 0) { res = 'Cannot divide by zero'; break; }
            res = ((num1 / num2) * 100).toFixed(2) + '%';
            break;
        case 'percentChange':
             if (num1 === 0) { res = 'Cannot calculate change from zero'; break; }
            const change = ((num2 - num1) / num1) * 100;
            res = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
            break;
    }
    setResult(res);
  };
  
  const resetFields = () => {
      setVal1('');
      setVal2('');
      setResult(null);
  }

  const getLabels = () => {
      switch(activeTab) {
          case 'whatIsXOfY': return { label1: 'Percentage (%)', label2: 'Value' };
          case 'xIsWhatPercentOfY': return { label1: 'Value', label2: 'Total Value' };
          case 'percentChange': return { label1: 'Old Value', label2: 'New Value' };
          default: return { label1: 'Value 1', label2: 'Value 2' };
      }
  };
  
  const { label1, label2 } = getLabels();

  return (
    <div className="space-y-6">
        <Tabs defaultValue="whatIsXOfY" onValueChange={(val) => { setActiveTab(val); resetFields(); }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="whatIsXOfY">What is X% of Y</TabsTrigger>
            <TabsTrigger value="xIsWhatPercentOfY">X is what % of Y</TabsTrigger>
            <TabsTrigger value="percentChange">% Change</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{label1}</Label><Input type="number" value={val1} onChange={e => setVal1(e.target.value)} /></div>
            <div className="space-y-2"><Label>{label2}</Label><Input type="number" value={val2} onChange={e => setVal2(e.target.value)} /></div>
        </div>
        <Button onClick={calculate} className="w-full"><Calculator className="mr-2 h-4 w-4"/> Calculate</Button>
        {result !== null && (
            <Card className="mt-6 text-center">
                <CardHeader><CardTitle>Result</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-primary">{result}</p></CardContent>
            </Card>
        )}
    </div>
  );
}
