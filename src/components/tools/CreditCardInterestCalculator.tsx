
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Banknote, Percent, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CreditCardInterestCalculator() {
  const [balance, setBalance] = useState('10000');
  const [apr, setApr] = useState('18');
  const [monthlyPayment, setMonthlyPayment] = useState('500');
  const [result, setResult] = useState<{
    monthsToPayOff: number;
    totalInterest: number;
    totalPaid: number;
  } | null>(null);
  const { toast } = useToast();

  const calculateInterest = () => {
    const principal = parseFloat(balance);
    const annualRate = parseFloat(apr) / 100;
    const payment = parseFloat(monthlyPayment);

    if (isNaN(principal) || principal <= 0 || isNaN(annualRate) || annualRate < 0 || isNaN(payment) || payment <= 0) {
      toast({ title: "Invalid Input", description: "Please enter valid positive numbers for all fields.", variant: "destructive"});
      return;
    }

    const monthlyRate = annualRate / 12;

    if (payment <= principal * monthlyRate) {
        toast({ title: "Payment Too Low", description: "Your monthly payment is too low to cover the interest. You will never pay off the balance.", variant: "destructive" });
        setResult(null);
        return;
    }

    const months = -(Math.log(1 - (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate));
    const totalPaid = months * payment;
    const totalInterest = totalPaid - principal;
    
    setResult({
        monthsToPayOff: Math.ceil(months),
        totalInterest,
        totalPaid,
    });
  };
  
  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
    if (remainingMonths > 0) result += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    return result.trim();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="balance" className="flex items-center gap-2"><Banknote/>Credit Card Balance ($)</Label>
          <Input id="balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="e.g., 10000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apr" className="flex items-center gap-2"><Percent/>Annual Percentage Rate (APR) (%)</Label>
          <Input id="apr" type="number" value={apr} onChange={(e) => setApr(e.target.value)} placeholder="e.g., 18" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly-payment" className="flex items-center gap-2"><Banknote/>Monthly Payment ($)</Label>
          <Input id="monthly-payment" type="number" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} placeholder="e.g., 500" />
        </div>
      </div>
      <Button onClick={calculateInterest} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate
      </Button>

      {result !== null && (
        <Card className="mt-6 text-center">
           <CardHeader>
                <CardTitle>Calculation Result</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Calendar/>Time to Pay Off</p>
              <p className="text-2xl font-bold text-primary">{formatMonths(result.monthsToPayOff)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
               <p className="text-sm text-muted-foreground">Total Interest Paid</p>
              <p className="text-2xl font-bold text-primary">${result.totalInterest.toFixed(2)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Amount Paid</p>
              <p className="text-2xl font-bold text-primary">${result.totalPaid.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
