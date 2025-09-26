
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
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
        let r = parseFloat(siRate) / 100;
        let t = parseFloat(siTime);

        if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r < 0 || t <= 0) {
            toast({ title: "Invalid Input", description: "Please enter valid positive numbers.", variant: "destructive" });
            return;
        }

        // Adjust rate to be annual if it's given monthly
        if (siRatePeriod === 'months') {
            r = r * 12;
        }
        
        // Adjust time to be in years if it's given in months
        if (siTimePeriod === 'months') {
            t = t / 12;
        }

        const interest = p * r * t;
        const total = p + interest;
        setSiResult({ interest, total });
    };

    const handleCompoundInterestCalc = () => {
        const p = parseFloat(ciPrincipal);
        let r = parseFloat(ciRate) / 100;
        let t = parseFloat(ciTime);
        const n = parseInt(ciFrequency, 10);

        if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r < 0 || t <= 0) {
            toast({ title: "Invalid Input", description: "Please enter valid positive numbers.", variant: "destructive" });
            return;
        }

        // Adjust rate to be annual if it's given monthly
        if (ciRatePeriod === 'months') {
            r = r * 12;
        }

        // Adjust time to be in years if it's given in months
        if (ciTimePeriod === 'months') {
            t = t / 12;
        }
        
        const amount = p * Math.pow((1 + r / n), n * t);
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

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))'];

    const renderResult = (result: { interest: number; total: number } | null, principal: string) => {
        if (!result) return null;
        const pieChartData = [
            { name: 'Principal Amount', value: parseFloat(principal) },
            { name: 'Total Interest', value: result.interest },
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Interest</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(result.interest)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(result.total)}</p>
                </div>
                 <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><PieChartIcon className="h-5 w-5" />Payment Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
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
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="currency-select-si">Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                  <SelectTrigger id="currency-select-si"><SelectValue/></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                                  </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="si-principal">Principal Amount</Label>
                                <Input id="si-principal" type="number" value={siPrincipal} onChange={e => setSiPrincipal(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                             <div className="space-y-2">
                                <Label htmlFor="currency-select-ci">Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                  <SelectTrigger id="currency-select-ci"><SelectValue/></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                                  </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="ci-principal">Principal Amount</Label>
                                <Input id="ci-principal" type="number" value={ciPrincipal} onChange={e => setCiPrincipal(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
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
