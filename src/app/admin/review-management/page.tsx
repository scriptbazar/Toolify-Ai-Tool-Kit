
'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
// import { tools } from '@/lib/constants'; // This will be fetched dynamically

type ReviewStatus = 'Approved' | 'Pending' | 'Rejected';

const allReviews: any[] = []; // Data should be fetched from a database in a real app

const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
        case 'Approved':
            return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Approved</Badge>;
        case 'Pending':
            return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
        case 'Rejected':
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
    const [reviews, setReviews] = useState(allReviews);
    const [activeFilter, setActiveFilter] = useState<ReviewStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    // const [tools, setTools] = useState([]); // In a real app, fetch tools

    const filteredReviews = reviews.filter(review => {
        const filterMatch = activeFilter === 'all' || review.status === activeFilter;
        // The search for tool name would need the tools list to be fetched
        const searchMatch = review.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            review.comment.toLowerCase().includes(searchQuery.toLowerCase());
        return filterMatch && searchMatch;
    });

    const tabs: { id: ReviewStatus | 'all', label: string, icon: React.ElementType, count: number }[] = [
        { id: 'all', label: 'All Reviews', icon: Star, count: reviews.length },
        { id: 'Pending', label: 'Pending', icon: Clock, count: reviews.filter(r => r.status === 'Pending').length },
        { id: 'Approved', label: 'Approved', icon: CheckCircle, count: reviews.filter(r => r.status === 'Approved').length },
        { id: 'Rejected', label: 'Rejected', icon: XCircle, count: reviews.filter(r => r.status === 'Rejected').length },
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
                {filteredReviews.length > 0 ? (
                  filteredReviews.map(review => (
                    <TableRow key={review.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={review.user.avatar} />
                                    <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{review.user.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="max-w-sm">
                            <p className="truncate">{review.comment.length > 30 ? `${review.comment.substring(0, 30)}...` : review.comment}</p>
                        </TableCell>
                        <TableCell>
                           <StarRating rating={review.rating} />
                        </TableCell>
                        <TableCell>
                            <Link href={`/${review.toolSlug}`} className="text-primary hover:underline">
                               {review.toolSlug}
                            </Link>
                        </TableCell>
                        <TableCell>{review.date}</TableCell>
                        <TableCell>{getStatusBadge(review.status as ReviewStatus)}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {review.status !== 'Approved' && <DropdownMenuItem><ThumbsUp className="mr-2 h-4 w-4"/>Approve</DropdownMenuItem>}
                                {review.status !== 'Rejected' && <DropdownMenuItem><ThumbsDown className="mr-2 h-4 w-4"/>Reject</DropdownMenuItem>}
                                <DropdownMenuItem className="text-red-500"><XCircle className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      No reviews found.
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
