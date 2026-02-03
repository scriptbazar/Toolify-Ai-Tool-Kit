'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserActivity } from '@/ai/flows/user-activity';
import { type UserActivity } from '@/ai/flows/user-activity.types';
import { getTools } from '@/ai/flows/tool-management';
import { type Tool } from '@/ai/flows/tool-management.types';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toolCategories } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function RecentlyUsedTools() {
    const { user } = useAuth();
    const [recentTools, setRecentTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        async function fetchRecentTools() {
            try {
                const [activities, allTools] = await Promise.all([
                    getUserActivity(user!.uid, 20),
                    getTools()
                ]);
                
                const toolUsageActivities = activities.filter(a => a.type === 'tool_usage');
                const recentToolSlugs = [...new Set(toolUsageActivities.map(a => a.details.path?.split('/').pop()))];
                const tools = recentToolSlugs
                    .map(slug => allTools.find(t => t.slug === slug))
                    .filter((t): t is Tool => !!t)
                    .slice(0, 5); // Limit to 5 tools
                    
                setRecentTools(tools);
            } catch (error) {
                console.error("Failed to fetch recent tools:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRecentTools();
    }, [user]);

    if (!user) return null;
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading Recent Tools...</CardTitle>
                </CardHeader>
            </Card>
        );
    }
    
    if (recentTools.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recently Used Tools</CardTitle>
                <CardDescription>Quick access to the tools you've used lately.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {recentTools.map(tool => {
                    const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
                    const categoryInfo = toolCategories.find(c => c.id === tool.category);
                    const iconColors = categoryInfo?.color || { bg: 'bg-primary/10', text: 'text-primary' };

                    return (
                        <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group">
                            <Card className="h-full flex flex-col items-center justify-center p-4 text-center hover:bg-muted transition-colors">
                                <div className={cn("p-3 rounded-full mb-2 transition-colors", iconColors.bg)}>
                                    <Icon className={cn("h-6 w-6 transition-colors", iconColors.text)} />
                                </div>
                                <p className="text-sm font-medium">{tool.name}</p>
                            </Card>
                        </Link>
                    )
                })}
            </CardContent>
        </Card>
    );
}
