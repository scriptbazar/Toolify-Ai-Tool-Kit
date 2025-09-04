
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Send, User, Mail, Wand2, Loader2, HelpCircle } from 'lucide-react';
import { generateToolDescription, requestNewTool } from '@/ai/flows/tool-management';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const requestSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  toolName: z.string().min(3, { message: "Tool name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
});

type RequestFormValues = z.infer<typeof requestSchema>;

const faqItems = [
    {
        question: "How long does it take for a requested tool to be developed?",
        answer: "Development time varies based on the complexity of the tool. Our team will review your request, and if approved, we'll try to provide an estimated timeline. Simple tools might be ready in a few weeks, while complex ones can take longer."
    },
    {
        question: "Will I be notified if my tool suggestion is approved?",
        answer: "Yes! If your tool suggestion is selected for development, we will notify you via the email address you provide. We'll also keep you updated on its progress."
    },
    {
        question: "Is there any cost for requesting a new tool?",
        answer: "No, requesting a tool is completely free. We value community feedback and use your suggestions to make our platform better for everyone."
    },
    {
        question: "What kind of tools can I request?",
        answer: "You can request any utility tool that you believe would be helpful for you and other users. This can range from simple text manipulators to more complex data converters or developer utilities. The more detailed your description, the better we can understand your needs."
    },
];

export default function RequestToolPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      name: '',
      email: '',
      toolName: '',
      description: '',
    },
  });

  const handleGenerateDescription = async () => {
    const toolName = form.getValues('toolName');
    if (!toolName) {
      toast({
        title: "Tool name required",
        description: "Please enter a tool name to generate a description.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateToolDescription({ toolName });
      form.setValue('description', result.description);
      toast({ title: "Description Generated!", description: "AI has drafted a description for your requested tool." });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (values: RequestFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await requestNewTool(values);
      if (result.success) {
        toast({
          title: "Request Submitted!",
          description: "Thank you for your suggestion. Our team will review it shortly.",
        });
        form.reset();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <Card>
                <CardHeader className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold">Request a New Tool</CardTitle>
                <CardDescription>
                    Have an idea for a tool that would make your life easier? Let us know!
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <FormControl><Input placeholder="John Doe" {...field} className="pl-10" /></FormControl>
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Your Email</FormLabel>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <FormControl><Input placeholder="you@example.com" {...field} className="pl-10" /></FormControl>
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="toolName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Requested Tool Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Image Background Remover" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tool Description</FormLabel>
                            <FormControl><Textarea placeholder="Describe what the tool should do, its features, and why it would be useful." {...field} className="min-h-[150px]" /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button type="button" variant="outline" onClick={handleGenerateDescription} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate Description
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit Request
                        </Button>
                    </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
            
            <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <HelpCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{item.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    </div>
  );
}
