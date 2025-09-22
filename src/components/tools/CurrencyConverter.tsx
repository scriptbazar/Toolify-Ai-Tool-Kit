
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

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
    { value: 'SGD', label: '🇸🇬 SGD - Singapore Dollar' },
    { value: 'NZD', label: '🇳🇿 NZD - New Zealand Dollar' },
    { value: 'MXN', label: '🇲🇽 MXN - Mexican Peso' },
    { value: 'ZAR', label: '🇿🇦 ZAR - South African Rand' },
    { value: 'HKD', label: '🇭🇰 HKD - Hong Kong Dollar' },
    { value: 'NOK', label: '🇳🇴 NOK - Norwegian Krone' },
    { value: 'SEK', label: '🇸🇪 SEK - Swedish Krona' },
    { value: 'TRY', label: '🇹🇷 TRY - Turkish Lira' },
    { value: 'AED', label: '🇦🇪 AED - UAE Dirham' },
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
    'SGD': 1.35,
    'NZD': 1.62,
    'MXN': 17.09,
    'ZAR': 18.77,
    'HKD': 7.81,
    'NOK': 10.55,
    'SEK': 10.46,
    'TRY': 32.27,
    'AED': 3.67,
};


export function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    convert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromCurrency, toCurrency]);

  const convert = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      setConvertedAmount('');
      setExchangeRate('');
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

    const singleUnitRate = rateTo / rateFrom;
    setExchangeRate(`1 ${fromCurrency} = ${singleUnitRate.toFixed(4)} ${toCurrency}`);
  };
  
  const handleSwap = () => {
      const tempFrom = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(tempFrom);
      // The useEffect will trigger the conversion automatically
  }
  
  const handleCopy = () => {
      if (!convertedAmount) return;
      navigator.clipboard.writeText(convertedAmount);
      toast({ title: 'Copied to clipboard!' });
  }

  return (
    <div className="space-y-6">
       <Card>
           <CardHeader>
               <CardTitle>Enter Amount</CardTitle>
           </CardHeader>
           <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="amount-input">Amount to Convert</Label>
                    <Input id="amount-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount"/>
                </div>
           </CardContent>
       </Card>
       
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
        <div className="space-y-2">
          <Label htmlFor="from-currency">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger id="from-currency"><SelectValue/></SelectTrigger>
            <SelectContent>
                {currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={handleSwap} className="mt-6">
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
       <Card>
           <CardHeader>
               <CardTitle>Conversion Result</CardTitle>
               {exchangeRate && <CardDescription>{exchangeRate}</CardDescription>}
           </CardHeader>
           <CardContent>
                 <div className="relative">
                    <Input value={convertedAmount} readOnly className="h-20 text-3xl font-bold bg-muted pr-12" />
                     <Button variant="ghost" size="icon" onClick={handleCopy} className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Copy className="h-5 w-5"/>
                     </Button>
                </div>
           </CardContent>
       </Card>
    </div>
  );
}
