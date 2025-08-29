
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
import { tools } from '@/lib/constants';

type ReviewStatus = 'Approved' | 'Pending' | 'Rejected';

const dummyReviews = [
    {
        id: 'rev-1',
        user: { name: 'Ganesh Kumar', avatar: 'https://i.pravatar.cc/150?u=ganesh' },
        toolSlug: 'ai-image-generator',
        rating: 5,
        comment: 'Absolutely fantastic tool! Saved me hours of work. The AI is incredibly smart.',
        date: '2024-07-30',
        status: 'Approved',
    },
    {
        id: 'rev-2',
        user: { name: 'Script Bazar', avatar: 'https://i.pravatar.cc/150?u=script' },
        toolSlug: 'youtube-summarizer',
        rating: 4,
        comment: 'Pretty good for getting quick summaries. Sometimes misses a few nuances but overall very helpful.',
        date: '2024-07-29',
        status: 'Approved',
    },
    {
        id: 'rev-3',
        user: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
        toolSlug: 'pdf-q-and-a',
        rating: 3,
        comment: 'It works, but it can be a bit slow with large documents. Needs improvement.',
        date: '2024-07-28',
        status: 'Pending',
    },
     {
        id: 'rev-4',
        user: { name: 'Elon Musk', avatar: 'https://i.pravatar.cc/150?u=elon' },
        toolSlug: 'code-helper',
        rating: 5,
        comment: 'This is the future of coding. 10/10.',
        date: '2024-07-27',
        status: 'Rejected',
    },
];

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
    const [reviews, setReviews] = useState(dummyReviews);
    const [activeFilter, setActiveFilter] = useState<ReviewStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredReviews = reviews.filter(review => {
        const filterMatch = activeFilter === 'all' || review.status === activeFilter;
        const searchMatch = review.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tools.find(t => t.slug === review.toolSlug)?.name.toLowerCase().includes(searchQuery.toLowerCase());
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
                            <p className="truncate">{review.comment.length > 50 ? `${review.comment.substring(0, 50)}...` : review.comment}</p>
                        </TableCell>
                        <TableCell>
                           <StarRating rating={review.rating} />
                        </TableCell>
                        <TableCell>
                            <Link href={`/${review.toolSlug}`} className="text-primary hover:underline">
                               {tools.find(t => t.slug === review.toolSlug)?.name}
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
