

import { Card, CardContent } from '@/components/ui/card';
import { Target, BookOpen, Lightbulb, MousePointerClick, ShieldCheck, LifeBuoy, Users, Gem } from 'lucide-react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const coreValues = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We constantly seek to innovate and improve our tools with the latest technology.',
    },
    {
      icon: MousePointerClick,
      title: 'Simplicity',
      description: 'Our tools are designed to be intuitive and easy to use for everyone.',
    },
    {
      icon: ShieldCheck,
      title: 'Reliability',
      description: 'Your data is always safe and protected with our robust security measures.',
    },
    {
      icon: LifeBuoy,
      title: 'Customer Focus',
      description: 'Our dedicated support team is available around the clock to assist you.',
    },
];

const teamMembers = [
    { name: 'Rohan Sharma', role: 'Founder & CEO', avatar: 'https://i.pravatar.cc/150?u=rohan' },
    { name: 'Priya Verma', role: 'Lead Developer', avatar: 'https://i.pravatar.cc/150?u=priya' },
    { name: 'Amit Kumar', role: 'Head of Product', avatar: 'https://i.pravatar.cc/150?u=amit' },
    { name: 'Sunita Singh', role: 'Marketing Lead', avatar: 'https://i.pravatar.cc/150?u=sunita' },
    { name: 'Anjali Sharma', role: 'UI/UX Designer', avatar: 'https://i.pravatar.cc/150?u=anjali' },
];

export default function AboutUsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            About ToolifyAI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We are on a mission to provide powerful, intuitive, and accessible online utilities for
            everyone.
          </p>
        </div>

        <Card className="mt-12 overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
                    <div className="relative aspect-video w-full">
                        <Image 
                            src="https://picsum.photos/600/400" 
                            alt="Our Mission"
                            width={600}
                            height={400}
                            className="object-cover w-full h-full"
                            data-ai-hint="team mission"
                        />
                    </div>
                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">Our Mission</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                Our mission is to empower individuals and businesses by simplifying
                                complex tasks. We believe that technology should be a great
                                equalizer, and our suite of smart tools is designed to save you time,
                                enhance your productivity, and unlock your creative potential—all
                                within a single, user-friendly platform.
                            </p>
                            <p>
                                From students and freelancers to large enterprises, ToolifyAI provides
                                the resources needed to succeed in a digital world.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="mt-12 overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
                     <div className="p-8 md:p-12 order-last md:order-first">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">Our Story</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                Founded in a small garage by a group of passionate developers and
                                designers, ToolifyAI started with a simple idea: what if everyone
                                had access to the tools they needed without a hefty price tag or a
                                steep learning curve? What began as a weekend project quickly grew
                                into a comprehensive platform loved by thousands worldwide.
                            </p>
                            <p>
                                We are driven by the stories of our users—the students who ace their projects,
                                the entrepreneurs who launch their businesses, and the creators who bring
                                their ideas to life. Your success is our motivation.
                            </p>
                        </div>
                    </div>
                    <div className="relative aspect-video w-full">
                        <Image 
                            src="https://picsum.photos/600/400" 
                            alt="Our Story"
                            width={600}
                            height={400}
                            className="object-cover w-full h-full"
                            data-ai-hint="passionate developers"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>

        <section className="py-12 md:py-16">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3">
                    <Gem className="h-10 w-10 text-primary" />
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Core Values</h2>
                </div>
                <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                    The principles that guide our work and our commitment to you.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {coreValues.map((value, index) => (
                    <Card key={index} className="text-center border-2 shadow-lg transition-all duration-300 hover:-translate-y-2 bg-card">
                        <CardContent className="p-8 flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-primary/10">
                                <value.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                            <p className="text-muted-foreground text-sm">{value.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

        <section className="py-12 md:py-16">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3">
                    <Users className="h-10 w-10 text-primary" />
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Meet The Team</h2>
                </div>
                <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                    The passionate individuals behind ToolifyAI, dedicated to building the best platform for you.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {teamMembers.map((member) => (
                    <Card key={member.name} className="text-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardContent className="p-0 flex flex-col items-center">
                            <div className="relative h-32 w-32 mb-4">
                                <Image
                                    src={member.avatar}
                                    alt={member.name}
                                    width={128}
                                    height={128}
                                    className="rounded-full object-cover shadow-lg"
                                />
                            </div>
                            <h3 className="text-lg font-semibold">{member.name}</h3>
                            <p className="text-primary">{member.role}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

         <section className="py-12">
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
        </section>

      </div>
    </div>
  );
}
