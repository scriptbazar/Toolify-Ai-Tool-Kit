
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, ArrowRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getSettings } from '@/ai/flows/settings-management';
import { type FaqItem } from '@/ai/flows/settings-management.types';
import * as Icons from 'lucide-react';


export default function ContactUsPage() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFaqs() {
            try {
                const settings = await getSettings();
                setFaqs(settings.faqs?.contactFaqs || []);
            } catch (error) {
                console.error("Failed to fetch FAQs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFaqs();
    }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 space-y-8 max-w-4xl">
      <Card>
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
              <Link href="/my-tickets">
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to My Tickets
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
      
      {loading ? (
          <Card>
              <CardHeader><CardTitle className="text-2xl font-bold text-center">Loading FAQs...</CardTitle></CardHeader>
          </Card>
      ) : faqs.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                    <HelpCircle className="h-6 w-6" />
                    Frequently Asked Questions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {faqs.map((faq) => {
                    const Icon = (Icons as any)[faq.icon] || HelpCircle;
                    return (
                        <AccordionItem value={faq.id} key={faq.id} className="border-none">
                            <AccordionTrigger className="faq-accordion-trigger">
                                <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded-full">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <span>{faq.question}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pl-16">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
