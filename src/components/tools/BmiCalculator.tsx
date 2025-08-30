
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function BmiCalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBmi = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const bmiValue = w / ((h / 100) * (h / 100));
      setBmi(bmiValue);
    } else {
      setBmi(null);
    }
  };

  const getBmiCategory = () => {
    if (bmi === null) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi >= 18.5 && bmi < 24.9) return 'Normal weight';
    if (bmi >= 25 && bmi < 29.9) return 'Overweight';
    return 'Obesity';
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 175" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 70" />
            </div>
        </div>
        <Button onClick={calculateBmi} className="w-full">Calculate BMI</Button>

        {bmi !== null && (
            <Card className="mt-6 text-center">
                <CardHeader>
                    <CardTitle>Your BMI Result</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{bmi.toFixed(2)}</p>
                    <p className="text-xl text-muted-foreground">{getBmiCategory()}</p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
