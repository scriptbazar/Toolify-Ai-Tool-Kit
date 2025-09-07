
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Fuel } from 'lucide-react';

export function FuelCostCalculator() {
  const [distance, setDistance] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [price, setPrice] = useState('');
  const [totalCost, setTotalCost] = useState<number | null>(null);

  const calculateCost = () => {
    const dist = parseFloat(distance);
    const eff = parseFloat(efficiency);
    const prc = parseFloat(price);

    if (dist > 0 && eff > 0 && prc > 0) {
      // Assuming efficiency is in km/l
      const fuelNeeded = dist / eff;
      const cost = fuelNeeded * prc;
      setTotalCost(cost);
    } else {
      setTotalCost(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="distance">Trip Distance (km)</Label>
          <Input id="distance" type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g., 500" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="efficiency">Fuel Efficiency (km/l)</Label>
          <Input id="efficiency" type="number" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} placeholder="e.g., 15" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Fuel Price ($/liter)</Label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 1.50" />
        </div>
      </div>
      <Button onClick={calculateCost} className="w-full">
        <Fuel className="mr-2 h-4 w-4" /> Calculate Fuel Cost
      </Button>

      {totalCost !== null && (
        <Card className="mt-6 text-center">
           <CardHeader>
                <CardTitle>Estimated Fuel Cost</CardTitle>
                <CardDescription>The total estimated cost for your trip.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">${totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
