
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-red-100 p-4 rounded-full w-fit mb-4">
                    <XCircle className="h-16 w-16 text-red-600" />
                </div>
                <CardTitle className="text-3xl">Payment Canceled</CardTitle>
                <CardDescription className="text-lg">
                    Your payment was not completed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    You have not been charged. If you were having trouble, please contact support or try again.
                </p>
                <Button asChild size="lg" className="mt-6" variant="outline">
                    <Link href="/manage-subscription">
                        <ArrowLeft className="ml-2 h-5 w-5" /> Back to Subscription Plans
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
