

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle,
  Edit,
  Trash2,
  Search,
  PlusCircle,
  MoreHorizontal,
  Clock,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

type PostStatus = 'Published' | 'Draft' | 'Scheduled' | 'Trash';

const allPosts: any[] = [];

const ITEMS_PER_PAGE = 5;

export default function AllPostsPage() {
  const [activeFilter, setActiveFilter] = useState<PostStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    if (activeFilter !== 'All') {
        if (activeFilter === 'Draft') {
            posts = posts.filter(p => p.status === 'Draft' || p.status === 'Scheduled');
        } else {
            posts = posts.filter(p => p.status === activeFilter);
        }
    }
    return posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, activeFilter]);
  
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);
  
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'Published':
        return <Badge><CheckCircle className="mr-1 h-3 w-3"/>Published</Badge>;
      case 'Draft':
        return <Badge variant="secondary"><Edit className="mr-1 h-3 w-3"/>Draft</Badge>;
      case 'Scheduled':
        return <Badge variant="outline" className="text-blue-500 border-blue-500"><Clock className="mr-1 h-3 w-3"/>Scheduled</Badge>;
      case 'Trash':
         return <Badge variant="destructive"><Trash2 className="mr-1 h-3 w-3"/>Trashed</Badge>;
    }
  };

  const tabs: { id: PostStatus | 'All'; label: string; icon: React.ElementType }[] = [
    { id: 'All', label: 'All', icon: FileText },
    { id: 'Published', label: 'Published', icon: CheckCircle },
    { id: 'Draft', label: 'Drafts', icon: Edit },
    { id: 'Trash', label: 'Trash', icon: Trash2 },
  ];

  const getCount = (status: PostStatus | 'All') => {
    if (status === 'All') return allPosts.length;
    if (status === 'Draft') return allPosts.filter(p => p.status === 'Draft' || p.status === 'Scheduled').length;
    return allPosts.filter(p => p.status === status).length;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
        <p className="text-muted-foreground">
          View, edit, and manage all your blog posts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
          <CardDescription>
            View, edit, and manage all your blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeFilter === tab.id ? 'default' : 'outline'}
                  onClick={() => { setActiveFilter(tab.id); setCurrentPage(1); }}
                  className="shrink-0"
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label} ({getCount(tab.id)})
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9 w-full sm:w-52"
                />
              </div>
              <Button asChild>
                <Link href="/admin/blog/add-new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Published Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPosts.length > 0 ? (
                    paginatedPosts.map(post => (
                        <TableRow key={post.slug}>
                            <TableCell className="font-medium">{post.title}</TableCell>
                            <TableCell>{getStatusBadge(post.status as PostStatus)}</TableCell>
                            <TableCell>{post.category}</TableCell>
                            <TableCell>{post.publishedDate}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Edit className="mr-2 h-4 w-4"/> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500">
                                            <Trash2 className="mr-2 h-4 w-4"/> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                            No blog posts found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
           {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 pt-4">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
