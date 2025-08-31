
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Copy,
  Eye,
  Download,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDesc,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import type { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getSettings } from '@/ai/flows/settings-management';
import { getPayments, type Payment, type PaymentStatus } from '@/ai/flows/payment-management';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


const getStatusBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'Completed':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3"/>Completed</Badge>;
    case 'Pending':
      return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
    case 'Failed':
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PaymentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchPayments() {
        setLoading(true);
        try {
            const fetchedPayments = await getPayments();
            setPayments(fetchedPayments);
        } catch (err: any) {
            console.error("Failed to fetch payments:", err);
            setError("Could not load payment history. Please try again later.");
        } finally {
            setLoading(false);
        }
    }
    fetchPayments();
  }, []);

  const counts = useMemo(() => ({
    all: payments.length,
    Completed: payments.filter(p => p.status === 'Completed').length,
    Pending: payments.filter(p => p.status === 'Pending').length,
    Failed: payments.filter(p => p.status === 'Failed').length,
  }), [payments]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: `Copied: ${text}` });
  };

  const tabs: { id: PaymentStatus | 'all'; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'all', label: 'All Transactions', icon: FileText, count: counts.all },
    { id: 'Completed', label: 'Completed', icon: CheckCircle2, count: counts.Completed },
    { id: 'Pending', label: 'Pending', icon: Clock, count: counts.Pending },
    { id: 'Failed', label: 'Failed', icon: XCircle, count: counts.Failed },
  ];
  
  const filteredPayments = payments.filter(p => {
    const filterMatch = activeFilter === 'all' || p.status === activeFilter;
    const searchMatch = p.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    return filterMatch && searchMatch;
  })

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };
  
  const handleDownloadPdf = async (payment: Payment) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    try {
        const settings = await getSettings();
        const siteTitle = settings.general?.siteTitle || 'ToolifyAI';
        const logoUrl = settings.general?.logoUrl;
        const socialLinks = settings.general?.socialLinks || {};
        
        const doc = new jsPDF();
        let finalY = 10;

        // --- Header ---
        if (logoUrl) {
            try {
                // This is a simplified approach. A more robust solution would handle CORS and different image types.
                // For this example, we assume a public, accessible image URL.
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                const dataUrl = await new Promise<string>(resolve => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
                doc.addImage(dataUrl, 'PNG', 14, 15, 20, 20);
                doc.setFontSize(22);
                doc.text(siteTitle, 40, 28);
            } catch (e) {
                 console.error("Could not add logo to PDF:", e);
                 doc.setFontSize(22);
                 doc.text(siteTitle, 14, 22);
            }
        } else {
             doc.setFontSize(22);
             doc.text(siteTitle, 14, 22);
        }

        doc.setFontSize(12);
        doc.text(`Transaction ID: ${payment.transactionId}`, 14, 45);
        doc.text(`Date: ${new Date(payment.date).toLocaleDateString()}`, 14, 52);
        finalY = 52;
        
        // --- User and Payment Tables ---
        autoTable(doc, {
            startY: finalY + 10,
            head: [['User Information']],
            body: [
                [{ content: `Name: ${payment.userName}\nEmail: ${payment.userEmail}`, styles: { halign: 'left' }}],
            ],
            theme: 'striped',
        });

        autoTable(doc, {
            startY: (doc as any).autoTable.previous.finalY + 10,
            head: [['Payment Details']],
            body: [
                ['Plan', payment.plan],
                ['Amount', `$${payment.amount.toFixed(2)}`],
                ['Status', payment.status],
                ['Payment Method', payment.paymentMethod],
            ],
            theme: 'striped',
            didParseCell: function (data: any) {
                if (data.section === 'body' && data.column.index === 0) {
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });
        finalY = (doc as any).autoTable.previous.finalY;


        // --- Footer with Social Links ---
        const pageHeight = doc.internal.pageSize.getHeight();
        const activeSocials = Object.entries(socialLinks).filter(([_, url]) => url);
        
        if (activeSocials.length > 0) {
            let socialY = pageHeight - 15 - (activeSocials.length * 5);
            doc.setFontSize(10);
            doc.text("Follow Us:", 14, socialY);
            socialY += 5;

            activeSocials.forEach(([name, url]) => {
                const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                doc.setTextColor(40, 52, 152); // Link color
                doc.textWithLink(`${capitalizedName}: ${url}`, 14, socialY, { url });
                socialY += 5;
            });
        }
        
        doc.save(`invoice-${payment.transactionId}.pdf`);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast({
            title: "Error Generating PDF",
            description: "Could not generate the PDF invoice. Please try again.",
            variant: "destructive"
        });
    }
  };

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // This is now a placeholder as real transactions should come from a payment gateway.
      toast({ title: "Action Not Available", description: "Manual transaction addition is disabled. Transactions should be created via your payment gateway." });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">
            View and manage all payments and transactions.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            A detailed log of all financial transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeFilter === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveFilter(tab.id)}
                  className="shrink-0"
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-auto"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={7}><Skeleton className="h-8 w-full"/></TableCell>
                        </TableRow>
                    ))
                ) : error ? (
                    <TableRow>
                        <TableCell colSpan={7}>
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </TableCell>
                    </TableRow>
                ) : filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                        <TableRow key={payment.transactionId}>
                            <TableCell>
                                <div className="flex items-center gap-2 font-mono text-xs">
                                    <span className="truncate">{payment.transactionId}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyToClipboard(payment.transactionId)}>
                                      <Copy className="h-3 w-3" />
                                      <span className="sr-only">Copy Transaction ID</span>
                                    </Button>
                                </div>
                            </TableCell>
                             <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{payment.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{payment.userName}</div>
                                        <div className="text-sm text-muted-foreground">{payment.userEmail}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{payment.plan}</TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(payment)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      No payment history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogDesc>A detailed view of the transaction.</DialogDesc>
            </DialogHeader>
            {selectedPayment && (
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold">User Information</h4>
                        <div className="flex items-center gap-3 rounded-md border p-3">
                            <Avatar>
                                <AvatarFallback>{selectedPayment.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p>{selectedPayment.userName}</p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    {selectedPayment.userEmail}
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(selectedPayment.userEmail)}>
                                        <Copy className="h-3 w-3" />
                                        <span className="sr-only">Copy Email</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                     <Separator />
                    <div className="space-y-2">
                         <h4 className="font-semibold">Payment Details</h4>
                         <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                            <span className="font-medium">Transaction ID:</span>
                            <div className="flex items-center gap-1 font-mono text-xs break-all">
                                {selectedPayment.transactionId}
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(selectedPayment.transactionId)}>
                                    <Copy className="h-3 w-3" />
                                    <span className="sr-only">Copy Transaction ID</span>
                                </Button>
                            </div>
                            <span className="font-medium">Date:</span><span>{new Date(selectedPayment.date).toLocaleDateString()}</span>
                            <span className="font-medium">Plan:</span><span>{selectedPayment.plan}</span>
                            <span className="font-medium">Amount:</span><span className="font-bold">${selectedPayment.amount.toFixed(2)}</span>
                            <span className="font-medium">Status:</span><span>{getStatusBadge(selectedPayment.status)}</span>
                            <span className="font-medium">Payment Method:</span><span>{selectedPayment.paymentMethod}</span>
                         </div>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="secondary" onClick={() => selectedPayment && handleDownloadPdf(selectedPayment)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add Custom Transaction</DialogTitle>
                  <DialogDesc>Manually add a new transaction record to the history.</DialogDesc>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="userName" placeholder="User Name" required className="p-2 border rounded-md" />
                      <input type="email" name="userEmail" placeholder="User Email" required className="p-2 border rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="plan" placeholder="Plan Name" required className="p-2 border rounded-md" />
                      <input type="number" name="amount" placeholder="Amount" step="0.01" required className="p-2 border rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <select name="status" required className="p-2 border rounded-md">
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                          <option value="Failed">Failed</option>
                      </select>
                      <input type="text" name="paymentMethod" placeholder="Payment Method" required className="p-2 border rounded-md" />
                  </div>
                  <DialogFooter>
                      <Button type="submit">Add Transaction</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
