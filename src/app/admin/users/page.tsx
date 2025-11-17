

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUsersClient } from './_components/AdminUsersClient';
import { getAllEmails } from '@/ai/flows/user-management';

export const revalidate = 0; // Disable caching for this page

export default async function AdminUsersPage() {
    const allUsers = await getAllEmails();

    const mappedUsers = allUsers.map(item => ({
        id: item.source === 'Signup' ? item.id : item.email,
        name: item.name || item.email.split('@')[0],
        email: item.email,
        role: item.source === 'Signup' ? (item.role || 'user') : 'lead',
        type: item.source as 'Signup' | 'Lead' | 'Comment',
        userName: item.userName,
        createdAtString: item.date,
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">
                View and manage registered users and chatbot leads.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A complete list of all registered users and leads.</CardDescription>
                </CardHeader>
                <CardContent>
                   <AdminUsersClient initialUsers={mappedUsers} />
                </CardContent>
            </Card>
        </div>
    );
}
