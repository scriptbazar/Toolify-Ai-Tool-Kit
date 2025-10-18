
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import * as Icons from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tool } from '@/ai/flows/tool-management.types';
import type { Post } from '@/ai/flows/blog-management.types';
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

interface ToolSidebarProps {
    adSettings: AdvertisementSettings | null;
    sidebarSettings: ToolSidebarSettings | null;
    popularTools: Tool[];
    recentPosts: Post[];
}

export function ToolSidebar({ adSettings, sidebarSettings, popularTools, recentPosts }: ToolSidebarProps) {
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
