
import { Button } from '@/components/ui/button';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { CategoryCard } from '@/components/tools/CategoryCard';
import { toolCategories } from '@/lib/constants';
import { getTools } from '@/ai/flows/tool-management';
import { ArrowRight, Hand, Database, Sparkles, Download, LifeBuoy, MessageCircle, Users, Wand2, Award, MousePointerClick, Bot, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

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

export default async function Home() {
  const tools = await getTools();
  const activeTools = tools.filter(tool => tool.status === 'Active');

  return (
    <>
      <section className="text-center py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            The Ultimate All-in-One Toolkit
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Your one-stop-shop for productivity and creativity. Over 100 free tools to help you get things done.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="#tools">
                Explore All Tools <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Browse by Category</h2>
                <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">Find the right tool for the job by exploring our categories.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {toolCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
          </div>
      </section>
      
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Get Started in 4 Easy Steps</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Our platform is designed to be simple and intuitive. Here's how you can get things done.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="text-center p-8 border-2 shadow-lg transition-all duration-300 hover:-translate-y-2">
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

       <section className="py-20 md:py-32 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Choose AI Smart Tools?</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              We are committed to providing a comprehensive suite of tools that are powerful, easy to use, and reliable, helping you achieve your goals faster.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 border-2 bg-background shadow-lg transition-all duration-300">
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
                <Link href="#tools">
                    Explore Tools <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
          </div>
        </div>
      </section>

      <section id="tools" className="container mx-auto px-4 py-8 md:py-12 space-y-16">
        {toolCategories.map((category) => (
          <div key={category.id}>
            <div id={category.id} className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">{category.name}</h2>
              <p className="mt-2 text-muted-foreground">{category.description}</p>
            </div>
            <ToolGrid tools={activeTools.filter(tool => tool.category === category.id)} />
          </div>
        ))}
      </section>
    </>
  );
}
