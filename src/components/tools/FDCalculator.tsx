
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Percent, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';

const PieChartDynamic = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });

interface FdResult {
    maturityAmount: number;
    totalInterest: number;
    principal: number;
}

export function FDCalculator() {
    const [principal, setPrincipal] = useState('100000');
    const [rate, setRate] = useState('6.5');
    const [tenure, setTenure] = useState('5');
    const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
    const [compounding, setCompounding] = useState('1'); // 1: Yearly, 2: Half-yearly, 4: Quarterly, 12: Monthly
    const [result, setResult] = useState<FdResult | null>(null);
    const { toast } = useToast();

    const calculateFd = () => {
        const p = parseFloat(principal);
        const r = parseFloat(rate) / 100;
        const t = tenureUnit === 'years' ? parseFloat(tenure) : parseFloat(tenure) / 12;
        const n = parseInt(compounding, 10);

        if (isNaN(p) || p <= 0 || isNaN(r) || r < 0 || isNaN(t) || t <= 0) {
            toast({ title: 'Invalid Input', description: 'Please enter valid positive numbers for all fields.', variant: 'destructive' });
            return;
        }

        const maturityAmount = p * Math.pow((1 + r / n), n * t);
        const totalInterest = maturityAmount - p;

        setResult({
            principal: p,
            maturityAmount,
            totalInterest,
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };
    
    const pieChartData = result ? [
        { name: 'Principal Amount', value: result.principal },
        { name: 'Total Interest', value: result.totalInterest },
    ] : [];

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>FD Calculator Inputs</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="principal">Principal Investment (₹)</Label>
                        <Input id="principal" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="e.g., 100000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                        <Input id="rate" type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g., 6.5" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="tenure">Tenure</Label>
                        <div className="flex gap-2">
                           <Input id="tenure" type="number" value={tenure} onChange={e => setTenure(e.target.value)} placeholder="e.g., 5" />
                            <Select value={tenureUnit} onValueChange={(val) => setTenureUnit(val as any)}>
                                <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                                <SelectContent><SelectItem value="years">Years</SelectItem><SelectItem value="months">Months</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compounding">Compounding Frequency</Label>
                        <Select value={compounding} onValueChange={setCompounding}>
                            <SelectTrigger id="compounding"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Yearly</SelectItem>
                                <SelectItem value="2">Half-yearly</SelectItem>
                                <SelectItem value="4">Quarterly</SelectItem>
                                <SelectItem value="12">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Button onClick={calculateFd} className="w-full">
                <Calculator className="mr-2 h-4 w-4" /> Calculate Maturity
            </Button>
            
            {result && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Maturity Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4">
                             <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Invested Amount</p>
                                <p className="text-xl font-bold">{formatCurrency(result.principal)}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Interest Earned</p>
                                <p className="text-xl font-bold text-primary">{formatCurrency(result.totalInterest)}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Maturity Amount</p>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(result.maturityAmount)}</p>
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
