

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
  MoreHorizontal,
  Copy,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'all' | 'completed' | 'pending' | 'failed';

const payments = [
  {
    transactionId: 'txn_1LgR...f2hN',
    user: {
      name: 'Olivia Martin',
      email: 'olivia.martin@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    plan: 'Pro Plan',
    amount: '$19.99',
    date: '2023-07-15',
    status: 'completed',
  },
  {
    transactionId: 'txn_2HjP...d3kM',
    user: {
      name: 'Jackson Lee',
      email: 'jackson.lee@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    },
    plan: 'Free Plan',
    amount: '$0.00',
    date: '2023-07-14',
    status: 'completed',
  },
    {
    transactionId: 'txn_3KlM...g5lO',
    user: {
      name: 'Isabella Nguyen',
      email: 'isabella.nguyen@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    },
    plan: 'Pro Plan',
    amount: '$19.99',
    date: '2023-07-13',
    status: 'pending',
  },
   {
    transactionId: 'txn_4NmB...h8pO',
    user: {
      name: 'William Kim',
      email: 'will@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    },
    plan: 'Pro Plan',
    amount: '$19.99',
    date: '2023-07-12',
    status: 'failed',
  },
  {
    transactionId: 'txn_5PqA...j9rS',
    user: {
      name: 'Sofia Davis',
      email: 'sofia.davis@email.com',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
    },
    plan: 'Team Plan',
    amount: '$49.99',
    date: '2023-07-11',
    status: 'completed',
  },
];

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
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">
          View and manage all payments and transactions.
        </p>
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
                  <TableHead>User</TableHead>
                  <TableHead>Transaction ID</TableHead>
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
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={payment.user.avatar} alt={payment.user.name} />
                                        <AvatarFallback>{payment.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{payment.user.name}</div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          {payment.user.email}
                                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(payment.user.email)}>
                                            <Copy className="h-3 w-3" />
                                            <span className="sr-only">Copy Email</span>
                                          </Button>
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 font-mono text-xs">
                                    {payment.transactionId}
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(payment.transactionId)}>
                                      <Copy className="h-3 w-3" />
                                      <span className="sr-only">Copy Transaction ID</span>
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>{payment.plan}</TableCell>
                            <TableCell>{payment.amount}</TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{getStatusBadge(payment.status as FilterType)}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
    </div>
  );
}

    