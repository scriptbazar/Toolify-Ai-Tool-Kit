
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

export default function ContactUsPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: 'Message Sent!',
            description: "Thanks for reaching out. We'll get back to you soon.",
        });
        (e.target as HTMLFormElement).reset();
    };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Contact Us
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                We'd love to hear from you! Whether you have a question about our tools, pricing, or anything else, our team is ready to answer all your questions.
            </p>
        </div>

        <div className="max-w-3xl mx-auto">
            <Card>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" placeholder="e.g., Feedback on Text Tools" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Your Message</Label>
                            <Textarea id="message" name="message" placeholder="Please type your message here..." className="min-h-[150px]" required />
                        </div>
                        <Button type="submit" className="w-full">
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
