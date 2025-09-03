
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addReview } from '@/ai/flows/review-management';
import { Star, Loader2, Send } from 'lucide-react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const reviewSchema = z.object({
  rating: z.number().min(1, { message: "Please select a rating." }),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters." }),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface AppUser {
  firstName: string;
  lastName: string;
  avatar?: string;
}

export function ReviewForm({ toolId, toolName }: { toolId: string, toolName: string }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();

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
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    if (!user || !userData) {
      toast({ title: 'Please log in to leave a review.', variant: 'destructive' });
      return;
    }
    
    const result = await addReview({
        ...values,
        toolId,
        toolName,
        authorId: user.uid,
        authorName: `${userData.firstName} ${userData.lastName}`,
        authorAvatar: userData.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
    });

    if (result.success) {
        toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
        form.reset();
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return null; // Don't show anything while checking auth status
  }

  if (!user) {
    return (
        <div className="text-center p-4 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
                <Link href="/login" className="text-primary underline">Log in</Link> to leave a review.
            </p>
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-6 w-6 cursor-pointer transition-colors',
                        (hoverRating || field.value) >= star
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground'
                      )}
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => field.onChange(star)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us what you think about this tool..."
                  {...field}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Submit Review
        </Button>
      </form>
    </Form>
  );
}
