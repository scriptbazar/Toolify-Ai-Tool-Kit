
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function PaymentHistoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payment History</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border-2 border-dashed rounded-lg">
            <History className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">Your payment history is under construction.</p>
            <p className="text-muted-foreground">You will be able to view your transactions here soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
