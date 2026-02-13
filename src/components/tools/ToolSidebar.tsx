import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import * as Icons from 'lucide-react';
import type { Tool } from '@/ai/flows/tool-management.types';
import type { Post } from '@/ai/flows/blog-management.types';
import type { AdvertisementSettings, ToolSidebarSettings } from '@/ai/flows/settings-management.types';
import { getTools } from '@/ai/flows/tool-management';
import { getPosts } from '@/ai/flows/blog-management';
import { getSettings } from '@/ai/flows/settings-management';
import { unstable_cache as cache } from 'next/cache';
import { toolCategories } from '@/lib/constants';
import { cn } from '@/lib/utils';


const SidebarWidget = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
            {children}
        </CardContent>
    </Card>
);

interface ToolSidebarProps {
    adSettings: AdvertisementSettings | null;
    currentToolSlug: string;
}

// Cached functions to fetch data specifically for the sidebar
const getPopularTools = cache(async (currentToolSlug: string) => {
    const allTools = await getTools({ status: 'Active' });
    return allTools.filter(t => t.slug !== currentToolSlug).slice(0, 12);
}, ['sidebar-popular-tools'], { revalidate: 3600 });

const getRecentPosts = cache(async () => {
    const allPosts = await getPosts('Published');
    return allPosts.slice(0, 5);
}, ['sidebar-recent-posts'], { revalidate: 3600 });


export async function ToolSidebar({ adSettings, currentToolSlug }: ToolSidebarProps) {
    
    const [sidebarSettings, popularTools, recentPosts] = await Promise.all([
        getSettings().then(s => s.sidebar?.toolSidebar ?? null),
        getPopularTools(currentToolSlug),
        getRecentPosts()
    ]);

    const showSidebar = (sidebarSettings?.showPopularTools && popularTools.length > 0) || (sidebarSettings?.showRecentPosts && recentPosts.length > 0) || adSettings?.adType !== 'none';

    if (!showSidebar) return null;

    return (
        <aside className="w-full lg:w-80 xl:w-[350px] mt-8 lg:mt-0 space-y-6 lg:sticky lg:top-24">
            <AdPlaceholder adSlotId="toolpage-sidebar" adSettings={adSettings} />
            {sidebarSettings?.showPopularTools && popularTools.length > 0 && (
                <SidebarWidget title="Popular Tools">
                    <ul className="space-y-1">
                        {popularTools.map(t => {
                            const ToolIcon = (Icons as any)[t.icon] || Icons.HelpCircle;
                            const categoryInfo = toolCategories.find(c => c.id === t.category);
                            return (
                            <li key={t.id}>
                                <Link href={`/tools/${t.slug}`} className="flex items-center gap-3 text-sm md:text-base text-muted-foreground hover:text-primary font-medium transition-all p-2.5 rounded-xl hover:bg-accent/50 group">
                                    <div className={cn(
                                        "p-2 rounded-lg transition-transform group-hover:scale-110", 
                                        categoryInfo?.color?.bg || "bg-muted"
                                    )}>
                                        <ToolIcon className={cn("h-5 w-5", categoryInfo?.color?.text || "text-muted-foreground")} />
                                    </div>
                                    <span className="truncate">{t.name}</span>
                                </Link>
                            </li>
                        )})}
                    </ul>
                </SidebarWidget>
            )}
            {sidebarSettings?.showRecentPosts && recentPosts.length > 0 && (
                <SidebarWidget title="Recent Posts">
                    <ul className="space-y-3 p-2">
                        {recentPosts.map(post => (
                            <li key={post.id}>
                                <Link href={`/blog/${post.slug}`} className="group block">
                                    <p className="font-bold text-sm group-hover:text-primary transition-colors leading-tight line-clamp-2">{post.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{new Date(post.publishedAt!).toLocaleDateString()}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </SidebarWidget>
            )}
        </aside>
    );
}