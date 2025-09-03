
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
import { ResponsiveHero } from '@/components/common/ResponsiveHero';
import { CategoryCard } from '@/components/tools/CategoryCard';


export default async function Home() {
  const tools = await getTools();
  const settings = await getSettings();
  const allPosts = await getPosts();
  const allReviews = await getReviews();

  const homepageSettings = settings.homepage || {};
  
  const testimonials = allReviews.filter(review => review.status === 'approved');
  
  const steps = homepageSettings.steps || [];
  const features = homepageSettings.features || [];

  const activeTools = tools.filter(tool => tool.status === 'Active');
  
  const categoryNames = toolCategories
    .filter(c => c.id !== 'cal_con' && c.id !== 'dev')
    .map(c => c.name.replace(' Tools', ''));

  const TestimonialCard = ({ name, role, avatar, comment }: { name: string, role: string, avatar: string, comment: string }) => (
    <Card className="w-[350px] shrink-0 bg-card text-card-foreground">
        <CardContent className="p-6 flex flex-col items-start text-left">
            <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-lg">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </div>
            <p className="text-muted-foreground text-base">"{comment}"</p>
        </CardContent>
    </Card>
  );

  const Testimonials = () => {
    const displayTestimonials = testimonials.slice(0, 12);
    const useMarquee = displayTestimonials.length >= 10;

    if (useMarquee) {
      const midPoint = Math.ceil(displayTestimonials.length / 2);
      const topRowItems = displayTestimonials.slice(0, midPoint);
      const bottomRowItems = displayTestimonials.slice(midPoint);
      
      return (
        <div className="relative flex flex-col gap-8 overflow-hidden">
          <div className="flex -translate-x-1/4 animate-marquee-right-to-left gap-8">
            {[...topRowItems, ...topRowItems].map((testimonial, index) => (
              <TestimonialCard key={`top-${testimonial.id}-${index}`} name={testimonial.authorName} role={testimonial.toolName} avatar={testimonial.authorAvatar} comment={testimonial.comment} />
            ))}
          </div>
          <div className="flex -translate-x-1/4 animate-marquee-left-to-right gap-8">
            {[...bottomRowItems, ...bottomRowItems].map((testimonial, index) => (
              <TestimonialCard key={`bottom-${testimonial.id}-${index}`} name={testimonial.authorName} role={testimonial.toolName} avatar={testimonial.authorAvatar} comment={testimonial.comment} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center flex-wrap gap-8">
        {displayTestimonials.map((testimonial) => (
          <TestimonialCard key={`static-${testimonial.id}`} name={testimonial.authorName} role={testimonial.toolName} avatar={testimonial.authorAvatar} comment={testimonial.comment} />
        ))}
      </div>
    );
  };


  return (
    <>
      <section className="text-center py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <ResponsiveHero allWords={categoryNames} />
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Over 100+ smart utility and AI-powered tools to boost your productivity. From text manipulation to AI image generation, we've got you covered.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/tools">
                Explore All Tools <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
           <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 max-w-6xl mx-auto">
            {toolCategories.map(category => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by Professionals Worldwide</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground mb-12">
                Our tools are trusted by thousands of developers, designers, and content creators to streamline their work and boost productivity.
            </p>
        </div>
        {testimonials.length > 0 ? (
            <Testimonials />
        ) : (
            <div className="text-center text-muted-foreground">No approved reviews yet.</div>
        )}
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <Card className="bg-background">
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
