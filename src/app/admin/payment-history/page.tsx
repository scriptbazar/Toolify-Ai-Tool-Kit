
'use client';

import { useState, useMemo } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import type { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getSettings } from '@/ai/flows/settings-management';


type FilterType = 'all' | 'completed' | 'pending' | 'failed';

const initialPayments = [
  {
    transactionId: 'txn_1LgR8t2eZvKYlo2Cf2hN3X4Y',
    user: {
      name: 'Olivia Martin',
      email: 'olivia.martin@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    plan: 'Pro Plan',
    amount: '$19.99',
    date: '2023-07-15',
    status: 'completed',
    paymentMethod: 'Visa **** 4242',
    subscribedFrom: '2023-07-15',
    subscribedUntil: '2024-07-15',
  },
  {
    transactionId: 'txn_2HjP9u4fGhKlo3Dg4jM5Y6Z7',
    user: {
      name: 'Jackson Lee',
      email: 'jackson.lee@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    },
    plan: 'Free Plan',
    amount: '$0.00',
    date: '2023-07-14',
    status: 'completed',
    paymentMethod: 'N/A',
    subscribedFrom: '2023-07-14',
    subscribedUntil: 'N/A',
  },
    {
    transactionId: 'txn_3KlM0v6gHjLlo4Eh6kO7P8Q9',
    user: {
      name: 'Isabella Nguyen',
      email: 'isabella.nguyen@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    },
    plan: 'Pro Plan',
    amount: '$19.99',
    date: '2023-07-13',
    status: 'pending',
    paymentMethod: 'PayPal',
    subscribedFrom: '2023-07-13',
    subscribedUntil: '2024-07-13',
  },
   {
    transactionId: 'txn_4NmB1w8hIkNlo5Fi7lP9R0S1',
    user: {
      name: 'William Kim',
      email: 'will@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    },
    plan: 'Pro Plan',
    amount: '$19.99',
    date: '2023-07-12',
    status: 'failed',
    paymentMethod: 'Visa **** 1234',
    subscribedFrom: '2023-07-12',
    subscribedUntil: '2024-07-12',
  },
  {
    transactionId: 'txn_5PqA2x0jJkOlo6Gj8mQ1T2U3',
    user: {
      name: 'Sofia Davis',
      email: 'sofia.davis@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
    },
    plan: 'Team Plan',
    amount: '$49.99',
    date: '2023-07-11',
    status: 'completed',
    paymentMethod: 'Mastercard **** 5678',
    subscribedFrom: '2023-07-11',
    subscribedUntil: '2024-07-11',
  },
];

type Payment = typeof initialPayments[0];


const getStatusBadge = (status: FilterType) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3"/>Completed</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
    case 'failed':
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState(initialPayments);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { toast } = useToast();

  const counts = useMemo(() => ({
    all: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
  }), [payments]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: `Copied: ${text}` });
  };

  const tabs: { id: FilterType; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'all', label: 'All Transactions', icon: FileText, count: counts.all },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: counts.completed },
    { id: 'pending', label: 'Pending', icon: Clock, count: counts.pending },
    { id: 'failed', label: 'Failed', icon: XCircle, count: counts.failed },
  ];
  
  const filteredPayments = payments.filter(p => {
    const filterMatch = activeFilter === 'all' || p.status === activeFilter;
    const searchMatch = p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                [{ content: `Name: ${payment.user.name}\nEmail: ${payment.user.email}`, styles: { halign: 'left' }}],
            ],
            theme: 'striped',
        });

        autoTable(doc, {
            startY: (doc as any).autoTable.previous.finalY + 10,
            head: [['Payment Details']],
            body: [
                ['Plan', payment.plan],
                ['Amount', payment.amount],
                ['Status', payment.status],
                ['Payment Method', payment.paymentMethod],
                ['Subscription Start', new Date(payment.subscribedFrom).toLocaleDateString()],
                ['Subscription End', payment.subscribedUntil === 'N/A' ? 'N/A' : new Date(payment.subscribedUntil).toLocaleDateString()],
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
      const formData = new FormData(e.currentTarget);
      const newTransaction: Payment = {
          transactionId: `txn_${Date.now()}`,
          user: {
              name: formData.get('userName') as string,
              email: formData.get('userEmail') as string,
              avatar: `https://i.pravatar.cc/150?u=${formData.get('userEmail') as string}`
          },
          plan: formData.get('plan') as string,
          amount: `$${formData.get('amount') as string}`,
          date: new Date().toISOString().split('T')[0],
          status: formData.get('status') as 'completed' | 'pending' | 'failed',
          paymentMethod: formData.get('paymentMethod') as string,
          subscribedFrom: new Date().toISOString().split('T')[0],
          subscribedUntil: 'N/A'
      };
      setPayments([newTransaction, ...payments]);
      setIsAddOpen(false);
      toast({ title: "Transaction Added", description: "The new transaction has been added to the history." });
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
                {filteredPayments.length > 0 ? (
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
                                        <AvatarImage src={payment.user.avatar} alt={payment.user.name} />
                                        <AvatarFallback>{payment.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{payment.user.name}</div>
                                        <div className="text-sm text-muted-foreground">{payment.user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{payment.plan}</TableCell>
                            <TableCell>{payment.amount}</TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{getStatusBadge(payment.status as FilterType)}</TableCell>
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
                                <AvatarImage src={selectedPayment.user.avatar} alt={selectedPayment.user.name} />
                                <AvatarFallback>{selectedPayment.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p>{selectedPayment.user.name}</p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    {selectedPayment.user.email}
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(selectedPayment.user.email)}>
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
                            <span className="font-medium">Date:</span><span>{selectedPayment.date}</span>
                            <span className="font-medium">Plan:</span><span>{selectedPayment.plan}</span>
                            <span className="font-medium">Amount:</span><span className="font-bold">{selectedPayment.amount}</span>
                            <span className="font-medium">Status:</span><span>{getStatusBadge(selectedPayment.status as FilterType)}</span>
                            <span className="font-medium">Payment Method:</span><span>{selectedPayment.paymentMethod}</span>
                            <span className="font-medium">Subscription Start:</span><span>{new Date(selectedPayment.subscribedFrom).toLocaleDateString()}</span>
                            <span className="font-medium">Subscription End:</span><span>{selectedPayment.subscribedUntil === 'N/A' ? 'N/A' : new Date(selectedPayment.subscribedUntil).toLocaleDateString()}</span>
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
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
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
