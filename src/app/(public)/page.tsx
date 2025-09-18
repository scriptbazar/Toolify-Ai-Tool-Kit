

import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getPosts } from '@/ai/flows/blog-management';
import { getReviews } from '@/ai/flows/review-management';
import { HomePageClient } from './_components/HomePageClient';

export default async function Home() {
    // Fetch a limited number of approved reviews for testimonials
    const [settings, allPosts, testimonials] = await Promise.all([
        getSettings(),
        getPosts(),
        getReviews({ limit: 12 }) // Fetch up to 12 approved reviews
    ]);

    const homepageSettings = settings.homepage || {};
    const steps = homepageSettings.steps || [];
    const features = homepageSettings.features || [];
    
    const latestPosts = allPosts.slice(0, 3);

  return (
    <HomePageClient
      testimonials={testimonials}
      steps={steps}
      features={features}
      latestPosts={latestPosts}
    />
  );
}

    

    
