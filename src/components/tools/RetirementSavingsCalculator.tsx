
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RetirementSavingsCalculator() {
    const [currentAge, setCurrentAge] = useState('30');
    const [retirementAge, setRetirementAge] = useState('60');
    const [monthlyExpenses, setMonthlyExpenses] = useState('50000');
    const [inflationRate, setInflationRate] = useState('6');
    const [preRetirementRoi, setPreRetirementRoi] = useState('12');
    const [postRetirementRoi, setPostRetirementRoi] = useState('8');
    const [result, setResult] = useState<{ corpus: number, monthlySavings: number } | null>(null);
    const { toast } = useToast();

    const calculateRetirement = () => {
        const cAge = parseInt(currentAge);
        const rAge = parseInt(retirementAge);
        const expenses = parseFloat(monthlyExpenses);
        const inflation = parseFloat(inflationRate) / 100;
        const preRoi = parseFloat(preRetirementRoi) / 100;
        const postRoi = parseFloat(postRetirementRoi) / 100;

        if ([cAge, rAge, expenses, inflation, preRoi, postRoi].some(isNaN) || cAge >= rAge) {
            toast({ title: 'Invalid Input', variant: 'destructive' });
            return;
        }

        const yearsToRetire = rAge - cAge;
        const futureMonthlyExpenses = expenses * Math.pow(1 + inflation, yearsToRetire);
        
        // Corpus needed at retirement, assuming you live till 90 (30 years post-retirement)
        const realPostRoi = ((1 + postRoi) / (1 + inflation)) - 1;
        const retirementCorpus = (futureMonthlyExpenses * 12) * ( (1 - Math.pow(1 + realPostRoi, -30)) / realPostRoi );

        // Required monthly savings (SIP)
        const i = preRoi / 12;
        const n = yearsToRetire * 12;
        const monthlySavings = retirementCorpus / (((Math.pow(1 + i, n) - 1) / i) * (1 + i));

        setResult({ corpus: retirementCorpus, monthlySavings });
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Retirement Planning</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Current Age (Years)</Label><Input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Retirement Age</Label><Input type="number" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Current Monthly Expenses (₹)</Label><Input type="number" value={monthlyExpenses} onChange={e => setMonthlyExpenses(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Expected Inflation Rate (%)</Label><Input type="number" value={inflationRate} onChange={e => setInflationRate(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Expected Pre-Retirement ROI (%)</Label><Input type="number" value={preRetirementRoi} onChange={e => setPreRetirementRoi(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Expected Post-Retirement ROI (%)</Label><Input type="number" value={postRetirementRoi} onChange={e => setPostRetirementRoi(e.target.value)} /></div>
                </CardContent>
            </Card>
            <Button onClick={calculateRetirement} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Savings</Button>
            {result && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><User/>Your Retirement Plan</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg text-center"><p className="text-sm text-muted-foreground">Retirement Corpus Needed</p><p className="text-3xl font-bold text-primary">₹{result.corpus.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p></div>
                        <div className="p-4 bg-muted rounded-lg text-center"><p className="text-sm text-muted-foreground">Required Monthly Savings (SIP)</p><p className="text-3xl font-bold text-primary">₹{result.monthlySavings.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p></div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
