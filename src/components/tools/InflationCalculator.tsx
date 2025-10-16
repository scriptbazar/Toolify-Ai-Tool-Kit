
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function InflationCalculator() {
    const [initialAmount, setInitialAmount] = useState('1000');
    const [inflationRate, setInflationRate] = useState('5');
    const [years, setYears] = useState('10');
    const [result, setResult] = useState<{ futureValue: number, purchasingPower: number } | null>(null);
    const { toast } = useToast();

    const calculateInflation = () => {
        const amount = parseFloat(initialAmount);
        const rate = parseFloat(inflationRate) / 100;
        const time = parseInt(years, 10);

        if (isNaN(amount) || amount <= 0 || isNaN(rate) || rate < 0 || isNaN(time) || time <= 0) {
            toast({ title: 'Invalid Input', variant: 'destructive' });
            return;
        }

        const futureValue = amount * Math.pow(1 + rate, time);
        const purchasingPower = amount / Math.pow(1 + rate, time);
        setResult({ futureValue, purchasingPower });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Inflation Calculator Inputs</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Initial Amount ($)</Label><Input type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Annual Inflation Rate (%)</Label><Input type="number" value={inflationRate} onChange={e => setInflationRate(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Number of Years</Label><Input type="number" value={years} onChange={e => setYears(e.target.value)} /></div>
                </CardContent>
            </Card>
            <Button onClick={calculateInflation} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate</Button>
            {result && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp/>Inflation Impact</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Future Value of ${initialAmount}</p>
                            <p className="text-3xl font-bold text-primary">${result.futureValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            <p className="text-xs">You will need this much money in {years} years to buy what ${initialAmount} buys today.</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Purchasing Power of ${initialAmount}</p>
                            <p className="text-3xl font-bold text-primary">${result.purchasingPower.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                             <p className="text-xs">Your ${initialAmount} will only be worth this much in {years} years.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
