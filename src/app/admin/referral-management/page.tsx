
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
  UserPlus,
  GitBranch,
  History,
  Search,
  Save,
  Percent,
  Cookie,
  CircleDollarSign,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import type { ReferralSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';

type FilterType = 'all' | 'direct' | 'team' | 'pending';
type StatusType = 'Completed' | 'Pending';

const allReferrals = [
    { referrer: 'olivia.martin@email.com', referredUser: 'liam@example.com', date: '2024-07-30', status: 'Completed', commission: '$5.00' },
    { referrer: 'jackson.lee@email.com', referredUser: 'noah@example.com', date: '2024-07-29', status: 'Completed', commission: '$5.00' },
    { referrer: 'olivia.martin@email.com', referredUser: 'emma@example.com', date: '2024-07-28', status: 'Pending', commission: '$0.00' },
    { referrer: 'isabella.nguyen@email.com', referredUser: 'ava@example.com', date: '2024-07-27', status: 'Completed', commission: '$5.00' },
    { referrer: 'will@email.com', referredUser: 'mason@example.com', date: '2024-07-26', status: 'Completed', commission: '$5.00' },
    { referrer: 'sofia.davis@email.com', referredUser: 'james@example.com', date: '2024-07-25', status: 'Pending', commission: '$0.00' },
    { referrer: 'jackson.lee@email.com', referredUser: 'logan@example.com', date: '2024-07-24', status: 'Completed', commission: '$5.00' },
];

const ITEMS_PER_PAGE = 5;

export default function ReferralManagementPage() {
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const appSettings = await getSettings();
        setSettings(appSettings.referral || {
          isReferralEnabled: true,
          commissionRate: 20,
          cookieDuration: 30,
          payoutThreshold: 50,
          isMultiLevel: false,
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load referral settings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

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
  
  const tabs: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'direct', label: 'Direct', icon: UserPlus },
    { id: 'team', label: 'Team', icon: GitBranch },
    { id: 'pending', label: 'Pending', icon: History },
  ];

  const filteredReferrals = useMemo(() => {
      let referrals = allReferrals;
      if (activeFilter === 'pending') {
          referrals = referrals.filter(r => r.status === 'Pending');
      }
      return referrals.filter(r => 
        r.referrer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.referredUser.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [searchQuery, activeFilter]);

  const paginatedReferrals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReferrals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredReferrals, currentPage]);

  const totalPages = Math.ceil(filteredReferrals.length / ITEMS_PER_PAGE);

  const getStatusBadge = (status: StatusType) => {
    switch (status) {
        case 'Completed':
            return <Badge variant='default' className="bg-green-500 hover:bg-green-600">Completed</Badge>;
        case 'Pending':
            return <Badge variant='secondary'>Pending</Badge>;
        default:
            return <Badge variant='outline'>{status}</Badge>;
    }
  };

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
              <CardTitle>All Referrals</CardTitle>
              <CardDescription>
                  A complete log of all referral activities.
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
                      {tab.label} ({tab.id === 'pending' ? allReferrals.filter(r => r.status === 'Pending').length : (tab.id === 'all' ? allReferrals.length : 0)})
                      </Button>
                  ))}
                  </div>
                  <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                      placeholder="Search referrals..."
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
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referred User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginatedReferrals.length > 0 ? (
                        paginatedReferrals.map((referral, index) => (
                          <TableRow key={index}>
                            <TableCell>{referral.referrer}</TableCell>
                            <TableCell>{referral.referredUser}</TableCell>
                            <TableCell>{referral.date}</TableCell>
                            <TableCell>{getStatusBadge(referral.status as StatusType)}</TableCell>
                            <TableCell className="text-right">{referral.commission}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-48 text-center">
                              No referral data found.
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
                            onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, isReferralEnabled: checked } : null)}
                          />
                      </div>

                      <div className={cn('space-y-6 transition-opacity duration-300', !settings.isReferralEnabled && 'opacity-50 pointer-events-none hidden')}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <Label htmlFor="commission-rate">Commission Rate</Label>
                                  <div className="relative">
                                      <Input 
                                        id="commission-rate" 
                                        type="number" 
                                        value={settings.commissionRate}
                                        onChange={(e) => setSettings(prev => prev ? { ...prev, commissionRate: Number(e.target.value) } : null)}
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
                                        onChange={(e) => setSettings(prev => prev ? { ...prev, cookieDuration: Number(e.target.value) } : null)}
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
                                        onChange={(e) => setSettings(prev => prev ? { ...prev, payoutThreshold: Number(e.target.value) } : null)}
                                        className="pl-8" />
                                      <CircleDollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  </div>
                              </div>
                              <div className="flex items-center justify-between rounded-lg border p-4">
                                  <Label htmlFor="enable-multi-level" className="font-medium">Enable Multi-level Referrals</Label>
                                  <Switch 
                                    id="enable-multi-level" 
                                    checked={settings.isMultiLevel}
                                    onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, isMultiLevel: checked } : null)}
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
