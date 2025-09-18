
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { getPosts } from '@/ai/flows/blog-management';
import { notFound } from 'next/navigation';
import { ToolPageClient } from './page.client';


export default async function ToolPage({ params }: { params: { slug: string } }) {
  
  const slug = params.slug;

  // Fetch all data in parallel for efficiency
  const [allTools, settings, toolReviews, allPosts] = await Promise.all([
    getTools(),
    getSettings(),
    getReviews({toolId: slug}),
    getPosts(),
  ]);

  const tool = allTools.find(t => t.slug === slug);
  
  if (!tool || tool.status === 'Disabled') {
      notFound();
  }
  
  const popularTools = allTools.filter(t => t.status === 'Active' && t.slug !== tool.slug).slice(0, 10);
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
