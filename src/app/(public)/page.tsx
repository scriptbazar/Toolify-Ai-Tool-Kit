
import { Button } from '@/components/ui/button';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { CategoryCard } from '@/components/tools/CategoryCard';
import { toolCategories } from '@/lib/constants';
import { getTools } from '@/ai/flows/tool-management';
import { ArrowRight, Hand, Database, Sparkles, Download, LifeBuoy, MessageCircle, Users, Wand2, Award, MousePointerClick, Bot, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const steps = [
    {
        icon: Hand,
        title: 'Choose a Tool',
        description: 'Browse our extensive collection and select the tool that fits your needs.',
    },
    {
        icon: Database,
        title: 'Input Your Data',
        description: 'Upload your file, paste your text, or enter the required information.',
    },
    {
        icon: Sparkles,
        title: 'Get Results',
        description: 'Our tool will process your request instantly, providing you with the output you need.',
    },
    {
        icon: Download,
        title: 'Download & Share',
        description: 'Easily download your results or share them with others in just a click.',
    },
];

const features = [
    {
        icon: Award,
        title: 'High-quality Output',
        description: 'Get crisp, clear, and accurate results without compromising on quality.',
    },
    {
        icon: MousePointerClick,
        title: 'User-friendly Interface',
        description: 'Our tools are designed to be intuitive and easy to use for everyone, regardless of technical skill.',
    },
    {
        icon: Bot,
        title: 'AI-Powered Tools',
        description: 'Leverage the power of artificial intelligence to automate tasks and unlock new creative possibilities.',
    },
    {
        icon: ShieldCheck,
        title: 'Secure & Reliable',
        description: 'Your data is always safe and protected with our robust security measures and reliable infrastructure.',
    },
    {
        icon: LifeBuoy,
        title: '24/7 Support',
        description: 'Our dedicated support team is available around the clock to assist you with any questions or issues.',
    },
    {
        icon: Wand2,
        title: 'Wide Range of Tools',
        description: 'From content creation to technical utilities, find everything you need in one convenient platform.',
    },
    {
        icon: MessageCircle,
        title: 'Live Chat',
        description: 'Get instant help and support from our team through live chat.',
    },
    {
        icon: Users,
        title: 'Community',
        description: 'Join our community to share ideas, get feedback, and connect with other users.',
    },
]

const blogPosts = [
    {
        category: 'Productivity',
        title: '10 AI-Powered Tools to Supercharge Your Productivity',
        description: 'Discover how artificial intelligence can help you automate tasks, save time, and focus on what matters most.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'AI productivity',
        href: '#',
    },
    {
        category: 'SEO',
        title: 'The Ultimate Guide to SEO for Beginners in 2024',
        description: 'Learn the fundamentals of Search Engine Optimization and start driving more organic traffic to your website.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'SEO guide',
        href: '#',
    },
    {
        category: 'Design',
        title: '5 Design Principles for Creating Stunning Images',
        description: 'Master the core principles of design to create visually appealing images that captivate your audience.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'design principles',
        href: '#',
    },
];

const testimonials = [
    {
        name: 'Sarah L.',
        role: 'Content Creator',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        comment: "ToolifyAI has revolutionized my workflow. The text tools are a lifesaver for drafting and editing content quickly.",
    },
    {
        name: 'Michael B.',
        role: 'Developer',
        avatar: 'https://i.pravatar.cc/150?u=michael',
        comment: "The JSON Formatter and Password Generator are my daily drivers. Simple, fast, and reliable. Highly recommended!",
    },
    {
        name: 'Jessica P.',
        role: 'Digital Marketer',
        avatar: 'https://i.pravatar.cc/150?u=jessica',
        comment: "I love the variety of tools available. From image conversion to SEO analysis, it has everything I need in one place.",
    },
    {
        name: 'David H.',
        role: 'Student',
        avatar: 'https://i.pravatar.cc/150?u=david',
        comment: "The Lorem Ipsum Generator and Word Counter are essential for my assignments. So much better than other sites.",
    },
    {
        name: 'Emily R.',
        role: 'Project Manager',
        avatar: 'https://i.pravatar.cc/150?u=emily',
        comment: "An indispensable toolkit for my team. The PDF tools, in particular, have saved us countless hours.",
    },
    {
        name: 'Chris T.',
        role: 'Graphic Designer',
        avatar: 'https://i.pravatar.cc/150?u=chris',
        comment: "The Color Picker is fantastic. It's so easy to grab the exact hex code I need for my designs. A brilliant tool!",
    },
    {
        name: 'Amanda G.',
        role: 'Small Business Owner',
        avatar: 'https://i.pravatar.cc/150?u=amanda',
        comment: "As someone who wears many hats, having all these utilities in one subscription is incredibly cost-effective and convenient.",
    },
    {
        name: 'Kevin S.',
        role: 'SEO Specialist',
        avatar: 'https://i.pravatar.cc/150?u=kevin',
        comment: "The AI Writer helps me generate content ideas and outlines in minutes. A true game-changer for my content strategy.",
    },
    {
        name: 'Olivia M.',
        role: 'Photographer',
        avatar: 'https://i.pravatar.cc/150?u=olivia',
        comment: "I frequently use the image tools to quickly resize and convert formats for web use. It's fast and maintains quality.",
    },
    {
        name: 'Brian W.',
        role: 'IT Consultant',
        avatar: 'https://i.pravatar.cc/150?u=brian',
        comment: "A reliable and secure set of tools. I recommend it to all my clients for its ease of use and broad functionality.",
    },
];

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
        <div className="relative flex flex-col gap-8 overflow-hidden">
            <div className="flex -translate-x-1/4 animate-marquee-right-to-left gap-8">
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                    <TestimonialCard key={`rtl-${index}`} {...testimonial} />
                ))}
            </div>
            <div className="flex -translate-x-1/4 animate-marquee-left-to-right gap-8">
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                    <TestimonialCard key={`ltr-${index}`} {...testimonial} />
                ))}
            </div>
        </div>
    </section>
);


export default async function Home() {
  const tools = await getTools();
  const activeTools = tools.filter(tool => tool.status === 'Active');

  return (
    <>
      <section className="text-center py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
            Your All-in-One <span className="text-primary whitespace-nowrap">Smart Toolkit</span>
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
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 justify-center">
              {toolCategories.map((category) => (
                <div key={category.id} className="w-full">
                  <CategoryCard category={category} />
                </div>
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
            {steps.map((step, index) => (
              <Card key={index} className="text-center p-8 border-2 shadow-lg transition-all duration-300 hover:-translate-y-2 bg-background">
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-primary/10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
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
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 border-2 bg-card shadow-lg transition-all duration-300">
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-primary/10">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
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
