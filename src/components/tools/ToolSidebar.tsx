
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import * as Icons from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getTools, type Tool } from '@/ai/flows/tool-management';
import { getPosts, type Post } from '@/ai/flows/blog-management';
import type { AdvertisementSettings, ToolSidebarSettings } from '@/ai/flows/settings-management.types';

const SidebarWidget = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card>
        <CardHeader className="p-4">
            <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            {children}
        </CardContent>
    </Card>
);

const SidebarSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader className="p-4"><Skeleton className="h-5 w-2/3" /></CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="p-4"><Skeleton className="h-5 w-2/3" /></CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                 {[...Array(3)].map((_, i) => <div key={i} className="space-y-1"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-1/2" /></div>)}
            </CardContent>
        </Card>
    </div>
)

interface ToolSidebarProps {
    adSettings: AdvertisementSettings | null;
    sidebarSettings: ToolSidebarSettings | null;
    currentToolSlug: string;
}

export function ToolSidebar({ adSettings, sidebarSettings, currentToolSlug }: ToolSidebarProps) {
    const [popularTools, setPopularTools] = useState<Tool[]>([]);
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [allTools, allPosts] = await Promise.all([
                    sidebarSettings?.showPopularTools ? getTools({ status: 'Active' }) : Promise.resolve([]),
                    sidebarSettings?.showRecentPosts ? getPosts('Published') : Promise.resolve([])
                ]);
                
                if (sidebarSettings?.showPopularTools) {
                    setPopularTools(allTools.filter(t => t.slug !== currentToolSlug).slice(0, 10));
                }

                if (sidebarSettings?.showRecentPosts) {
                    setRecentPosts(allPosts.filter(p => p.status === 'Published').slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to fetch sidebar data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [sidebarSettings, currentToolSlug]);

    if (loading) {
        return (
            <aside className="w-full lg:w-64 xl:w-80 mt-8 lg:mt-0 space-y-6 lg:sticky lg:top-24">
                <SidebarSkeleton />
            </aside>
        );
    }
    
    const showSidebar = (sidebarSettings?.showPopularTools && popularTools.length > 0) || (sidebarSettings?.showRecentPosts && recentPosts.length > 0) || adSettings?.adType !== 'none';

    if (!showSidebar) return null;


    return (
        <aside className="w-full lg:w-64 xl:w-80 mt-8 lg:mt-0 space-y-6 lg:sticky lg:top-24">
            <AdPlaceholder adSlotId="toolpage-sidebar" adSettings={adSettings} />
            {sidebarSettings?.showPopularTools && popularTools.length > 0 && (
                <SidebarWidget title="Popular Tools">
                    <ul className="space-y-2">
                        {popularTools.map(t => {
                            const ToolIcon = (Icons as any)[t.icon] || Icons.HelpCircle;
                            return (
                            <li key={t.id}>
                                <Link href={`/tools/${t.slug}`} className="flex items-center gap-3 text-base text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted">
                                    <ToolIcon className="h-5 w-5" />
                                    <span>{t.name}</span>
                                </Link>
                            </li>
                        )})}
                    </ul>
                </SidebarWidget>
            )}
            {sidebarSettings?.showRecentPosts && recentPosts.length > 0 && (
                <SidebarWidget title="Recent Posts">
                    <ul className="space-y-3">
                        {recentPosts.map(post => (
                            <li key={post.id}>
                                <Link href={`/blog/${post.slug}`} className="group">
                                    <p className="font-medium text-sm group-hover:text-primary transition-colors leading-tight">{post.title}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(post.publishedAt!).toLocaleDateString()}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </SidebarWidget>
            )}
        </aside>
    );
}

