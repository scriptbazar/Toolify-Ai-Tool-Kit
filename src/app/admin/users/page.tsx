
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Users, UserPlus, Search, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { updateUserRole, deleteUser, getAllEmails } from '@/ai/flows/user-management';
import dynamic from 'next/dynamic';

const UserTable = dynamic(() => import('@/components/admin/UserTable').then(mod => mod.UserTable), {
    loading: () => (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
    )
});

interface User {
  id: string;
  name: string;
  email: string;
  userName?: string;
  role: 'admin' | 'user' | 'lead';
  type: 'Signup' | 'Lead' | 'Comment';
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  createdAtString?: string;
}

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'signup' | 'lead' | 'comment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();

  const fetchUsersAndLeads = async () => {
    setLoading(true);
    try {
      const combinedList = await getAllEmails();
      
      const mappedList: User[] = combinedList.map(item => ({
          id: item.source === 'Signup' ? item.id : item.email, // Use real ID for signups
          name: item.name || item.email.split('@')[0],
          email: item.email,
          role: item.source === 'Signup' ? (item.role || 'user') : 'lead',
          type: item.source as 'Signup' | 'Lead' | 'Comment',
          userName: item.userName,
          createdAtString: item.date,
      }));

      setAllUsers(mappedList);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.code === 'permission-denied' || err.code === 'failed-precondition') {
        setError("Access Denied: You don't have permission to view this page. Please ensure you are logged in with an admin account and that your Firestore security rules allow admin access.");
      } else {
        setError('Failed to load data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndLeads();
  }, []);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const filterMatch = activeFilter === 'all' || user.type.toLowerCase() === activeFilter;
      const searchMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()) || (user.userName && user.userName.toLowerCase().includes(searchQuery.toLowerCase()));
      return filterMatch && searchMatch;
    });
  }, [allUsers, activeFilter, searchQuery]);

  const handleFilterChange = (filter: 'all' | 'signup' | 'lead' | 'comment') => {
      setActiveFilter(filter);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
  };

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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Button variant={activeFilter === 'all' ? 'default' : 'outline'} onClick={() => handleFilterChange('all')}>
                    <Users className="mr-2 h-4 w-4"/>
                    All Users
                </Button>
                <Button variant={activeFilter === 'signup' ? 'default' : 'outline'} onClick={() => handleFilterChange('signup')}>
                    <UserPlus className="mr-2 h-4 w-4"/>
                    Signup Users
                </Button>
                <Button variant={activeFilter === 'lead' ? 'default' : 'outline'} onClick={() => handleFilterChange('lead')}>
                    <User className="mr-2 h-4 w-4"/>
                    Lead Users
                </Button>
                <Button variant={activeFilter === 'comment' ? 'default' : 'outline'} onClick={() => handleFilterChange('comment')}>
                    <MessageSquare className="mr-2 h-4 w-4"/>
                    Comment Users
                </Button>
            </div>
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or username"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9 w-full sm:w-52"
                />
            </div>
          </div>
          {loading && (
             <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
             </div>
          )}
          {error && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && (
              <UserTable 
                users={filteredUsers} 
                onRoleChange={(userId, newRole) => {
                  updateUserRole({ userId, newRole }).then(result => {
                    if (result.success) {
                      toast({ title: 'Success', description: 'User role updated successfully.' });
                      fetchUsersAndLeads();
                    } else {
                      toast({ title: 'Error', description: result.message, variant: 'destructive' });
                    }
                  });
                }}
                onDeleteUser={(userId) => {
                  deleteUser(userId).then(result => {
                    if (result.success) {
                      toast({ title: 'Success', description: 'User has been deleted.' });
                      fetchUsersAndLeads();
                    } else {
                      toast({ title: 'Error', description: result.message, variant: 'destructive' });
                    }
                  });
                }}
              />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
