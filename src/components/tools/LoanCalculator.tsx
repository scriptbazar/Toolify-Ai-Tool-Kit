
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Download, MessageCircle, Calculator, Trash2, PieChart as PieChartIcon, Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { getSettings } from '@/ai/flows/settings-management';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ScheduleItem {
    month: number;
    principal: string;
    interest: string;
    totalPayment: string;
    remainingBalance: string;
}

export function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [gstRate, setGstRate] = useState('');
  const [interestRate, setInterestRate] = useState('5');
  const [loanTerm, setLoanTerm] = useState('10');
  const [termUnit, setTermUnit] = useState<'years' | 'months'>('years');
  const [frequency, setFrequency] = useState<'monthly' | 'daily' | 'weekly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState('INR');
  const [loanType, setLoanType] = useState('Personal Loan');
  const { toast } = useToast();

  const [payment, setPayment] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [gstAmount, setGstAmount] = useState<number | null>(null);
  
  const currencySymbols: {[key: string]: string} = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
  };
  
  const formatCurrency = (value: number | undefined | null, currencyCode: string) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
  }
  
  const calculateLoan = () => {
    const principal = parseFloat(loanAmount);
    const gst = parseFloat(gstRate) || 0;
    
    const gstValue = (principal * gst) / 100;
    const totalPrincipal = principal + gstValue;
    
    setGstAmount(gstValue);

    const annualRate = parseFloat(interestRate) / 100;
    
    if (isNaN(principal) || principal <= 0 || isNaN(annualRate) || annualRate < 0 || isNaN(parseFloat(loanTerm)) || parseFloat(loanTerm) <= 0) {
        setPayment(null);
        setTotalPayment(null);
        setTotalInterest(null);
        setSchedule([]);
        return;
    }
    
    let ratePerPeriod = 0;
    let numberOfPayments = 0;

    const termInMonths = termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm);

    switch(frequency) {
        case 'daily':
            ratePerPeriod = annualRate / 365;
            numberOfPayments = termInMonths * 30.44; // Avg days in month
            break;
        case 'weekly':
            ratePerPeriod = annualRate / 52;
            numberOfPayments = termInMonths * 4.345; // Avg weeks in month
            break;
        case 'yearly':
            ratePerPeriod = annualRate;
            numberOfPayments = termInMonths / 12;
            break;
        default: // monthly
            ratePerPeriod = annualRate / 12;
            numberOfPayments = termInMonths;
            break;
    }

    if (totalPrincipal > 0 && annualRate >= 0 && numberOfPayments > 0) {
      const calculatedPayment = annualRate > 0 ?
        totalPrincipal * (ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPayments)) / (Math.pow(1 + ratePerPeriod, numberOfPayments) - 1)
        : totalPrincipal / numberOfPayments;
        
      const totalPaid = calculatedPayment * numberOfPayments;
      const interestPaid = totalPaid - totalPrincipal;

      setPayment(calculatedPayment);
      setTotalPayment(totalPaid);
      setTotalInterest(interestPaid);
      
      let remainingBalance = totalPrincipal;
      const newSchedule: ScheduleItem[] = [];
      for(let i = 1; i <= Math.ceil(numberOfPayments); i++) {
        const interestForPeriod = remainingBalance * ratePerPeriod;
        const principalForPeriod = calculatedPayment - interestForPeriod;
        remainingBalance -= principalForPeriod;

        newSchedule.push({
            month: i,
            principal: formatCurrency(principalForPeriod, currency),
            interest: formatCurrency(interestForPeriod, currency),
            totalPayment: formatCurrency(calculatedPayment, currency),
            remainingBalance: formatCurrency(Math.max(0, remainingBalance), currency),
        });
      }
      setSchedule(newSchedule);
    }
  };
  
  const handleClear = () => {
        setLoanAmount('100000');
        setGstRate('');
        setInterestRate('5');
        setLoanTerm('10');
        setPayment(null);
        setTotalPayment(null);
        setTotalInterest(null);
        setSchedule([]);
        setGstAmount(null);
    };
  
  const handleDownloadPdf = async () => {
    if (!payment || !totalPayment || !totalInterest || schedule.length === 0) {
        toast({ title: "No data to download", description: "Please calculate the loan first.", variant: "destructive" });
        return;
    }
    
    try {
        const settings = await getSettings();
        const siteTitle = settings.general?.siteTitle || 'ToolifyAI';
        const logoUrl = settings.general?.logoUrl;
        
        const doc = new jsPDF();
        
        // ---- HEADER (Page 1 only) ----
        if (logoUrl) {
            try {
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                const logoImage = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                doc.addImage(logoImage, 'PNG', 15, 15, 20, 20);
                doc.setFontSize(22).setTextColor(40).text(siteTitle, 40, 28);
            } catch (e) {
                console.error("Could not add logo to PDF:", e);
                doc.setFontSize(22).setTextColor(40).text(siteTitle, 15, 28);
            }
        } else {
            doc.setFontSize(22).setTextColor(40).text(siteTitle, 15, 28);
        }

        // ---- SUMMARY TABLE ----
        const summaryBodyData = [
            ['Loan Type', loanType],
            ['Loan Amount', formatCurrency(parseFloat(loanAmount), currency)],
        ];
        if (gstAmount && gstAmount > 0) {
            summaryBodyData.push(['GST Amount', formatCurrency(gstAmount, currency)]);
            summaryBodyData.push(['Total Loan Amount', formatCurrency(parseFloat(loanAmount) + gstAmount, currency)]);
        }
        summaryBodyData.push(
            ['Interest Rate', `${interestRate}% per annum`],
            ['Loan Term', `${loanTerm} ${termUnit}`],
            [`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Payment`, formatCurrency(payment, currency)],
            ['Total Payment', formatCurrency(totalPayment, currency)],
            ['Total Interest', formatCurrency(totalInterest, currency)],
        );
        autoTable(doc, {
            startY: 50,
            head: [['Loan Summary', '']],
            body: summaryBodyData,
            theme: 'striped',
            headStyles: { fillColor: [76, 35, 137] },
            columnStyles: { 0: { fontStyle: 'bold' } },
        });

        // ---- SCHEDULE TABLE ----
        const scheduleBodyData = schedule.map(item => [
            item.month,
            item.principal.replace(/[^\d.-]/g, ''),
            item.interest.replace(/[^\d.-]/g, ''),
            item.totalPayment.replace(/[^\d.-]/g, ''),
            item.remainingBalance.replace(/[^\d.-]/g, ''),
        ]);
        autoTable(doc, {
            head: [['#', 'Principal', 'Interest', 'Total Payment', 'Balance']],
            body: scheduleBodyData,
            theme: 'grid',
            headStyles: { fillColor: [76, 35, 137] },
        });
        
        // ---- WATERMARK (All pages) ----
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const { width, height } = doc.internal.pageSize;
            doc.saveGraphicsState();
            doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
            doc.setFontSize(50).setTextColor(150);
            doc.text(siteTitle, width / 2, height / 2, { align: 'center', angle: -45 });
            doc.restoreGraphicsState();
        }

        doc.save(`emi-schedule-${loanAmount}.pdf`);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast({
            title: "Error Generating PDF",
            description: "Could not generate the PDF. Please try again.",
            variant: "destructive"
        });
    }
  };


  const getShareSummary = () => {
      if (!payment || !totalPayment || !totalInterest) return '';
      return `*Loan Summary for ${loanType}*\n\n` +
      `- *Loan Amount:* ${formatCurrency(parseFloat(loanAmount), currency)}\n` +
      (gstAmount && gstAmount > 0 ? `- *GST Amount:* ${formatCurrency(gstAmount, currency)}\n` : '') +
      (gstAmount && gstAmount > 0 ? `- *Total Loan:* ${formatCurrency(parseFloat(loanAmount) + gstAmount, currency)}\n` : '') +
      `- *Interest Rate:* ${interestRate}%\n` +
      `- *Loan Term:* ${loanTerm} ${termUnit}\n` +
      `- *EMI:* ${formatCurrency(payment, currency)} / ${frequency}\n` +
      `- *Total Payment:* ${formatCurrency(totalPayment, currency)}\n` +
      `- *Total Interest:* ${formatCurrency(totalInterest, currency)}\n\n` +
      `_Calculated with ToolifyAI Loan Calculator_`;
  };

  const handleShareOnWhatsApp = () => {
      const summary = getShareSummary();
      if (!summary) return;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
      window.open(whatsappUrl, '_blank');
  };
  
  const handleShareOnEmail = () => {
      const summary = getShareSummary().replace(/\*/g, ''); // Remove markdown for plain text email
      if (!summary) return;
      const subject = `Loan Calculation for ${loanType}`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
      window.location.href = mailtoUrl;
  };
  
  const handleShareOnTelegram = () => {
      const summary = getShareSummary();
      if (!summary) return;
      const telegramUrl = `https://t.me/share/url?url=https://toolifyai.com&text=${encodeURIComponent(summary)}`;
      window.open(telegramUrl, '_blank');
  }

    const pieChartData = (payment !== null && totalInterest !== null) ? [
        { name: 'Principal Amount', value: parseFloat(loanAmount) },
        { name: 'Total Interest', value: totalInterest },
    ] : [];

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
            <Label htmlFor="loan-type">Loan Type</Label>
            <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger id="loan-type"><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                    <SelectItem value="Home Loan">Home Loan</SelectItem>
                    <SelectItem value="Car Loan">Car Loan</SelectItem>
                    <SelectItem value="Education Loan">Education Loan</SelectItem>
                    <SelectItem value="Business Loan">Business Loan</SelectItem>
                    <SelectItem value="Two-wheeler Loan">Two-wheeler Loan</SelectItem>
                    <SelectItem value="Gold Loan">Gold Loan</SelectItem>
                    <SelectItem value="Payday Loan">Payday Loan</SelectItem>
                    <SelectItem value="Medical Loan">Medical Loan</SelectItem>
                    <SelectItem value="Debt Consolidation Loan">Debt Consolidation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="loan-amount">Loan Amount</Label>
           <div className="flex gap-2">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[100px]"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
            <Input id="loan-amount" type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="e.g., 100000" />
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="gst-rate">GST Rate (%) (Optional)</Label>
            <Input id="gst-rate" type="number" value={gstRate} onChange={(e) => setGstRate(e.target.value)} placeholder="e.g., 18" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
          <Input id="interest-rate" type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="e.g., 5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loan-term">Loan Term</Label>
          <div className="flex gap-2">
            <Input id="loan-term" type="number" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} placeholder="e.g., 10" />
            <Select value={termUnit} onValueChange={(val) => setTermUnit(val as any)}>
                <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="years">Years</SelectItem><SelectItem value="months">Months</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
         <div className="space-y-2 col-span-1 md:col-span-1">
          <Label htmlFor="frequency">Payment Frequency</Label>
            <Select value={frequency} onValueChange={(val) => setFrequency(val as any)}>
                <SelectTrigger className="w-full"><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={calculateLoan} className="w-full">
          <Calculator className="mr-2 h-4 w-4" /> Calculate
        </Button>
        <Button onClick={handleClear} variant="outline" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>

      {payment !== null && (
        <Card className="mt-6">
           <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
                <CardDescription>Your estimated loan breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
                <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground capitalize">{frequency} Payment</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(payment, currency)}</p>
                </div>
                 <div className="p-2 bg-muted rounded-lg text-center">
                   <p className="text-sm text-muted-foreground">Total Payment</p>
                  <p className="text-xl font-bold">{formatCurrency(totalPayment, currency)}</p>
                </div>
                 <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-xl font-bold">{formatCurrency(totalInterest, currency)}</p>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><PieChartIcon className="h-5 w-5" />Loan Breakdown</CardTitle>
                    <CardDescription className="text-xs">Principal vs. Interest</CardDescription>
                </CardHeader>
                <CardContent className="h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                label={(props) => formatCurrency(props.value, currency)}
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{paddingTop: '20px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
             </Card>
          </CardContent>
        </Card>
      )}
      
      {schedule.length > 0 && (
         <Card className="mt-6">
            <CardHeader>
                <CardTitle>EMI Schedule</CardTitle>
                <CardDescription>Detailed breakdown of your payments over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card">
                            <TableRow>
                                <TableHead className="w-[80px]">#</TableHead>
                                <TableHead>Principal</TableHead>
                                <TableHead>Interest</TableHead>
                                <TableHead>Total Payment</TableHead>
                                <TableHead>Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedule.map((item) => (
                                <TableRow key={item.month}>
                                    <TableCell>{item.month}</TableCell>
                                    <TableCell>{item.principal}</TableCell>
                                    <TableCell>{item.interest}</TableCell>
                                    <TableCell>{item.totalPayment}</TableCell>
                                    <TableCell>{item.remainingBalance}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row justify-end gap-2">
                 <Button variant="outline" onClick={handleShareOnWhatsApp}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.39 1.22 4.84l-1.18 4.34 4.45-1.16c1.4.74 3 .12 4.58.12h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM12.04 3.67c4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24h-.01c-1.48 0-2.92-.39-4.18-1.11l-.3-.17-3.11.81.83-3.04-.19-.32a8.24 8.24 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.24-8.24zm3.53 10.19c-.17-.08-1-.49-1.15-.55-.16-.06-.27-.08-.39.08s-.44.55-.54.66c-.1.11-.2.13-.37.04s-1.15-.42-2.19-1.34c-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.07-.54.08-.11.17-.27.26-.4.1-.13.13-.22.2-.36.06-.15.03-.27-.01-.36-.05-.08-1-2.4-1.37-3.29-.36-.85-.73-.73-.99-.74h-.27c-.22 0-.58.08-.89.36s-1.04 1.01-1.04 2.47c0 1.46 1.06 2.87 1.21 3.07.16.21 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.61.69.21 1.32.18 1.82.11.55-.07 1.66-.68 1.9-1.33.23-.65.23-1.21.16-1.33-.07-.12-.25-.2-.42-.28z"/>
                    </svg>
                    Share on WhatsApp
                </Button>
                <Button variant="outline" onClick={handleShareOnEmail}>
                    <Mail className="mr-2 h-4 w-4"/> Share on Email
                </Button>
                <Button variant="outline" onClick={handleShareOnTelegram}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.13-.05.266-.19.395-1.22 1.06-2.06 2.02-2.822 2.914-.595.717-.963 1.122-1.122 1.23a.472.472 0 0 1-.33.123c-.16-.01-.3-.09-.41-.235-1.35-1.145-2.02-1.71-2.02-1.71s-.112-.097-.26-.03c-.15.066-.24.21-.24.21s-.13.14-.24.234c-.1.1-.2.13-.3.13a.43.43 0 0 1-.24-.07c-.12-.09-.15-.2-.15-.2s-.03-.11-.03-.21c0-.1.03-.2.03-.2s.18-.24.54-.54c.36-.3.66-.54.66-.54s.45-.45.81-.81c.36-.36.75-.75 1.05-1.11.3-.36.54-.78.54-.78s.09-.24.21-.36c.12-.12.27-.18.42-.18.15 0 .3.04.45.18l.06.06z"/>
                    </svg>
                    Share on Telegram
                </Button>
                <Button onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4"/> Download as PDF
                </Button>
            </CardFooter>
         </Card>
      )}
    </div>
  );
}
