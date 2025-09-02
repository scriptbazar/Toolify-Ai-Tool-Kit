
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';


export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { toast } = useToast();

    useEffect(() => {
        if (!sessionId) {
            console.error("No session ID found in URL.");
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // In a real application, you would verify the session on your backend
                // and then update the user's plan in Firestore.
                // For this example, we will simulate this update on the client side.
                // NOTE: Client-side updates like this are not secure. This should be a webhook.
                try {
                    // Placeholder for which plan was purchased.
                    // This should be retrieved from the webhook/backend verification.
                    const purchasedPlanId = 'pro'; // Hardcoded for demonstration

                    const userDocRef = doc(db, 'users', user.uid);
                    await updateDoc(userDocRef, {
                        planId: purchasedPlanId
                    });

                    toast({
                        title: "Payment Successful!",
                        description: `Your plan has been upgraded to ${purchasedPlanId}.`,
                    });
                } catch (error) {
                    console.error("Failed to update user plan:", error);
                     toast({
                        title: "Update Error",
                        description: "Your payment was successful, but we couldn't update your plan. Please contact support.",
                        variant: "destructive",
                    });
                }
            }
        });

        return () => unsubscribe();

    }, [sessionId, toast]);


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
