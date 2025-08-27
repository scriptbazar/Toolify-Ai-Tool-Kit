
'use client';

import {
  Activity,
  ArrowUpRight,
  Users,
  DollarSign,
  UserPlus,
  BarChart3
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

const pageViewsData = [
  { date: '2024-05-01', views: 2345 },
  { date: '2024-05-02', views: 2834 },
  { date: '2024-05-03', views: 3123 },
  { date: '2024-05-04', views: 2987 },
  { date: '2024-05-05', views: 3456 },
  { date: '2024-05-06', views: 3678 },
  { date: '2024-05-07', views: 4123 },
];

const usersByCountryData = [
  { country: 'USA', users: 450 },
  { country: 'India', users: 320 },
  { country: 'Germany', users: 210 },
  { country: 'Japan', users: 180 },
  { country: 'UK', users: 150 },
  { country: 'Brazil', users: 120 },
];

const recentSignups = [
    {
        name: 'Olivia Martin',
        email: 'olivia.martin@email.com',
        plan: 'Pro',
        date: '2023-06-24',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    {
        name: 'Jackson Lee',
        email: 'jackson.lee@email.com',
        plan: 'Free',
        date: '2023-06-25',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    },
    {
        name: 'Isabella Nguyen',
        email: 'isabella.nguyen@email.com',
        plan: 'Pro',
        date: '20_23-06-26',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    },
    {
        name: 'William Kim',
        email: 'will@email.com',
        plan: 'Free',
        date: '2023-06-27',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    },
    {
        name: 'Sofia Davis',
        email: 'sofia.davis@email.com',
        plan: 'Pro',
        date: '2023-06-28',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
    },
];

const ComingSoonDialogContent = () => (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Feature Coming Soon</DialogTitle>
      <DialogDescription>
        This analytics section is under construction. Check back later for more insights!
      </DialogDescription>
    </DialogHeader>
    <div className="min-h-[200px] flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
        <p className="text-lg text-muted-foreground">
            Coming soon!
        </p>
    </div>
  </DialogContent>
);

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 space-y-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          A detailed overview of your application's performance.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,234</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+18.3% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2,350</div>
                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23.5%</div>
                <p className="text-xs text-muted-foreground">-2.5% from last month</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Page Views</CardTitle>
                <CardDescription>A line chart showing page views over the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pageViewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-3">
              <CardHeader>
                <CardTitle>Users by Country</CardTitle>
                 <CardDescription>A bar chart showing the distribution of users by country.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usersByCountryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>The most recent users to sign up for your application.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSignups.map((user) => (
                      <TableRow key={user.email}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.plan === 'Pro' ? 'default' : 'secondary'}>{user.plan}</Badge>
                        </TableCell>
                        <TableCell>{user.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>

        <Dialog open={activeTab !== 'overview'} onOpenChange={(isOpen) => !isOpen && setActiveTab('overview')}>
          <TabsContent value="audience">
            <ComingSoonDialogContent />
          </TabsContent>
          <TabsContent value="behavior">
            <ComingSoonDialogContent />
          </TabsContent>
          <TabsContent value="conversions">
            <ComingSoonDialogContent />
          </TabsContent>
        </Dialog>

      </Tabs>
    </div>
  );
}
