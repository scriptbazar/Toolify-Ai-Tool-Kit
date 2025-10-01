
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
    capturePayPalOrder,
    verifyRazorpayPayment,
} from '@/ai/flows/payment-management';


export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const processPayment = async () => {
            const paypalToken = searchParams.get('token'); // PayPal
            const razorpayPaymentId = searchParams.get('razorpay_payment_id'); // Razorpay
            
            if (paypalToken) { // PayPal Verification
                 try {
                    const result = await capturePayPalOrder(paypalToken);
                    if (result.success) {
                        setStatus('success');
                        toast({
                            title: "Payment Successful!",
                            description: `Your plan has been upgraded.`,
                        });
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error: any) {
                    setStatus('error');
                    setErrorMessage(error.message || "Failed to process your PayPal payment. Please contact support.");
                }
            } else if (razorpayPaymentId) { // Razorpay Verification
                try {
                    const result = await verifyRazorpayPayment({
                        razorpay_order_id: searchParams.get('razorpay_order_id')!,
                        razorpay_payment_id: razorpayPaymentId,
                        razorpay_signature: searchParams.get('razorpay_signature')!,
                    });
                     if (result.success) {
                        setStatus('success');
                        toast({ title: "Payment Successful!", description: `Your plan has been upgraded.` });
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error: any) {
                    setStatus('error');
                    setErrorMessage(error.message || "Failed to verify Razorpay payment.");
                }
            }
            // Add other gateways as they are implemented...
            else {
                setStatus('success'); // Default to success for gateways without client-side verification flow
                toast({
                    title: "Payment Processed!",
                    description: `Your payment is being processed. Your plan will be updated shortly.`,
                });
            }
        };

        processPayment();
    }, [searchParams, toast]);


    if (status === 'loading') {
        return (
             <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <div className="mx-auto p-4 rounded-full w-fit mb-4">
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        </div>
                        <CardTitle className="text-3xl">Processing Payment...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Please wait while we verify your transaction. Do not close this page.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (status === 'error') {
         return (
             <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <div className="mx-auto bg-red-100 p-4 rounded-full w-fit mb-4">
                            <AlertTriangle className="h-16 w-16 text-red-600" />
                        </div>
                        <CardTitle className="text-3xl">Payment Verification Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {errorMessage}
                        </p>
                        <Button asChild size="lg" className="mt-6">
                            <Link href="/dashboard">
                                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }


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
