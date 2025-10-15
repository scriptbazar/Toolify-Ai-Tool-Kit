
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function SalesTaxCalculator() {
  const [price, setPrice] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [result, setResult] = useState<{ taxAmount: number, totalPrice: number } | null>(null);

  const calculateTax = () => {
    const p = parseFloat(price);
    const r = parseFloat(taxRate);

    if (isNaN(p) || p < 0 || isNaN(r) || r < 0) {
      setResult(null);
      return;
    }
    
    const taxAmount = (p * r) / 100;
    const totalPrice = p + taxAmount;
    setResult({ taxAmount, totalPrice });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price-input">Price ($)</Label>
          <Input id="price-input" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-rate">Sales Tax Rate (%)</Label>
          <Input id="tax-rate" type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} placeholder="e.g., 8.25" />
        </div>
      </div>
      <Button onClick={calculateTax} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate
      </Button>

      {result && (
        <Card className="mt-6 text-center">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Tax Amount</p>
              <p className="text-3xl font-bold text-primary">${result.taxAmount.toFixed(2)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
               <p className="text-sm text-muted-foreground">Total Price</p>
              <p className="text-3xl font-bold text-primary">${result.totalPrice.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
