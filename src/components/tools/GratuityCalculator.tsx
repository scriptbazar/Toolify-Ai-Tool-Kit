
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GratuityCalculator() {
    const [monthlySalary, setMonthlySalary] = useState('');
    const [yearsOfService, setYearsOfService] = useState('');
    const [gratuity, setGratuity] = useState<number | null>(null);
    const { toast } = useToast();

    const calculateGratuity = () => {
        const salary = parseFloat(monthlySalary);
        const years = parseInt(yearsOfService, 10);

        if (isNaN(salary) || salary <= 0 || isNaN(years) || years < 5) {
            toast({ title: 'Invalid Input', description: 'Please enter a valid salary and at least 5 years of service.', variant: 'destructive'});
            return;
        }

        // Gratuity calculation formula for employees covered under the Act
        const result = (salary / 26) * 15 * years;
        setGratuity(result);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gratuity Calculator Inputs</CardTitle>
                    <CardDescription>Based on the Gratuity Act of 1972, applicable for employees with 5+ years of service.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="salary">Last Drawn Monthly Salary (Basic + DA)</Label>
                        <Input id="salary" type="number" value={monthlySalary} onChange={e => setMonthlySalary(e.target.value)} placeholder="e.g., 50000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="years">Years of Service</Label>
                        <Input id="years" type="number" value={yearsOfService} onChange={e => setYearsOfService(e.target.value)} placeholder="e.g., 10"/>
                    </div>
                </CardContent>
            </Card>
            <Button onClick={calculateGratuity} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Gratuity</Button>
            {gratuity !== null && (
                <Card className="mt-6 text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><Award/>Estimated Gratuity Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(gratuity)}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
