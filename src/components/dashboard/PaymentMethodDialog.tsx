
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createPayPalOrder, createRazorpayOrder } from '@/ai/flows/payment-management';
import type { Plan, PaymentSettings } from '@/ai/flows/settings-management.types';
import type { User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface PaymentMethodDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    plan: Plan;
    user: FirebaseUser;
    userProfile: {
        email: string;
        firstName?: string;
        lastName?: string;
    };
    paymentSettings: PaymentSettings | null;
}

export function PaymentMethodDialog({ isOpen, onOpenChange, plan, user, userProfile, paymentSettings }: PaymentMethodDialogProps) {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handlePayment = async (method: 'paypal' | 'razorpay') => {
        setIsProcessing(method);
        try {
            if (method === 'paypal') {
                const { links } = await createPayPalOrder({
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
            } else if (method === 'razorpay') {
                const razorpayOrder = await createRazorpayOrder({
                    planId: plan.id,
                    planName: plan.name,
                    planPrice: plan.price,
                    userId: user.uid,
                    userEmail: userProfile.email,
                    userName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
                });
                
                const options = {
                    key: razorpayOrder.key,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: razorpayOrder.name,
                    description: razorpayOrder.description,
                    order_id: razorpayOrder.id,
                    handler: function (response: any){
                        router.push(`/payment/success?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}`);
                    },
                    prefill: razorpayOrder.prefill,
                    notes: razorpayOrder.notes,
                    theme: {
                        color: "#7c3aed"
                    }
                };
                // This assumes the Razorpay script is loaded globally
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
        } catch (error: any) {
            toast({ title: 'Payment Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Choose Your Payment Method</DialogTitle>
                    <DialogDescription>
                        You are upgrading to the <span className="font-bold text-primary">{plan.name}</span> plan for <span className="font-bold text-primary">${plan.price.toFixed(2)}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {paymentSettings?.paypal?.isEnabled && (
                        <Button 
                            className="w-full h-14 justify-start text-lg" 
                            variant="outline"
                            onClick={() => handlePayment('paypal')}
                            disabled={!!isProcessing}
                        >
                            {isProcessing === 'paypal' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CreditCard className="mr-3 h-6 w-6"/>} 
                            Pay with PayPal
                        </Button>
                    )}
                    {paymentSettings?.razorpay?.isEnabled && (
                        <Button 
                            className="w-full h-14 justify-start text-lg" 
                            variant="outline"
                            onClick={() => handlePayment('razorpay')}
                            disabled={!!isProcessing}
                        >
                            {isProcessing === 'razorpay' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CreditCard className="mr-3 h-6 w-6"/>} 
                            Pay with Razorpay
                        </Button>
                    )}
                     {!paymentSettings?.paypal?.isEnabled && !paymentSettings?.razorpay?.isEnabled && (
                         <p className="text-center text-muted-foreground">No payment gateways are currently enabled. Please contact support.</p>
                     )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
