
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calculator, Percent, Trash2, PieChart as PieChartIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function InterestCalculator() {
    const [activeTab, setActiveTab] = useState('simple');
    const { toast } = useToast();

    // Shared State
    const [currency, setCurrency] = useState('INR');

    // Simple Interest State
    const [siPrincipal, setSiPrincipal] = useState('100000');
    const [siRate, setSiRate] = useState('5');
    const [siRatePeriod, setSiRatePeriod] = useState<'years' | 'months'>('years');
    const [siTime, setSiTime] = useState('5');
    const [siTimePeriod, setSiTimePeriod] = useState<'years' | 'months'>('years');
    const [siResult, setSiResult] = useState<{ interest: number; total: number } | null>(null);

    // Compound Interest State
    const [ciPrincipal, setCiPrincipal] = useState('100000');
    const [ciRate, setCiRate] = useState('5');
    const [ciRatePeriod, setCiRatePeriod] = useState<'years' | 'months'>('years');
    const [ciTime, setCiTime] = useState('5');
    const [ciTimePeriod, setCiTimePeriod] = useState<'years' | 'months'>('years');
    const [ciFrequency, setCiFrequency] = useState('12'); // Monthly
    const [ciResult, setCiResult] = useState<{ interest: number; total: number } | null>(null);
    
    const currencySymbols: {[key: string]: string} = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };

    const formatCurrency = (value: number) => {
        return (currencySymbols[currency] || currency) + value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const handleSimpleInterestCalc = () => {
        const p = parseFloat(siPrincipal);
        let annualRate = parseFloat(siRate) / 100;
        let timeInYears = parseFloat(siTime);

        if (isNaN(p) || isNaN(annualRate) || isNaN(timeInYears) || p <= 0 || annualRate < 0 || timeInYears <= 0) {
            toast({ title: "Invalid Input", description: "Please enter valid positive numbers.", variant: "destructive" });
            return;
        }

        // Standardize to annual rate and time in years for calculation
        if (siRatePeriod === 'months') {
            annualRate = annualRate * 12;
        }
        
        if (siTimePeriod === 'months') {
            timeInYears = timeInYears / 12;
        }

        const interest = p * annualRate * timeInYears;
        const total = p + interest;
        setSiResult({ interest, total });
    };

    const handleCompoundInterestCalc = () => {
        const p = parseFloat(ciPrincipal);
        let annualRate = parseFloat(ciRate) / 100;
        let timeInYears = parseFloat(ciTime);
        const n = parseInt(ciFrequency, 10);

        if (isNaN(p) || isNaN(annualRate) || isNaN(timeInYears) || p <= 0 || annualRate < 0 || timeInYears <= 0) {
            toast({ title: "Invalid Input", description: "Please enter valid positive numbers.", variant: "destructive" });
            return;
        }

        // Standardize to annual rate and time in years for calculation
        if (ciRatePeriod === 'months') {
            annualRate = annualRate * 12;
        }

        if (ciTimePeriod === 'months') {
            timeInYears = timeInYears / 12;
        }
        
        const amount = p * Math.pow((1 + annualRate / n), n * timeInYears);
        const interest = amount - p;
        setCiResult({ interest, total: amount });
    };

    const handleClearSimple = () => {
        setSiPrincipal('100000');
        setSiRate('5');
        setSiTime('5');
        setSiResult(null);
    }
    
     const handleClearCompound = () => {
        setCiPrincipal('100000');
        setCiRate('5');
        setCiTime('5');
        setCiResult(null);
    }

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    const renderResult = (result: { interest: number; total: number } | null, principal: string) => {
        if (!result) return null;
        const pieChartData = result ? [
            { name: 'Principal Amount', value: parseFloat(principal) },
            { name: 'Total Interest', value: result.interest },
        ] : [];

        return (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Interest Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-3">
                         <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-base text-muted-foreground">Principal Amount</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold">{formatCurrency(parseFloat(principal))}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-base text-muted-foreground">Total Interest</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold text-primary">{formatCurrency(result.interest)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-base text-muted-foreground">Total Amount</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold text-primary">{formatCurrency(result.total)}</p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><PieChartIcon className="h-5 w-5" />Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(props) => `${((props.percent || 0) * 100).toFixed(0)}%`}>
                                        {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{paddingTop: '20px'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        );
    }


    return (
        <Tabs defaultValue="simple" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple">Simple Interest</TabsTrigger>
                <TabsTrigger value="compound">Compound Interest</TabsTrigger>
            </TabsList>
            <TabsContent value="simple">
                <Card>
                    <CardHeader>
                        <CardTitle>Simple Interest Calculator</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="si-principal">Principal Amount</Label>
                                <div className="flex gap-2">
                                <Select value={currency} onValueChange={setCurrency}>
                                  <SelectTrigger id="currency-select-si" className="w-[100px]"><SelectValue/></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="INR">INR</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                    <SelectItem value="JPY">JPY</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input id="si-principal" type="number" value={siPrincipal} onChange={e => setSiPrincipal(e.target.value)} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="si-rate">Rate of Interest</Label>
                                <div className="flex gap-2">
                                    <Input id="si-rate" type="number" value={siRate} onChange={e => setSiRate(e.target.value)} />
                                     <Select value={siRatePeriod} onValueChange={(val) => setSiRatePeriod(val as 'years' | 'months')}>
                                        <SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger>
                                        <SelectContent><SelectItem value="years">per year</SelectItem><SelectItem value="months">per month</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="si-time">Time Period</Label>
                                <div className="flex gap-2">
                                    <Input id="si-time" type="number" value={siTime} onChange={e => setSiTime(e.target.value)} />
                                    <Select value={siTimePeriod} onValueChange={(val) => setSiTimePeriod(val as 'years' | 'months')}>
                                        <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                                        <SelectContent><SelectItem value="years">Years</SelectItem><SelectItem value="months">Months</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSimpleInterestCalc} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate</Button>
                            <Button onClick={handleClearSimple} variant="outline" className="w-full"><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
                        </div>
                        {siResult && renderResult(siResult, siPrincipal)}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="compound">
                 <Card>
                    <CardHeader>
                        <CardTitle>Compound Interest Calculator</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                              <div className="space-y-2">
                                <Label htmlFor="ci-principal">Principal Amount</Label>
                                <div className="flex gap-2">
                                    <Select value={currency} onValueChange={setCurrency}>
                                      <SelectTrigger id="currency-select-ci" className="w-[100px]"><SelectValue/></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="INR">INR</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                        <SelectItem value="JPY">JPY</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input id="ci-principal" type="number" value={ciPrincipal} onChange={e => setCiPrincipal(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ci-rate">Rate of Interest</Label>
                                <div className="flex gap-2">
                                  <Input id="ci-rate" type="number" value={ciRate} onChange={e => setCiRate(e.target.value)} />
                                  <Select value={ciRatePeriod} onValueChange={(val) => setCiRatePeriod(val as 'years' | 'months')}>
                                      <SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger>
                                      <SelectContent><SelectItem value="years">per year</SelectItem><SelectItem value="months">per month</SelectItem></SelectContent>
                                  </Select>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="ci-time">Time Period</Label>
                                <div className="flex gap-2">
                                    <Input id="ci-time" type="number" value={ciTime} onChange={e => setCiTime(e.target.value)} />
                                    <Select value={ciTimePeriod} onValueChange={(val) => setCiTimePeriod(val as 'years' | 'months')}><SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="years">Years</SelectItem><SelectItem value="months">Months</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ci-frequency">Compounding Frequency</Label>
                                <Select value={ciFrequency} onValueChange={setCiFrequency}><SelectTrigger id="ci-frequency"><SelectValue/></SelectTrigger><SelectContent>
                                    <SelectItem value="1">Yearly</SelectItem><SelectItem value="2">Half-yearly</SelectItem><SelectItem value="4">Quarterly</SelectItem><SelectItem value="12">Monthly</SelectItem>
                                </SelectContent></Select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCompoundInterestCalc} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate</Button>
                            <Button onClick={handleClearCompound} variant="outline" className="w-full"><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
                        </div>
                         {ciResult && renderResult(ciResult, ciPrincipal)}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
