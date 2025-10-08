
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


export default function Home() {
    const [pageData, setPageData] = useState<{
        testimonials: Review[];
        steps: HomepageSettings['steps'];
        features: HomepageSettings['features'];
        latestPosts: Post[];
    } | null>(null);

    useEffect(() => {
      async function fetchData() {
        const [settings, allPosts, testimonials] = await Promise.all([
            getSettings(),
            getPosts(),
            getReviews({ limit: 12 })
        ]);

        const homepageSettings = settings.homepage || {};
        const steps = homepageSettings.steps || [];
        const features = homepageSettings.features || [];
        
        const latestPosts = allPosts.slice(0, 3);

        setPageData({ testimonials, steps, features, latestPosts });
      }
      fetchData();
    }, []);

    if (!pageData) {
        return <div>Loading...</div>; // Or a proper skeleton loader
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
