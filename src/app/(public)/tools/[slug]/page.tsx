
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { notFound } from 'next/navigation';
import { ToolComponentRenderer } from './_components/ToolPageClient';
import { ToolSidebar } from '@/components/tools/ToolSidebar';

export default async function ToolPage({ params }: { params: { slug: string } }) {
    // Fetch data sequentially to avoid potential server hangs with Promise.all
    const settings = await getSettings();
    const tools = await getTools({ slug: params.slug });
    const tool = tools[0];

    if (!tool || tool.status === 'Disabled') {
        notFound();
    }
    
    const toolReviews = await getReviews({ toolId: params.slug });
    const adSettings = settings?.advertisement ?? null;
    const sidebarSettings = settings?.sidebar?.toolSidebar ?? null;

    return (
        <ToolComponentRenderer
            tool={tool}
            toolReviews={toolReviews}
            adSettings={adSettings}
        >
            <ToolSidebar
                adSettings={adSettings}
                sidebarSettings={sidebarSettings}
                currentToolSlug={params.slug}
            />
        </ToolComponentRenderer>
    );
}

    