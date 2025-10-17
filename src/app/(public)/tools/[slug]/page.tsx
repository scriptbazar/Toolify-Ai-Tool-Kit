
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { notFound } from 'next/navigation';
import { ToolComponentRenderer } from './_components/ToolPageClient';
import { ToolSidebar } from '@/components/tools/ToolSidebar';

export default async function ToolPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    // Fetch only the essential data for this specific tool page.
    const settings = await getSettings();
    const tool = await getTools({ slug: slug }).then(tools => tools[0]);
    const toolReviews = await getReviews({ toolId: slug });

    if (!tool || tool.status === 'Disabled') {
        notFound();
    }

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
                currentToolSlug={slug}
            />
        </ToolComponentRenderer>
    );
}
