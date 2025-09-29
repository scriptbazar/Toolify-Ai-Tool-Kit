
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
import { createStripeCheckoutSession, createPayPalOrder, createRazorpayOrder, createPayUPayment, createCashfreePayment, createPhonePePayment } from '@/ai/flows/payment-management';
import { loadStripe } from '@stripe/stripe-js';


interface UserProfile {
  planId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
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
    
    setIsProcessing(plan.id);

    // Stripe
    if (paymentSettings?.stripe?.isEnabled) {
        try {
            const { sessionId, publishableKey } = await createStripeCheckoutSession({
                planId: plan.id,
                planName: plan.name,
                planPrice: plan.price,
                userId: user.uid,
                userEmail: userProfile.email,
            });

            if (!sessionId || !publishableKey) throw new Error('Could not create a checkout session.');
            const stripe = await loadStripe(publishableKey);
            if (!stripe) throw new Error('Stripe.js failed to load.');

            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) throw new Error(error.message);

        } catch (error: any) {
            toast({ title: 'Stripe Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsProcessing(null);
        }
        return;
    }
    
    // PayPal
    if (paymentSettings?.paypal?.isEnabled) {
      try {
        const { id, links } = await createPayPalOrder({
            planId: plan.id,
            planName: plan.name,
            planPrice: plan.price,
            userId: user.uid,
        });
        const approvalLink = links.find(link => link.rel === 'approve');
        if (approvalLink) {
            window.location.href = approvalLink.href;
        } else {
            throw new Error('Could not find PayPal approval link.');
        }
      } catch (error: any) {
        toast({ title: 'PayPal Error', description: error.message, variant: 'destructive' });
      } finally {
         setIsProcessing(null);
      }
      return;
    }

    // Razorpay
    if (paymentSettings?.razorpay?.isEnabled) {
        try {
            const razorpayOrder = await createRazorpayOrder({
                planId: plan.id,
                planName: plan.name,
                planPrice: plan.price,
                userId: user.uid,
                userEmail: userProfile.email,
                userName: `${userProfile.firstName} ${userProfile.lastName}`,
            });
            
            const options = {
                key: razorpayOrder.key,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: razorpayOrder.name,
                description: razorpayOrder.description,
                order_id: razorpayOrder.id,
                handler: function (response: any){
                    // This should be verified on a server
                    console.log(response);
                    router.push('/payment/success');
                },
                prefill: razorpayOrder.prefill,
                notes: razorpayOrder.notes,
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast({ title: 'Razorpay Error', description: error.message, variant: 'destructive'});
        } finally {
            setIsProcessing(null);
        }
        return;
    }
    
    // PayU
    if (paymentSettings?.payu?.isEnabled) {
        try {
            const payuData = await createPayUPayment({
                planId: plan.id,
                planName: plan.name,
                planPrice: plan.price,
                userId: user.uid,
                userEmail: userProfile.email,
                userName: `${userProfile.firstName} ${userProfile.lastName}`,
            });

            // Create a form and submit it to redirect to PayU
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payuData.action;
            
            Object.entries(payuData).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value.toString();
                form.appendChild(input);
            });
            
            document.body.appendChild(form);
            form.submit();

        } catch (error: any) {
            toast({ title: 'PayU Error', description: error.message, variant: 'destructive'});
        } finally {
            setIsProcessing(null);
        }
        return;
    }
    
    // Cashfree
    if (paymentSettings?.cashfree?.isEnabled) {
        try {
            const cashfreeData = await createCashfreePayment({
                planId: plan.id,
                planName: plan.name,
                planPrice: plan.price,
                userId: user.uid,
                userEmail: userProfile.email,
                userName: `${userProfile.firstName} ${userProfile.lastName}`,
            });
            const cashfree = new (window as any).Cashfree(cashfreeData.mode);
            cashfree.checkout({
                paymentSessionId: cashfreeData.payment_session_id,
                returnUrl: `${window.location.origin}/payment/success?order_id={order_id}`,
            });
        } catch (error: any) {
            toast({ title: 'Cashfree Error', description: error.message, variant: 'destructive'});
        } finally {
            setIsProcessing(null);
        }
        return;
    }

    // PhonePe
    if (paymentSettings?.phonepe?.isEnabled) {
         try {
            const phonepeData = await createPhonePePayment({
                planId: plan.id,
                planName: plan.name,
                planPrice: plan.price,
                userId: user.uid,
                userEmail: userProfile.email,
                userName: `${userProfile.firstName} ${userProfile.lastName}`,
            });
            window.location.href = phonepeData.redirectUrl;
         } catch (error: any) {
             toast({ title: 'PhonePe Error', description: error.message, variant: 'destructive'});
         } finally {
            setIsProcessing(null);
         }
         return;
    }

    toast({ title: 'Not Available', description: 'This payment gateway is not yet supported. Please contact support.', variant: 'destructive'});
    setIsProcessing(null);
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

    
