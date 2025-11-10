
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { notFound } from 'next/navigation';
import { ToolComponentRenderer } from './_components/ToolPageClient';
import { ToolSidebar } from '@/components/tools/ToolSidebar';
import { getPosts } from '@/ai/flows/blog-management';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const tools = await getTools({ slug });
  const tool = tools[0];

  if (!tool) {
    return {
      title: 'Tool Not Found',
    }
  }

  return {
    title: tool.name,
    description: tool.description,
  }
}

export default async function ToolPage({ params }: { params: { slug: string } }) {

    // Fetch only the essential data for the main tool page
    const [settings, tools, toolReviews] = await Promise.all([
        getSettings(),
        getTools({ slug: params.slug }),
        getReviews({ toolId: params.slug })
    ]);
    
    const tool = tools[0];
    
    // If the main tool is not found, return 404
    if (!tool || tool.status === 'Disabled') {
        notFound();
    }
    
    const adSettings = settings?.advertisement ?? null;

    return (
        <ToolComponentRenderer
            tool={tool}
            toolReviews={toolReviews}
            adSettings={adSettings}
        >
            {/* The sidebar will now fetch its own data */}
            <ToolSidebar
                adSettings={adSettings}
                currentToolSlug={params.slug}
            />
        </ToolComponentRenderer>
    );
}
