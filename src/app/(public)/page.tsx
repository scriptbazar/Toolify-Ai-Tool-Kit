
import { Button } from '@/components/ui/button';
import { getTools } from '@/ai/flows/tool-management';
import { toolCategories } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { TypingEffect } from '@/components/common/TypingEffect';
import { getSettings } from '@/ai/flows/settings-management';
import * as Icons from 'lucide-react';

// Dummy data from review-management, will be replaced by a proper data fetch
const allReviews = [
    {
        id: '1',
        user: { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane' },
        toolSlug: 'case-converter',
        comment: 'This tool is a lifesaver! It saves me so much time when formatting text for my blog posts. Highly recommended!',
        rating: 5,
        date: '2024-05-10',
        status: 'Approved',
    },
    {
        id: '2',
        user: { name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=john' },
        toolSlug: 'password-generator',
        comment: 'Great for creating strong, secure passwords. The options for length and character types are very useful.',
        rating: 4,
        date: '2024-05-12',
        status: 'Approved',
    },
    {
        id: '3',
        user: { name: 'Emily White', avatar: 'https://i.pravatar.cc/150?u=emily' },
        toolSlug: 'json-formatter',
        comment: 'It works, but sometimes it hangs on very large JSON files. Could be better.',
        rating: 3,
        date: '2024-05-15',
        status: 'Pending',
    },
     {
        id: '4',
        user: { name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?u=michael' },
        toolSlug: 'text-to-speech',
        comment: 'The voice sounds a bit robotic. I was expecting something more natural for a Pro tool.',
        rating: 4,
        date: '2024-05-18',
        status: 'Approved',
    },
];


export default async function Home() {
  const tools = await getTools();
  const settings = await getSettings();
  const homepageSettings = settings.homepage || {};
  
  const testimonials = allReviews.filter(review => review.status === 'Approved');
  const half = Math.ceil(testimonials.length / 2);
  const firstHalfTestimonials = testimonials.slice(0, half);
  const secondHalfTestimonials = testimonials.slice(half);

  const steps = homepageSettings.steps || [];
  const features = homepageSettings.features || [];
  const blogPosts = homepageSettings.blogPosts || [];

  const activeTools = tools.filter(tool => tool.status === 'Active');
  const categoryNames = toolCategories.map(c => c.name.replace(' Tools', ''));

  const TestimonialCard = ({ name, role, avatar, comment }: { name: string, role: string, avatar: string, comment: string }) => (
    <Card className="w-[350px] shrink-0">
        <CardContent className="p-6 flex flex-col items-start text-left">
            <div className="flex items-center gap-4 mb-4">
                <Avatar>
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4">"{comment}"</p>
            <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
            </div>
        </CardContent>
    </Card>
  );

  const Testimonials = () => (
     <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by Professionals Worldwide</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground mb-12">
                Our tools are trusted by thousands of developers, designers, and content creators to streamline their work and boost productivity.
            </p>
        </div>
        {testimonials.length > 0 ? (
            <div className="relative flex flex-col gap-8 overflow-hidden">
                <div className="flex -translate-x-1/4 animate-marquee-right-to-left gap-8">
                    {[...firstHalfTestimonials, ...firstHalfTestimonials].map((testimonial, index) => (
                        <TestimonialCard key={`rtl-${index}`} name={testimonial.user.name} role={testimonial.toolSlug} avatar={testimonial.user.avatar} comment={testimonial.comment} />
                    ))}
                </div>
                <div className="flex -translate-x-1/4 animate-marquee-left-to-right gap-8">
                     {[...secondHalfTestimonials, ...secondHalfTestimonials].map((testimonial, index) => (
                        <TestimonialCard key={`ltr-${index}`} name={testimonial.user.name} role={testimonial.toolSlug} avatar={testimonial.user.avatar} comment={testimonial.comment} />
                    ))}
                </div>
            </div>
        ) : (
             <div className="text-center text-muted-foreground">No approved reviews yet.</div>
        )}
    </section>
  );


  return (
    <>
      <section className="text-center py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
            Your All-in-One Smart&nbsp;
             <span className="text-primary whitespace-nowrap">
                <TypingEffect
                    words={categoryNames}
                />
            </span>
            &nbsp;Toolkit
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Over 100+ smart utility and AI-powered tools to boost your productivity. From text manipulation to AI image generation, we've got you covered.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/tools">
                Explore All Tools <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
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
            {steps.map((step, index) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
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

      <section id="blog" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">From Our Blog</h2>
                <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                    Stay updated with the latest news, tips, and tutorials from our team.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post, index) => (
                    <BlogPostCard
                        key={index}
                        category={post.category}
                        title={post.title}
                        description={post.description}
                        imageUrl={post.imageUrl}
                        imageHint={post.imageHint}
                        href={post.href}
                    />
                ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/blog">
                    Explore Blog <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <Card className="bg-card">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Join Thousands of Satisfied Users</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                Start exploring our powerful suite of tools today and see how we can help you achieve more.
              </p>
              <div className="mt-8">
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
