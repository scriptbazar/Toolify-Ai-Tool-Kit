
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';

const PieChartDynamic = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });

export function MortgageCalculator() {
    const [loanAmount, setLoanAmount] = useState('5000000');
    const [interestRate, setInterestRate] = useState('7.5');
    const [loanTerm, setLoanTerm] = useState('20');
    const [result, setResult] = useState<{ monthlyPayment: number; totalPayment: number; totalInterest: number } | null>(null);
    const { toast } = useToast();

    const calculateMortgage = () => {
        const P = parseFloat(loanAmount);
        const r = parseFloat(interestRate) / 100 / 12;
        const n = parseInt(loanTerm) * 12;

        if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r < 0 || n <= 0) {
            toast({ title: 'Invalid Input', variant: 'destructive' });
            return;
        }

        const monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = monthlyPayment * n;
        const totalInterest = totalPayment - P;

        setResult({ monthlyPayment, totalPayment, totalInterest });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const pieChartData = result ? [
        { name: 'Principal Amount', value: parseFloat(loanAmount) },
        { name: 'Total Interest', value: result.totalInterest },
    ] : [];
    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Mortgage Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Loan Amount (₹)</Label><Input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Annual Interest Rate (%)</Label><Input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Loan Term (Years)</Label><Input type="number" value={loanTerm} onChange={e => setLoanTerm(e.target.value)} /></div>
                </CardContent>
            </Card>
            <Button onClick={calculateMortgage} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Mortgage</Button>
            {result && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Home/>Your Mortgage Estimate</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4">
                            <div className="text-center p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Monthly Payment</p><p className="text-3xl font-bold text-primary">{formatCurrency(result.monthlyPayment)}</p></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Total Payment</p><p className="font-bold">{formatCurrency(result.totalPayment)}</p></div>
                                <div className="text-center p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Total Interest</p><p className="font-bold">{formatCurrency(result.totalInterest)}</p></div>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChartDynamic>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChartDynamic>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
