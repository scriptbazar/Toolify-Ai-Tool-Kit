'use client';

import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { getPosts } from '@/ai/flows/blog-management';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import * as Icons from 'lucide-react';
import { ToolComponentRenderer } from '@/components/tools/tool-components';
import { useEffect, useState } from 'react';
import { type Tool } from '@/ai/flows/tool-management.types';
import { type Review } from '@/ai/flows/review-management.types';
import { type Post } from '@/ai/flows/blog-management.types';
import { type AppSettings } from '@/ai/flows/settings-management.types';
import { Logo } from '@/components/common/Logo';
import { Loader2 } from 'lucide-react';

const SidebarWidget = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader className="p-4">
            <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            {children}
        </CardContent>
    </Card>
);

export default function ToolPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [pageData, setPageData] = useState<{
        tool: Tool;
        toolReviews: Review[];
        adSettings: AppSettings['advertisement'] | null;
        sidebar: React.ReactNode;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData(slug: string) {
            try {
                const settings = await getSettings();
                const allPosts = await getPosts();
                const allTools = await getTools();
                const toolReviews = await getReviews({ toolId: slug });

                const tool = allTools.find(t => t.slug === slug);

                if (!tool || tool.status === 'Disabled') {
                    notFound();
                    return;
                }

                const sidebarSettings = settings?.sidebar?.toolSidebar;
                const popularTools = allTools.filter(t => t.status === 'Active' && t.slug !== slug).slice(0, 10);
                const recentPosts = allPosts.filter(p => p.status === 'Published').slice(0, 5);

                const sidebar = (
                    <aside className="w-full lg:w-64 xl:w-80 mt-8 lg:mt-0 space-y-6">
                        <AdPlaceholder adSlotId="toolpage-sidebar" adSettings={settings?.advertisement ?? null} />
                        {sidebarSettings?.showPopularTools && popularTools.length > 0 && (
                            <SidebarWidget title="Popular Tools">
                                <ul className="space-y-2">
                                    {popularTools.map(t => {
                                        const ToolIcon = (Icons as any)[t.icon] || Icons.HelpCircle;
                                        return (
                                        <li key={t.id}>
                                            <Link href={`/tools/${t.slug}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted">
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

                setPageData({
                    tool,
                    toolReviews,
                    adSettings: settings?.advertisement ?? null,
                    sidebar,
                });
            } catch (error) {
                console.error("Failed to fetch tool page data", error);
                notFound();
            } finally {
                setLoading(false);
            }
        }

        if (slug) {
            fetchData(slug);
        }
    }, [slug]);

    if (loading) {
        return (
             <div className="flex h-[calc(100vh-10rem)] w-full flex-col items-center justify-center gap-4 bg-background py-20">
                <Logo className="h-16 w-16 animate-pulse" />
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-lg">Loading tool...</p>
                </div>
            </div>
        )
    }

    if (!pageData) {
        return null;
    }

    return (
        <ToolComponentRenderer
            tool={pageData.tool}
            toolReviews={pageData.toolReviews}
            adSettings={pageData.adSettings}
            sidebar={pageData.sidebar}
        />
    );
}