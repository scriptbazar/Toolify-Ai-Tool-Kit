'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';

export function AdSenseRevenueCalculator() {
  const [pageViews, setPageViews] = useState('50000');
  const [ctr, setCtr] = useState('1.5');
  const [cpc, setCpc] = useState('0.25');
  const [revenue, setRevenue] = useState<{ daily: number, monthly: number, yearly: number } | null>(null);

  const calculateRevenue = () => {
    const _pageViews = parseFloat(pageViews);
    const _ctr = parseFloat(ctr) / 100;
    const _cpc = parseFloat(cpc);

    if ([_pageViews, _ctr, _cpc].every(v => v >= 0)) {
      const daily = _pageViews * _ctr * _cpc;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="page-views">Daily Page Views</Label>
          <Input id="page-views" type="number" value={pageViews} onChange={(e) => setPageViews(e.target.value)} placeholder="e.g., 50000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctr">Click-Through Rate (CTR) (%)</Label>
          <Input id="ctr" type="number" value={ctr} onChange={(e) => setCtr(e.target.value)} placeholder="e.g., 1.5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpc">Cost Per Click (CPC) ($)</Label>
          <Input id="cpc" type="number" value={cpc} onChange={(e) => setCpc(e.target.value)} placeholder="e.g., 0.25" />
        </div>
      </div>
      <Button onClick={calculateRevenue} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate Revenue
      </Button>

      {revenue !== null && (
        <Card className="mt-6 text-center">
           <CardHeader>
                <CardTitle>Estimated AdSense Revenue</CardTitle>
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
