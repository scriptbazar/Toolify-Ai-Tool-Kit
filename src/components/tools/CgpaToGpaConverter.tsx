
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CgpaToGpaConverter() {
  const [cgpa, setCgpa] = useState('');
  const [cgpaScale, setCgpaScale] = useState('10');
  const [gpaScale, setGpaScale] = useState('4');
  const [gpaResult, setGpaResult] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleCalculate = () => {
    const cgpaVal = parseFloat(cgpa);
    const cgpaScaleVal = parseFloat(cgpaScale);
    const gpaScaleVal = parseFloat(gpaScale);

    if (isNaN(cgpaVal) || isNaN(cgpaScaleVal) || isNaN(gpaScaleVal) || cgpaScaleVal <= 0 || gpaScaleVal <= 0 || cgpaVal < 0) {
        toast({ title: "Invalid Input", description: "Please enter valid, positive numbers for all fields.", variant: "destructive"});
        return;
    }
    
    if (cgpaVal > cgpaScaleVal) {
        toast({ title: "Invalid CGPA", description: "Your CGPA cannot be greater than its scale.", variant: "destructive"});
        return;
    }

    const result = (cgpaVal / cgpaScaleVal) * gpaScaleVal;
    setGpaResult(result.toFixed(2));
  };


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>CGPA to GPA Conversion</CardTitle>
                <CardDescription>Convert your CGPA from one scale (e.g., 10) to another (e.g., 4.0).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cgpa-input">Your CGPA</Label>
                        <Input id="cgpa-input" type="number" value={cgpa} onChange={e => setCgpa(e.target.value)} placeholder="e.g., 8.7"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cgpa-scale">Your CGPA Scale</Label>
                        <Input id="cgpa-scale" type="number" value={cgpaScale} onChange={e => setCgpaScale(e.target.value)} placeholder="e.g., 10"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gpa-scale">Target GPA Scale</Label>
                        <Input id="gpa-scale" type="number" value={gpaScale} onChange={e => setGpaScale(e.target.value)} placeholder="e.g., 4.0"/>
                    </div>
                </div>
                 <Button onClick={handleCalculate} className="w-full">
                    <Calculator className="mr-2 h-4 w-4"/>
                    Convert to GPA
                </Button>
            </CardContent>
        </Card>
        {gpaResult !== null && (
            <Card className="mt-6 text-center animate-in fade-in-50">
                <CardHeader>
                    <CardTitle>Converted GPA</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">{gpaResult}</p>
                    <p className="text-sm text-muted-foreground">on a {gpaScale}-point scale</p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
