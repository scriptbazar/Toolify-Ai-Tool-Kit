
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


interface Result {
    investedAmount: number;
    estimatedReturns: number;
    maturityValue: number;
}

export function MutualFundCalculator() {
    const [investmentType, setInvestmentType] = useState<'lumpsum' | 'sip'>('sip');
    
    // SIP State
    const [monthlyInvestment, setMonthlyInvestment] = useState('5000');
    const [sipRate, setSipRate] = useState('12');
    const [sipTime, setSipTime] = useState('10');

    // Lumpsum State
    const [lumpsumAmount, setLumpsumAmount] = useState('100000');
    const [lumpsumRate, setLumpsumRate] = useState('12');
    const [lumpsumTime, setLumpsumTime] = useState('10');

    const [result, setResult] = useState<Result | null>(null);
    const { toast } = useToast();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const calculateSIP = () => {
        const i = parseFloat(sipRate) / 100 / 12; // monthly rate
        const n = parseFloat(sipTime) * 12; // number of months
        const P = parseFloat(monthlyInvestment);

        if (isNaN(P) || P <= 0 || isNaN(i) || isNaN(n) || n <= 0) {
            toast({ title: 'Invalid Input', variant: 'destructive'});
            return;
        }

        const maturityValue = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
        const investedAmount = P * n;
        const estimatedReturns = maturityValue - investedAmount;

        setResult({ investedAmount, estimatedReturns, maturityValue });
    };

    const calculateLumpsum = () => {
        const P = parseFloat(lumpsumAmount);
        const r = parseFloat(lumpsumRate) / 100;
        const t = parseFloat(lumpsumTime);
        
        if (isNaN(P) || P <= 0 || isNaN(r) || isNaN(t) || t <= 0) {
            toast({ title: 'Invalid Input', variant: 'destructive'});
            return;
        }

        const maturityValue = P * Math.pow((1 + r), t);
        const investedAmount = P;
        const estimatedReturns = maturityValue - investedAmount;
        
        setResult({ investedAmount, estimatedReturns, maturityValue });
    };
    
    const pieChartData = result ? [
        { name: 'Invested Amount', value: result.investedAmount },
        { name: 'Estimated Returns', value: result.estimatedReturns },
    ] : [];

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    return (
        <Tabs defaultValue="sip" onValueChange={(val) => { setInvestmentType(val as any); setResult(null); }}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sip">SIP (Monthly)</TabsTrigger>
                <TabsTrigger value="lumpsum">Lump Sum</TabsTrigger>
            </TabsList>
            <TabsContent value="sip">
                <Card>
                    <CardHeader><CardTitle>SIP Calculator</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Monthly Investment (₹)</Label><Input type="number" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Expected Return Rate (% p.a.)</Label><Input type="number" value={sipRate} onChange={e => setSipRate(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Time Period (Years)</Label><Input type="number" value={sipTime} onChange={e => setSipTime(e.target.value)} /></div>
                        </div>
                        <Button onClick={calculateSIP} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate</Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="lumpsum">
                 <Card>
                    <CardHeader><CardTitle>Lump Sum Calculator</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Total Investment (₹)</Label><Input type="number" value={lumpsumAmount} onChange={e => setLumpsumAmount(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Expected Return Rate (% p.a.)</Label><Input type="number" value={lumpsumRate} onChange={e => setLumpsumRate(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Time Period (Years)</Label><Input type="number" value={lumpsumTime} onChange={e => setLumpsumTime(e.target.value)} /></div>
                        </div>
                        <Button onClick={calculateLumpsum} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate</Button>
                    </CardContent>
                </Card>
            </TabsContent>
            
            {result && (
                 <Card className="mt-6">
                    <CardHeader><CardTitle>Projected Returns</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3">
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Invested Amount</span><span className="font-bold">{formatCurrency(result.investedAmount)}</span></div>
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Est. Returns</span><span className="font-bold text-primary">{formatCurrency(result.estimatedReturns)}</span></div>
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
        </Tabs>
    );
}
