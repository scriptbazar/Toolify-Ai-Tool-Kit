
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getTicketsByUser, type Ticket, type TicketStatus } from '@/ai/flows/ticket-management';
import { useRouter } from 'next/navigation';
import { Ticket as TicketIcon, PlusCircle, Clock, CheckCircle, RefreshCw, CircleDotDashed, AlertCircle, Inbox, Search } from "lucide-react";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { CreateTicketDialog } from '@/components/dashboard/CreateTicketDialog';
import { CountdownTimer } from '@/components/common/CountdownTimer';


const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return <Badge variant="destructive"><CircleDotDashed className="mr-1 h-3 w-3" />Open</Badge>;
      case 'In Progress':
        return <Badge variant="secondary"><RefreshCw className="mr-1 h-3 w-3 animate-spin" />In Progress</Badge>;
      case 'Closed':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Closed</Badge>;
    }
};

type FilterType = 'all' | TicketStatus;

export default function MyTicketsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchTickets = async (uid: string) => {
    setLoading(true);
    try {
        const userTickets = await getTicketsByUser(uid);
        setTickets(userTickets);
    } catch (err: any) {
        console.error(err);
        setError("Failed to load your tickets. Please try again later.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        fetchTickets(firebaseUser.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);
  
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const filterMatch = activeFilter === 'all' || t.status === activeFilter;
      const searchMatch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
      return filterMatch && searchMatch;
    });
  }, [tickets, activeFilter, searchQuery]);
  
  const counts = useMemo(() => ({
    all: tickets.length,
    Open: tickets.filter(t => t.status === 'Open').length,
    'In Progress': tickets.filter(t => t.status === 'In Progress').length,
    Closed: tickets.filter(t => t.status === 'Closed').length,
  }), [tickets]);

  const tabs: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Inbox },
    { id: 'Open', label: 'Open', icon: CircleDotDashed },
    { id: 'In Progress', label: 'In Progress', icon: RefreshCw },
    { id: 'Closed', label: 'Closed', icon: CheckCircle },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
            <h1 className="text-3xl font-bold">My Support Tickets</h1>
            <p className="text-muted-foreground">Review your past and present support requests.</p>
        </div>
        <CreateTicketDialog onTicketCreated={() => user && fetchTickets(user.uid)} />
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Your Ticket History</CardTitle>
            <CardDescription>Tickets are automatically deleted after 15 days for your privacy.</CardDescription>
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
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
            </div>
          </div>
            {loading && (
                 <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                 </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {!loading && !error && filteredTickets.length === 0 && (
                 <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-8 border-2 border-dashed rounded-lg">
                    <TicketIcon className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">You don't have any tickets in this category.</p>
                 </div>
            )}
            {!loading && !error && filteredTickets.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead>Deletes In</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.map(ticket => (
                            <TableRow key={ticket.id}>
                                <TableCell className="font-medium">{ticket.subject}</TableCell>
                                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                <TableCell>{new Date(ticket.lastUpdated).toLocaleString()}</TableCell>
                                <TableCell>
                                     <CountdownTimer
                                        expiryDate={new Date(ticket.expiresAt)}
                                        className="text-xs text-muted-foreground flex items-center gap-1.5"
                                        expiredText="Expired & Deleted"
                                        expiredClassName="text-red-500"
                                     >
                                         <Clock className="h-3 w-3" />
                                     </CountdownTimer>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
