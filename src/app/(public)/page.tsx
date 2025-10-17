
import { getSettings } from '@/ai/flows/settings-management';
import { getPosts } from '@/ai/flows/blog-management';
import { getReviews } from '@/ai/flows/review-management';
import { HomePageClient } from './_components/HomePageClient';

export default async function Home() {
    const settings = await getSettings();
    const posts = await getPosts('Published');
    const testimonials = await getReviews({ status: 'approved', limit: 12 });

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
