
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  CheckCircle,
  Clock,
  Search,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getToolRequests, updateToolRequestStatus, type ToolRequest } from '@/ai/flows/tool-management';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

const REQUESTS_PER_PAGE = 5;

const getStatusBadge = (status: FilterType) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Approved</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
    case 'rejected':
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function ToolRequestsPage() {
  const [requests, setRequests] = useState<ToolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const fetchedRequests = await getToolRequests();
      setRequests(fetchedRequests);
    } catch (error) {
      console.error("Failed to fetch tool requests:", error);
      toast({ title: 'Error', description: 'Could not load tool requests.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    const originalRequests = [...requests];
    const updatedRequests = requests.map(r => r.id === requestId ? { ...r, status } : r);
    setRequests(updatedRequests);

    const result = await updateToolRequestStatus(requestId, status);
    if (!result.success) {
      setRequests(originalRequests); // Revert on failure
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Request status updated to ${status}.` });
    }
  };
  
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
        const filterMatch = activeFilter === 'all' || req.status === activeFilter;
        const searchMatch = req.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            req.description.toLowerCase().includes(searchQuery.toLowerCase());
        return filterMatch && searchMatch;
    });
  }, [requests, activeFilter, searchQuery]);
  
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * REQUESTS_PER_PAGE;
    return filteredRequests.slice(startIndex, startIndex + REQUESTS_PER_PAGE);
  }, [filteredRequests, currentPage]);

  const totalPages = Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE);


  const tabs: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: requests.length },
    { id: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { id: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
    { id: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tool Requests</h1>
        <p className="text-muted-foreground">
          Review and manage tool suggestions submitted by users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Suggestions</CardTitle>
          <CardDescription>
            Approve or reject new tool ideas from the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => (
                <Button key={tab.id} variant={activeFilter === tab.id ? 'default' : 'outline'} onClick={() => { setActiveFilter(tab.id); setCurrentPage(1); }} className="shrink-0">
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && [...Array(5)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ))}
                {!loading && paginatedRequests.length > 0 ? (
                  paginatedRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{req.name}</TableCell>
                      <TableCell className="font-medium">{req.toolName}</TableCell>
                      <TableCell className="max-w-xs truncate">{req.description}</TableCell>
                      <TableCell>{new Date(req.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(req.status as FilterType)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {req.status !== 'approved' && <DropdownMenuItem onClick={() => handleStatusUpdate(req.id, 'approved')}><ThumbsUp className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>}
                            {req.status !== 'rejected' && <DropdownMenuItem onClick={() => handleStatusUpdate(req.id, 'rejected')}><ThumbsDown className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="h-48 text-center">No tool requests found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
           {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
