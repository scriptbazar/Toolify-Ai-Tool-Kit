

import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { getPosts } from '@/ai/flows/blog-management';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import * as Icons from 'lucide-react';
import { ToolPageClient } from './_components/ToolPageClient';
import { cache } from 'react';

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

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

const getCachedTools = cache(getTools);
const getCachedPosts = cache(getPosts);


export default async function ToolPage({ params }: { params: { slug: string } }) {
    const awaitedParams = await params;
    const slug = awaitedParams.slug;

    const [settings, allPosts, allTools, toolReviews] = await Promise.all([
        getSettings(),
        getCachedPosts(),
        getCachedTools(),
        getReviews({ toolId: slug })
    ]);

    const tool = allTools.find(t => t.slug === slug);

    if (!tool || tool.status === 'Disabled') {
        notFound();
    }

    const sidebarSettings = settings?.sidebar?.toolSidebar;
    const popularTools = allTools.filter(t => t.status === 'Active' && t.slug !== slug).slice(0, 10);
    const recentPosts = allPosts.filter(p => p.status === 'Published').slice(0, 5);
    const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;

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

    return (
        <ToolPageClient
            tool={tool}
            toolReviews={toolReviews}
            adSettings={settings?.advertisement ?? null}
            sidebar={sidebar}
        />
    );
}
