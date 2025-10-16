
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NscCalculator() {
    const [investment, setInvestment] = useState('10000');
    const [rate, setRate] = useState('7.7'); // Current NSC rate as of writing
    const [result, setResult] = useState<{ maturityValue: number; interest: number } | null>(null);
    const { toast } = useToast();

    const calculateNSC = () => {
        const p = parseFloat(investment);
        const r = parseFloat(rate) / 100;
        const t = 5; // NSC tenure is fixed at 5 years

        if (isNaN(p) || p <= 0 || isNaN(r) || r < 0) {
            toast({ title: 'Invalid Input', variant: 'destructive'});
            return;
        }

        // NSC compounds annually
        const maturityValue = p * Math.pow((1 + r), t);
        const interest = maturityValue - p;
        setResult({ maturityValue, interest });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>NSC Calculator Inputs</CardTitle>
                    <CardDescription>The interest rate is pre-filled with the current rate, but you can adjust it.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Investment Amount (₹)</Label><Input type="number" value={investment} onChange={e => setInvestment(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Annual Interest Rate (%)</Label><Input type="number" value={rate} onChange={e => setRate(e.target.value)} /></div>
                </CardContent>
            </Card>
            <Button onClick={calculateNSC} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Maturity Value</Button>
            {result && (
                <Card className="text-center">
                    <CardHeader><CardTitle className="flex items-center justify-center gap-2"><FileText/>NSC Maturity Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Total Investment</p><p className="text-xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(investment))}</p></div>
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Total Interest</p><p className="text-xl font-bold text-primary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(result.interest)}</p></div>
                        <div className="p-4 bg-primary/10 rounded-lg"><p className="text-sm text-primary">Maturity Value</p><p className="text-2xl font-bold text-primary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(result.maturityValue)}</p></div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
