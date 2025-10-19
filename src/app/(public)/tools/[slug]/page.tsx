
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { notFound } from 'next/navigation';
import { ToolComponentRenderer } from './_components/ToolPageClient';
import { ToolSidebar } from '@/components/tools/ToolSidebar';
import { getPosts } from '@/ai/flows/blog-management';

export default async function ToolPage({ params }: { params: { slug: string } }) {
    const { slug } = params;

    // Fetch all necessary data in parallel for this page and its sidebar
    const [settings, tools, allTools, allPosts] = await Promise.all([
        getSettings(),
        getTools({ slug: slug }),
        getTools({ status: 'Active' }), // For popular tools in sidebar
        getPosts('Published') // For recent posts in sidebar
    ]);
    
    const tool = tools[0];
    
    // If the main tool is not found, return 404
    if (!tool || tool.status === 'Disabled') {
        notFound();
    }

    // Fetch reviews only if the tool exists
    const toolReviews = await getReviews({ toolId: tool.slug });
    
    const adSettings = settings?.advertisement ?? null;
    const sidebarSettings = settings?.sidebar?.toolSidebar ?? null;

    // Prepare data for the sidebar
    const popularTools = sidebarSettings?.showPopularTools 
        ? allTools.filter(t => t.slug !== slug).slice(0, 10) 
        : [];
    const recentPosts = sidebarSettings?.showRecentPosts 
        ? allPosts.slice(0, 5) 
        : [];

    return (
        <ToolComponentRenderer
            tool={tool}
            toolReviews={toolReviews}
            adSettings={adSettings}
        >
            <ToolSidebar
                adSettings={adSettings}
                sidebarSettings={sidebarSettings}
                popularTools={popularTools}
                recentPosts={recentPosts}
            />
        </ToolComponentRenderer>
    );
}
