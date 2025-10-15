
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';

export function TDSCalculator() {
  const [income, setIncome] = useState('');
  const [tdsRate, setTdsRate] = useState('');
  const [result, setResult] = useState<{ tdsAmount: number, netIncome: number } | null>(null);

  const calculateTds = () => {
    const inc = parseFloat(income);
    const rate = parseFloat(tdsRate);

    if (isNaN(inc) || isNaN(rate) || inc < 0 || rate < 0 || rate > 100) {
      setResult(null);
      return;
    }

    const tdsAmount = (inc * rate) / 100;
    const netIncome = inc - tdsAmount;
    setResult({ tdsAmount, netIncome });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="income-input">Total Income ($)</Label>
          <Input id="income-input" type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g., 50000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tds-rate">TDS Rate (%)</Label>
          <Input id="tds-rate" type="number" value={tdsRate} onChange={(e) => setTdsRate(e.target.value)} placeholder="e.g., 10" />
        </div>
      </div>
      <Button onClick={calculateTds} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate TDS
      </Button>

      {result && (
        <Card className="mt-6 text-center">
          <CardHeader>
            <CardTitle>TDS Calculation</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">TDS Amount</p>
              <p className="text-3xl font-bold text-red-500">${result.tdsAmount.toFixed(2)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
               <p className="text-sm text-muted-foreground">Net Income</p>
              <p className="text-3xl font-bold text-green-500">${result.netIncome.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
