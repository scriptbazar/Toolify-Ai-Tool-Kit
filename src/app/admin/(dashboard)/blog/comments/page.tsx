

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Trash2,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

type FilterType = 'all' | 'pending' | 'approved' | 'trash';

const comments = [
    {
        id: 'comment-1',
        author: {
            name: 'Alex Johnson',
            avatar: 'https://i.pravatar.cc/150?u=alexj',
        },
        comment: 'This is a really insightful article! Thanks for sharing.',
        inResponseTo: 'The Future of AI',
        submittedOn: '2024-07-28',
        status: 'approved',
    },
    {
        id: 'comment-2',
        author: {
            name: 'Samantha Bee',
            avatar: 'https://i.pravatar.cc/150?u=samanthab',
        },
        comment: 'Could you elaborate on the second point? I\'m not sure I follow.',
        inResponseTo: 'The Future of AI',
        submittedOn: '2024-07-29',
        status: 'pending',
    },
     {
        id: 'comment-3',
        author: {
            name: 'Mark Cuban',
            avatar: 'https://i.pravatar.cc/150?u=markc',
        },
        comment: 'Great post, but I think you missed a key aspect...',
        inResponseTo: 'Productivity Hacks',
        submittedOn: '2024-07-30',
        status: 'approved',
    },
];

const getStatusBadge = (status: FilterType) => {
  switch (status) {
    case 'approved':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Approved</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
    case 'trash':
        return <Badge variant="destructive"><Trash2 className="mr-1 h-3 w-3"/>Trashed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}


export default function CommentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: MessageSquare },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comment Management</h1>
        <p className="text-muted-foreground">
          Moderate, approve, and manage all comments on your blog posts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Comments</CardTitle>
          <CardDescription>
            View and moderate all user comments here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeFilter === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveFilter(tab.id)}
                  className="shrink-0"
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label} ({comments.filter(c => activeFilter === 'all' || c.status === activeFilter).length})
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>In Response To</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {comments.filter(c => activeFilter === 'all' || c.status === activeFilter).length > 0 ? (
                    comments.filter(c => activeFilter === 'all' || c.status === activeFilter).map(comment => (
                        <TableRow key={comment.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                                        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{comment.author.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{comment.comment}</TableCell>
                            <TableCell>
                                <Link href="#" className="text-primary hover:underline">
                                    {comment.inResponseTo}
                                </Link>
                            </TableCell>
                            <TableCell>{comment.submittedOn}</TableCell>
                            <TableCell>{getStatusBadge(comment.status as FilterType)}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Approve</DropdownMenuItem>
                                        <DropdownMenuItem>Reply</DropdownMenuItem>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Move to Trash</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                            No comments found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
