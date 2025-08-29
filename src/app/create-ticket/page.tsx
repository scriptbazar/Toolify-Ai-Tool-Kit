
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createTicket } from '@/ai/flows/ticket-management';
import { sendSupportTicketConfirmationEmail } from '@/ai/flows/send-email';
import { Loader2, Send, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  priority: z.enum(['Low', 'Medium', 'High']),
  message: z.string().min(20, 'Message must be at least 20 characters.'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface AppUser {
  firstName: string;
  lastName: string;
}

const CountdownTimer = ({ expiryDate }: { expiryDate: Date }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryDate) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
                This ticket will be deleted in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
        </div>
    );
};

export default function CreateTicketPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                setUserData(userDocSnap.data() as AppUser);
            }
        } else {
            router.push('/login');
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      priority: 'Medium',
      message: '',
    },
  });

  const onSubmit: SubmitHandler<TicketFormValues> = async (data) => {
    if (!user || !userData) {
        toast({ title: 'Error', description: 'You must be logged in to create a ticket.', variant: 'destructive' });
        return;
    }
    
    try {
        const ticketId = `TKT-${Date.now()}`;
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        setExpiryDate(expires);

        await createTicket({
            ticketId,
            subject: data.subject,
            priority: data.priority,
            message: data.message,
            userId: user.uid,
            userName: `${userData.firstName} ${userData.lastName}`,
            userEmail: user.email!,
            expiresAt: expires.toISOString(),
        });
        
        await sendSupportTicketConfirmationEmail({
            to: user.email!,
            name: `${userData.firstName} ${userData.lastName}`,
            ticketId,
        });
        
        toast({
            title: 'Ticket Created!',
            description: 'Your support ticket has been submitted successfully.',
        });
        setTicketSubmitted(true);
    } catch (error: any) {
        console.error('Ticket creation failed:', error);
        toast({
            title: 'Submission Failed',
            description: error.message || 'Could not submit your ticket. Please try again.',
            variant: 'destructive',
        });
    }
  };
  
  if (loading) {
      return <div>Loading...</div>
  }

  if (ticketSubmitted && expiryDate) {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <CardTitle className="text-2xl">Ticket Submitted Successfully</CardTitle>
                <CardDescription>
                    Thank you for contacting support. We have received your ticket and a confirmation email has been sent to you. Our team will get back to you shortly.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <CountdownTimer expiryDate={expiryDate} />
                 <Button onClick={() => router.push('/my-tickets')}>View My Tickets</Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Support Ticket</CardTitle>
        <CardDescription>
          Have an issue? Fill out the form below and our team will get back to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g., Issue with AI Image Generator" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a priority level" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Describe your issue</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Please provide as much detail as possible..." className="min-h-[150px]"/></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit Ticket
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
