
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
import 'jspdf-autotable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Banknote, Percent, Calendar } from 'lucide-react';


interface ScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface CalculationResult {
  monthsToPayOff: number;
  totalInterest: number;
  totalPaid: number;
  schedule: ScheduleItem[];
}

export function CreditCardInterestCalculator() {
  const [balance, setBalance] = useState('10000');
  const [apr, setApr] = useState('18');
  const [monthlyPayment, setMonthlyPayment] = useState('500');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const [extraPayment, setExtraPayment] = useState('100');
  const [extraPaymentResult, setExtraPaymentResult] = useState<{ original: CalculationResult; withExtra: CalculationResult } | null>(null);

  const [payoffGoal, setPayoffGoal] = useState('24');
  const [payoffGoalResult, setPayoffGoalResult] = useState<{ requiredPayment: number } | null>(null);

  const { toast } = useToast();
  
  const calculateLoanDetails = (principal: number, annualRate: number, payment: number): CalculationResult | string => {
    const monthlyRate = annualRate / 12;
    if (payment <= principal * monthlyRate) {
      return "Your monthly payment is too low to cover the interest. You will never pay off the balance.";
    }

    const months = -(Math.log(1 - (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate));
    const totalPaid = months * payment;
    const totalInterest = totalPaid - principal;
    
    let remainingBalance = principal;
    const schedule: ScheduleItem[] = [];
    for (let i = 1; i <= Math.ceil(months); i++) {
        const interestForPeriod = remainingBalance * monthlyRate;
        const principalForPeriod = payment - interestForPeriod;
        remainingBalance -= principalForPeriod;
        schedule.push({
            month: i,
            payment,
            principal: principalForPeriod,
            interest: interestForPeriod,
            balance: Math.max(0, remainingBalance),
        });
    }

    return {
        monthsToPayOff: Math.ceil(months),
        totalInterest,
        totalPaid,
        schedule,
    };
  }

  const handleCalculate = () => {
    const principal = parseFloat(balance);
    const annualRate = parseFloat(apr) / 100;
    const payment = parseFloat(monthlyPayment);

    if (isNaN(principal) || principal <= 0 || isNaN(annualRate) || annualRate < 0 || isNaN(payment) || payment <= 0) {
      toast({ title: "Invalid Input", description: "Please enter valid positive numbers for all fields.", variant: "destructive"});
      return;
    }
    
    const calculation = calculateLoanDetails(principal, annualRate, payment);
    if (typeof calculation === 'string') {
        toast({ title: 'Payment Too Low', description: calculation, variant: 'destructive'});
        setResult(null);
    } else {
        setResult(calculation);
    }
  };

  const handleCalculateExtra = () => {
    const principal = parseFloat(balance);
    const annualRate = parseFloat(apr) / 100;
    const basePayment = parseFloat(monthlyPayment);
    const extra = parseFloat(extraPayment) || 0;

    const originalCalc = calculateLoanDetails(principal, annualRate, basePayment);
    const withExtraCalc = calculateLoanDetails(principal, annualRate, basePayment + extra);
    
    if (typeof originalCalc === 'string' || typeof withExtraCalc === 'string') {
         toast({ title: 'Calculation Error', description: typeof originalCalc === 'string' ? originalCalc : (typeof withExtraCalc === 'string' ? withExtraCalc : ''), variant: 'destructive'});
         setExtraPaymentResult(null);
    } else {
        setExtraPaymentResult({ original: originalCalc, withExtra: withExtraCalc });
    }
  };

  const handleCalculateGoal = () => {
    const principal = parseFloat(balance);
    const annualRate = parseFloat(apr) / 100;
    const months = parseInt(payoffGoal, 10);
    const monthlyRate = annualRate / 12;

    if (isNaN(principal) || isNaN(annualRate) || isNaN(months) || principal <= 0 || annualRate < 0 || months <= 0) {
        toast({ title: "Invalid Input", variant: "destructive" });
        return;
    }
    
    const requiredPayment = annualRate > 0 ?
        principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
        : principal / months;

    setPayoffGoalResult({ requiredPayment });
  };
  
  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    let resultText = '';
    if (years > 0) resultText += `${years} year${years > 1 ? 's' : ''} `;
    if (remainingMonths > 0) resultText += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    return resultText.trim();
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  }

  const pieChartData = result ? [
    { name: 'Principal Paid', value: parseFloat(balance) },
    { name: 'Total Interest', value: result.totalInterest },
  ] : [];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  const handleDownloadPdf = async () => {
    if (!result) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    
    doc.setFontSize(18).text('Credit Card Interest Calculation Report', 14, 22);
    doc.setFontSize(11).setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
    
    (doc as any).autoTable({
        startY: 35,
        head: [['Summary', 'Amount']],
        body: [
            ['Initial Balance', `${formatCurrency(parseFloat(balance))}`],
            ['Interest Rate (APR)', `${apr}%`],
            ['Monthly Payment', `${formatCurrency(parseFloat(monthlyPayment))}`],
            ['Time to Pay Off', formatMonths(result.monthsToPayOff)],
            ['Total Interest Paid', `${formatCurrency(result.totalInterest)}`],
            ['Total Amount Paid', `${formatCurrency(result.totalPaid)}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [76, 35, 137] },
    });
    
    const finalY = (doc as any).autoTable.previous.finalY;
    
    (doc as any).autoTable({
        startY: finalY + 10,
        head: [['#', 'Payment', 'Principal', 'Interest', 'Balance']],
        body: result.schedule.map(item => [item.month, item.payment.toFixed(2), item.principal.toFixed(2), item.interest.toFixed(2), item.balance.toFixed(2)]),
        theme: 'grid',
        headStyles: { fillColor: [76, 35, 137] },
    });
    
    doc.save(`credit-card-report-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Interest Calculator</TabsTrigger>
          <TabsTrigger value="extraPayment">Extra Payment</TabsTrigger>
          <TabsTrigger value="payoffGoal">Payoff Goal</TabsTrigger>
        </TabsList>
        <TabsContent value="calculator" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="space-y-2">
                <Label htmlFor="balance" className="flex items-center gap-2"><Banknote/>Credit Card Balance (₹)</Label>
                <Input id="balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="e.g., 10000" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="apr" className="flex items-center gap-2"><Percent/>Annual Percentage Rate (APR) (%)</Label>
                <Input id="apr" type="number" value={apr} onChange={(e) => setApr(e.target.value)} placeholder="e.g., 18" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="monthly-payment" className="flex items-center gap-2"><Banknote/>Monthly Payment (₹)</Label>
                <Input id="monthly-payment" type="number" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} placeholder="e.g., 500" />
                </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">
                <Calculator className="mr-2 h-4 w-4" /> Calculate
            </Button>
            {result && (
                <div className="space-y-6">
                    <Card><CardHeader><CardTitle>Calculation Result</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Calendar/>Time to Pay Off</p>
                            <p className="text-xl font-bold text-primary">{formatMonths(result.monthsToPayOff)}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Total Interest</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(result.totalInterest)}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Total Paid</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(result.totalPaid)}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                             <p className="text-sm text-muted-foreground">Interest/Principal Ratio</p>
                             <p className="text-xl font-bold text-primary">{((result.totalInterest/parseFloat(balance))*100).toFixed(1)}%</p>
                        </div>
                    </CardContent>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon/>Payment Breakdown</CardTitle></CardHeader>
                            <CardContent className="h-64 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `${formatCurrency(value)}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Amortization Schedule</CardTitle></CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-72">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-card"><TableRow><TableHead>Month</TableHead><TableHead>Interest</TableHead><TableHead>Principal</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
                                        <TableBody>{result.schedule.map(item => (<TableRow key={item.month}><TableCell>{item.month}</TableCell><TableCell>{formatCurrency(item.interest)}</TableCell><TableCell>{formatCurrency(item.principal)}</TableCell><TableCell>{formatCurrency(item.balance)}</TableCell></TableRow>))}</TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                             <CardFooter className="p-4"><Button variant="outline" className="w-full" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4"/>Download Schedule</Button></CardFooter>
                        </Card>
                    </div>
                </div>
            )}
        </TabsContent>
        <TabsContent value="extraPayment" className="space-y-6 pt-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="extra-payment">Extra Monthly Payment (₹)</Label>
                    <Input id="extra-payment" type="number" value={extraPayment} onChange={e => setExtraPayment(e.target.value)} />
                </div>
                <Button onClick={handleCalculateExtra} className="self-end w-full">Calculate with Extra Payment</Button>
            </div>
            {extraPaymentResult && (
                <Card>
                    <CardHeader><CardTitle>Extra Payment Impact</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                           <p className="font-semibold">Payoff Time</p>
                           <p className="text-muted-foreground line-through">{formatMonths(extraPaymentResult.original.monthsToPayOff)}</p>
                           <p className="text-lg font-bold text-primary">{formatMonths(extraPaymentResult.withExtra.monthsToPayOff)}</p>
                        </div>
                         <div className="p-4 bg-muted rounded-lg">
                           <p className="font-semibold">Total Interest</p>
                           <p className="text-muted-foreground line-through">{formatCurrency(extraPaymentResult.original.totalInterest)}</p>
                           <p className="text-lg font-bold text-primary">{formatCurrency(extraPaymentResult.withExtra.totalInterest)}</p>
                        </div>
                        <div className="md:col-span-2 p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg text-center">
                            <p className="font-bold">You save {formatCurrency(extraPaymentResult.original.totalInterest - extraPaymentResult.withExtra.totalInterest)} and pay off your debt {formatMonths(extraPaymentResult.original.monthsToPayOff - extraPaymentResult.withExtra.monthsToPayOff)} faster!</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
        <TabsContent value="payoffGoal" className="space-y-6 pt-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="payoff-goal">Payoff Goal (in months)</Label>
                    <Input id="payoff-goal" type="number" value={payoffGoal} onChange={e => setPayoffGoal(e.target.value)} />
                </div>
                <Button onClick={handleCalculateGoal} className="self-end w-full">Calculate Required Payment</Button>
            </div>
            {payoffGoalResult && (
                 <Card className="text-center">
                    <CardHeader><CardTitle>Required Monthly Payment</CardTitle><CardDescription>To pay off your debt in {payoffGoal} months.</CardDescription></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-primary">{formatCurrency(payoffGoalResult.requiredPayment)}</p></CardContent>
                 </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
