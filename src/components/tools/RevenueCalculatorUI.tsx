
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Download, Share2, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { getSettings } from '@/ai/flows/settings-management';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface RevenueCalculatorUIProps {
    title: string;
    children: React.ReactNode;
    revenue: { daily: number, weekly: number, monthly: number, yearly: number } | null;
    onCalculate: () => void;
    onClear: () => void;
    getShareSummary: () => string;
    pdfBody: (string | number)[][];
    pdfTitle: string;
}

export function RevenueCalculatorUI({
    title,
    children,
    revenue,
    onCalculate,
    onClear,
    getShareSummary,
    pdfBody,
    pdfTitle
}: RevenueCalculatorUIProps) {
  const { toast } = useToast();

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
        doc.setFontSize(18).text(`${siteTitle} - ${pdfTitle}`, 14, 22);
        doc.setFontSize(11).setTextColor(100);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
        (doc as any).autoTable({
            startY: 35,
            head: [['Metric', 'Value']],
            body: pdfBody,
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
        doc.save(`${pdfTitle.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.pdf`);
    } catch (error) {
        console.error("PDF generation error:", error);
        toast({ title: 'Error generating PDF', variant: 'destructive' });
    }
  };
  
    const handleShare = (platform: 'whatsapp' | 'email' | 'telegram') => {
      const summary = getShareSummary();
      if (!summary) return;

      if (platform === 'whatsapp') {
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
          window.open(whatsappUrl, '_blank');
      } else if (platform === 'email') {
          const subject = title;
          const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary.replace(/\*/g, ''))}`;
          window.location.href = mailtoUrl;
      } else if (platform === 'telegram') {
          const telegramUrl = `https://t.me/share/url?url=https://toolifyai.com&text=${encodeURIComponent(summary)}`;
          window.open(telegramUrl, '_blank');
      }
  };


  return (
    <div className="space-y-6">
      {children}
      <div className="flex gap-2">
        <Button onClick={onCalculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Calculate Revenue
        </Button>
        {revenue !== null && (
            <Button onClick={onClear} variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
        )}
      </div>

      {revenue !== null && (
        <div className="space-y-6">
            <Card className="text-center">
                <CardHeader><CardTitle>Estimated Revenue</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Daily</p><p className="text-2xl font-bold text-primary">{formatCurrency(revenue.daily)}</p></div>
                    <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Weekly</p><p className="text-2xl font-bold text-primary">{formatCurrency(revenue.weekly)}</p></div>
                    <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Monthly</p><p className="text-2xl font-bold text-primary">{formatCurrency(revenue.monthly)}</p></div>
                    <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Yearly</p><p className="text-2xl font-bold text-primary">{formatCurrency(revenue.yearly)}</p></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Earnings Visualization</CardTitle><CardDescription>A visual representation of your estimated earnings.</CardDescription></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(value) => formatCurrency(value as number)} /><Tooltip formatter={(value) => formatCurrency(value as number)} /><Legend /><Bar dataKey="Earnings" fill="hsl(var(--primary))" /></BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Share2/>Share or Download</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <Button variant="outline" className="w-full" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF Report</Button>
                    <Button variant="outline" className="w-full" onClick={() => handleShare('whatsapp')}><svg viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4"><path d="m12.04 2-5.46 9.55v.01h10.91c-2.73-4.72-5.45-9.55-5.45-9.56zm0 0c5.46 0 9.91 4.45 9.91 9.91s-4.45 9.91-9.91 9.91-9.91-4.45-9.91-9.91S6.58 2 12.04 2zM16.4 15.2c-.17-.08-1-.49-1.15-.55s-.27-.08-.39.08-.44.55-.54.66-.2.13-.37.04-1.15-.42-2.19-1.34c-.81-.72-1.36-1.61-1.52-1.88s.14-.42.21-.54.17-.27.26-.4.03-.22.06-.36-.02-.27-.06-.36-1-2.4-1.37-3.29c-.36-.85-.73-.73-.99-.74h-.27c-.22 0-.58.08-.89.36s-1.04 1.01-1.04 2.47c0 1.46 1.06 2.87 1.21 3.07s2.07 3.16 5.02 4.43c.7.3 1.25.48 1.68.61s.88.21 1.32.18c.55-.07 1.66-.68 1.9-1.33s.23-1.21.16-1.33c-.07-.12-.25-.2-.42-.28z"/></svg>Share on WhatsApp</Button>
                    <Button variant="outline" className="w-full" onClick={() => handleShare('telegram')}><svg viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4"><path d="m9.417 15.181-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.43 3.662c.272-1.21-.488-1.699-1.262-1.428L1.125 8.818c-1.21.49-1.201 1.161-.224 1.445l4.163 1.297 9.876-6.215c.482-.3.923-.142.533.193z"/></svg>Share on Telegram</Button>
                    <Button variant="outline" className="w-full" onClick={() => handleShare('email')}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>Share via Email</Button>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
