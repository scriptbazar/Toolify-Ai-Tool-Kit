
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getSettings } from '@/ai/flows/settings-management';
import type { Plan } from '@/ai/flows/settings-management.types';

interface Subscriber {
    id: string;
    name: string;
    email: string;
    planId: string;
    subscribedAt: string;
    subscriptionEndsAt: string;
}

const SUBSCRIBERS_PER_PAGE = 5;

export function SubscriberTable() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const settings = await getSettings();
                const fetchedPlans = settings.plan?.plans || [];
                setPlans(fetchedPlans);
                
                const usersRef = collection(db, 'users');
                const planIds = fetchedPlans.map(p => p.id).filter(id => id);
                
                let fetchedSubscribers: Subscriber[] = [];
                if (planIds.length > 0) {
                    const planChunks: string[][] = [];
                    for (let i = 0; i < planIds.length; i += 10) {
                        planChunks.push(planIds.slice(i, i + 10));
                    }
                    
                    const userPromises = planChunks.map(chunk => {
                        const q = query(usersRef, where('planId', 'in', chunk));
                        return getDocs(q);
                    });
                    const userSnapshots = await Promise.all(userPromises);
                    
                    userSnapshots.forEach(snapshot => {
                        snapshot.docs.forEach(doc => {
                            const data = doc.data();
                            const subscribedAtDate = data.subscriptionStartDate?.toDate ? data.subscriptionStartDate.toDate() : new Date();
                            const endsAtDate = data.subscriptionEndDate?.toDate ? data.subscriptionEndDate.toDate() : new Date();

                            fetchedSubscribers.push({
                                id: doc.id,
                                name: `${data.firstName} ${data.lastName}`,
                                email: data.email,
                                planId: data.planId || 'free',
                                subscribedAt: subscribedAtDate.toLocaleDateString(),
                                subscriptionEndsAt: endsAtDate.toLocaleDateString(),
                            });
                        });
                    });
                }
                setSubscribers(fetchedSubscribers);
            } catch (error) {
                console.error("Error fetching subscriber data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const totalPages = Math.ceil(subscribers.length / SUBSCRIBERS_PER_PAGE);
    const paginatedSubscribers = useMemo(() => {
        const startIndex = (currentPage - 1) * SUBSCRIBERS_PER_PAGE;
        return subscribers.slice(startIndex, startIndex + SUBSCRIBERS_PER_PAGE);
    }, [currentPage, subscribers]);

    if (loading) {
        return <div>Loading subscribers...</div>;
    }
    
    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Subscribed Plan</TableHead>
                            <TableHead>Subscription Date</TableHead>
                            <TableHead>Subscription End Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedSubscribers.length > 0 ? (
                            paginatedSubscribers.map(sub => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{sub.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{sub.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{sub.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {plans.find(p => p.id === sub.planId)?.name || sub.planId}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{sub.subscribedAt}</TableCell>
                                    <TableCell>{sub.subscriptionEndsAt}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No subscribers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </>
    );
}
