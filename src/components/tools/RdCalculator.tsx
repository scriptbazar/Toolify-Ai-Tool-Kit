'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calculator } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';

const PieChartDynamic = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });


interface RdResult {
    maturityAmount: number;
    totalInterest: number;
    principal: number;
}

export function RdCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState('5000');
    const [rate, setRate] = useState('6.5');
    const [tenure, setTenure] = useState('5');
    const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
    const [compounding, setCompounding] = useState('4'); // Quarterly
    const [result, setResult] = useState<RdResult | null>(null);
    const { toast } = useToast();

    const calculateRd = () => {
        const P = parseFloat(monthlyInvestment);
        const r = parseFloat(rate) / 100;
        const n = parseInt(compounding, 10);
        const tInMonths = tenureUnit === 'years' ? parseFloat(tenure) * 12 : parseFloat(tenure);

        if (isNaN(P) || P <= 0 || isNaN(r) || r < 0 || isNaN(tInMonths) || tInMonths <= 0) {
            toast({ title: 'Invalid Input', variant: 'destructive' });
            return;
        }

        let maturityAmount = 0;
        for (let i = 1; i <= tInMonths; i++) {
            const monthsRemaining = tInMonths - i + 1;
            const tInYears = monthsRemaining / 12;
            maturityAmount += P * Math.pow(1 + r / n, n * tInYears);
        }
        
        // This is a simplified approx. A more accurate formula is complex.
        // M = P * ((1+i)^n - 1) / (1 - (1+i)^(-1/q)) where i=r/q, n=t*q
        // For simplicity, we'll use a standard formula for quarterly compounding which is more common.
        
        const totalInstallments = tInMonths;
        const ratePerQuarter = r / 4;
        const quarters = tInMonths / 3;
        
        const M = P * ( (Math.pow(1 + ratePerQuarter, quarters) - 1) / (1 - Math.pow(1 + ratePerQuarter, -1/3)) );
        
        const investedAmount = P * totalInstallments;
        const interestEarned = M - investedAmount;

        setResult({
            principal: investedAmount,
            maturityAmount: M,
            totalInterest: interestEarned,
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };
    
    const pieChartData = result ? [
        { name: 'Total Investment', value: result.principal },
        { name: 'Interest Earned', value: result.totalInterest },
    ] : [];

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>RD Calculator Inputs</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Monthly Investment (₹)</Label><Input type="number" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Annual Interest Rate (%)</Label><Input type="number" value={rate} onChange={e => setRate(e.target.value)} /></div>
                    <div className="space-y-2">
                        <Label>Tenure</Label>
                        <div className="flex gap-2">
                            <Input type="number" value={tenure} onChange={e => setTenure(e.target.value)} />
                            <Select value={tenureUnit} onValueChange={(val) => setTenureUnit(val as any)}>
                                <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                                <SelectContent><SelectItem value="years">Years</SelectItem><SelectItem value="months">Months</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Button onClick={calculateRd} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Maturity</Button>
            {result && (
                <Card><CardHeader><CardTitle>Maturity Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3">
                             <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Total Investment</span><span className="font-bold">{formatCurrency(result.principal)}</span></div>
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Interest Earned</span><span className="font-bold text-primary">{formatCurrency(result.totalInterest)}</span></div>
                            <div className="p-4 bg-primary/10 rounded-lg text-center"><p className="text-sm">Maturity Amount</p><p className="text-3xl font-bold text-primary">{formatCurrency(result.maturityAmount)}</p></div>
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
