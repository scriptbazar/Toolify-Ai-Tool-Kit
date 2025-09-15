
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, endBefore, Query, DocumentData, QueryDocumentSnapshot, where, QueryConstraint } from 'firebase/firestore';
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
import { AlertCircle, MoreHorizontal, User, Users, UserPlus, Search, MessageSquare, Edit, Copy, UserCog, Trash2, Check, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { updateUserRole, deleteUser } from '@/ai/flows/user-management';


interface User {
  id: string;
  name: string; // Combined name
  email: string;
  userName?: string;
  role: 'admin' | 'user' | 'lead';
  type: 'Signup' | 'Lead' | 'Comment';
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}


const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'signup' | 'lead' | 'comment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDocs, setPageDocs] = useState<(QueryDocumentSnapshot<DocumentData> | null)[]>( [null] );
  
  const { toast } = useToast();

  const fetchUsersAndLeads = async (page = 1, direction: 'next' | 'prev' | 'first' = 'first') => {
    setLoading(true);
    try {
        const usersCollection = collection(db, 'users');
        const leadsCollection = collection(db, 'leads');
        const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
        
        const getQuery = (coll: Query<DocumentData>) => {
            let q = query(coll, ...constraints);
            if (direction === 'next' && page > 1 && pageDocs[page - 1]) {
                q = query(coll, ...constraints, startAfter(pageDocs[page - 1]), limit(ITEMS_PER_PAGE));
            } else if (direction === 'prev' && page > 0 && pageDocs[page - 1]) {
                q = query(coll, ...constraints, endBefore(pageDocs[page - 1]), limit(ITEMS_PER_PAGE));
            } else {
                 q = query(coll, ...constraints, limit(ITEMS_PER_PAGE));
            }
            return q;
        }

        let usersSnapshot, leadsSnapshot;
        if (activeFilter === 'all' || activeFilter === 'signup') {
            usersSnapshot = await getDocs(getQuery(usersCollection));
        }
        if (activeFilter === 'all' || activeFilter === 'lead') {
            leadsSnapshot = await getDocs(getQuery(leadsCollection));
        }
       
        const usersList: User[] = usersSnapshot?.docs.map(doc => {
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
        }) || [];

        const leadsList: User[] = leadsSnapshot?.docs.map(doc => {
            const data = doc.data();
            return {
            id: doc.id,
            name: data.name,
            email: data.email,
            role: 'lead',
            type: 'Lead',
            createdAt: data.createdAt,
            };
        }) || [];
        
        const combinedList = [...usersList, ...leadsList].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        
        const lastDoc = usersSnapshot?.docs[usersSnapshot.docs.length - 1] || leadsSnapshot?.docs[leadsSnapshot.docs.length - 1];
        
        setPageDocs(prev => {
            const newDocs = [...prev];
            newDocs[page] = lastDoc || null;
            return newDocs;
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
    fetchUsersAndLeads(1, 'first');
  }, [activeFilter]);
  
  const handleNextPage = () => {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    fetchUsersAndLeads(newPage, 'next');
  };

  const handlePrevPage = () => {
    if (currentPage <= 1) return;
    const newPage = currentPage - 1;
    setCurrentPage(newPage);
    fetchUsersAndLeads(newPage, 'prev');
  };
  
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: `Copied ${fieldName}: ${text}` });
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    const result = await updateUserRole({ userId, newRole });
    if (result.success) {
      toast({ title: 'Success', description: 'User role updated successfully.' });
      fetchUsersAndLeads(currentPage, 'first'); // Refresh data
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) {
      toast({ title: 'Success', description: 'User has been deleted.' });
      fetchUsersAndLeads(currentPage, 'first'); // Refresh data
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };
  
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const filterMatch = activeFilter === 'all' || user.type.toLowerCase() === activeFilter;
      const searchMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()) || (user.userName && user.userName.toLowerCase().includes(searchQuery.toLowerCase()));
      return filterMatch && searchMatch;
    });
  }, [allUsers, activeFilter, searchQuery]);


  const counts = useMemo(() => ({
    all: allUsers.length,
    signup: allUsers.filter(u => u.type === 'Signup').length,
    lead: allUsers.filter(u => u.type === 'Lead').length,
    comment: allUsers.filter(u => u.type === 'Comment').length,
  }), [allUsers]);

  const handleFilterChange = (filter: 'all' | 'signup' | 'lead' | 'comment') => {
      setActiveFilter(filter);
      setCurrentPage(1);
      setPageDocs([null]);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
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
                {[...Array(ITEMS_PER_PAGE)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
            <div className="overflow-x-auto">
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.email}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(user.email, 'Email')}>
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Copy email</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.userName ? (
                            <div className="flex items-center gap-2">
                              @{user.userName}
                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(user.userName!, 'Username')}>
                                <Copy className="h-3 w-3" />
                                <span className="sr-only">Copy username</span>
                              </Button>
                            </div>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : (user.role === 'user' ? 'secondary' : 'outline')}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                         <TableCell className="text-right">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.id}`}><Edit className="mr-2 h-4 w-4" /> Edit User</Link>
                                </DropdownMenuItem>
                                {user.role !== 'lead' && (
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger><UserCog className="mr-2 h-4 w-4"/> Set Role</DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')} disabled={user.role === 'admin'}>
                                      <Shield className="mr-2 h-4 w-4" /> Admin {user.role === 'admin' && <Check className="ml-auto h-4 w-4"/>}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')} disabled={user.role === 'user'}>
                                      <User className="mr-2 h-4 w-4" /> User {user.role === 'user' && <Check className="ml-auto h-4 w-4"/>}
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                )}
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the user and their associated data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                        Yes, delete user
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No users found for the current selection.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
           <div className="flex items-center justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                  Page {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={filteredUsers.length < ITEMS_PER_PAGE}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
