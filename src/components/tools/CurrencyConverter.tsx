
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const currencies = [
    { value: 'USD', label: '🇺🇸 USD - US Dollar' },
    { value: 'EUR', label: '🇪🇺 EUR - Euro' },
    { value: 'JPY', label: '🇯🇵 JPY - Japanese Yen' },
    { value: 'GBP', label: '🇬🇧 GBP - British Pound' },
    { value: 'AUD', label: '🇦🇺 AUD - Australian Dollar' },
    { value: 'CAD', label: '🇨🇦 CAD - Canadian Dollar' },
    { value: 'CHF', label: '🇨🇭 CHF - Swiss Franc' },
    { value: 'CNY', label: '🇨🇳 CNY - Chinese Yuan' },
    { value: 'INR', label: '🇮🇳 INR - Indian Rupee' },
    { value: 'BRL', label: '🇧🇷 BRL - Brazilian Real' },
    { value: 'RUB', label: '🇷🇺 RUB - Russian Ruble' },
    { value: 'KRW', label: '🇰🇷 KRW - South Korean Won' },
];

// Dummy rates for demonstration, relative to USD
const dummyRates: { [key: string]: number } = {
    'USD': 1,
    'EUR': 0.92,
    'JPY': 157.25,
    'GBP': 0.78,
    'AUD': 1.50,
    'CAD': 1.37,
    'CHF': 0.89,
    'CNY': 7.25,
    'INR': 83.54,
    'BRL': 5.25,
    'RUB': 89.10,
    'KRW': 1380.55,
};


export function CurrencyConverter() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    convert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromCurrency, toCurrency]);

  const convert = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      setConvertedAmount('');
      return;
    }

    const rateFrom = dummyRates[fromCurrency];
    const rateTo = dummyRates[toCurrency];
    
    const amountInUsd = amountNum / rateFrom;
    const result = amountInUsd * rateTo;
    
    setConvertedAmount(result.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
  };
  
  const handleSwap = () => {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
          <Label htmlFor="amount-input">Amount</Label>
          <Input id="amount-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount"/>
      </div>
      <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="from-currency">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger id="from-currency"><SelectValue/></SelectTrigger>
            <SelectContent>
                {currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={handleSwap}>
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-2">
          <Label htmlFor="to-currency">To</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger id="to-currency"><SelectValue/></SelectTrigger>
            <SelectContent>
                 {currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
       <div className="p-6 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Converted Amount</p>
            <p className="text-4xl font-bold text-primary mt-1">{convertedAmount}</p>
        </div>
    </div>
  );
}
