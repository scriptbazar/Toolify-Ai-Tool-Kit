
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';
import { Badge } from '../ui/badge';

export function AdMobRevenueCalculator() {
  const [dau, setDau] = useState('10000');
  const [impressionsPerDau, setImpressionsPerDau] = useState('5');
  const [matchRate, setMatchRate] = useState('98');
  const [showRate, setShowRate] = useState('95');
  const [ecpm, setEcpm] = useState('1.50');
  const [revenue, setRevenue] = useState<{ daily: number, monthly: number, yearly: number } | null>(null);

  const calculateRevenue = () => {
    const _dau = parseFloat(dau);
    const _impressions = parseFloat(impressionsPerDau);
    const _match = parseFloat(matchRate) / 100;
    const _show = parseFloat(showRate) / 100;
    const _ecpm = parseFloat(ecpm);

    if ([_dau, _impressions, _match, _show, _ecpm].every(v => v > 0)) {
      const daily = _dau * _impressions * _match * _show * (_ecpm / 1000);
      setRevenue({
        daily,
        monthly: daily * 30,
        yearly: daily * 365,
      });
    } else {
      setRevenue(null);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dau">Daily Active Users (DAU)</Label>
          <Input id="dau" type="number" value={dau} onChange={(e) => setDau(e.target.value)} placeholder="e.g., 10000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="impressions">Ad Impressions per DAU</Label>
          <Input id="impressions" type="number" value={impressionsPerDau} onChange={(e) => setImpressionsPerDau(e.target.value)} placeholder="e.g., 5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ecpm">eCPM ($)</Label>
          <Input id="ecpm" type="number" value={ecpm} onChange={(e) => setEcpm(e.target.value)} placeholder="e.g., 1.50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="match-rate">Match Rate (%)</Label>
          <Input id="match-rate" type="number" value={matchRate} onChange={(e) => setMatchRate(e.target.value)} placeholder="e.g., 98" />
        </div>
         <div className="space-y-2">
          <Label htmlFor="show-rate">Show Rate (%)</Label>
          <Input id="show-rate" type="number" value={showRate} onChange={(e) => setShowRate(e.target.value)} placeholder="e.g., 95" />
        </div>
      </div>
      <Button onClick={calculateRevenue} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate Revenue
      </Button>

      {revenue !== null && (
        <Card className="mt-6 text-center">
           <CardHeader>
                <CardTitle>Estimated AdMob Revenue</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Daily</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(revenue.daily)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
               <p className="text-sm text-muted-foreground">Monthly</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(revenue.monthly)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Yearly</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(revenue.yearly)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
