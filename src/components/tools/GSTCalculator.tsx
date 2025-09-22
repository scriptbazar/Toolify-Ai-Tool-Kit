
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function GSTCalculator() {
  const [amount, setAmount] = useState('1000');
  const [gstRate, setGstRate] = useState('18');
  const [calculationType, setCalculationType] = useState<'add' | 'remove'>('add');
  const [result, setResult] = useState<{
    baseAmount: number;
    gstAmount: number;
    totalAmount: number;
  } | null>(null);
  const { toast } = useToast();

  const handleCalculate = () => {
    const baseAmount = parseFloat(amount);
    const rate = parseFloat(gstRate) / 100;

    if (isNaN(baseAmount) || baseAmount < 0 || isNaN(rate) || rate < 0) {
      toast({ title: 'Invalid Input', description: 'Please enter valid positive numbers for all fields.', variant: 'destructive' });
      return;
    }

    let calculatedBase, calculatedGst, calculatedTotal;

    if (calculationType === 'add') {
      calculatedBase = baseAmount;
      calculatedGst = baseAmount * rate;
      calculatedTotal = baseAmount + calculatedGst;
    } else { // remove
      calculatedTotal = baseAmount;
      calculatedBase = baseAmount / (1 + rate);
      calculatedGst = calculatedTotal - calculatedBase;
    }

    setResult({
      baseAmount: calculatedBase,
      gstAmount: calculatedGst,
      totalAmount: calculatedTotal,
    });
  };
  
  const formatCurrency = (value: number) => {
    // A simple formatter for demonstration. Could be expanded with currency symbols.
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount-input">Base Amount</Label>
        <Input id="amount-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 1000" />
      </div>

      <RadioGroup value={calculationType} onValueChange={(val) => setCalculationType(val as any)} className="grid grid-cols-2 gap-4">
        <Label htmlFor="add-gst" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
            <RadioGroupItem value="add" id="add-gst" className="sr-only"/>Add GST
        </Label>
        <Label htmlFor="remove-gst" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
            <RadioGroupItem value="remove" id="remove-gst" className="sr-only"/>Remove GST
        </Label>
      </RadioGroup>

      <div className="space-y-2">
        <Label htmlFor="gst-rate-select">GST Rate (%)</Label>
        <Select value={gstRate} onValueChange={setGstRate}>
            <SelectTrigger id="gst-rate-select">
                <SelectValue placeholder="Select GST Rate" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="3">3%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
                <SelectItem value="18">18%</SelectItem>
                <SelectItem value="28">28%</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <Button onClick={handleCalculate} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate
      </Button>

      {result && (
        <Card className="mt-6 text-center">
          <CardHeader>
            <CardTitle>Calculation Result</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Base Amount</p>
              <p className="text-xl font-bold">₹{formatCurrency(result.baseAmount)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">GST Amount</p>
              <p className="text-xl font-bold">₹{formatCurrency(result.gstAmount)}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary">Total Amount</p>
              <p className="text-2xl font-bold text-primary">₹{formatCurrency(result.totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
