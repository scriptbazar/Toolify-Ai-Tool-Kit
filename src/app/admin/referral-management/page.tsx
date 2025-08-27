
'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'all' | 'direct' | 'team' | 'pending';

export default function ReferralManagementPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const tabs: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'direct', label: 'Direct', icon: UserPlus },
    { id: 'team', label: 'Team', icon: GitBranch },
    { id: 'pending', label: 'Pending', icon: History },
  ];

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate saving settings
    setTimeout(() => {
        setIsSaving(false);
        toast({
            title: 'Settings Saved',
            description: 'Your referral settings have been updated.',
        });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral Management</h1>
        <p className="text-muted-foreground">
          Track and manage all referral activities and rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
                        onClick={() => setActiveFilter(tab.id)}
                        className="shrink-0"
                        >
                        <tab.icon className="mr-2 h-4 w-4" />
                        {tab.label} (0)
                        </Button>
                    ))}
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        placeholder="Search referrals..."
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
                        <TableHead>Referrer</TableHead>
                        <TableHead>Referred User</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                            No referral data found.
                        </TableCell>
                        </TableRow>
                    </TableBody>
                    </Table>
                </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Referral Settings</CardTitle>
                    <CardDescription>Configure your referral program.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="enable-referrals" className="font-medium">Enable Referral Program</Label>
                        <Switch id="enable-referrals" defaultChecked />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="commission-rate">Commission Rate</Label>
                        <div className="relative">
                            <Input id="commission-rate" type="number" defaultValue="20" className="pl-8" />
                            <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cookie-duration">Cookie Duration (Days)</Label>
                         <div className="relative">
                            <Input id="cookie-duration" type="number" defaultValue="30" className="pl-8" />
                            <Cookie className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payout-threshold">Minimum Payout Threshold</Label>
                         <div className="relative">
                            <Input id="payout-threshold" type="number" defaultValue="50" className="pl-8" />
                            <CircleDollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>

                    <Button className="w-full" onClick={handleSaveSettings} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
