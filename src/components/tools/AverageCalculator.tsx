
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AverageCalculator() {
  const [numbers, setNumbers] = useState('');
  const [result, setResult] = useState<{ average: number, sum: number, count: number } | null>(null);
  const { toast } = useToast();

  const calculateAverage = () => {
    const numberArray = numbers.split(/[\s,]+/).filter(n => n !== '').map(Number);
    if (numberArray.some(isNaN)) {
      toast({ title: "Invalid Input", description: "Please enter valid numbers separated by spaces or commas.", variant: "destructive" });
      return;
    }

    if (numberArray.length === 0) {
      toast({ title: "No numbers entered", variant: "destructive" });
      return;
    }

    const sum = numberArray.reduce((acc, val) => acc + val, 0);
    const count = numberArray.length;
    const average = sum / count;

    setResult({ average, sum, count });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="numbers-input">Enter Numbers</Label>
        <Textarea 
          id="numbers-input" 
          value={numbers} 
          onChange={e => setNumbers(e.target.value)} 
          placeholder="Enter numbers separated by spaces or commas"
          className="min-h-[150px]"
        />
      </div>
      <Button onClick={calculateAverage} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate Average
      </Button>

      {result && (
        <Card className="mt-6 text-center">
          <CardHeader>
            <CardTitle>Calculation Result</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-3xl font-bold text-primary">{result.average.toLocaleString()}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
               <p className="text-sm text-muted-foreground">Sum</p>
              <p className="text-3xl font-bold">{result.sum.toLocaleString()}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
               <p className="text-sm text-muted-foreground">Count</p>
              <p className="text-3xl font-bold">{result.count}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
