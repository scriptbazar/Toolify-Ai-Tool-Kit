
import { Button } from '@/components/ui/button';
import { getTools } from '@/ai/flows/tool-management';
import { toolCategories } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { getSettings } from '@/ai/flows/settings-management';
import * as Icons from 'lucide-react';
import { getPosts } from '@/ai/flows/blog-management';
import { getReviews } from '@/ai/flows/review-management';
import { CategoryCard } from '@/components/tools/CategoryCard';
import { type Tool } from '@/ai/flows/tool-management.types';
import { type Review } from '@/ai/flows/review-management.types';
import { ToolOfTheWeek } from '@/components/tools/ToolOfTheWeek';
import { HomePageClient } from './_components/HomePageClient';

export default async function Home() {
    const [tools, settings, allPosts, allReviews] = await Promise.all([
        getTools(),
        getSettings(),
        getPosts(),
        getReviews()
    ]);

    const homepageSettings = settings.homepage || {};
    const testimonials = allReviews.filter(review => review.status === 'approved');
    const steps = homepageSettings.steps || [];
    const features = homepageSettings.features || [];
    const toolOfTheWeek = tools.find(tool => tool.isToolOfTheWeek) || null;
    const latestPosts = allPosts.filter(p => p.status === 'Published').slice(0, 3);

  return (
    <HomePageClient
      testimonials={testimonials}
      steps={steps}
      features={features}
      toolOfTheWeek={toolOfTheWeek}
      latestPosts={latestPosts}
    />
  );
}
