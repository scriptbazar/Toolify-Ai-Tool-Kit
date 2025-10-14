
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Download, Share2, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { getSettings } from '@/ai/flows/settings-management';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
    const dau = _mau / 30; // Approximate DAU from MAU

    // These are simplified placeholder multipliers. A real calculator would have complex data.
    const regionMultipliers: { [key: string]: number } = { global: 1.0, us: 1.8, eu: 1.5, in: 0.6, sea: 0.7 };
    const platformMultipliers = { android: 1.0, ios: 1.4 };
    const categoryMultipliers = { game: 1.2, social: 1.0, utility: 0.9, entertainment: 1.1, education: 0.8, other: 1.0 };
    
    const matchRate = 0.98; // Assuming a constant 98% match rate
    const showRate = 0.95; // Assuming a constant 95% show rate

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
      toast({ title: "Invalid Input", description: "Please enter valid, non-negative numbers for all fields.", variant: "destructive"});
    }
  };
  
  const handleClear = () => {
    setMau('100000');
    setImpressionsPerDau('5');
    setRegion('global');
    setPlatform('android');
    setCategory('game');
    setEcpm('1.50');
    setRevenue(null);
    toast({ title: "Fields Cleared" });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  const chartData = revenue ? [
      { name: 'Daily', Earnings: revenue.daily },
      { name: 'Weekly', Earnings: revenue.weekly },
      { name: 'Monthly', Earnings: revenue.monthly },
      { name: 'Yearly', Earnings: revenue.yearly },
  ] : [];

  const handleDownloadPdf = async () => {
    if (!revenue) return;
    try {
        const settings = await getSettings();
        const siteTitle = settings.general?.siteTitle || 'ToolifyAI';
        const doc = new jsPDF();
        doc.setFontSize(18).text(`${siteTitle} - AdMob Revenue Report`, 14, 22);
        doc.setFontSize(11).setTextColor(100);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
        (doc as any).autoTable({
            startY: 35,
            head: [['Metric', 'Value']],
            body: [
                ['Monthly Active Users (MAU)', mau],
                ['Impressions per DAU', impressionsPerDau],
                ['Region', region.toUpperCase()],
                ['Platform', platform.charAt(0).toUpperCase() + platform.slice(1)],
                ['App Category', category.charAt(0).toUpperCase() + category.slice(1)],
                ['eCPM', formatCurrency(parseFloat(ecpm))],
            ],
            theme: 'striped',
        });
        const finalY = (doc as any).autoTable.previous.finalY;
        (doc as any).autoTable({
            startY: finalY + 10,
            head: [['Period', 'Estimated Earnings']],
            body: [
                ['Daily', formatCurrency(revenue.daily)],
                ['Weekly', formatCurrency(revenue.weekly)],
                ['Monthly', formatCurrency(revenue.monthly)],
                ['Yearly', formatCurrency(revenue.yearly)],
            ],
            theme: 'grid',
        });
        doc.save(`admob-report-${Date.now()}.pdf`);
    } catch (error) {
        console.error("PDF generation error:", error);
        toast({ title: 'Error generating PDF', variant: 'destructive' });
    }
  };

  const getShareSummary = () => {
      if (!revenue) return '';
      return `*AdMob Earning Estimation*\n\n` +
             `*Inputs:*\n` +
             `- MAU: ${mau}\n` +
             `- Platform: ${platform}\n` +
             `- eCPM: ${formatCurrency(parseFloat(ecpm))}\n\n` +
             `*Estimated Earnings:*\n` +
             `- Daily: ${formatCurrency(revenue.daily)}\n` +
             `- Monthly: ${formatCurrency(revenue.monthly)}\n` +
             `- Yearly: ${formatCurrency(revenue.yearly)}\n\n` +
             `_Calculated with ToolifyAI AdMob Calculator_`;
  }

  const handleShare = (platform: 'whatsapp' | 'email' | 'telegram') => {
      const summary = getShareSummary();
      if (!summary) return;
      if (platform === 'whatsapp') {
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
          window.open(whatsappUrl, '_blank');
      } else if (platform === 'email') {
          const subject = 'AdMob Revenue Calculation';
          const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary.replace(/\*/g, ''))}`;
          window.location.href = mailtoUrl;
      } else if (platform === 'telegram') {
          const telegramUrl = `https://t.me/share/url?url=https://toolifyai.com&text=${encodeURIComponent(summary)}`;
          window.open(telegramUrl, '_blank');
      }
  };

  return (
    <div className="space-y-6">
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
      <div className="flex gap-2">
        <Button onClick={calculateRevenue} className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Calculate Revenue
        </Button>
        {revenue !== null && (
            <Button onClick={handleClear} variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
        )}
      </div>

      {revenue !== null && (
        <div className="space-y-6">
            <Card className="text-center">
                <CardHeader>
                        <CardTitle>Estimated AdMob Revenue</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Daily</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(revenue.daily)}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Weekly</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(revenue.weekly)}</p>
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

            <Card>
                <CardHeader>
                    <CardTitle>Earnings Visualization</CardTitle>
                    <CardDescription>A visual representation of your estimated earnings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="Earnings" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Share2/>Share or Download</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <Button variant="outline" className="w-full" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF Report
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleShare('whatsapp')}>
                         <svg viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.39 1.22 4.84l-1.18 4.34 4.45-1.16c1.4.74 3 .12 4.58.12h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM16.4 15.2c-.17-.08-1-.49-1.15-.55s-.27-.08-.39.08-.44.55-.54.66-.2.13-.37.04-1.15-.42-2.19-1.34c-.81-.72-1.36-1.61-1.52-1.88s.14-.42.21-.54.17-.27.26-.4.03-.22.06-.36-.02-.27-.06-.36-1-2.4-1.37-3.29c-.36-.85-.73-.73-.99-.74h-.27c-.22 0-.58.08-.89.36s-1.04 1.01-1.04 2.47c0 1.46 1.06 2.87 1.21 3.07s2.07 3.16 5.02 4.43c.7.3 1.25.48 1.68.61s.88.21 1.32.18c.55-.07 1.66-.68 1.9-1.33s.23-1.21.16-1.33c-.07-.12-.25-.2-.42-.28z"/>
                        </svg>
                        Share on WhatsApp
                    </Button>
                     <Button variant="outline" className="w-full" onClick={() => handleShare('telegram')}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                          <path d="m9.417 15.181-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.43 3.662c.272-1.21-.488-1.699-1.262-1.428L1.125 8.818c-1.21.49-1.201 1.161-.224 1.445l4.163 1.297 9.876-6.215c.482-.3.923-.142.533.193z"/>
                        </svg>
                        Share on Telegram
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleShare('email')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                            <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                        </svg>
                         Share via Email
                    </Button>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
