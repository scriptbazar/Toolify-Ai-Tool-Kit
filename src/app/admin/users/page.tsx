
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
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
import { AlertCircle, MoreHorizontal, User, Users, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole, type UpdateUserRoleInput } from '@/ai/flows/user-management';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface User {
  id: string;
  name: string; // Combined name
  email: string;
  userName?: string;
  role: 'admin' | 'user' | 'lead';
  type: 'Signup' | 'Lead';
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}


export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'signup' | 'lead'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchUsersAndLeads = async () => {
    setLoading(true);
    try {
      // Fetch registered users
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList: User[] = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email,
          userName: data.userName,
          role: data.role,
          type: 'Signup',
          createdAt: data.createdAt,
        };
      });

      // Fetch leads
      const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      const leadsSnapshot = await getDocs(leadsQuery);
      const leadsList: User[] = leadsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          role: 'lead',
          type: 'Lead',
          createdAt: data.createdAt,
        };
      });

      // Combine and sort by date
      const combinedList = [...usersList, ...leadsList].sort((a, b) => {
        const dateA = a.createdAt?.seconds ?? 0;
        const dateB = b.createdAt?.seconds ?? 0;
        return dateB - dateA;
      });

      setAllUsers(combinedList);
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
      const filterMatch = activeFilter === 'all' || (activeFilter === 'signup' && user.type === 'Signup') || (activeFilter === 'lead' && user.type === 'Lead');
      const searchMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()) || (user.userName && user.userName.toLowerCase().includes(searchQuery.toLowerCase()));
      return filterMatch && searchMatch;
    });
  }, [allUsers, activeFilter, searchQuery]);
  
  const counts = useMemo(() => ({
    all: allUsers.length,
    signup: allUsers.filter(u => u.type === 'Signup').length,
    lead: allUsers.filter(u => u.type === 'Lead').length,
  }), [allUsers]);

  const handleEditClick = (user: User) => {
    if (user.type === 'Lead') {
        toast({ title: "Info", description: "Leads cannot be edited." });
        return;
    }
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      const input: UpdateUserRoleInput = {
        userId: selectedUser.id,
        newRole: selectedUser.role as 'user' | 'admin', // Cast here
      };
      await updateUserRole(input);
      toast({
        title: 'Success!',
        description: `User role for ${selectedUser.email} has been updated.`,
      });
      await fetchUsersAndLeads();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to update role:", error);
      toast({
        title: 'Error',
        description: error.message || 'Could not update user role.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };


  const formatDate = (timestamp?: { seconds: number; nanoseconds: number; }) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
      return 'N/A';
    }
    return new Date(timestamp.seconds * 1000).toLocaleString();
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
                <Button variant={activeFilter === 'all' ? 'default' : 'outline'} onClick={() => setActiveFilter('all')}>
                    <Users className="mr-2 h-4 w-4" />
                    All Users ({counts.all})
                </Button>
                <Button variant={activeFilter === 'signup' ? 'default' : 'outline'} onClick={() => setActiveFilter('signup')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Signup Users ({counts.signup})
                </Button>
                <Button variant={activeFilter === 'lead' ? 'default' : 'outline'} onClick={() => setActiveFilter('lead')}>
                    <User className="mr-2 h-4 w-4" />
                    Lead Users ({counts.lead})
                </Button>
            </div>
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
            </div>
          </div>
          {loading && <p>Loading users...</p>}
          {error && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                         <div className="flex items-center gap-2">
                           <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                           </Avatar>
                           <span>{user.name}</span>
                         </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.userName || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : (user.role === 'user' ? 'secondary' : 'outline')}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                       <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.type === 'Lead'}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(user)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value: 'user' | 'admin') => 
                    setSelectedUser(prev => prev ? { ...prev, role: value } : null)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleRoleChange} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
