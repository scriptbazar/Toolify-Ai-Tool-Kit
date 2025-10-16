
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';

const PieChartDynamic = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });

interface EpfResult {
    totalInvestment: number;
    interestEarned: number;
    maturityValue: number;
}

export function EPFCalculator() {
    const [currentAge, setCurrentAge] = useState('25');
    const [retirementAge, setRetirementAge] = useState('60');
    const [basicSalary, setBasicSalary] = useState('50000');
    const [contribution, setContribution] = useState('12');
    const [epfBalance, setEpfBalance] = useState('0');
    const [epfRate, setEpfRate] = useState('8.25');
    const [salaryIncrease, setSalaryIncrease] = useState('5');
    const [result, setResult] = useState<EpfResult | null>(null);
    const { toast } = useToast();

    const calculateEPF = () => {
        const p_age = parseInt(currentAge);
        const r_age = parseInt(retirementAge);
        let p_salary = parseFloat(basicSalary);
        const p_contribution = parseFloat(contribution) / 100;
        let p_balance = parseFloat(epfBalance);
        const p_rate = parseFloat(epfRate) / 100;
        const p_increase = parseFloat(salaryIncrease) / 100;

        if (isNaN(p_age) || isNaN(r_age) || isNaN(p_salary) || isNaN(p_contribution) || isNaN(p_balance) || isNaN(p_rate) || isNaN(p_increase) || p_age >= r_age) {
            toast({ title: 'Invalid Input', description: 'Please check your inputs.', variant: 'destructive'});
            return;
        }

        let totalInvestment = p_balance;
        let totalInterest = 0;
        let currentBalance = p_balance;

        for (let year = p_age; year < r_age; year++) {
            const annualContribution = (p_salary * p_contribution) * 12 * 2; // Employee + Employer
            totalInvestment += annualContribution;
            const interest = (currentBalance + annualContribution) * p_rate;
            totalInterest += interest;
            currentBalance += annualContribution + interest;
            p_salary *= (1 + p_increase);
        }

        setResult({
            totalInvestment,
            interestEarned: totalInterest,
            maturityValue: currentBalance
        });
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
                    <CardTitle>EPF Calculator Inputs</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Current Age (Years)</Label><Input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Retirement Age</Label><Input type="number" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Basic Salary + DA (Monthly)</Label><Input type="number" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Your Contribution (% of Basic)</Label><Input type="number" value={contribution} onChange={e => setContribution(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Current EPF Balance</Label><Input type="number" value={epfBalance} onChange={e => setEpfBalance(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Current EPF Interest Rate (%)</Label><Input type="number" value={epfRate} onChange={e => setEpfRate(e.target.value)} /></div>
                    <div className="space-y-2 lg:col-span-3"><Label>Annual Salary Increase (%)</Label><Input type="number" value={salaryIncrease} onChange={e => setSalaryIncrease(e.target.value)} /></div>
                </CardContent>
            </Card>
            <Button onClick={calculateEPF} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate EPF Corpus</Button>
            {result && (
                <Card className="animate-in fade-in-50">
                    <CardHeader><CardTitle>Projected EPF Corpus at Retirement</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3">
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Total Investment</span><span className="font-bold">{formatCurrency(result.totalInvestment)}</span></div>
                            <div className="p-3 bg-muted rounded-lg flex justify-between items-center"><span className="text-sm text-muted-foreground">Interest Earned</span><span className="font-bold text-primary">{formatCurrency(result.interestEarned)}</span></div>
                            <div className="p-4 bg-primary/10 rounded-lg text-center"><p className="text-sm">Total Corpus</p><p className="text-3xl font-bold text-primary">{formatCurrency(result.maturityValue)}</p></div>
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
