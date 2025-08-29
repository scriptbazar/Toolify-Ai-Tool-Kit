
'use client';

import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  UserCheck,
  UserPlus,
  Users,
  Construction,
  Globe,
  Link as LinkIcon,
  Chrome,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  Cell,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';


interface ChartData {
  month: string;
  users: number;
}

interface PieChartData {
  name: string;
  value: number;
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


export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalLeads: 0,
    activeUsers: 0,
  });
  const [lineChartData, setLineChartData] = useState<ChartData[]>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);

  useEffect(() => {
    async function fetchAnalyticsData() {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const leadsRef = collection(db, 'leads');

        const [usersSnapshot, leadsSnapshot] = await Promise.all([
            getDocs(usersRef),
            getDocs(leadsRef)
        ]);

        const totalUsers = usersSnapshot.size;
        const totalLeads = leadsSnapshot.size;
        const allUsersList = usersSnapshot.docs.map(doc => doc.data());

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsersCount = allUsersList.filter(user => 
            user.createdAt && user.createdAt.toDate() >= thirtyDaysAgo
        ).length;

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const activeUsersCount = allUsersList.filter(user =>
          user.lastActive && user.lastActive.toDate() >= fiveMinutesAgo
        ).length;
        
        setStats({ 
            totalUsers, 
            totalLeads,
            newUsers: newUsersCount,
            activeUsers: activeUsersCount
        });

        const monthlySignups: { [key: string]: number } = {};
        allUsersList.forEach(user => {
          if (user.createdAt && user.createdAt.seconds) {
            const date = new Date(user.createdAt.seconds * 1000);
            if (date.getFullYear() === new Date().getFullYear()) {
                const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                monthlySignups[monthKey] = (monthlySignups[monthKey] || 0) + 1;
            }
          }
        });
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentYear = new Date().getFullYear();
        const fullYearData: ChartData[] = [];

        for (let i = 0; i < 12; i++) {
          const monthKey = `${currentYear}-${i}`;
          fullYearData.push({
            month: monthNames[i],
            users: monthlySignups[monthKey] || 0,
          });
        }
        setLineChartData(fullYearData);
        
        setPieChartData([
            { name: 'Signup Users', value: totalUsers },
            { name: 'Lead Users', value: totalLeads },
        ]);


      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = ['overview', 'audience', 'behavior', 'conversions'];

  const renderOverview = () => {
     if (loading) {
        return (
             <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
     }
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
                    +5.2% from last month
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
                    +18.3% from last month
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
                    +180.1% from last month
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
                          <RechartsLineChart
                              data={lineChartData}
                              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                          >
                               <CartesianGrid vertical={false} />
                               <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                               <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false}/>
                               <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                               <Line dataKey="users" type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} />
                          </RechartsLineChart>
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
                                    {`${(percent * 100).toFixed(0)}%`}
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
  }

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
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'default' : 'outline'}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && renderOverview()}

        <Dialog
          open={activeTab !== 'overview'}
          onOpenChange={(isOpen) => !isOpen && setActiveTab('overview')}
        >
           <DialogContent>
            <DialogHeader>
              <DialogTitle>Feature Coming Soon</DialogTitle>
              <DialogDescription>
                This analytics section is under construction. Check back later for more
                insights!
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-[200px] flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
              <div className="text-center">
                <Construction className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">More detailed analytics are coming soon!</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
