
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            About AI Smart Tools
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We are on a mission to provide powerful, intuitive, and accessible online utilities for
            everyone.
          </p>
        </div>

        <Card className="mt-12 overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
                    <div className="relative aspect-[3/2] w-full">
                        <Image 
                            src="https://picsum.photos/600/400" 
                            alt="Our Mission"
                            fill
                            className="object-cover"
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
                                From students and freelancers to large enterprises, AI Smart Tools provides
                                the resources needed to succeed in a digital world.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
