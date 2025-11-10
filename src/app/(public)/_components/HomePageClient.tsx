
'use client';

import { Button } from '@/components/ui/button';
import { toolCategories } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CategoryCard } from '@/components/tools/CategoryCard';
import { type Tool } from '@/ai/flows/tool-management.types';
import { type Review } from '@/ai/flows/review-management.types';
import { type Post } from '@/ai/flows/blog-management.types';
import { type HomepageSettings } from '@/ai/flows/settings-management.types';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const Testimonials = dynamic(() => import('@/app/(public)/_components/Testimonials').then(mod => mod.Testimonials), {
  loading: () => <Skeleton className="h-96 w-full" />,
});


interface HomePageClientProps {
    testimonials: Review[];
    steps: HomepageSettings['steps'];
    features: HomepageSettings['features'];
    latestPosts: Post[];
}

export function HomePageClient({ testimonials, steps, features, latestPosts }: HomePageClientProps) {

    return (
        <>
      <section className="text-center py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
            Your All-in-One <span className="text-primary">Smart</span> <span className="text-accent">Toolkit</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Boost your productivity with our suite of 100+ smart utilities and AI-powered tools.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/tools">
                Explore All Tools <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
           <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 max-w-6xl mx-auto">
            {toolCategories.filter(c => !['calculator', 'miscellaneous'].includes(c.id)).map(category => (
                <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Get Started in 4 Easy Steps</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Our platform is designed to be simple and intuitive. Here's how you can get things done.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(steps || []).map((step, index) => {
              const Icon = (Icons as any)[step.icon] || Icons.HelpCircle;
              return (
              <Card key={index} className="text-center p-8 border-2 shadow-lg transition-all duration-300 hover:-translate-y-2 bg-background">
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-primary/10">
                     <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            )})}
          </div>
        </div>
      </section>

       <section id="features" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Choose ToolifyAI?</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              We are committed to providing a comprehensive suite of tools that are powerful, easy to use, and reliable, helping you achieve your goals faster.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(features || []).map((feature, index) => {
              const Icon = (Icons as any)[feature.icon] || Icons.HelpCircle;
              return (
              <Card key={index} className="text-center p-8 border-2 bg-card shadow-lg transition-all duration-300">
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            )})}
          </div>
          <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/tools">
                    Explore Tools <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by Professionals Worldwide</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground mb-12">
                Our tools are trusted by thousands of developers, designers, and content creators to streamline their work and boost productivity.
            </p>
        </div>
        {testimonials.length > 0 ? (
            <Testimonials testimonials={testimonials} />
        ) : (
            <div className="text-center text-muted-foreground">No approved reviews yet.</div>
        )}
      </section>

       <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">From Our Blog</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Stay updated with our latest articles, tips, and announcements.
            </p>
          </div>
          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  category={post.category}
                  title={post.title}
                  description={post.content.substring(0, 100) + '...'}
                  imageUrl={post.imageUrl || 'https://picsum.photos/seed/blog/600/400'}
                  imageHint={post.imageHint || 'blog post image'}
                  href={`/blog/${post.slug}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No blog posts yet.</p>
          )}
           <div className="text-center mt-12">
                <Button asChild size="lg" variant="outline">
                    <Link href="/blog">
                        Read More Articles <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <Card className="bg-card">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Join Thousands of Satisfied Users</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                Start exploring our powerful suite of tools today and see how we can help you achieve more.
              </p>
              <div className="mt-8 flex justify-center">
                <Button asChild size="lg">
                  <Link href="/tools">
                    Explore Tools <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
    );
}
