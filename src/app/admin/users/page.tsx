

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
import { AlertCircle, MoreHorizontal, User, Users, UserPlus, Search, MessageSquare, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';


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

const dummyCommentUsers: User[] = [
    { id: 'commenter-1', name: 'Alex Johnson', email: 'alexj@example.com', role: 'user', type: 'Comment', createdAt: { seconds: 1672531199, nanoseconds: 0 } },
    { id: 'commenter-2', name: 'Samantha Bee', email: 'samanthab@example.com', role: 'user', type: 'Comment', createdAt: { seconds: 1672617599, nanoseconds: 0 } },
];

const ITEMS_PER_PAGE = 5;

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'signup' | 'lead' | 'comment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
      const combinedList = [...usersList, ...leadsList, ...dummyCommentUsers].sort((a, b) => {
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
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: 'Copied to clipboard!' });
  };
  
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const filterMatch = activeFilter === 'all' || user.type.toLowerCase() === activeFilter;
      const searchMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()) || (user.userName && user.userName.toLowerCase().includes(searchQuery.toLowerCase()));
      return filterMatch && searchMatch;
    });
  }, [allUsers, activeFilter, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  const counts = useMemo(() => ({
    all: allUsers.length,
    signup: allUsers.filter(u => u.type === 'Signup').length,
    lead: allUsers.filter(u => u.type === 'Lead').length,
    comment: allUsers.filter(u => u.type === 'Comment').length,
  }), [allUsers]);

  const handleFilterChange = (filter: 'all' | 'signup' | 'lead' | 'comment') => {
      setActiveFilter(filter);
      setCurrentPage(1);
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
                    All Users ({counts.all})
                </Button>
                <Button variant={activeFilter === 'signup' ? 'default' : 'outline'} onClick={() => handleFilterChange('signup')}>
                    <UserPlus className="mr-2 h-4 w-4"/>
                    Signup Users ({counts.signup})
                </Button>
                <Button variant={activeFilter === 'lead' ? 'default' : 'outline'} onClick={() => handleFilterChange('lead')}>
                    <User className="mr-2 h-4 w-4"/>
                    Lead Users ({counts.lead})
                </Button>
                <Button variant={activeFilter === 'comment' ? 'default' : 'outline'} onClick={() => handleFilterChange('comment')}>
                    <MessageSquare className="mr-2 h-4 w-4"/>
                    Comment Users ({counts.comment})
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
          {loading && <p>Loading users...</p>}
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
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map(user => (
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
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(user.email)}>
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Copy email</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.userName ? (
                            <div className="flex items-center gap-2">
                              @{user.userName}
                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(user.userName!)}>
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
                      <TableCell colSpan={6} className="text-center h-24">
                        No users found for the current selection.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
           {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
