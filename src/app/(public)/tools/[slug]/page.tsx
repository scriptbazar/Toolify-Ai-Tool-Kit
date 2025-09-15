

import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { getPosts } from '@/ai/flows/blog-management';
import { notFound } from 'next/navigation';
import { ToolPageClient } from './page.client';


export default async function ToolPage({ params }: { params: { slug: string } }) {
  
  const allTools = await getTools();
  const tool = allTools.find(t => t.slug === params.slug);
  
  if (!tool || tool.status === 'Disabled') {
      notFound();
  }
  
  const [settings, toolReviews, allPosts] = await Promise.all([
    getSettings(),
    getReviews(params.slug),
    getPosts()
  ]);
  
  const popularTools = allTools.filter(t => t.status === 'Active' && t.slug !== tool.slug).slice(0, 20);
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

