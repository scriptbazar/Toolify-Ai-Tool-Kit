
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, X } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically handle form submission, e.g., send to an API
    console.log('Form submitted');
    setIsOpen(false);
    toast({
      title: 'Message Sent!',
      description: 'Thanks for reaching out. We will get back to you soon.',
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleOpen}
          className="rounded-full w-16 h-16 shadow-lg hover:scale-110 transition-transform duration-200"
          aria-label="Toggle chat widget"
        >
          {isOpen ? <X className="h-8 w-8" /> : <Logo className="h-8 w-8" />}
        </Button>
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-24 right-6 z-50 w-full max-w-sm transition-all duration-300 ease-in-out',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2'
          )}
          data-state={isOpen ? 'open' : 'closed'}
        >
          <Card className="shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6" />
                <CardTitle className="text-lg">ToolifyAI</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-8 w-8 hover:bg-primary/80">
                 <X className="h-5 w-5" />
                 <span className="sr-only">Close chat</span>
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-4 space-y-4">
                 <p className="text-sm text-muted-foreground">
                    Welcome! How can we help you today? Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message..." required className="min-h-[100px]" />
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
