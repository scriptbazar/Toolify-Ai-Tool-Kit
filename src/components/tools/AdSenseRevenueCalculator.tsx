
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RevenueCalculatorUI } from './RevenueCalculatorUI'; // Reusable UI

export function AdSenseRevenueCalculator() {
  const [pageViews, setPageViews] = useState('50000');
  const [ctr, setCtr] = useState('1.5');
  const [cpc, setCpc] = useState('0.25');
  const [revenue, setRevenue] = useState<{ daily: number, weekly: number, monthly: number, yearly: number } | null>(null);
  const { toast } = useToast();

  const calculateRevenue = () => {
    const _pageViews = parseFloat(pageViews);
    const _ctr = parseFloat(ctr) / 100;
    const _cpc = parseFloat(cpc);

    if ([_pageViews, _ctr, _cpc].every(v => v >= 0)) {
      const daily = _pageViews * _ctr * _cpc;
      setRevenue({
        daily,
        weekly: daily * 7,
        monthly: daily * 30,
        yearly: daily * 365,
      });
    } else {
      setRevenue(null);
      toast({ title: "Invalid Input", variant: "destructive"});
    }
  };

  const getShareSummary = () => {
      if (!revenue) return '';
      return `*AdSense Earning Estimation*\n\n` +
             `*Inputs:*\n` +
             `- Page Views: ${pageViews}\n` +
             `- CTR: ${ctr}%\n` +
             `- CPC: $${cpc}\n\n` +
             `*Estimated Earnings:*\n` +
             `- Daily: $${revenue.daily.toFixed(2)}\n` +
             `- Monthly: $${revenue.monthly.toFixed(2)}\n` +
             `- Yearly: $${revenue.yearly.toFixed(2)}`;
  }
  
  const pdfBody = [
      ['Daily Page Views', pageViews],
      ['Click-Through Rate (CTR)', `${ctr}%`],
      ['Cost Per Click (CPC)', `$${parseFloat(cpc).toFixed(2)}`],
  ];

  return (
    <RevenueCalculatorUI
        title="AdSense Revenue Calculator"
        revenue={revenue}
        onClear={() => {
            setPageViews('50000');
            setCtr('1.5');
            setCpc('0.25');
            setRevenue(null);
        }}
        getShareSummary={getShareSummary}
        pdfBody={pdfBody}
        pdfTitle="AdSense Revenue Report"
        onCalculate={calculateRevenue}
    >
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
    </RevenueCalculatorUI>
  );
}
