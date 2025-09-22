
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { getPosts } from '@/ai/flows/blog-management';
import { notFound } from 'next/navigation';
import { ToolPageClient } from './page.client';


export default async function ToolPage({ params }: { params: { slug: string } }) {
  
  // Fetch only the specific tool needed for this page
  const [tool] = await getTools({ slug: params.slug });

  if (!tool || tool.status === 'Disabled') {
      notFound();
  }

  // Fetch other data in parallel for efficiency
  const [settings, toolReviews, allPosts] = await Promise.all([
    getSettings(),
    getReviews({toolId: params.slug}),
    getPosts(),
  ]);
  
  // Fetch popular tools for the sidebar, excluding the current tool.
  // This can be further optimized if getTools supports exclusion.
  const popularTools = (await getTools({ limit: 10 }))
    .filter(t => t.status === 'Active' && t.slug !== tool.slug)
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
