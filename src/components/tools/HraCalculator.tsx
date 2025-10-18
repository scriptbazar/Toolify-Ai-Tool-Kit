
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Home, PieChart as PieChartIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';

const PieChartDynamic = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });


interface HraResult {
    hraExemption: number;
    taxableHra: number;
    totalHra: number;
}

export function HraCalculator() {
  const [basicSalary, setBasicSalary] = useState('');
  const [da, setDa] = useState('0');
  const [hraReceived, setHraReceived] = useState('');
  const [rentPaid, setRentPaid] = useState('');
  const [isMetroCity, setIsMetroCity] = useState(false);
  const [result, setResult] = useState<HraResult | null>(null);
  const { toast } = useToast();

  const calculateHra = () => {
    const basic = parseFloat(basicSalary);
    const dearness = parseFloat(da);
    const hra = parseFloat(hraReceived);
    const rent = parseFloat(rentPaid);

    if (isNaN(basic) || isNaN(dearness) || isNaN(hra) || isNaN(rent)) {
      toast({ title: 'Invalid Input', description: 'Please enter valid numbers for all fields.', variant: 'destructive' });
      return;
    }

    const salaryForHra = basic + dearness;

    const exemption1 = hra;
    const exemption2 = rent - (0.10 * salaryForHra);
    const exemption3 = (isMetroCity ? 0.50 : 0.40) * salaryForHra;

    const hraExemption = Math.min(exemption1, exemption2, exemption3);
    const finalExemption = Math.max(0, hraExemption);
    
    setResult({
        hraExemption: finalExemption,
        taxableHra: Math.max(0, hra - finalExemption),
        totalHra: hra,
    });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const pieChartData = result ? [
    { name: 'Exempted HRA', value: result.hraExemption },
    { name: 'Taxable HRA', value: result.taxableHra },
  ] : [];

  const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-1))'];


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HRA Exemption Calculator</CardTitle>
          <CardDescription>Calculate your House Rent Allowance tax exemption.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basic-salary">Basic Salary (Annual)</Label>
              <Input id="basic-salary" type="number" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} placeholder="e.g., 500000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="da">Dearness Allowance (Annual)</Label>
              <Input id="da" type="number" value={da} onChange={e => setDa(e.target.value)} placeholder="e.g., 50000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hra-received">HRA Received (Annual)</Label>
              <Input id="hra-received" type="number" value={hraReceived} onChange={e => setHraReceived(e.target.value)} placeholder="e.g., 200000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent-paid">Total Rent Paid (Annual)</Label>
              <Input id="rent-paid" type="number" value={rentPaid} onChange={e => setRentPaid(e.target.value)} placeholder="e.g., 240000" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="metro-city" checked={isMetroCity} onCheckedChange={(checked) => setIsMetroCity(Boolean(checked))} />
            <Label htmlFor="metro-city">Do you live in a metro city? (Delhi, Mumbai, Chennai, Kolkata)</Label>
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={calculateHra} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate HRA Exemption
      </Button>

      {result !== null && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              Your HRA Exemption Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Exempted HRA</span>
                <span className="font-bold text-green-500">{formatCurrency(result.hraExemption)}</span>
              </div>
               <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxable HRA</span>
                <span className="font-bold text-red-500">{formatCurrency(result.taxableHra)}</span>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg flex justify-between items-center">
                <span className="text-lg text-primary font-bold">Total HRA Received</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(result.totalHra)}</span>
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
