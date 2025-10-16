
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SwpCalculator() {
    const [totalInvestment, setTotalInvestment] = useState('1000000');
    const [withdrawalPerMonth, setWithdrawalPerMonth] = useState('8000');
    const [expectedReturnRate, setExpectedReturnRate] = useState('12');
    const [result, setResult] = useState<{ years: number; months: number } | null>(null);
    const { toast } = useToast();

    const calculateSWP = () => {
        const P = parseFloat(totalInvestment);
        const W = parseFloat(withdrawalPerMonth);
        const r = parseFloat(expectedReturnRate) / 100 / 12; // monthly rate

        if (isNaN(P) || P <= 0 || isNaN(W) || W <= 0 || isNaN(r) || r < 0) {
            toast({ title: 'Invalid Input', variant: 'destructive'});
            return;
        }

        if (W <= P * r) {
            toast({ title: "Funds Won't Deplete", description: "Your withdrawal amount is less than or equal to the interest earned. Your funds will last indefinitely at this rate.", variant: 'default' });
            return;
        }

        const n = Math.log(W / (W - (P * r))) / Math.log(1 + r);
        
        if (isNaN(n) || n === Infinity) {
            toast({ title: 'Calculation Error', description: 'Could not calculate the duration. Please check your inputs.', variant: 'destructive'});
            return;
        }
        
        const years = Math.floor(n / 12);
        const months = Math.round(n % 12);
        setResult({ years, months });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>SWP Inputs</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Total Investment (₹)</Label><Input type="number" value={totalInvestment} onChange={e => setTotalInvestment(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Withdrawal per Month (₹)</Label><Input type="number" value={withdrawalPerMonth} onChange={e => setWithdrawalPerMonth(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Expected Annual Return (%)</Label><Input type="number" value={expectedReturnRate} onChange={e => setExpectedReturnRate(e.target.value)} /></div>
                </CardContent>
            </Card>
            <Button onClick={calculateSWP} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Duration</Button>
            {result && (
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><TrendingDown/>Your Money Will Last For</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">
                            {result.years} years and {result.months} months
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
