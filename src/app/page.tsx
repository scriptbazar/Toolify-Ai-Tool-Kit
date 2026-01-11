

import { getSettings } from '@/ai/flows/settings-management';
import { getPosts } from '@/ai/flows/blog-management';
import { getReviews } from '@/ai/flows/review-management';
import { HomePageClient } from './_components/HomePageClient';

export default async function Home() {
    const [settings, posts, testimonials] = await Promise.all([
        getSettings(),
        getPosts('Published'),
        getReviews({ status: 'approved', limit: 12 })
    ]);

    const homepageSettings = settings.homepage || {};
    const steps = homepageSettings.steps || [];
    const features = homepageSettings.features || [];
    
    const latestPosts = posts.slice(0, 3);

    return (
        <HomePageClient
            testimonials={testimonials}
            steps={steps}
            features={features}
            latestPosts={latestPosts}
        />
    );
}
