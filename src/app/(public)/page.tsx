
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getPosts } from '@/ai/flows/blog-management';
import { getReviews } from '@/ai/flows/review-management';
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

    