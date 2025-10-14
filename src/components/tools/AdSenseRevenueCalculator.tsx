
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Download, Share2, MessageCircle, Mail } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { getSettings } from '@/ai/flows/settings-management';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


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
    }
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

        doc.setFontSize(18).text(`${siteTitle} - AdSense Revenue Report`, 14, 22);
        doc.setFontSize(11).setTextColor(100);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);

        (doc as any).autoTable({
            startY: 35,
            head: [['Metric', 'Value']],
            body: [
                ['Daily Page Views', pageViews],
                ['Click-Through Rate (CTR)', `${ctr}%`],
                ['Cost Per Click (CPC)', formatCurrency(parseFloat(cpc))],
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
        
        doc.save(`adsense-report-${Date.now()}.pdf`);

    } catch (error) {
        console.error("PDF generation error:", error);
        toast({ title: 'Error generating PDF', variant: 'destructive' });
    }
  };

  const getShareSummary = () => {
      if (!revenue) return '';
      return `*AdSense Earning Estimation*\n\n` +
             `*Inputs:*\n` +
             `- Page Views: ${pageViews}\n` +
             `- CTR: ${ctr}%\n` +
             `- CPC: ${formatCurrency(parseFloat(cpc))}\n\n` +
             `*Estimated Earnings:*\n` +
             `- Daily: ${formatCurrency(revenue.daily)}\n` +
             `- Monthly: ${formatCurrency(revenue.monthly)}\n` +
             `- Yearly: ${formatCurrency(revenue.yearly)}\n\n` +
             `_Calculated with ToolifyAI AdSense Calculator_`;
  }

  const handleShare = (platform: 'whatsapp' | 'email' | 'telegram') => {
      const summary = getShareSummary();
      if (!summary) return;

      if (platform === 'whatsapp') {
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
          window.open(whatsappUrl, '_blank');
      } else if (platform === 'email') {
          const subject = 'AdSense Revenue Calculation';
          const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary.replace(/\*/g, ''))}`;
          window.location.href = mailtoUrl;
      } else if (platform === 'telegram') {
          const telegramUrl = `https://t.me/share/url?url=https://toolifyai.com&text=${encodeURIComponent(summary)}`;
          window.open(telegramUrl, '_blank');
      }
  };

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
        <div className="space-y-6">
            <Card className="text-center">
                <CardHeader>
                        <CardTitle>Estimated AdSense Revenue</CardTitle>
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
                <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="w-full" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF Report
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleShare('whatsapp')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.39 1.22 4.84l-1.18 4.34 4.45-1.16c1.4.74 3 .12 4.58.12h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM12.04 3.67c4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24h-.01c-1.48 0-2.92-.39-4.18-1.11l-.3-.17-3.11.81.83-3.04-.19-.32a8.24 8.24 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.24-8.24zm3.53 10.19c-.17-.08-1-.49-1.15-.55-.16-.06-.27-.08-.39.08s-.44.55-.54.66c-.1.11-.2.13-.37.04s-1.15-.42-2.19-1.34c-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.07-.54.08-.11.17-.27.26-.4.1-.13.13-.22.2-.36.06-.15.03-.27-.01-.36-.05-.08-1-2.4-1.37-3.29-.36-.85-.73-.73-.99-.74h-.27c-.22 0-.58.08-.89.36s-1.04 1.01-1.04 2.47c0 1.46 1.06 2.87 1.21 3.07.16.21 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.61.69.21 1.32.18 1.82.11.55-.07 1.66-.68 1.9-1.33.23-.65.23-1.21.16-1.33-.07-.12-.25-.2-.42-.28z"/>
                        </svg>
                        Share on WhatsApp
                    </Button>
                     <Button variant="outline" className="w-full" onClick={() => handleShare('telegram')}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.13-.05.266-.19.395-1.22 1.06-2.06 2.02-2.822 2.914-.595.717-.963 1.122-1.122 1.23a.472.472 0 0 1-.33.123c-.16-.01-.3-.09-.41-.235-1.35-1.145-2.02-1.71-2.02-1.71s-.112-.097-.26-.03c-.15.066-.24.21-.24.21s-.13.14-.24.234c-.1.1-.2.13-.3.13a.43.43 0 0 1-.24-.07c-.12-.09-.15-.2-.15-.2s-.03-.11-.03-.21c0-.1.03-.2.03-.2s.18-.24.54-.54c.36-.3.66-.54.66-.54s.45-.45.81-.81c.36-.36.75-.75 1.05-1.11.3-.36.54-.78.54-.78s.09-.24.21-.36c.12-.12.27-.18.42-.18.15 0 .3.04.45.18l.06.06z"/>
                        </svg>
                        Share on Telegram
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleShare('email')}>
                        <Mail className="mr-2 h-4 w-4" /> Share via Email
                    </Button>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
