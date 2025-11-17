'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Send, User, Mail, Wand2, Loader2, HelpCircle, LogIn, UserPlus } from 'lucide-react';
import { generateToolDescription, requestNewTool } from '@/ai/flows/tool-management';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { type FaqItem } from '@/ai/flows/settings-management.types';
import * as Icons from 'lucide-react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';

const requestSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  toolName: z.string().min(3, { message: "Tool name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface AppUser {
  firstName: string;
  lastName: string;
}

interface RequestToolClientProps {
    faqs: FaqItem[];
}

export function RequestToolClient({ faqs }: RequestToolClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const data = userDocSnap.data() as AppUser;
                setUserData(data);
                form.setValue('name', `${data.firstName} ${data.lastName}`);
                form.setValue('email', firebaseUser.email || '');
            }
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [form]);


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
        form.reset({
            ...values,
            toolName: '',
            description: ''
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
    const getIconComponent = (iconName?: string): React.ElementType => {
        if (!iconName) return HelpCircle;
        const IconComponent = (Icons as any)[iconName as keyof typeof Icons];
        return IconComponent || HelpCircle;
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
                {!user ? (
                     <div className="text-center p-8 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold">Please Log In</h3>
                        <p className="text-muted-foreground mt-2 mb-6">You must be logged in to request a new tool.</p>
                        <div className="flex gap-4 justify-center">
                            <Button asChild><Link href="/login"><LogIn className="mr-2 h-4 w-4"/>Log In</Link></Button>
                            <Button asChild variant="outline"><Link href="/signup"><UserPlus className="mr-2 h-4 w-4"/>Sign Up</Link></Button>
                        </div>
                     </div>
                ) : (
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
                                    <FormControl><Input {...field} className="pl-10" disabled /></FormControl>
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
                                    <FormControl><Input {...field} className="pl-10" disabled /></FormControl>
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
                )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                        <HelpCircle className="h-6 w-6" />
                        Frequently Asked Questions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq) => {
                            const Icon = getIconComponent(faq.icon as string);
                            return (
                                <AccordionItem value={faq.question} key={faq.id}>
                                    <AccordionTrigger className="text-left">
                                        <div className="flex items-center gap-4">
                                        <div className="p-2 bg-muted rounded-full">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <span>{faq.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground pl-16">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
