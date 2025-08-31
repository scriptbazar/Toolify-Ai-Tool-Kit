
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl">About ToolifyAI</CardTitle>
            <CardDescription>
              Your all-in-one destination for a smarter, more efficient digital life.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p>Welcome to ToolifyAI. Our mission is to provide a comprehensive suite of powerful, easy-to-use online utilities that simplify complex tasks and boost productivity for everyone—from students and content creators to developers and business professionals.</p>
                <p>In a world overflowing with information and digital noise, we believe in the power of simplicity and efficiency. ToolifyAI was born from a desire to eliminate the need for multiple, single-purpose websites and applications. We wanted to create a single, reliable hub where you can find all the tools you need, right when you need them. Our goal is to empower you to work smarter, not harder, by providing intuitive tools that deliver accurate results instantly.</p>
            </div>
            
            <div className="text-center">
                <h2 className="text-2xl font-bold border-b pb-2 mb-6">Meet The Team</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-4">
                    <div className="text-center">
                        <Avatar className="w-32 h-32 mx-auto mb-4 shadow-lg">
                            <AvatarImage src="https://i.pravatar.cc/150?u=jane" alt="Jane Doe" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold">Jane Doe</h3>
                        <p className="text-muted-foreground">Founder & CEO</p>
                    </div>
                    <div className="text-center">
                        <Avatar className="w-32 h-32 mx-auto mb-4 shadow-lg">
                            <AvatarImage src="https://i.pravatar.cc/150?u=john" alt="John Smith" />
                            <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold">John Smith</h3>
                        <p className="text-muted-foreground">Lead Developer</p>
                    </div>
                    <div className="text-center">
                        <Avatar className="w-32 h-32 mx-auto mb-4 shadow-lg">
                            <AvatarImage src="https://i.pravatar.cc/150?u=emily" alt="Emily White" />
                            <AvatarFallback>EW</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold">Emily White</h3>
                        <p className="text-muted-foreground">UX/UI Designer</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
