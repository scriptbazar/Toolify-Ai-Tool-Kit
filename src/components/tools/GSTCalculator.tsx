
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, Download, MessageCircle, Mail, PieChart as PieChartIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getSettings } from '@/ai/flows/settings-management';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface Result {
    baseAmount: number;
    gstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    totalAmount: number;
}

export function GSTCalculator() {
  const [amount, setAmount] = useState('1000');
  const [gstRate, setGstRate] = useState('18');
  const [calculationType, setCalculationType] = useState<'add' | 'remove'>('add');
  const [currency, setCurrency] = useState('INR');
  const [result, setResult] = useState<Result | null>(null);
  const { toast } = useToast();
  
  const currencySymbols: {[key: string]: string} = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
  };

  const handleCalculate = () => {
    const baseAmount = parseFloat(amount);
    const rate = parseFloat(gstRate) / 100;

    if (isNaN(baseAmount) || baseAmount < 0 || isNaN(rate) || rate < 0) {
      toast({ title: 'Invalid Input', description: 'Please enter valid positive numbers for all fields.', variant: 'destructive' });
      return;
    }

    let calculatedBase, calculatedGst, calculatedTotal;

    if (calculationType === 'add') {
      calculatedBase = baseAmount;
      calculatedGst = baseAmount * rate;
      calculatedTotal = baseAmount + calculatedGst;
    } else { // remove
      calculatedTotal = baseAmount;
      calculatedBase = baseAmount / (1 + rate);
      calculatedGst = calculatedTotal - calculatedBase;
    }

    setResult({
      baseAmount: calculatedBase,
      gstAmount: calculatedGst,
      cgstAmount: calculatedGst / 2,
      sgstAmount: calculatedGst / 2,
      totalAmount: calculatedTotal,
    });
  };
  
  const formatCurrency = (value: number) => {
    return (currencySymbols[currency] || currency) + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  const getShareSummary = () => {
      if (!result) return '';
      return `*GST Calculation Summary*\n\n` +
      `- *Base Amount:* ${formatCurrency(result.baseAmount)}\n` +
      `- *CGST (${parseFloat(gstRate)/2}%):* ${formatCurrency(result.cgstAmount)}\n` +
      `- *SGST (${parseFloat(gstRate)/2}%):* ${formatCurrency(result.sgstAmount)}\n` +
      `*- Total GST:* ${formatCurrency(result.gstAmount)}\n\n` +
      `*Total Amount: ${formatCurrency(result.totalAmount)}*\n\n` +
      `_Calculated with ToolifyAI GST Calculator_`;
  };

  const handleShareOnWhatsApp = () => {
      const summary = getShareSummary();
      if (!summary) return;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
      window.open(whatsappUrl, '_blank');
  };

  const handleDownloadPdf = async () => {
    if (!result) {
        toast({ title: "No data to download", description: "Please calculate first.", variant: "destructive" });
        return;
    }
    
    try {
        const settings = await getSettings();
        const siteTitle = settings.general?.siteTitle || 'ToolifyAI';
        const logoUrl = settings.general?.logoUrl;
        
        const doc = new jsPDF();
        
        // --- Header ---
        if (logoUrl) {
            try {
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                const dataUrl = await new Promise<string>(resolve => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
                doc.addImage(dataUrl, 'PNG', 15, 15, 20, 20);
                doc.setFontSize(22).setTextColor(40).text(siteTitle, 40, 28);
            } catch (e) {
                 console.error("Could not add logo to PDF:", e);
                 doc.setFontSize(22).setTextColor(40).text(siteTitle, 15, 28);
            }
        } else {
             doc.setFontSize(22).setTextColor(40).text(siteTitle, 15, 28);
        }
        
        doc.setFontSize(16).text('GST Calculation Report', 15, 45);

        (doc as any).autoTable({
            startY: 50,
            head: [['Description', 'Amount']],
            body: [
                ['Base Amount', formatCurrency(result.baseAmount)],
                [`CGST (${parseFloat(gstRate)/2}%)`, formatCurrency(result.cgstAmount)],
                [`SGST (${parseFloat(gstRate)/2}%)`, formatCurrency(result.sgstAmount)],
                ['Total GST', formatCurrency(result.gstAmount)],
            ],
            foot: [['Total Amount', formatCurrency(result.totalAmount)]],
            theme: 'striped',
            headStyles: { fillColor: [76, 35, 137] },
            footStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold' },
        });
        
        doc.save(`gst-calculation-${Date.now()}.pdf`);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast({
            title: "Error Generating PDF",
            description: "Could not generate the PDF. Please try again.",
            variant: "destructive"
        });
    }
  };


  const handleShareOnEmail = () => {
      const summary = getShareSummary().replace(/\*/g, '');
      if (!summary) return;
      const subject = `GST Calculation Summary`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
      window.location.href = mailtoUrl;
  };
  
    const pieChartData = result ? [
        { name: 'Base Amount', value: result.baseAmount },
        { name: 'Total GST', value: result.gstAmount },
    ] : [];

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
            <Label htmlFor="currency-select">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency-select"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                <SelectItem value="USD">$ - US Dollar</SelectItem>
                <SelectItem value="EUR">€ - Euro</SelectItem>
                <SelectItem value="GBP">£ - British Pound</SelectItem>
                <SelectItem value="JPY">¥ - Japanese Yen</SelectItem>
                <SelectItem value="AUD">A$ - Australian Dollar</SelectItem>
                <SelectItem value="CAD">C$ - Canadian Dollar</SelectItem>
              </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="amount-input">Amount</Label>
            <Input id="amount-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 1000" />
        </div>
         <div className="space-y-2">
            <Label htmlFor="gst-rate-select">GST Rate (%)</Label>
            <Select value={gstRate} onValueChange={setGstRate}>
                <SelectTrigger id="gst-rate-select"><SelectValue placeholder="Select GST Rate" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="3">3%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                </SelectContent>
            </Select>
          </div>
      </div>
      
      <div className="space-y-2">
        <Label>Calculation Type</Label>
        <Select value={calculationType} onValueChange={(v) => setCalculationType(v as 'add' | 'remove')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add">GST Exclusive (Add GST)</SelectItem>
            <SelectItem value="remove">GST Inclusive (Remove GST)</SelectItem>
          </SelectContent>
        </Select>
      </div>


      <Button onClick={handleCalculate} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate
      </Button>

      {result && (
        <Card className="mt-6 text-center animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Calculation Result</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-3 text-left">
                <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Amount</span>
                    <span className="text-lg font-bold">{formatCurrency(result.baseAmount)}</span>
                </div>
                <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">CGST ({parseFloat(gstRate)/2}%)</span>
                    <span className="text-lg font-bold">{formatCurrency(result.cgstAmount)}</span>
                </div>
                <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">SGST ({parseFloat(gstRate)/2}%)</span>
                    <span className="text-lg font-bold">{formatCurrency(result.sgstAmount)}</span>
                </div>
                <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total GST</span>
                    <span className="text-lg font-bold">{formatCurrency(result.gstAmount)}</span>
                </div>
                 <div className="p-4 bg-primary/10 rounded-lg flex justify-between items-center">
                    <span className="text-lg text-primary font-bold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.totalAmount)}</span>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(props) => formatCurrency(props.value)}
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 mt-4">
                <Button variant="outline" className="w-full" onClick={handleShareOnWhatsApp}>
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.39 1.22 4.84l-1.18 4.34 4.45-1.16c1.4.74 3 .12 4.58.12h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM12.04 3.67c4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24h-.01c-1.48 0-2.92-.39-4.18-1.11l-.3-.17-3.11.81.83-3.04-.19-.32a8.24 8.24 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.24-8.24zm3.53 10.19c-.17-.08-1-.49-1.15-.55-.16-.06-.27-.08-.39.08s-.44.55-.54.66c-.1.11-.2.13-.37.04s-1.15-.42-2.19-1.34c-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.07-.54.08-.11.17-.27.26-.4.1-.13.13-.22.2-.36.06-.15.03-.27-.01-.36-.05-.08-1-2.4-1.37-3.29-.36-.85-.73-.73-.99-.74h-.27c-.22 0-.58.08-.89.36s-1.04 1.01-1.04 2.47c0 1.46 1.06 2.87 1.21 3.07.16.21 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.61.69.21 1.32.18 1.82.11.55-.07 1.66-.68 1.9-1.33.23-.65.23-1.21.16-1.33-.07-.12-.25-.2-.42-.28z"/>
                    </svg>
                    Share on WhatsApp
                </Button>
                 <Button variant="outline" className="w-full" onClick={handleShareOnEmail}>
                    <Mail className="mr-2 h-4 w-4"/> Share on Email
                </Button>
                <Button variant="outline" className="w-full" onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4"/> Download as PDF
                </Button>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
