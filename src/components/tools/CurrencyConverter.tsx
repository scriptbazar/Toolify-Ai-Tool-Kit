
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { getExchangeRates } from '@/ai/flows/currency-converter';
import { currencies } from '@/lib/countries';

export function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>('');
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRates() {
      try {
        const fetchedRates = await getExchangeRates();
        setRates(fetchedRates);
        setLoading(false);
      } catch (error: any) {
        console.error("Failed to fetch exchange rates:", error);
        toast({
          title: "Error",
          description: "Could not load live exchange rates. Please try again later.",
          variant: "destructive"
        });
        setLoading(false);
      }
    }
    fetchRates();
  }, [toast]);

  useEffect(() => {
    if (Object.keys(rates).length > 0) {
      convert();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromCurrency, toCurrency, rates]);

  const convert = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      setConvertedAmount('');
      setExchangeRate('');
      return;
    }

    const rateFrom = rates[fromCurrency];
    const rateTo = rates[toCurrency];
    
    if (rateFrom && rateTo) {
      const result = (amountNum / rateFrom) * rateTo;
      
      setConvertedAmount(result.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));

      const singleUnitRate = rateTo / rateFrom;
      setExchangeRate(`1 ${fromCurrency} = ${singleUnitRate.toFixed(4)} ${toCurrency}`);
    }
  };
  
  const handleSwap = () => {
      const tempFrom = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(tempFrom);
  }
  
  const handleCopy = () => {
      if (!convertedAmount) return;
      navigator.clipboard.writeText(convertedAmount);
      toast({ title: 'Copied to clipboard!' });
  }

  if (loading) {
      return (
          <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
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
                {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}
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
                 {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}
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
