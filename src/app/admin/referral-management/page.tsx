

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users,
  Search,
  Save,
  Percent,
  Cookie,
  CircleDollarSign,
  Loader2,
  Check,
  X,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import { getReferralRequests, updateReferralRequestStatus } from '@/ai/flows/user-management';
import type { ReferralSettings } from '@/ai/flows/settings-management.types';
import type { ReferralRequest } from '@/ai/flows/user-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

const getStatusBadge = (status: FilterType) => {
    switch (status) {
        case 'approved':
            return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Approved</Badge>;
        case 'pending':
            return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
        case 'rejected':
            return <Badge variant="destructive"><X className="mr-1 h-3 w-3"/>Rejected</Badge>;
        default:
            return <Badge variant='outline'>{status}</Badge>;
    }
};

const ITEMS_PER_PAGE = 5;

export default function ReferralManagementPage() {
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [requests, setRequests] = useState<ReferralRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [appSettings, referralRequests] = await Promise.all([
          getSettings(),
          getReferralRequests()
        ]);
        
        setSettings(appSettings.referral || {
          isReferralEnabled: true,
          commissionRate: 20,
          cookieDuration: 30,
          payoutThreshold: 50,
          isMultiLevel: false,
          referralProgramDescription: '',
        });

        setRequests(referralRequests);

      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Error',
          description: 'Could not load referral data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);
  
  const handleInputChange = (field: keyof ReferralSettings, value: string | number | boolean) => {
    setSettings(prev => (prev ? { ...prev, [field]: value } : null));
  };


  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSettings({ referral: settings });
      toast({
        title: 'Settings Saved',
        description: 'Your referral settings have been updated.',
      });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not save settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
   const handleRequestUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await updateReferralRequestStatus({ requestId, status });
      setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status } : req));
      toast({
        title: `Request ${status}`,
        description: 'The user has been notified.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update the request status.',
        variant: 'destructive',
      });
    }
  };

  const tabs: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', icon: X },
  ];

  const filteredRequests = useMemo(() => {
    let filtered = requests;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(r => r.status === activeFilter);
    }
    return filtered.filter(r => 
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, activeFilter, requests]);
  
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRequests, currentPage]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  
  const getCount = (status: FilterType) => {
    if (status === 'all') return requests.length;
    return requests.filter(r => r.status === status).length;
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral Management</h1>
        <p className="text-muted-foreground">
          Track and manage all referral activities and rewards.
        </p>
      </div>

      <div className="space-y-6">
          <Card>
              <CardHeader>
              <CardTitle>All Referral Requests</CardTitle>
              <CardDescription>
                  A complete log of all users requesting to join the referral program.
              </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {tabs.map((tab) => (
                      <Button
                      key={tab.id}
                      variant={activeFilter === tab.id ? 'default' : 'outline'}
                      onClick={() => {
                        setActiveFilter(tab.id);
                        setCurrentPage(1);
                      }}
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
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9 w-full sm:w-64"
                      />
                  </div>
              </div>

              <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                      <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Date Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginatedRequests.length > 0 ? (
                        paginatedRequests.map((req) => (
                          <TableRow key={req.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                       <Avatar>
                                            <AvatarFallback>{req.userName.charAt(0)}</AvatarFallback>
                                       </Avatar>
                                       <div>
                                          <p className="font-medium">{req.userName}</p>
                                          <p className="text-sm text-muted-foreground">{req.userEmail}</p>
                                       </div>
                                    </div>
                                </TableCell>
                            <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(req.status as FilterType)}</TableCell>
                            <TableCell className="text-right">
                                {req.status === 'pending' && (
                                    <div className="flex gap-2 justify-end">
                                      <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleRequestUpdate(req.id, 'approved')}>
                                        <Check className="mr-2 h-4 w-4" /> Approve
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleRequestUpdate(req.id, 'rejected')}>
                                        <X className="mr-2 h-4 w-4" /> Reject
                                      </Button>
                                    </div>
                                )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center">
                              No referral requests found for the current filter.
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
          
          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Referral Settings</CardTitle>
                      <CardDescription>Configure your referral program.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <Label htmlFor="enable-referrals" className="font-medium">Enable Referral Program</Label>
                          <p className="text-sm text-muted-foreground">Turn the entire referral system on or off.</p>
                        </div>
                          <Switch 
                            id="enable-referrals" 
                            checked={settings.isReferralEnabled} 
                            onCheckedChange={(checked) => handleInputChange('isReferralEnabled', checked)}
                          />
                      </div>

                      <div className={cn('space-y-6 transition-opacity duration-300', !settings.isReferralEnabled && 'opacity-50 pointer-events-none')}>
                          <div className="space-y-2">
                             <Label htmlFor="referralProgramDescription">Referral Program Description</Label>
                              <Textarea 
                                id="referralProgramDescription"
                                placeholder="Describe your referral program here. Explain the benefits, commission rates, and rules. This will be shown to users."
                                value={settings.referralProgramDescription || ''}
                                onChange={(e) => handleInputChange('referralProgramDescription', e.target.value)}
                                className="min-h-[150px]"
                              />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <Label htmlFor="commission-rate">Commission Rate</Label>
                                  <div className="relative">
                                      <Input 
                                        id="commission-rate" 
                                        type="number" 
                                        value={settings.commissionRate}
                                        onChange={(e) => handleInputChange('commissionRate', Number(e.target.value))}
                                        className="pl-8" />
                                      <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="cookie-duration">Cookie Duration (Days)</Label>
                                  <div className="relative">
                                      <Input 
                                        id="cookie-duration" 
                                        type="number" 
                                        value={settings.cookieDuration}
                                        onChange={(e) => handleInputChange('cookieDuration', Number(e.target.value))}
                                        className="pl-8" />
                                      <Cookie className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <Label htmlFor="payout-threshold">Minimum Payout Threshold</Label>
                                  <div className="relative">
                                      <Input 
                                        id="payout-threshold" 
                                        type="number" 
                                        value={settings.payoutThreshold}
                                        onChange={(e) => handleInputChange('payoutThreshold', Number(e.target.value))}
                                        className="pl-8" />
                                      <CircleDollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  </div>
                              </div>
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                  <Label htmlFor="enable-multi-level" className="font-medium">Enable Multi-level Referrals</Label>
                                  <Switch 
                                    id="enable-multi-level" 
                                    checked={settings.isMultiLevel}
                                    onCheckedChange={(checked) => handleInputChange('isMultiLevel', checked)}
                                  />
                              </div>
                          </div>
                      </div>
                      
                      <Button className="w-full" onClick={handleSaveSettings} disabled={isSaving}>
                          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Save Settings
                      </Button>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
}
