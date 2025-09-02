
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
  Loader2,
  Eye,
  UserX,
  Copy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getAffiliateRequests, updateAffiliateRequestStatus, getAffiliates, type Affiliate, type ReferralRequest } from '@/ai/flows/user-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const StatCard = ({ title, value, icon: Icon, onClick }: { title: string, value: string, icon: React.ElementType, onClick?: () => void }) => (
  <Card onClick={onClick} className={onClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}>
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
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
        const [pendingRequests, approvedAffiliates] = await Promise.all([
            getAffiliateRequests(),
            getAffiliates()
        ]);
        setRequests(pendingRequests);
        setAffiliates(approvedAffiliates);
    } catch (error) {
        console.error("Failed to fetch affiliate data:", error);
        toast({ title: 'Error', description: 'Could not load affiliate data.', variant: 'destructive'});
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleRequestUpdate = async (userId: string, status: 'approved' | 'rejected') => {
    const result = await updateAffiliateRequestStatus(userId, status);
    if (result.success) {
        toast({ title: 'Success', description: `Request has been ${status}.`});
        fetchData(); // Re-fetch all data to update both lists
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
  
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: `Copied ${fieldName}: ${text}` });
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Management</h1>
        <p className="text-muted-foreground">
          Manage your affiliate partners, review requests, and track their performance.
        </p>
      </div>
      
       <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">
                Pending Requests
                {requests.length > 0 && <Badge className="ml-2">{requests.length}</Badge>}
            </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Affiliates" value={affiliates.length.toString()} icon={Users} onClick={() => setActiveTab('overview')} />
                <StatCard title="Pending Requests" value={requests.length.toString()} icon={Send} onClick={() => setActiveTab('requests')} />
                <StatCard title="Total Earnings" value={`$${totalEarnings.toFixed(2)}`} icon={DollarSign} />
                <StatCard title="Total Paid" value="$0.00" icon={CreditCard} />
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
                        {filteredAffiliates.length > 0 ? filteredAffiliates.map((affiliate) => (
                            <TableRow key={affiliate.id} className="cursor-pointer" onClick={() => { setSelectedAffiliate(affiliate); setIsDetailOpen(true); }}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={affiliate.avatar} alt={affiliate.name} />
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
                                    <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedAffiliate(affiliate); setIsDetailOpen(true); }}>
                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        <CreditCard className="mr-2 h-4 w-4" /> Mark as Paid
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        <UserX className="mr-2 h-4 w-4 text-destructive" /> 
                                        {affiliate.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No approved affiliates yet.</TableCell>
                            </TableRow>
                        )}
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
                                                <AvatarImage src={req.avatar} alt={req.name} />
                                                <AvatarFallback>{req.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{req.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{req.email}</TableCell>
                                    <TableCell>{new Date(req.requestDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleRequestUpdate(req.id, 'approved')}>
                                                <ThumbsUp className="mr-2 h-4 w-4" />Approve
                                            </Button>
                                             <Button variant="destructive" size="sm" onClick={() => handleRequestUpdate(req.id, 'rejected')}>
                                                <ThumbsDown className="mr-2 h-4 w-4" />Reject
                                            </Button>
                                        </div>
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

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Affiliate Details</DialogTitle>
            </DialogHeader>
            {selectedAffiliate && (
              <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                          <AvatarImage src={selectedAffiliate.avatar} alt={selectedAffiliate.name}/>
                          <AvatarFallback>{selectedAffiliate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <h3 className="text-lg font-semibold">{selectedAffiliate.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedAffiliate.email}</p>
                      </div>
                  </div>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="font-medium text-muted-foreground">User ID:</div>
                      <div className="flex items-center gap-1">
                          <span className="truncate">{selectedAffiliate.id}</span>
                           <Copy className="h-3 w-3 cursor-pointer" onClick={() => copyToClipboard(selectedAffiliate.id, 'User ID')} />
                      </div>
                      <div className="font-medium text-muted-foreground">Status:</div>
                      <div>
                          <Badge variant={selectedAffiliate.status === 'Active' ? 'default' : 'secondary'} className={selectedAffiliate.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                              {selectedAffiliate.status}
                          </Badge>
                      </div>
                       <div className="font-medium text-muted-foreground">Total Referrals:</div>
                      <div>{selectedAffiliate.referrals}</div>
                       <div className="font-medium text-muted-foreground">Total Earnings:</div>
                      <div>${selectedAffiliate.earnings.toFixed(2)}</div>
                   </div>
              </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

    </div>
  );
}
