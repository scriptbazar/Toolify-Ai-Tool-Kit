
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';


export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id'); // For Stripe
    const token = searchParams.get('token'); // For PayPal (order ID)
    const { toast } = useToast();

    useEffect(() => {
        // Function to update the user's plan in Firestore
        const updateUserPlan = async (user: User) => {
            // In a real production app, you would verify the session/token on your backend
            // using a webhook to prevent users from accessing this page directly.
            // For this example, we'll optimistically update the user's plan.
            try {
                const userDocRef = doc(db, 'users', user.uid);
                // A secure webhook would look up the session/order, get the planId from metadata,
                // and update the user's document in Firestore.
                // For this demo, we'll assume a successful payment means upgrading to the 'pro' plan.
                await updateDoc(userDocRef, {
                    planId: 'pro', 
                    subscriptionStatus: 'active',
                });
                 toast({
                    title: "Payment Successful!",
                    description: `Your plan has been upgraded.`,
                });
            } catch (error) {
                console.error("Failed to update user plan:", error);
                 toast({
                    title: "Update Error",
                    description: "Your payment was successful, but we couldn't update your plan automatically. Please contact support.",
                    variant: "destructive",
                });
            }
        };

        if (sessionId || token) {
             const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    await updateUserPlan(user);
                } else {
                    // If the user is not logged in when they hit this page,
                    // we can't update their record. Webhooks are essential to solve this.
                    console.warn("User not logged in on success page. Cannot update plan.");
                     toast({
                        title: "Please Log In",
                        description: "Your payment was successful. Please log in to see your new plan.",
                    });
                }
            });
            return () => unsubscribe();
        }

    }, [sessionId, token, toast]);


  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
                <CardTitle className="text-3xl">Payment Successful!</CardTitle>
                <CardDescription className="text-lg">
                    Thank you for your purchase. Your subscription has been activated.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    You can now access all the features of your new plan. An email with your receipt has been sent.
                </p>
                <Button asChild size="lg" className="mt-6">
                    <Link href="/dashboard">
                        Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
