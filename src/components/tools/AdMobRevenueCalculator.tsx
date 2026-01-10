
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RevenueCalculatorUI } from './RevenueCalculatorUI'; // Reusable UI

const appCategories = [
    { value: 'game', label: 'Gaming' },
    { value: 'social', label: 'Social & Communication' },
    { value: 'utility', label: 'Utility & Productivity' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
];

export function AdMobRevenueCalculator() {
  const [mau, setMau] = useState('100000');
  const [impressionsPerDau, setImpressionsPerDau] = useState('5');
  const [region, setRegion] = useState('global');
  const [platform, setPlatform] = useState('android');
  const [category, setCategory] = useState('game');
  const [ecpm, setEcpm] = useState('1.50');
  const [revenue, setRevenue] = useState<{ daily: number, weekly: number, monthly: number, yearly: number } | null>(null);
  const { toast } = useToast();

  const calculateRevenue = () => {
    const _mau = parseFloat(mau);
    const _impressions = parseFloat(impressionsPerDau);
    const _ecpm = parseFloat(ecpm);
    const dau = _mau / 30;

    const regionMultipliers: { [key: string]: number } = { global: 1.0, us: 1.8, eu: 1.5, in: 0.6, sea: 0.7 };
    const platformMultipliers = { android: 1.0, ios: 1.4 };
    const categoryMultipliers = { game: 1.2, social: 1.0, utility: 0.9, entertainment: 1.1, education: 0.8, other: 1.0 };
    
    const matchRate = 0.98;
    const showRate = 0.95;

    if ([dau, _impressions, _ecpm].every(v => v >= 0)) {
      const daily = dau * _impressions * matchRate * showRate * (_ecpm / 1000) * (regionMultipliers[region] || 1) * platformMultipliers[platform as keyof typeof platformMultipliers] * categoryMultipliers[category as keyof typeof categoryMultipliers];
      setRevenue({
        daily,
        weekly: daily * 7,
        monthly: daily * 30,
        yearly: daily * 365,
      });
    } else {
      setRevenue(null);
      toast({ title: "Invalid Input", description: "Please enter valid, non-negative numbers.", variant: "destructive"});
    }
  };

  const getShareSummary = () => {
      if (!revenue) return '';
      return `*AdMob Earning Estimation*\n\n` +
             `*Inputs:*\n` +
             `- MAU: ${mau}\n` +
             `- Platform: ${platform}\n` +
             `- eCPM: ${ecpm}\n\n` +
             `*Estimated Earnings:*\n` +
             `- Daily: ${revenue.daily.toFixed(2)}\n` +
             `- Monthly: ${revenue.monthly.toFixed(2)}\n` +
             `- Yearly: ${revenue.yearly.toFixed(2)}`;
  }
  
  const pdfBody = [
      ['Monthly Active Users (MAU)', mau],
      ['Impressions per DAU', impressionsPerDau],
      ['Region', region.toUpperCase()],
      ['Platform', platform.charAt(0).toUpperCase() + platform.slice(1)],
      ['App Category', category.charAt(0).toUpperCase() + category.slice(1)],
      ['eCPM', `$${parseFloat(ecpm).toFixed(2)}`],
  ];

  return (
    <RevenueCalculatorUI
        title="AdMob Revenue Calculator"
        revenue={revenue}
        onClear={() => {
            setMau('100000');
            setImpressionsPerDau('5');
            setRegion('global');
            setPlatform('android');
            setCategory('game');
            setEcpm('1.50');
            setRevenue(null);
        }}
        getShareSummary={getShareSummary}
        pdfBody={pdfBody}
        pdfTitle="AdMob Revenue Report"
        onCalculate={calculateRevenue}
    >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="mau">Monthly Active Users (MAU)</Label>
                <Input id="mau" type="number" value={mau} onChange={(e) => setMau(e.target.value)} placeholder="e.g., 100000" />
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
                <Label htmlFor="region-select">Region</Label>
                <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger id="region-select"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="eu">Europe</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="sea">Southeast Asia</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="platform-select">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform-select"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="android">Android</SelectItem>
                        <SelectItem value="ios">iOS</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="category-select">App Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category-select"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {appCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
    </RevenueCalculatorUI>
  );
}
