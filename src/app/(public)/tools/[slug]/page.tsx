
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { getPosts } from '@/ai/flows/blog-management';
import { notFound } from 'next/navigation';
import { ToolPageClient } from './page.client';
import { toolComponents } from '@/components/tools/tool-components';


export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  
  if (!toolComponents[slug]) {
      notFound();
  }

  // Fetch only the specific tool needed for this page
  const [tool] = await getTools({ slug });

  if (!tool || tool.status === 'Disabled') {
      notFound();
  }

  // Fetch other data in parallel for efficiency
  const [settings, toolReviews, allPosts, allTools] = await Promise.all([
    getSettings(),
    getReviews({toolId: slug}),
    getPosts(),
    getTools(), // Still needed for popular tools, but the main page load is faster.
  ]);
  
  // Fetch popular tools for the sidebar, excluding the current tool.
  const popularTools = allTools
    .filter(t => t.status === 'Active' && t.slug !== slug)
    .slice(0, 10);
    
  const recentPosts = allPosts.filter(p => p.status === 'Published').slice(0, 10);

  return (
    <ToolPageClient
      tool={tool}
      toolReviews={toolReviews}
      settings={settings}
      popularTools={popularTools}
      recentPosts={recentPosts}
    />
  );
}

