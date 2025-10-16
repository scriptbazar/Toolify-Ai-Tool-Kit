
import { getTools, type Tool } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews, type Review } from '@/ai/flows/review-management';
import { getPosts, type Post } from '@/ai/flows/blog-management';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import * as Icons from 'lucide-react';
import { ToolComponentRenderer } from './_components/ToolPageClient';
import { type AppSettings } from '@/ai/flows/settings-management.types';

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

export default async function ToolPage({ params }: { params: { slug: string } }) {
    const { slug } = params;

    // Optimized data fetching
    const [settings, allPosts, tools, toolReviews] = await Promise.all([
        getSettings(),
        getPosts('Published'),
        getTools({ slug }), // Fetch only the specific tool for this page
        getReviews({ toolId: slug }),
    ]);

    const tool = tools[0];

    if (!tool || tool.status === 'Disabled') {
        notFound();
    }
    
    // Fetch all tools separately for the sidebar without blocking the page render
    const allToolsForSidebar = await getTools({ status: 'Active' });

    const sidebarSettings = settings?.sidebar?.toolSidebar;
    const popularTools = allToolsForSidebar.filter(t => t.slug !== slug).slice(0, 10);
    const recentPosts = allPosts.filter(p => p.status === 'Published').slice(0, 5);

    const sidebar = (
        <aside className="w-full lg:w-64 xl:w-80 mt-8 lg:mt-0 space-y-6 lg:sticky lg:top-24">
            <AdPlaceholder adSlotId="toolpage-sidebar" adSettings={settings?.advertisement ?? null} />
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

    return (
        <ToolComponentRenderer
            tool={tool}
            toolReviews={toolReviews}
            adSettings={settings?.advertisement ?? null}
            sidebar={sidebar}
        />
    );
}
