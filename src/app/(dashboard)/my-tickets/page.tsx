
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getTicketsByUser, type Ticket, type TicketStatus } from '@/ai/flows/ticket-management';
import { useRouter } from 'next/navigation';
import { Ticket as TicketIcon, PlusCircle, Clock, CheckCircle, RefreshCw, CircleDotDashed, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const CountdownCell = ({ expiryDate }: { expiryDate: string }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryDate) - +new Date();
        let timeLeft: {d: number, h: number, m: number, s: number} | null = null;
        if (difference > 0) {
            timeLeft = {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
                s: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!timeLeft) return;
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    if (!timeLeft) {
        return <span className="text-red-500">Expired & Deleted</span>;
    }

    return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
                {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
            </span>
        </div>
    );
};

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

export default function MyTicketsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        fetchTickets(firebaseUser.uid);
      } else {
        router.push('/login');
      }
    });

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
    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Support Tickets</h1>
        <Button asChild>
            <Link href="/create-ticket">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Ticket
            </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Ticket History</CardTitle>
          <CardDescription>Here are all the support tickets you've submitted. Tickets are automatically deleted after 30 days for your privacy.</CardDescription>
        </CardHeader>
        <CardContent>
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
            {!loading && !error && tickets.length === 0 && (
                 <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-8 border-2 border-dashed rounded-lg">
                    <TicketIcon className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">You haven't submitted any tickets yet.</p>
                    <p className="text-muted-foreground">If you need help, feel free to create one!</p>
                 </div>
            )}
            {!loading && !error && tickets.length > 0 && (
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
                        {tickets.map(ticket => (
                            <TableRow key={ticket.id}>
                                <TableCell className="font-medium">{ticket.subject}</TableCell>
                                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                <TableCell>{new Date(ticket.lastUpdated).toLocaleString()}</TableCell>
                                <TableCell>
                                    <CountdownCell expiryDate={ticket.expiresAt} />
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
