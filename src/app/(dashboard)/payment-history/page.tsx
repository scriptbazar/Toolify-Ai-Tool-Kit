
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getPayments } from '@/ai/flows/payment-management';
import type { Payment, PaymentStatus } from '@/ai/flows/payment-management.types';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, XCircle, CreditCard, Search, FileText } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PaymentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const allPayments = await getPayments();
          // In a real application with many users, you would query only the user's payments.
          // For now, we fetch all and filter on the client.
          const userPayments = allPayments.filter(p => p.userId === firebaseUser.uid);
          setPayments(userPayments);
        } catch (error) {
          console.error("Failed to load payment history:", error);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);
  
  const counts = useMemo(() => ({
    all: payments.length,
    Completed: payments.filter(p => p.status === 'Completed').length,
    Pending: payments.filter(p => p.status === 'Pending').length,
    Failed: payments.filter(p => p.status === 'Failed').length,
  }), [payments]);

  const tabs: { id: PaymentStatus | 'all'; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Transactions', icon: FileText },
    { id: 'Completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'Pending', label: 'Pending', icon: Clock },
    { id: 'Failed', label: 'Failed', icon: XCircle },
  ];
  
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
        const filterMatch = activeFilter === 'all' || p.status === activeFilter;
        const searchMatch = p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.plan.toLowerCase().includes(searchQuery.toLowerCase());
        return filterMatch && searchMatch;
    });
  }, [payments, activeFilter, searchQuery]);


  if (loading) {
      return (
         <div className="space-y-6">
            <Skeleton className="h-10 w-1/3 mb-6" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">
          A record of all your transactions and invoices.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Transactions</CardTitle>
          <CardDescription>Review your past payments and subscription charges.</CardDescription>
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
                        {tab.label} ({counts[tab.id as keyof typeof counts]})
                        </Button>
                    ))}
                </div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.transactionId}>
                    <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                    <TableCell className="font-medium">{payment.plan}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                     <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <CreditCard className="w-12 h-12 mb-2" />
                        You have no payment history yet.
                     </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
