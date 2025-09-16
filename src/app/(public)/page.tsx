

import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getPosts } from '@/ai/flows/blog-management';
import { getReviews } from '@/ai/flows/review-management';
import { HomePageClient } from './_components/HomePageClient';

export default async function Home() {
    // Fetch a limited number of approved reviews for testimonials
    const [tools, settings, allPosts, testimonials] = await Promise.all([
        getTools({ limit: 10 }), // Fetch only a small number of tools for "Tool of the Week" logic
        getSettings(),
        getPosts('all'),
        getReviews({ limit: 12 }) // Fetch up to 12 approved reviews
    ]);

    const homepageSettings = settings.homepage || {};
    const steps = homepageSettings.steps || [];
    const features = homepageSettings.features || [];
    
    const toolsOfTheWeek = tools.filter(tool => tool.isToolOfTheWeek);
    let toolOfTheWeek = null;
    if (toolsOfTheWeek.length > 0) {
        // If multiple tools are marked, pick one at random to display
        const randomIndex = Math.floor(Math.random() * toolsOfTheWeek.length);
        toolOfTheWeek = toolsOfTheWeek[randomIndex];
    }

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

    

    
