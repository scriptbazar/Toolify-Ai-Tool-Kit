

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Landmark, Download, MessageCircle, Calculator } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import type { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getSettings } from '@/ai/flows/settings-management';
import { useToast } from '@/hooks/use-toast';


interface ScheduleItem {
    month: number;
    principal: string;
    interest: string;
    totalPayment: string;
    remainingBalance: string;
}

export function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('100000');
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
  
  const currencySymbols: {[key: string]: string} = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
  };

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount);
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

    if (principal > 0 && annualRate >= 0 && numberOfPayments > 0) {
      const calculatedPayment = annualRate > 0 ?
        principal * (ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPayments)) / (Math.pow(1 + ratePerPeriod, numberOfPayments) - 1)
        : principal / numberOfPayments;
        
      const totalPaid = calculatedPayment * numberOfPayments;
      const interestPaid = totalPaid - principal;

      setPayment(calculatedPayment);
      setTotalPayment(totalPaid);
      setTotalInterest(interestPaid);
      
      // Generate EMI Schedule
      let remainingBalance = principal;
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
  
  const formatCurrency = (value: number, currencyCode: string) => {
      const symbol = currencySymbols[currencyCode] || '$';
      return `${symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
  }
  
  const handleDownloadPdf = async () => {
    if (!payment || !totalPayment || !totalInterest || schedule.length === 0) return;
    
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    try {
        const settings = await getSettings();
        const siteTitle = settings.general?.siteTitle || 'ToolifyAI';
        const logoUrl = settings.general?.logoUrl;
        
        const doc = new jsPDF();
        let finalY = 10;

        // --- Header ---
        if (logoUrl) {
            try {
                 const response = await fetch(logoUrl);
                 const blob = await response.blob();
                 const reader = new FileReader();
                 const dataUrl = await new Promise<string>((resolve, reject) => {
                     reader.onloadend = () => resolve(reader.result as string);
                     reader.onerror = reject;
                     reader.readAsDataURL(blob);
                 });
                doc.addImage(dataUrl, 'PNG', 15, 15, 20, 20);
                doc.setFontSize(22).text(siteTitle, 40, 28);
            } catch (e) {
                 console.error("Could not add logo to PDF:", e);
                 doc.setFontSize(22).text(siteTitle, 15, 22);
            }
        } else {
             doc.setFontSize(22).text(siteTitle, 15, 22);
        }

        doc.setFontSize(12).text("Loan EMI Schedule", 15, 45);
        doc.line(15, 48, 195, 48); // separator line
        
        // --- Loan Summary Table ---
        autoTable(doc, {
            startY: 55,
            body: [
                ['Loan Type', loanType],
                ['Loan Amount', formatCurrency(parseFloat(loanAmount), currency)],
                ['Interest Rate', `${interestRate}% per annum`],
                ['Loan Term', `${loanTerm} ${termUnit}`],
                [`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Payment`, formatCurrency(payment, currency)],
                ['Total Payment', formatCurrency(totalPayment, currency)],
                ['Total Interest', formatCurrency(totalInterest, currency)],
            ],
            theme: 'plain',
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold' } },
        });

        // --- EMI Schedule Table ---
        autoTable(doc, {
          startY: (doc as any).autoTable.previous.finalY + 10,
          head: [['#', 'Principal', 'Interest', 'Total Payment', 'Balance']],
          body: schedule.map(item => [item.month.toString(), item.principal, item.interest, item.totalPayment, item.remainingBalance]),
          theme: 'grid',
          headStyles: { fillColor: [76, 35, 137] }, // Primary color
        });
        
        // --- Footer ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8).text(`Page ${i} of ${pageCount}`, 195, 290, { align: 'right' });
            doc.text(`${siteTitle} - EMI Report`, 15, 290);
        }
        
        doc.save(`emi-schedule-${loanAmount}.pdf`);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast({
            title: "Error Generating PDF",
            description: "Could not generate the PDF invoice. Please try again.",
            variant: "destructive"
        });
    }
  };

  const handleShareOnWhatsApp = () => {
      if (!payment || !totalPayment || !totalInterest) return;

      const summary = `*Loan Summary for ${loanType}*
- *Loan Amount:* ${formatCurrency(parseFloat(loanAmount), currency)}
- *Interest Rate:* ${interestRate}%
- *Loan Term:* ${loanTerm} ${termUnit}
- *EMI:* ${formatCurrency(payment, currency)} / ${frequency}
- *Total Payment:* ${formatCurrency(totalPayment, currency)}
- *Total Interest:* ${formatCurrency(totalInterest, currency)}`;
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
      window.open(whatsappUrl, '_blank');
  };

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
         <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
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
      <Button onClick={calculateLoan} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate
      </Button>

      {payment !== null && (
        <Card className="mt-6">
           <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
                <CardDescription>Your estimated loan breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground capitalize">{frequency} Payment</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(payment, currency)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
               <p className="text-sm text-muted-foreground">Total Payment</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPayment!, currency)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Interest</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInterest!, currency)}</p>
            </div>
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
                    <MessageCircle className="mr-2 h-4 w-4"/> Share on WhatsApp
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