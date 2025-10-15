
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';
import dynamic from 'next/dynamic';

const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface NpsResult {
    totalInvestment: number;
    totalCorpus: number;
    interestEarned: number;
    lumpsumAmount: number;
    annuityAmount: number;
    monthlyPension: number;
}

export function NpsCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState('10000');
    const [currentAge, setCurrentAge] = useState('25');
    const [retirementAge, setRetirementAge] = useState('60');
    const [expectedReturns, setExpectedReturns] = useState('10');
    const [annuityAllocation, setAnnuityAllocation] = useState(40);
    const [annuityRate, setAnnuityRate] = useState('6');
    const [result, setResult] = useState<NpsResult | null>(null);
    const { toast } = useToast();
    
    const calculateNPS = () => {
        const P = parseFloat(monthlyInvestment);
        const currentA = parseInt(currentAge, 10);
        const retireA = parseInt(retirementAge, 10);
        const r = parseFloat(expectedReturns) / 100;
        const anRate = parseFloat(annuityRate) / 100;

        const investmentPeriod = retireA - currentA;
        if (isNaN(P) || isNaN(currentA) || isNaN(retireA) || isNaN(r) || isNaN(anRate) || investmentPeriod <= 0) {
            toast({ title: "Invalid Input", variant: "destructive" });
            return;
        }

        const i = r / 12; // monthly rate of return
        const n = investmentPeriod * 12; // total number of investments

        const totalCorpus = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
        const totalInvestment = P * n;
        const interestEarned = totalCorpus - totalInvestment;
        
        const annuityAmount = totalCorpus * (annuityAllocation / 100);
        const lumpsumAmount = totalCorpus - annuityAmount;
        
        const monthlyPension = (annuityAmount * (anRate / 12)) / (1 - Math.pow(1 + (anRate / 12), -30 * 12)); // Assuming pension till age 90

        setResult({
            totalInvestment,
            totalCorpus,
            interestEarned,
            lumpsumAmount,
            annuityAmount,
            monthlyPension,
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const pieChartData = result ? [
        { name: 'Your Investment', value: result.totalInvestment },
        { name: 'Interest Earned', value: result.interestEarned },
    ] : [];

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>NPS Investment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Monthly Investment (₹)</Label><Input type="number" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Your Current Age (Years)</Label><Input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Retirement Age</Label><Input type="number" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Expected Return on Investment (%)</Label><Input type="number" value={expectedReturns} onChange={e => setExpectedReturns(e.target.value)} /></div>
                    <div className="space-y-2">
                        <Label>Annuity Allocation: {annuityAllocation}%</Label>
                        <Slider value={[annuityAllocation]} onValueChange={([val]) => setAnnuityAllocation(val)} min={40} max={100} step={5} />
                    </div>
                     <div className="space-y-2">
                        <Label>Annuity Rate (%)</Label>
                        <Input type="number" value={annuityRate} onChange={e => setAnnuityRate(e.target.value)} />
                    </div>
                </CardContent>
            </Card>
            <Button onClick={calculateNPS} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate NPS Corpus</Button>
            {result && (
                 <Card>
                    <CardHeader><CardTitle>Projected Retirement Funds</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                         <div className="space-y-3">
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Total Investment</span><span className="font-bold">{formatCurrency(result.totalInvestment)}</span></div>
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Interest Earned</span><span className="font-bold">{formatCurrency(result.interestEarned)}</span></div>
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm font-bold text-primary">Total Corpus</span><span className="text-xl font-bold text-primary">{formatCurrency(result.totalCorpus)}</span></div>
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Lumpsum at Retirement</span><span className="font-bold">{formatCurrency(result.lumpsumAmount)}</span></div>
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm font-bold text-primary">Est. Monthly Pension</span><span className="text-xl font-bold text-primary">{formatCurrency(result.monthlyPension)}</span></div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
