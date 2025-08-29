

'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Edit, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const adminQuery = query(usersCollection, where('role', '==', 'admin'));
      const adminSnapshot = await getDocs(adminQuery);
      
      const adminList: AdminUser[] = adminSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email,
          role: data.role,
          createdAt: data.createdAt,
        };
      });

      setAdmins(adminList);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching admins:", err);
      setError('Failed to load administrators. Please ensure you have the correct permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const formatDate = (timestamp?: { seconds: number; nanoseconds: number; }) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
      return 'N/A';
    }
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Administrators</h1>
        <p className="text-muted-foreground">
          Manage all users with administrator privileges.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>A list of all users with the 'admin' role.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading administrators...</p>}
          {error && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length > 0 ? (
                    admins.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                           <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                             </Avatar>
                             <span>{user.name}</span>
                           </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge>
                            <UserCog className="mr-2 h-3 w-3"/>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/users/${user.id}`}>
                              <Edit className="mr-2 h-4 w-4"/>
                              Manage
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No administrators found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
