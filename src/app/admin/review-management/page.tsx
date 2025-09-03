
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { getReviews, updateReviewStatus, deleteReview, type Review, type ReviewStatus } from '@/ai/flows/review-management';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
        case 'approved':
            return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Approved</Badge>;
        case 'pending':
            return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
        case 'rejected':
            return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Rejected</Badge>;
    }
};

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
            />
        ))}
    </div>
);

export default function ReviewManagementPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<ReviewStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const fetchedReviews = await getReviews();
            setReviews(fetchedReviews);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Could not fetch reviews.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);
    
    const handleStatusUpdate = async (reviewId: string, status: 'approved' | 'rejected') => {
        const originalReviews = [...reviews];
        const updatedReviews = reviews.map(r => r.id === reviewId ? {...r, status} : r);
        setReviews(updatedReviews);

        const result = await updateReviewStatus(reviewId, status);
        if (result.success) {
            toast({ title: 'Success', description: `Review has been ${status}.`});
        } else {
            setReviews(originalReviews); // Revert on failure
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
    };
    
    const handleDeleteReview = async (reviewId: string) => {
        const originalReviews = [...reviews];
        const updatedReviews = reviews.filter(r => r.id !== reviewId);
        setReviews(updatedReviews);

        const result = await deleteReview(reviewId);
        if (result.success) {
            toast({ title: 'Success', description: 'Review has been deleted.' });
        } else {
            setReviews(originalReviews);
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    };

    const filteredReviews = reviews.filter(review => {
        const filterMatch = activeFilter === 'all' || review.status === activeFilter;
        const searchMatch = review.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            review.comment.toLowerCase().includes(searchQuery.toLowerCase());
        return filterMatch && searchMatch;
    });

    const tabs: { id: ReviewStatus | 'all', label: string, icon: React.ElementType, count: number }[] = [
        { id: 'all', label: 'All Reviews', icon: Star, count: reviews.length },
        { id: 'pending', label: 'Pending', icon: Clock, count: reviews.filter(r => r.status === 'pending').length },
        { id: 'approved', label: 'Approved', icon: CheckCircle, count: reviews.filter(r => r.status === 'approved').length },
        { id: 'rejected', label: 'Rejected', icon: XCircle, count: reviews.filter(r => r.status === 'rejected').length },
    ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
        <p className="text-muted-foreground">
          Moderate and manage all user-submitted tool reviews.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>
            View, approve, or reject user reviews from this panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
               {tabs.map(tab => (
                <Button key={tab.id} variant={activeFilter === tab.id ? 'default' : 'outline'} onClick={() => setActiveFilter(tab.id)} className="shrink-0">
                    <tab.icon className="mr-2 h-4 w-4"/>
                    {tab.label} ({tab.count})
                </Button>
               ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, tool, or comment..."
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
                  <TableHead>User</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell>
                    </TableRow>
                ))}
                {!loading && filteredReviews.length > 0 ? (
                  filteredReviews.map(review => (
                    <TableRow key={review.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={review.authorAvatar} />
                                    <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{review.authorName}</span>
                            </div>
                        </TableCell>
                        <TableCell className="max-w-sm">
                            <p className="truncate">{review.comment}</p>
                        </TableCell>
                        <TableCell>
                           <StarRating rating={review.rating} />
                        </TableCell>
                        <TableCell>
                            <Link href={`/tools/${review.toolId}`} className="text-primary hover:underline">
                               {review.toolName}
                            </Link>
                        </TableCell>
                        <TableCell>{new Date(review.submittedOn).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {review.status !== 'approved' && <DropdownMenuItem onClick={() => handleStatusUpdate(review.id, 'approved')}><ThumbsUp className="mr-2 h-4 w-4 text-green-500"/>Approve</DropdownMenuItem>}
                                {review.status !== 'rejected' && <DropdownMenuItem onClick={() => handleStatusUpdate(review.id, 'rejected')}><ThumbsDown className="mr-2 h-4 w-4 text-red-500"/>Reject</DropdownMenuItem>}
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the review from the database.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                    </TableRow>
                  ))
                ) : !loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      No reviews found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
