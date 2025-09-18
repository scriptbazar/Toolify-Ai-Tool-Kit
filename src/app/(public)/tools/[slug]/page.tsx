
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { getPosts } from '@/ai/flows/blog-management';
import { notFound } from 'next/navigation';
import { ToolPageClient } from './page.client';


export default async function ToolPage({ params }: { params: { slug: string } }) {
  
  const slug = params.slug;

  // Fetch only the required tool data, and other page data in parallel
  const [toolResponse, settings, toolReviews, allPosts, popularTools] = await Promise.all([
    getTools({ slug: slug }), // Fetch the specific tool by slug
    getSettings(),
    getReviews({toolId: slug}),
    getPosts(),
    getTools({ limit: 20 }) // Fetch a limited number of popular tools
  ]);

  const tool = toolResponse[0]; // getTools with slug should return an array with one item or be empty
  
  if (!tool || tool.status === 'Disabled') {
      notFound();
  }
  
  const filteredPopularTools = popularTools.filter(t => t.status === 'Active' && t.slug !== tool.slug);
  const recentPosts = allPosts.filter(p => p.status === 'Published').slice(0, 10);

  return (
    <ToolPageClient
      tool={tool}
      toolReviews={toolReviews}
      settings={settings}
      popularTools={filteredPopularTools}
      recentPosts={recentPosts}
    />
  );
}
