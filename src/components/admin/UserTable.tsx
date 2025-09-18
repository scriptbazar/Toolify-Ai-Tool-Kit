
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Copy, UserCog, Trash2, Check, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

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
}

interface UserTableProps {
  users: User[];
  onRoleChange: (userId: string, newRole: 'user' | 'admin') => void;
  onDeleteUser: (userId: string) => void;
}

export function UserTable({ users, onRoleChange, onDeleteUser }: UserTableProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: `Copied ${fieldName}: ${text}` });
  };
  
  const formatDate = (timestamp?: { seconds: number; nanoseconds: number; }) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
      return 'N/A';
    }
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Date Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map(user => (
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
                            <DropdownMenuItem onClick={() => onRoleChange(user.id, 'admin')} disabled={user.role === 'admin'}>
                              <Shield className="mr-2 h-4 w-4" /> Admin {user.role === 'admin' && <Check className="ml-auto h-4 w-4"/>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRoleChange(user.id, 'user')} disabled={user.role === 'user'}>
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
                              <AlertDialogAction onClick={() => onDeleteUser(user.id)}>
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
  );
}
