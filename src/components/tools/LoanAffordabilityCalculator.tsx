
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoanAffordabilityCalculator() {
    const [monthlyIncome, setMonthlyIncome] = useState('50000');
    const [monthlyExpenses, setMonthlyExpenses] = useState('20000');
    const [interestRate, setInterestRate] = useState('8.5');
    const [loanTenure, setLoanTenure] = useState('5');
    const [dtiRatio, setDtiRatio] = useState('40'); // Debt-to-income ratio
    const [result, setResult] = useState<{ affordableLoan: number, affordableEmi: number } | null>(null);
    const { toast } = useToast();

    const calculateAffordability = () => {
        const income = parseFloat(monthlyIncome);
        const expenses = parseFloat(monthlyExpenses);
        const rate = parseFloat(interestRate) / 100 / 12;
        const tenureMonths = parseInt(loanTenure) * 12;
        const dti = parseFloat(dtiRatio) / 100;

        if (isNaN(income) || isNaN(expenses) || isNaN(rate) || isNaN(tenureMonths) || isNaN(dti)) {
            toast({ title: 'Invalid Input', variant: 'destructive' });
            return;
        }

        const maxEmi = (income * dti) - expenses;
        if (maxEmi <= 0) {
            setResult({ affordableLoan: 0, affordableEmi: 0 });
            toast({ title: 'Not Eligible', description: 'Your expenses are too high to afford a loan.', variant: 'destructive'});
            return;
        }

        const affordableLoan = maxEmi * ( (Math.pow(1 + rate, tenureMonths) - 1) / (rate * Math.pow(1 + rate, tenureMonths)) );
        setResult({ affordableLoan, affordableEmi: maxEmi });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Affordability Inputs</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Your Gross Monthly Income</Label><Input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Your Total Monthly Expenses (incl. other EMIs)</Label><Input type="number" value={monthlyExpenses} onChange={e => setMonthlyExpenses(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Loan Interest Rate (% p.a.)</Label><Input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Loan Tenure (Years)</Label><Input type="number" value={loanTenure} onChange={e => setLoanTenure(e.target.value)} /></div>
                    <div className="md:col-span-2 space-y-2"><Label>Debt-to-Income (DTI) Ratio allowed by lender (%)</Label><Input type="number" value={dtiRatio} onChange={e => setDtiRatio(e.target.value)} /></div>
                </CardContent>
            </Card>
            <Button onClick={calculateAffordability} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Affordability</Button>
            {result && (
                <Card className="text-center">
                    <CardHeader><CardTitle className="flex items-center justify-center gap-2"><Banknote/>Your Loan Affordability</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Affordable Loan Amount</p>
                            <p className="text-3xl font-bold text-primary">₹{result.affordableLoan.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Affordable Monthly EMI</p>
                            <p className="text-3xl font-bold text-primary">₹{result.affordableEmi.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
