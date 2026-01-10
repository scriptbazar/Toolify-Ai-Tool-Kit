

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscribersClient } from './_components/SubscribersClient';
import { getAllEmails } from '@/ai/flows/user-management';
import { unstable_noStore as noStore } from 'next/cache';

export default async function SubscribersPage() {
    noStore();
    const initialEmails = await getAllEmails();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Subscribers</h1>
                <p className="text-muted-foreground">
                View and manage all email subscribers from various sources.
                </p>
            </div>
            <Card>
                <CardHeader>
                <CardTitle>Subscriber List</CardTitle>
                <CardDescription>
                    A complete list of all registered users and leads.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <SubscribersClient initialEmails={initialEmails} />
                </CardContent>
            </Card>
        </div>
    );
}
