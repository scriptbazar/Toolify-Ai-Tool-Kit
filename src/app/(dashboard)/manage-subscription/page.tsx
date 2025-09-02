
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, ArrowRight, Star, BadgeCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSettings } from '@/ai/flows/settings-management';
import type { Plan, PaymentSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { createStripeCheckoutSession } from '@/ai/flows/payment-management';
import { loadStripe } from '@stripe/stripe-js';


interface UserProfile {
  planId?: string;
  email: string;
}

export default function ManageSubscriptionPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const [settings, userDocSnap] = await Promise.all([
                        getSettings(),
                        getDoc(doc(db, "users", firebaseUser.uid))
                    ]);
                    
                    const activePlans = settings.plan?.plans.filter(p => p.status === 'active') || [];
                    setPlans(activePlans);
                    setPaymentSettings(settings.payment || null);

                    if (userDocSnap.exists()) {
                        setUserProfile(userDocSnap.data() as UserProfile);
                    }
                } catch (error) {
                    console.error("Failed to load data:", error);
                    toast({
                        title: "Error",
                        description: "Could not load subscription details.",
                        variant: "destructive",
                    });
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }
    fetchData();
  }, [toast]);
  
  const currentPlanId = userProfile?.planId || 'free';

  const handleUpgradeClick = async (plan: Plan) => {
    if (!userProfile || !user) {
        toast({ title: 'Error', description: 'You must be logged in to upgrade.', variant: 'destructive'});
        return;
    }
    
    // Check if Stripe is enabled
    if (paymentSettings?.stripe?.isEnabled) {
        setIsProcessing(plan.id);
        try {
            const { sessionId, publishableKey } = await createStripeCheckoutSession({
                planId: plan.id,
                planName: plan.name,
                planPrice: plan.price,
                userId: user.uid,
                userEmail: userProfile.email,
            });

            if (!sessionId || !publishableKey) {
                throw new Error('Could not create a checkout session.');
            }

            const stripe = await loadStripe(publishableKey);
            if (!stripe) {
                throw new Error('Stripe.js failed to load.');
            }

            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) {
                 throw new Error(error.message);
            }

        } catch (error: any) {
            toast({
                title: 'Checkout Error',
                description: error.message || 'Could not initiate the payment process. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsProcessing(null);
        }
        return;
    }
    
    // Check if any other gateway is enabled
    const anyGatewayEnabled = Object.values(paymentSettings || {}).some(gateway => gateway?.isEnabled);

    if (anyGatewayEnabled) {
         toast({ title: 'Coming Soon!', description: 'This payment gateway is not yet supported. Please contact support.', variant: 'default'});
         return;
    }

    // If no gateway is enabled at all
    toast({ title: 'Not Available', description: 'Online payment is currently not available. Please contact support.', variant: 'destructive'});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
        <p className="text-muted-foreground">
          Upgrade, downgrade, or manage your current subscription plan.
        </p>
      </div>

       <div className="flex items-center justify-center space-x-4">
            <Label htmlFor="billing-cycle" className="text-muted-foreground">Monthly</Label>
            <Switch
                id="billing-cycle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
                disabled
            />
            <Label htmlFor="billing-cycle" className="text-muted-foreground">
                Yearly <span className="text-primary font-semibold">(Save 2 months)</span>
            </Label>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         {loading ? (
            [...Array(3)].map((_, i) => (
                <Card key={i} className="h-[450px]">
                    <CardHeader><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-3/4 mt-2" /></CardHeader>
                    <CardContent className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-24 w-full" /></CardContent>
                    <CardFooter><Skeleton className="h-12 w-full" /></CardFooter>
                </Card>
            ))
        ) : (
            plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlanId;
                const isProcessingThisPlan = isProcessing === plan.id;
                return (
                    <Card key={plan.id} className={cn(
                        'flex flex-col h-full transition-all',
                        plan.isPopular && !isCurrentPlan && 'border-2 border-primary shadow-xl',
                        isCurrentPlan && 'border-2 border-green-500 bg-green-500/5'
                    )}>
                        {plan.isPopular && !isCurrentPlan && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                                Most Popular
                            </div>
                        )}
                         {isCurrentPlan && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                <BadgeCheck className="h-4 w-4"/> Current Plan
                            </div>
                        )}
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="text-center mb-8">
                                <span className="text-4xl font-bold">
                                    ${isYearly ? (plan.price * 10).toFixed(0) : plan.price}
                                </span>
                                <span className="text-muted-foreground">
                                    /{isYearly ? 'year' : 'month'}
                                </span>
                            </div>
                            <ul className="space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature.id} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                                        <span className="text-muted-foreground">{feature.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" disabled={isCurrentPlan || !!isProcessing} onClick={() => handleUpgradeClick(plan)}>
                                {isProcessingThisPlan ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</>
                                ) : isCurrentPlan ? 'Your Current Plan' : 'Upgrade Plan'}
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })
        )}
      </div>
    </div>
  );
}
