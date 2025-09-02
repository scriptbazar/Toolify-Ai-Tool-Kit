
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  DollarSign,
  CreditCard,
  Send,
  Search,
  MoreHorizontal,
  BadgeCheck,
  ThumbsUp,
  ThumbsDown,
  Hourglass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getAffiliateRequests, updateAffiliateRequestStatus, type ReferralRequest } from '@/ai/flows/user-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Affiliate = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  referrals: number;
  earnings: number;
  status: 'Active' | 'Inactive';
};

const dummyAffiliates: Affiliate[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatar: '', referrals: 25, earnings: 125.50, status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', referrals: 10, earnings: 50.00, status: 'Active' },
  { id: '3', name: 'Peter Jones', email: 'peter@example.com', avatar: '', referrals: 5, earnings: 25.00, status: 'Inactive' },
];

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function AffiliateManagementPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [requests, setRequests] = useState<ReferralRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
        const pendingRequests = await getAffiliateRequests();
        setRequests(pendingRequests);
    } catch (error) {
        console.error("Failed to fetch affiliate requests:", error);
        toast({ title: 'Error', description: 'Could not load pending requests.', variant: 'destructive'});
    }
  }

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        await fetchRequests();
        setAffiliates(dummyAffiliates);
        setLoading(false);
    }
    fetchData();
  }, []);
  
  const handleRequestUpdate = async (userId: string, status: 'approved' | 'rejected') => {
    const result = await updateAffiliateRequestStatus(userId, status);
    if (result.success) {
        toast({ title: 'Success', description: `Request has been ${status}.`});
        fetchRequests(); // Re-fetch the list of pending requests
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive'});
    }
  }

  const filteredAffiliates = affiliates.filter(
    (affiliate) =>
      affiliate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalEarnings = affiliates.reduce((sum, aff) => sum + aff.earnings, 0);

  if (loading) {
      return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-64" />
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Management</h1>
        <p className="text-muted-foreground">
          Manage your affiliate partners, review requests, and track their performance.
        </p>
      </div>
      
       <Tabs defaultValue="overview">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">
                Pending Requests
                {requests.length > 0 && <Badge className="ml-2">{requests.length}</Badge>}
            </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Affiliates" value={affiliates.length.toString()} icon={Users} />
                <StatCard title="Total Earnings" value={`$${totalEarnings.toFixed(2)}`} icon={DollarSign} />
                <StatCard title="Total Paid" value="$0.00" icon={CreditCard} />
                <StatCard title="Total Due" value={`$${totalEarnings.toFixed(2)}`} icon={Send} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Affiliate Partners</CardTitle>
                    <CardDescription>
                        A list of all users who have joined the affiliate program.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search affiliates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Affiliate</TableHead>
                            <TableHead>Referrals</TableHead>
                            <TableHead>Total Earnings</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredAffiliates.map((affiliate) => (
                            <TableRow key={affiliate.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{affiliate.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{affiliate.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                    {affiliate.email}
                                    </div>
                                </div>
                                </div>
                            </TableCell>
                            <TableCell>{affiliate.referrals}</TableCell>
                            <TableCell>${affiliate.earnings.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={affiliate.status === 'Active' ? 'default' : 'secondary'} className={affiliate.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                <BadgeCheck className="mr-1 h-3 w-3"/>{affiliate.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                                    <DropdownMenuItem>
                                        {affiliate.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Pending Affiliate Requests</CardTitle>
                    <CardDescription>
                        Review and approve or reject new affiliate requests.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length > 0 ? requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{req.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{req.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{req.email}</TableCell>
                                    <TableCell>{new Date(req.requestDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleRequestUpdate(req.id, 'approved')}>
                                            <ThumbsUp className="mr-2 h-4 w-4" />Approve
                                        </Button>
                                         <Button variant="destructive" size="sm" onClick={() => handleRequestUpdate(req.id, 'rejected')}>
                                            <ThumbsDown className="mr-2 h-4 w-4" />Reject
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No pending requests.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
