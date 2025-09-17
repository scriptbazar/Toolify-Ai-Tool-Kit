
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bitcoin, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '../ui/combobox';
import { getCryptoCurrencies, getCryptoRates } from '@/ai/flows/crypto-converter';
import type { Currency } from '@/ai/flows/crypto-converter.types';

export function CryptocurrencyConverter() {
    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState('bitcoin');
    const [toCurrency, setToCurrency] = useState('usd');
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [rates, setRates] = useState<{ [key: string]: number }>({});
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchCurrenciesAndRates() {
            try {
                const [currencyData, ratesData] = await Promise.all([
                    getCryptoCurrencies(),
                    getCryptoRates()
                ]);

                if (!currencyData.success || !ratesData.success) {
                    throw new Error('Failed to fetch currency data from the server.');
                }
                
                setCurrencies(currencyData.currencies);
                setRates(ratesData.rates);

            } catch (error: any) {
                console.error("Error fetching currency data:", error);
                toast({
                    title: "API Error",
                    description: error.message || "Could not load currency data. Please try again later.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        }
        fetchCurrenciesAndRates();
    }, [toast]);
    
    useEffect(() => {
        if (loading || Object.keys(rates).length === 0) return;
        
        const inputAmount = parseFloat(amount);
        if (isNaN(inputAmount) || inputAmount < 0) {
            setResult(null);
            return;
        }

        const fromRate = rates[fromCurrency];
        const toRate = rates[toCurrency];

        if (fromRate === undefined || toRate === undefined) {
             setResult(null); // Or show an error
             return;
        }
        
        const convertedValue = (inputAmount * fromRate) / toRate;
        setResult(convertedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }));

    }, [amount, fromCurrency, toCurrency, rates, loading]);

    const currencyOptions = useMemo(() => 
        currencies.map(c => ({ value: c.id, label: `${c.name} (${c.symbol.toUpperCase()})` })),
    [currencies]);
    
    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    if (loading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-semibold">Loading Currencies...</h3>
                <p className="text-muted-foreground mt-2">Fetching real-time price data.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-end gap-4">
                <div className="space-y-2">
                    <Label htmlFor="from-amount">From</Label>
                     <Input 
                        id="from-amount" 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="1.00"
                    />
                    <Combobox
                        items={currencyOptions}
                        value={fromCurrency}
                        onValueChange={setFromCurrency}
                        placeholder="Select currency..."
                        searchPlaceholder="Search currency..."
                        notFoundMessage="Currency not found."
                    />
                </div>
                <Button variant="outline" size="icon" onClick={handleSwap} className="shrink-0 mb-10">
                    <ArrowRightLeft className="h-5 w-5"/>
                </Button>
                <div className="space-y-2">
                    <Label htmlFor="to-amount">To</Label>
                    <Input 
                        id="to-amount"
                        value={result || ''} 
                        readOnly 
                        className="bg-muted font-bold text-lg h-10"
                        placeholder="Result"
                    />
                    <Combobox
                        items={currencyOptions}
                        value={toCurrency}
                        onValueChange={setToCurrency}
                        placeholder="Select currency..."
                        searchPlaceholder="Search currency..."
                        notFoundMessage="Currency not found."
                    />
                </div>
            </div>
            
            {result && (
                 <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Conversion Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {amount} <span className="text-primary">{currencies.find(c => c.id === fromCurrency)?.symbol.toUpperCase()}</span> = {result} <span className="text-primary">{currencies.find(c => c.id === toCurrency)?.symbol.toUpperCase()}</span>
                        </p>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
