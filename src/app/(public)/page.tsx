
'use client';

import { useState, useEffect } from 'react';
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getPosts } from '@/ai/flows/blog-management';
import { getReviews } from '@/ai/flows/review-management';
import { HomePageClient } from './_components/HomePageClient';
import { type Tool } from '@/ai/flows/tool-management.types';
import { type Review } from '@/ai/flows/review-management.types';
import { type Post } from '@/ai/flows/blog-management.types';
import { type HomepageSettings } from '@/ai/flows/settings-management.types';
import { Logo } from '@/components/common/Logo';
import { Loader2 } from 'lucide-react';


export default function Home() {
    const [pageData, setPageData] = useState<{
        testimonials: Review[];
        steps: HomepageSettings['steps'];
        features: HomepageSettings['features'];
        latestPosts: Post[];
    } | null>(null);

    useEffect(() => {
      async function fetchData() {
        const [settings, posts, testimonials] = await Promise.all([
            getSettings(),
            getPosts('Published'),
            getReviews({ status: 'approved', limit: 12 })
        ]);

        const homepageSettings = settings.homepage || {};
        const steps = homepageSettings.steps || [];
        const features = homepageSettings.features || [];
        
        const latestPosts = posts.slice(0, 3);

        setPageData({ testimonials, steps, features, latestPosts });
      }
      fetchData();
    }, []);

    if (!pageData) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
                <Logo className="h-16 w-16 animate-pulse" />
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-lg">Loading...</p>
                </div>
            </div>
        );
    }

  return (
    <HomePageClient
      testimonials={pageData.testimonials}
      steps={pageData.steps}
      features={pageData.features}
      latestPosts={pageData.latestPosts}
    />
  );
}
