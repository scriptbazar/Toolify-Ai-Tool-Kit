
'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
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
import { updateCommentStatus, type Comment, type CommentStatus } from '@/ai/flows/blog-management';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type FilterType = 'all' | CommentStatus;

const getStatusBadge = (status: CommentStatus) => {
  switch (status) {
    case 'approved':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Approved</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
    case 'rejected':
        return <Badge variant="destructive"><Trash2 className="mr-1 h-3 w-3"/>Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface CommentsClientProps {
    initialComments: Comment[];
}

export function CommentsClient({ initialComments }: CommentsClientProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  
  const handleUpdateStatus = async (commentId: string, newStatus: Comment['status']) => {
    const originalComments = [...comments];
    const updatedComments = comments.map(c => 
        c.id === commentId ? { ...c, status: newStatus } : c
    );
    setComments(updatedComments);
    
    try {
        const result = await updateCommentStatus(commentId, newStatus);
        if (result.success) {
            toast({
              title: "Comment Updated",
              description: `The comment has been marked as ${newStatus}.`,
            });
        } else {
            throw new Error(result.message);
        }
    } catch(e: any) {
        setComments(originalComments);
        toast({
            title: "Update Failed",
            description: e.message || "Could not update comment status.",
            variant: "destructive"
        });
    }
  };

  const filteredComments = comments.filter(c => {
    const filterMatch = activeFilter === 'all' || c.status === activeFilter;
    const searchMatch =
      c.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.postTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return filterMatch && searchMatch;
  });

  const tabs: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: MessageSquare },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', icon: Trash2 },
  ];
  
  const getCount = (status: FilterType) => {
    if (status === 'all') return comments.length;
    return comments.filter(c => c.status === status).length;
  }

  return (
    <>
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
              {tab.label} ({getCount(tab.id)})
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
             {filteredComments.length > 0 ? (
                filteredComments.map(comment => (
                    <TableRow key={comment.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{comment.authorName}</span>
                            </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{comment.comment}</TableCell>
                        <TableCell>
                            <Link href={`/blog/${comment.postId}`} className="text-primary hover:underline">
                                {comment.postTitle}
                            </Link>
                        </TableCell>
                        <TableCell>{new Date(comment.submittedOn).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(comment.status as CommentStatus)}</TableCell>
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
                                    {comment.status !== 'approved' && (
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(comment.id, 'approved')}>
                                            <ThumbsUp className="mr-2 h-4 w-4"/> Approve
                                        </DropdownMenuItem>
                                    )}
                                    {comment.status !== 'rejected' && (
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(comment.id, 'rejected')}>
                                            <ThumbsDown className="mr-2 h-4 w-4"/> Reject
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem className="text-red-600" onClick={() => toast({ title: "Delete action not implemented."})}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                        No comments found for the selected filter.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
