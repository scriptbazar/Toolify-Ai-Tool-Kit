
'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  UserCheck,
  UserPlus,
  Users,
  Footprints,
  LogIn,
  LogOut,
  Activity,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { type AdminActivityLogItem } from '@/ai/flows/user-activity';
import Link from 'next/link';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });


interface ChartData {
  month: string;
  users: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface Stats {
    totalUsers: number;
    newUsers: number;
    totalLeads: number;
    activeUsers: number;
    totalUsersChange: string;
    totalLeadsChange: string;
    newUsersChange: string;
}

interface AdminAnalyticsClientProps {
    stats: Stats;
    lineChartData: ChartData[];
    pieChartData: PieChartData[];
    activityLog: AdminActivityLogItem[];
}

const lineChartConfig = {
  users: {
    label: 'Users',
    color: 'hsl(var(--primary))',
  },
};

const pieChartConfig = {
  "Signup Users": {
    label: 'Signup Users',
    color: 'hsl(var(--primary))',
  },
  "Lead Users": {
     label: 'Lead Users',
     color: 'hsl(var(--chart-2))',
  }
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))'];
const ITEMS_PER_PAGE = 10;


export function AdminAnalyticsClient({ stats, lineChartData, pieChartData, activityLog }: AdminAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(activityLog.length / ITEMS_PER_PAGE);
  const currentActivityLog = activityLog.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity Log' },
  ];
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tool_usage': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'login': return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout': return <LogOut className="h-4 w-4 text-red-500" />;
      default: return <Footprints className="h-4 w-4 text-gray-500" />;
    }
  }


  const renderOverview = () => {
      return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalUsersChange} from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalLeadsChange} from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New Users (30d)
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{stats.newUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                     {stats.newUsersChange} from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Users active in the last 5 minutes
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                  <CardHeader>
                      <CardTitle>User Growth This Year</CardTitle>
                      <CardDescription>
                          A chart showing new user signups per month.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
                          <LineChart
                              data={lineChartData}
                              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                          >
                               <CartesianGrid vertical={false} />
                               <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                               <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false}/>
                               <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                               <Line dataKey="users" type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} />
                          </LineChart>
                      </ChartContainer>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>Users by Source</CardTitle>
                      <CardDescription>
                          A breakdown of user acquisition channels.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                           <PieChart>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Pie
                              data={pieChartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              labelLine={false}
                              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                    {`${((percent || 0) * 100).toFixed(0)}%`}
                                  </text>
                                );
                              }}
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                          </PieChart>
                      </ChartContainer>
                  </CardContent>
              </Card>
            </div>
          </div>
      )
  };

   const renderActivityLog = () => (
    <Card>
      <CardHeader>
        <CardTitle>Admin Activity Log</CardTitle>
        <CardDescription>A log of all important actions performed by users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityLog.length === 0 && <TableRow><TableCell colSpan={4} className="text-center h-24">No activity yet.</TableCell></TableRow>}
            {currentActivityLog.map(log => (
              <TableRow key={log.id}>
                <TableCell>
                    <Link href={`/admin/users/${log.userId}`} className="hover:underline">
                        {log.userName}
                    </Link>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {getActivityIcon(log.type)}
                        <span className="capitalize">{log.type.replace(/_/g, ' ')}</span>
                    </div>
                </TableCell>
                <TableCell>{log.details.name}</TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 &&
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        }
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          A detailed overview of your application's performance.
        </p>
      </header>

      <div className="space-y-4">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className="capitalize"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'activity' && renderActivityLog()}

      </div>
    </div>
  );
}
