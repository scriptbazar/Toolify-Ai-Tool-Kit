
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function HraCalculator() {
    const [basicSalary, setBasicSalary] = useState('');
    const [hraReceived, setHraReceived] = useState('');
    const [rentPaid, setRentPaid] = useState('');
    const [isMetroCity, setIsMetroCity] = useState(false);
    const [exemption, setExemption] = useState<number | null>(null);
    const { toast } = useToast();

    const calculateExemption = () => {
        const basic = parseFloat(basicSalary);
        const hra = parseFloat(hraReceived);
        const rent = parseFloat(rentPaid);

        if (isNaN(basic) || isNaN(hra) || isNaN(rent) || basic <= 0 || hra < 0 || rent < 0) {
            toast({
                title: "Invalid Input",
                description: "Please enter valid positive numbers for all fields.",
                variant: "destructive"
            });
            return;
        }

        // 1. Actual HRA received
        const actualHra = hra;

        // 2. Rent paid minus 10% of basic salary
        const rentMinus10Percent = rent - (0.10 * basic);

        // 3. 50% of basic salary for metro cities, 40% for non-metro
        const salaryPercentage = isMetroCity ? 0.50 * basic : 0.40 * basic;
        
        const calculatedExemption = Math.min(actualHra, rentMinus10Percent > 0 ? rentMinus10Percent : 0, salaryPercentage);
        
        setExemption(calculatedExemption > 0 ? calculatedExemption : 0);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>HRA Exemption Calculator</CardTitle>
                    <CardDescription>Calculate your House Rent Allowance (HRA) tax exemption based on your salary and rent.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="basic-salary">Basic Salary (Annual)</Label>
                            <Input id="basic-salary" type="number" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} placeholder="e.g., 600000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hra-received">HRA Received (Annual)</Label>
                            <Input id="hra-received" type="number" value={hraReceived} onChange={e => setHraReceived(e.target.value)} placeholder="e.g., 240000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rent-paid">Total Rent Paid (Annual)</Label>
                            <Input id="rent-paid" type="number" value={rentPaid} onChange={e => setRentPaid(e.target.value)} placeholder="e.g., 300000" />
                        </div>
                         <div className="flex items-center space-x-2 pt-8">
                            <Checkbox id="metro-city" checked={isMetroCity} onCheckedChange={(checked) => setIsMetroCity(Boolean(checked))} />
                            <Label htmlFor="metro-city">Do you live in a metro city (Delhi, Mumbai, Kolkata, Chennai)?</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Button onClick={calculateExemption} className="w-full">
                <Calculator className="mr-2 h-4 w-4" /> Calculate HRA Exemption
            </Button>
            {exemption !== null && (
                <Card className="mt-6 text-center">
                    <CardHeader>
                        <CardTitle>HRA Tax Exemption</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(exemption)}
                        </p>
                        <p className="text-sm text-muted-foreground">This is the maximum HRA amount exempt from tax for the year.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
