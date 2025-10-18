
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Copy, Loader2, Bitcoin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { getCryptoExchangeRates } from '@/ai/flows/crypto-converter';
import { cryptoCurrencies } from '@/lib/crypto-currencies';
import { Combobox } from '../ui/combobox';

export function CryptoConverter() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>('');
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRates() {
      try {
        const fetchedRates = await getCryptoExchangeRates();
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

    const rateFrom = rates[fromCurrency.toUpperCase()];
    const rateTo = rates[toCurrency.toUpperCase()];
    
    if (rateFrom && rateTo) {
      const result = (amountNum / rateFrom) * rateTo;
      
      setConvertedAmount(result.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: result > 1 ? 2 : 8,
      }));

      const singleUnitRate = rateTo / rateFrom;
      setExchangeRate(`1 ${fromCurrency} = ${singleUnitRate.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: singleUnitRate > 1 ? 2 : 8,
      })} ${toCurrency}`);
    } else {
        // Handle cases where one of the currencies might not be in the fiat list, like USD itself
        if (fromCurrency.toUpperCase() === 'USD' && rateTo) {
            const result = amountNum * rateTo;
            setConvertedAmount(result.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: result > 1 ? 2 : 8}));
            setExchangeRate(`1 USD = ${rateTo.toLocaleString()} ${toCurrency}`);
        } else if (toCurrency.toUpperCase() === 'USD' && rateFrom) {
            const result = amountNum / rateFrom;
             setConvertedAmount(result.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
            setExchangeRate(`1 ${fromCurrency} = ${ (1 / rateFrom).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`);
        } else {
            setConvertedAmount('');
            setExchangeRate('Could not find conversion rate.');
        }
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

  const currencyOptions = useMemo(() => {
    return [
        { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
        { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
        { value: 'JPY', label: '🇯🇵 Japanese Yen (JPY)' },
        { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
        { value: 'INR', label: '🇮🇳 Indian Rupee (INR)' },
        ...cryptoCurrencies.map(c => ({ value: c.code, label: `${c.code} - ${c.name}` }))
    ];
  }, []);

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
       
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4">
        <div className="space-y-2">
          <Label>From</Label>
          <Combobox items={currencyOptions} value={fromCurrency} onValueChange={setFromCurrency} placeholder="Select currency..." searchPlaceholder="Search currency..." notFoundMessage="Currency not found."/>
        </div>
        <Button variant="outline" size="icon" onClick={handleSwap} className="shrink-0 mt-6">
          <ArrowRightLeft className="h-5 w-5"/>
        </Button>
        <div className="space-y-2">
          <Label>To</Label>
          <Combobox items={currencyOptions} value={toCurrency} onValueChange={setToCurrency} placeholder="Select currency..." searchPlaceholder="Search currency..." notFoundMessage="Currency not found."/>
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
