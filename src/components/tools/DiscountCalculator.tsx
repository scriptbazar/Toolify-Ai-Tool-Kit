
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';

export function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [savedAmount, setSavedAmount] = useState<number | null>(null);

  const calculateDiscount = () => {
    const price = parseFloat(originalPrice);
    const disc = parseFloat(discount);

    if (price > 0 && disc >= 0) {
      const saved = (price * disc) / 100;
      const final = price - saved;
      setSavedAmount(saved);
      setFinalPrice(final);
    } else {
      setSavedAmount(null);
      setFinalPrice(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="original-price">Original Price ($)</Label>
          <Input id="original-price" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="e.g., 100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Discount (%)</Label>
          <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="e.g., 25" />
        </div>
      </div>
      <Button onClick={calculateDiscount} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate
      </Button>

      {finalPrice !== null && savedAmount !== null && (
        <Card className="mt-6 text-center">
           <CardHeader>
                <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Final Price</p>
              <p className="text-3xl font-bold text-primary">${finalPrice.toFixed(2)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
               <p className="text-sm text-muted-foreground">You Save</p>
              <p className="text-3xl font-bold text-green-500">${savedAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
