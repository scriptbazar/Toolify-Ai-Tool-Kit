
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';

export function HraCalculator() {
    const [basicSalary, setBasicSalary] = useState('');
    const [da, setDa] = useState('0');
    const [hraReceived, setHraReceived] = useState('');
    const [rentPaid, setRentPaid] = useState('');
    const [isMetroCity, setIsMetroCity] = useState(true);
    const [result, setResult] = useState<{ exemptHra: number, taxableHra: number } | null>(null);
    const { toast } = useToast();

    const calculateHRA = () => {
        const basic = parseFloat(basicSalary);
        const daVal = parseFloat(da);
        const hra = parseFloat(hraReceived);
        const rent = parseFloat(rentPaid);

        if (isNaN(basic) || isNaN(daVal) || isNaN(hra) || isNaN(rent)) {
            toast({ title: 'Invalid Input', description: 'Please fill all the required fields with valid numbers.', variant: 'destructive'});
            return;
        }

        const salaryForHra = basic + daVal;
        
        const rule1 = hra; // Actual HRA received
        const rule2 = isMetroCity ? salaryForHra * 0.5 : salaryForHra * 0.4; // 50% or 40% of salary
        const rule3 = rent - (salaryForHra * 0.1); // Rent paid minus 10% of salary
        
        const exemptHra = Math.max(0, Math.min(rule1, rule2, rule3));
        const taxableHra = Math.max(0, hra - exemptHra);

        setResult({ exemptHra, taxableHra });
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>HRA Exemption Calculator</CardTitle>
                    <CardDescription>Calculate your House Rent Allowance tax exemption.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Basic Salary (Annual)</Label><Input type="number" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Dearness Allowance (DA) (Annual)</Label><Input type="number" value={da} onChange={e => setDa(e.target.value)} /></div>
                    <div className="space-y-2"><Label>HRA Received (Annual)</Label><Input type="number" value={hraReceived} onChange={e => setHraReceived(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Total Rent Paid (Annual)</Label><Input type="number" value={rentPaid} onChange={e => setRentPaid(e.target.value)} /></div>
                    <div className="flex items-center space-x-2 pt-6"><Checkbox id="is-metro" checked={isMetroCity} onCheckedChange={c => setIsMetroCity(!!c)}/><Label htmlFor="is-metro">Do you live in a metro city? (Delhi, Mumbai, Chennai, Kolkata)</Label></div>
                </CardContent>
            </Card>
            <Button onClick={calculateHRA} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Exemption</Button>
            {result && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Home/>HRA Calculation Result</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg"><p className="text-sm text-green-700 dark:text-green-400">Exempted HRA</p><p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{result.exemptHra.toLocaleString('en-IN')}</p></div>
                        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg"><p className="text-sm text-red-700 dark:text-red-400">Taxable HRA</p><p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{result.taxableHra.toLocaleString('en-IN')}</p></div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
