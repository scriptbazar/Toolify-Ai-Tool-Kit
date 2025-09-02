
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, ArrowRight, HelpCircle, Code, Palette, Database, UserCog, Settings, ShieldCheck, CreditCard, Wand2, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
    {
        question: "What is ToolifyAI?",
        answer: "ToolifyAI is an all-in-one platform offering over 100 free and premium smart utility tools. Our collection includes AI-powered tools, text analysis, image and video converters, developer utilities, and much more, all designed to enhance your productivity and creativity.",
        icon: Wand2
    },
    {
        question: "Do I need an account to use the tools?",
        answer: "Many of our basic tools are available for free without an account. However, creating a free account gives you access to more features and higher usage limits. A Pro subscription unlocks all tools and provides the best experience.",
        icon: UserCog
    },
    {
        question: "Is ToolifyAI free to use?",
        answer: "Yes, we offer a generous free plan that includes access to many of our tools. For users who need more power, higher limits, and access to our premium AI tools, we offer an affordable Pro plan.",
        icon: DollarSign
    },
    {
        question: "How do I create an account?",
        answer: "You can create an account by clicking the 'Sign Up' button in the header. Simply provide your name, email, and a secure password to get started.",
        icon: UserCog
    },
    {
        question: "I forgot my password. What should I do?",
        answer: "If you've forgotten your password, click on the 'Login' button and then select the 'Forgot Password?' link. Enter your email address, and we'll send you instructions to reset it.",
        icon: Settings
    },
    {
        question: "What are the benefits of a Pro subscription?",
        answer: "A Pro subscription gives you unlimited access to all tools, including our most advanced AI-powered features. You'll also enjoy higher usage limits, faster processing, an ad-free experience, and priority customer support.",
        icon: Palette
    },
    {
        question: "How do I upgrade my plan?",
        answer: "You can upgrade to a Pro plan at any time from your user dashboard. Simply navigate to the 'Subscription' section and choose the plan that best fits your needs.",
        icon: CreditCard
    },
    {
        question: "What payment methods are accepted?",
        answer: "We accept all major credit cards, including Visa, Mastercard, and American Express. We also support payments through PayPal for your convenience.",
        icon: CreditCard
    },
    {
        question: "How do I cancel my subscription?",
        answer: "You can cancel your subscription at any time from the 'Manage Subscription' section in your user dashboard. Your plan will remain active until the end of the current billing cycle.",
        icon: Settings
    },
    {
        question: "Is my data secure with ToolifyAI?",
        answer: "Absolutely. We take your privacy and security very seriously. We use industry-standard encryption for all data and never share your personal information with third parties. For tools that process files, your files are automatically deleted from our servers after a short period.",
        icon: ShieldCheck
    },
    {
        question: "Do you store the content I use in the tools?",
        answer: "No, we do not store the content you input into our tools (like text for the case converter or files for conversion). Your data is processed securely and is only held temporarily to perform the requested function.",
        icon: Database
    },
    {
        question: "Why is a tool not working correctly?",
        answer: "If you encounter an issue with a tool, please try clearing your browser's cache and refreshing the page. If the problem persists, please create a support ticket with a detailed description of the issue, and our technical team will investigate it promptly.",
        icon: Code
    },
];


export default function ContactUsPage() {
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
      
      <Card>
        <CardHeader>
             <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <HelpCircle className="h-6 w-6" />
                Frequently Asked Questions
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-none">
                  <AccordionTrigger className="faq-accordion-trigger">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-muted rounded-full">
                        <faq.icon className="h-5 w-5 text-primary" />
                       </div>
                       <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-16">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
