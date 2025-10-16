
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';

const PieChartDynamic = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });


interface PpfResult {
    totalInvestment: number;
    interestEarned: number;
    maturityValue: number;
}

export function PpfCalculator() {
    const [yearlyInvestment, setYearlyInvestment] = useState('150000');
    const [rate, setRate] = useState('7.1');
    const [tenure, setTenure] = useState('15');
    const [result, setResult] = useState<PpfResult | null>(null);
    const { toast } = useToast();

    const calculatePPF = () => {
        const P = parseFloat(yearlyInvestment);
        const r = parseFloat(rate) / 100;
        const t = parseInt(tenure, 10);

        if (isNaN(P) || P <= 0 || isNaN(r) || isNaN(t) || t <= 0) {
            toast({ title: 'Invalid Input', variant: 'destructive'});
            return;
        }

        let balance = 0;
        for (let i = 0; i < t; i++) {
            balance = (balance + P) * (1 + r);
        }
        
        const totalInvestment = P * t;
        const interestEarned = balance - totalInvestment;

        setResult({ totalInvestment, interestEarned, maturityValue: balance });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };
    
    const pieChartData = result ? [
        { name: 'Total Investment', value: result.totalInvestment },
        { name: 'Interest Earned', value: result.interestEarned },
    ] : [];
    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>PPF Calculator Inputs</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Yearly Investment (₹)</Label><Input type="number" value={yearlyInvestment} onChange={e => setYearlyInvestment(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Annual Interest Rate (%)</Label><Input type="number" value={rate} onChange={e => setRate(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Time Period (Years)</Label><Input type="number" value={tenure} onChange={e => setTenure(e.target.value)} /></div>
                </CardContent>
            </Card>
            <Button onClick={calculatePPF} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Maturity Value</Button>
            {result && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck/>PPF Maturity Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3">
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Total Investment</span><span className="font-bold">{formatCurrency(result.totalInvestment)}</span></div>
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Interest Earned</span><span className="font-bold text-primary">{formatCurrency(result.interestEarned)}</span></div>
                            <div className="p-4 bg-primary/10 rounded-lg text-center"><p className="text-sm">Maturity Value</p><p className="text-3xl font-bold text-primary">{formatCurrency(result.maturityValue)}</p></div>
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
