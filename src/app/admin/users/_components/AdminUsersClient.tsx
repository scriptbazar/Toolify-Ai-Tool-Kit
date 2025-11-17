'use client';

import { useState, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Users, UserPlus, Search, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole, deleteUser } from '@/ai/flows/user-management';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

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

interface AdminUsersClientProps {
    initialUsers: User[];
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const [activeFilter, setActiveFilter] = useState<'all' | 'signup' | 'lead' | 'comment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();

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
  
  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    const result = await updateUserRole({ userId, newRole });
    if (result.success) {
      toast({ title: 'Success', description: 'User role updated successfully.' });
      const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u);
      setAllUsers(updatedUsers);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) {
      toast({ title: 'Success', description: 'User has been deleted.' });
      setAllUsers(allUsers.filter(u => u.id !== userId));
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  return (
    <>
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
      <UserTable 
        users={filteredUsers} 
        onRoleChange={handleRoleChange}
        onDeleteUser={handleDeleteUser}
      />
    </>
  );
}
