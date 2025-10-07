
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserActivity } from '@/ai/flows/user-activity';
import type { UserActivity, UserActivityType } from '@/ai/flows/user-activity.types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Clock, Type, FileText, Newspaper, HelpCircle, Activity, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const ITEMS_PER_PAGE = 10;

const getActivityIcon = (type: UserActivityType) => {
  switch (type) {
    case 'tool_usage':
      return <Type className="h-4 w-4 text-primary" />;
    case 'page_view':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'blog_view':
      return <Newspaper className="h-4 w-4 text-green-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function UsageHistoryPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userActivities = await getUserActivity(firebaseUser.uid, 100); 
          setActivities(userActivities);
        } catch (error) {
          console.error("Failed to load usage history:", error);
          toast({
            title: "Error",
            description: "Could not load your usage history.",
            variant: "destructive",
          });
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  const toolUsageData = useMemo(() => {
    const toolCounts: { [key: string]: number } = {};
    activities
      .filter(a => a.type === 'tool_usage')
      .forEach(a => {
        const toolName = a.details.name || 'Unknown Tool';
        toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
      });

    return Object.entries(toolCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [activities]);

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return activities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activities, currentPage]);
  
  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);


  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usage History</h1>
        <p className="text-muted-foreground">
          A detailed look at your recent activity on ToolifyAI.
        </p>
      </div>

       <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="mr-2 h-4 w-4"/>Most Used Tools</TabsTrigger>
          <TabsTrigger value="log"><Clock className="mr-2 h-4 w-4"/>Recent Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>
                Your top tools based on usage in your recent activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {toolUsageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={toolUsageData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <p className="font-medium">{`${payload[0].payload.name}: ${payload[0].value} uses`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                 <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-8 border-2 border-dashed rounded-lg">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">No tool usage data available yet.</p>
                    <p className="text-muted-foreground">Start using some tools to see your stats here!</p>
                 </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="log" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Complete Activity Log</CardTitle>
              <CardDescription>A chronological list of your recent activities on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActivities.length > 0 ? paginatedActivities.map(activity => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActivityIcon(activity.type)}
                          <span className="capitalize font-medium">
                            {activity.type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{activity.details.name}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                            You have no recent activity.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
               {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 pt-4">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
