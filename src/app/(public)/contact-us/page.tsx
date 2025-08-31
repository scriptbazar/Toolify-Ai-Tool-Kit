
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ContactUsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Mail className="h-6 w-6" />
            Support & Inquiries
          </CardTitle>
          <CardDescription>
            For the fastest support, please create a ticket through your user dashboard. For general inquiries, you can email us.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="text-center border-2 border-dashed rounded-lg p-8">
            <h2 className="text-xl font-semibold">Create a Support Ticket</h2>
            <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
              To get help with your account or report an issue, please log in and create a support ticket from your dashboard.
            </p>
            <Button asChild>
              <Link href="/login">
                <ArrowRight className="mr-2 h-4 w-4" />
                Login to Create Ticket
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">For general business inquiries, you can reach us at:</p>
            <a href="mailto:contact@example.com" className="text-primary font-medium hover:underline">
              contact@example.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
