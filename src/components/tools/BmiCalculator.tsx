
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

export function BmiCalculator() {
  const [unit, setUnit] = useState('metric');
  const [metric, setMetric] = useState({ height: '', weight: '' });
  const [imperial, setImperial] = useState({ ft: '', in: '', lbs: '' });
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string } | null>(null);

  const calculateBmi = () => {
    let heightInMeters = 0;
    let weightInKg = 0;

    if (unit === 'metric') {
      const h = parseFloat(metric.height);
      const w = parseFloat(metric.weight);
      if (h > 0 && w > 0) {
        heightInMeters = h / 100;
        weightInKg = w;
      }
    } else {
      const ft = parseFloat(imperial.ft) || 0;
      const inch = parseFloat(imperial.in) || 0;
      const lbs = parseFloat(imperial.lbs);
      if ((ft > 0 || inch > 0) && lbs > 0) {
        const totalInches = (ft * 12) + inch;
        heightInMeters = totalInches * 0.0254;
        weightInKg = lbs * 0.453592;
      }
    }

    if (heightInMeters > 0 && weightInKg > 0) {
      const bmi = weightInKg / (heightInMeters * heightInMeters);
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obesity';
      setBmiResult({ bmi, category });
    } else {
      setBmiResult(null);
    }
  };
  
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Underweight': return <Badge variant="default" className="bg-blue-500">Underweight</Badge>;
      case 'Normal': return <Badge variant="default" className="bg-green-500">Normal</Badge>;
      case 'Overweight': return <Badge variant="default" className="bg-yellow-500">Overweight</Badge>;
      case 'Obesity': return <Badge variant="destructive">Obesity</Badge>;
      default: return null;
    }
  };

  const getBmiProgress = (bmi: number) => {
    if (bmi < 18.5) return (bmi / 18.5) * 25;
    if (bmi < 25) return 25 + ((bmi - 18.5) / 6.5) * 25;
    if (bmi < 30) return 50 + ((bmi - 25) / 5) * 25;
    return 75 + Math.min(25, ((bmi - 30) / 10) * 25);
  };


  return (
    <div className="space-y-6">
        <Tabs value={unit} onValueChange={setUnit}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="metric">Metric (cm/kg)</TabsTrigger>
                <TabsTrigger value="imperial">Imperial (ft/in/lbs)</TabsTrigger>
            </TabsList>
            <TabsContent value="metric">
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div><Label htmlFor="metric-height">Height (cm)</Label><Input id="metric-height" type="number" value={metric.height} onChange={(e) => setMetric({...metric, height: e.target.value})} placeholder="e.g., 175" /></div>
                    <div><Label htmlFor="metric-weight">Weight (kg)</Label><Input id="metric-weight" type="number" value={metric.weight} onChange={(e) => setMetric({...metric, weight: e.target.value})} placeholder="e.g., 70" /></div>
                </div>
            </TabsContent>
            <TabsContent value="imperial">
                <div className="grid grid-cols-3 gap-4 mt-4">
                     <div><Label htmlFor="imperial-ft">Height (ft)</Label><Input id="imperial-ft" type="number" value={imperial.ft} onChange={(e) => setImperial({...imperial, ft: e.target.value})} placeholder="e.g., 5" /></div>
                     <div><Label htmlFor="imperial-in">Height (in)</Label><Input id="imperial-in" type="number" value={imperial.in} onChange={(e) => setImperial({...imperial, in: e.target.value})} placeholder="e.g., 9" /></div>
                    <div><Label htmlFor="imperial-lbs">Weight (lbs)</Label><Input id="imperial-lbs" type="number" value={imperial.lbs} onChange={(e) => setImperial({...imperial, lbs: e.target.value})} placeholder="e.g., 155" /></div>
                </div>
            </TabsContent>
        </Tabs>
        <Button onClick={calculateBmi} className="w-full">Calculate BMI</Button>

        {bmiResult && (
            <Card className="mt-6 text-center">
                <CardHeader>
                    <CardTitle>Your BMI Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-center gap-2">
                        <p className="text-5xl font-bold">{bmiResult.bmi.toFixed(1)}</p>
                        {getCategoryBadge(bmiResult.category)}
                    </div>
                     <div className="w-full pt-2">
                        <Progress value={getBmiProgress(bmiResult.bmi)} />
                        <div className="text-xs text-muted-foreground grid grid-cols-4 mt-1">
                            <span>Underweight</span>
                            <span>Normal</span>
                            <span>Overweight</span>
                            <span className="text-right">Obesity</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
