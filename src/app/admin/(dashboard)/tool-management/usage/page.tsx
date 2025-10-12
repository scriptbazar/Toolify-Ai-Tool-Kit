

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getToolUsageStats, getRecentToolActivity, type ToolUsageStat, type RecentToolActivity } from '@/ai/flows/user-activity';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Clock, User } from 'lucide-react';
import Link from 'next/link';

export default function ToolUsagePage() {
    const [stats, setStats] = useState<ToolUsageStat[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentToolActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [usageStats, activityLog] = await Promise.all([
                    getToolUsageStats(),
                    getRecentToolActivity(20)
                ]);
                setStats(usageStats);
                setRecentActivity(activityLog);
            } catch (error) {
                console.error("Failed to fetch tool usage data:", error);
                toast({ title: 'Error', description: 'Could not load tool usage data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);
    
    const chartData = useMemo(() => {
        return stats.slice(0, 10).sort((a,b) => a.count - b.count); // For horizontal bar chart, sort ascending
    }, [stats]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tool Usage Analytics</h1>
                <p className="text-muted-foreground">
                    Understand which tools are most popular and see recent user activity.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart3/> Most Used Tools</CardTitle>
                        <CardDescription>Top 10 tools based on usage count.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                           <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="toolName" type="category" width={150} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return <div className="rounded-lg border bg-background p-2 shadow-sm"><p className="font-medium">{`${payload[0].payload.toolName}: ${payload[0].value} uses`}</p></div>;
                                    }
                                    return null;
                                }} />
                                <Bar dataKey="count" layout="vertical" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="flex items-center justify-center h-[300px] text-muted-foreground">No tool usage data available.</div>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock/> Recent Tool Activity</CardTitle>
                        <CardDescription>The latest tool usage across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tool</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivity.map(activity => (
                                    <TableRow key={activity.id}>
                                        <TableCell className="font-medium">{activity.toolName}</TableCell>
                                        <TableCell>
                                            <Link href={`/admin/users/${activity.userId}`} className="hover:underline flex items-center gap-1">
                                                <User className="h-3 w-3"/>{activity.userName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {recentActivity.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No recent activity.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
