
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';

const PieChartDynamic = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });


interface SipResult {
    investedAmount: number;
    estimatedReturns: number;
    maturityValue: number;
}

export function SIPCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState('5000');
    const [rate, setRate] = useState('12');
    const [time, setTime] = useState('10');
    const [result, setResult] = useState<SipResult | null>(null);
    const { toast } = useToast();

    const calculateSIP = () => {
        const i = parseFloat(rate) / 100 / 12; // monthly rate
        const n = parseFloat(time) * 12; // number of months
        const P = parseFloat(monthlyInvestment);

        if (isNaN(P) || P <= 0 || isNaN(i) || isNaN(n) || n <= 0) {
            toast({ title: 'Invalid Input', description: 'Please enter valid positive numbers for all fields.', variant: 'destructive'});
            return;
        }

        const maturityValue = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
        const investedAmount = P * n;
        const estimatedReturns = maturityValue - investedAmount;

        setResult({ investedAmount, estimatedReturns, maturityValue });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };
    
    const pieChartData = result ? [
        { name: 'Total Investment', value: result.investedAmount },
        { name: 'Est. Returns', value: result.estimatedReturns },
    ] : [];

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>SIP Investment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="monthly-investment">Monthly Investment (₹)</Label>
                        <Input id="monthly-investment" type="number" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)} placeholder="e.g., 5000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="return-rate">Expected Return Rate (% p.a.)</Label>
                        <Input id="return-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g., 12" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time-period">Time Period (Years)</Label>
                        <Input id="time-period" type="number" value={time} onChange={e => setTime(e.target.value)} placeholder="e.g., 10" />
                    </div>
                </CardContent>
            </Card>

            <Button onClick={calculateSIP} className="w-full">
                <Calculator className="mr-2 h-4 w-4"/>Calculate
            </Button>
            
            {result && (
                 <Card className="mt-6">
                    <CardHeader><CardTitle>Projected Returns</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3">
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Invested Amount</span>
                                <span className="font-bold">{formatCurrency(result.investedAmount)}</span>
                            </div>
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Est. Returns</span>
                                <span className="font-bold text-primary">{formatCurrency(result.estimatedReturns)}</span>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-lg text-center">
                                <p className="text-sm">Maturity Value</p>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(result.maturityValue)}</p>
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
