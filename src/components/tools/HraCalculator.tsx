
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const metroCities = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai'];

export function HraCalculator() {
    const [basicSalary, setBasicSalary] = useState('50000');
    const [hraReceived, setHraReceived] = useState('20000');
    const [rentPaid, setRentPaid] = useState('15000');
    const [city, setCity] = useState('non-metro');
    const [exemption, setExemption] = useState<number | null>(null);
    const { toast } = useToast();

    const calculateHra = () => {
        const basic = parseFloat(basicSalary);
        const hra = parseFloat(hraReceived);
        const rent = parseFloat(rentPaid);

        if (isNaN(basic) || isNaN(hra) || isNaN(rent)) {
            toast({ title: "Invalid Input", variant: "destructive" });
            return;
        }

        const condition1 = hra;
        const condition2 = city === 'metro' ? basic * 0.5 : basic * 0.4;
        const condition3 = Math.max(0, rent - (basic * 0.1));

        const hraExemption = Math.min(condition1, condition2, condition3);
        setExemption(hraExemption);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>HRA Exemption Calculator</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Basic Salary (Monthly)</Label><Input type="number" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} /></div>
                    <div className="space-y-2"><Label>HRA Received (Monthly)</Label><Input type="number" value={hraReceived} onChange={e => setHraReceived(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Rent Paid (Monthly)</Label><Input type="number" value={rentPaid} onChange={e => setRentPaid(e.target.value)} /></div>
                    <div className="space-y-2">
                        <Label>City Type</Label>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="metro">Metro (Delhi, Mumbai, Kolkata, Chennai)</SelectItem>
                                <SelectItem value="non-metro">Non-Metro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            <Button onClick={calculateHra} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate HRA Exemption</Button>
            {exemption !== null && (
                <Card>
                    <CardHeader>
                        <CardTitle>Calculated HRA Exemption</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-primary">₹{exemption.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        <p className="text-sm text-muted-foreground">This is the amount exempt from tax per month.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
