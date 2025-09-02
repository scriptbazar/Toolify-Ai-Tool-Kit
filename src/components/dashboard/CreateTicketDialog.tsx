
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDesc,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createTicket, generateTicketContent } from '@/ai/flows/ticket-management';
import { sendSupportTicketConfirmationEmail } from '@/ai/flows/send-email';
import { Loader2, Send, Wand2, PlusCircle, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  priority: z.enum(['Low', 'Medium', 'High']),
  problemSummary: z.string().optional(),
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

export function CreateTicketDialog({ onTicketCreated }: { onTicketCreated: (userId: string) => void }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
      }
    });
    return () => unsubscribe();
  }, []);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      priority: 'Medium',
      problemSummary: '',
      message: '',
    },
  });

  const handleGenerate = async () => {
    const summary = form.getValues('problemSummary');
    if (!summary) {
        form.setError('problemSummary', { type: 'manual', message: 'Please provide a summary to generate content.' });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateTicketContent({ problemSummary: summary });
        form.setValue('message', result.detailedMessage, { shouldValidate: true });
        toast({ title: 'Content Generated!', description: 'Your support message has been drafted by AI.'});
    } catch (error: any) {
        toast({ title: 'Generation Failed', description: error.message, variant: 'destructive'});
    } finally {
        setIsGenerating(false);
    }
  }

  const onSubmit: SubmitHandler<TicketFormValues> = async (data) => {
    if (!user || !userData) return;
    
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
        
        setTicketSubmitted(true);
    } catch (error: any) {
        toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset state when closing the dialog
      setTicketSubmitted(false);
      setExpiryDate(null);
      form.reset();
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        {!ticketSubmitted ? (
            <>
                <DialogHeader>
                    <DialogTitle>Create a New Support Ticket</DialogTitle>
                    <DialogDesc>
                    Have an issue? Fill out the form below and our team will get back to you.
                    </DialogDesc>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
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
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a priority level" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Use AI to help you!</AlertTitle>
                            <AlertDescription>
                                Briefly summarize your problem below, and our AI can help you write a clear, detailed message for our support team.
                            </AlertDescription>
                        </Alert>
                         <FormField control={form.control} name="problemSummary" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Problem Summary (for AI)</FormLabel>
                                <div className="flex gap-2">
                                <FormControl><Input {...field} placeholder="e.g., PDF merger is not combining my files" /></FormControl>
                                 <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Generate
                                </Button>
                                </div>
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
                        <DialogFooter className="sticky bottom-0 bg-background pt-4">
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Submit Ticket
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </>
        ) : (
             <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-bold">Ticket Submitted Successfully</h2>
                <p className="text-muted-foreground">
                    Thank you for contacting support. We have received your ticket and a confirmation email has been sent. Our team will get back to you shortly.
                </p>
                {expiryDate && <CountdownTimer expiryDate={expiryDate} />}
                 <Button onClick={() => { onTicketCreated(user!.uid); handleOpenChange(false); }}>Close</Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
