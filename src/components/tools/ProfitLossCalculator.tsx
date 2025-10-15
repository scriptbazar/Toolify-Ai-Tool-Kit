'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfitLossCalculator() {
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [result, setResult] = useState<{
    amount: number;
    percentage: number;
    type: 'Profit' | 'Loss' | 'No Profit, No Loss';
  } | null>(null);

  const calculate = () => {
    const cp = parseFloat(costPrice);
    const sp = parseFloat(sellingPrice);

    if (isNaN(cp) || isNaN(sp) || cp < 0 || sp < 0) {
      setResult(null);
      return;
    }

    const amount = sp - cp;
    const percentage = cp > 0 ? (amount / cp) * 100 : (sp > 0 ? Infinity : 0);
    let type: 'Profit' | 'Loss' | 'No Profit, No Loss' = 'No Profit, No Loss';
    if (amount > 0) type = 'Profit';
    if (amount < 0) type = 'Loss';
    
    setResult({ amount: Math.abs(amount), percentage: Math.abs(percentage), type });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost-price">Cost Price ($)</Label>
          <Input id="cost-price" type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="e.g., 80" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="selling-price">Selling Price ($)</Label>
          <Input id="selling-price" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="e.g., 100" />
        </div>
      </div>
      <Button onClick={calculate} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate
      </Button>

      {result && (
        <Card className={cn(
            "mt-6 text-center",
            result.type === 'Profit' && 'border-green-500 bg-green-500/5',
            result.type === 'Loss' && 'border-red-500 bg-red-500/5',
        )}>
           <CardHeader>
                <CardTitle className={cn(
                    "flex items-center justify-center gap-2",
                    result.type === 'Profit' && 'text-green-600',
                    result.type === 'Loss' && 'text-red-600'
                )}>
                   {result.type === 'Profit' && <TrendingUp />}
                   {result.type === 'Loss' && <TrendingDown />}
                   {result.type}
                </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-3xl font-bold">${result.amount.toFixed(2)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
               <p className="text-sm text-muted-foreground">Percentage</p>
              <p className="text-3xl font-bold">{result.percentage.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
