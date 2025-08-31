'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, ArrowRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
    {
        question: "What is ToolifyAI?",
        answer: "ToolifyAI is an all-in-one platform offering over 100 free and premium smart utility tools. Our collection includes AI-powered tools, text analysis, image and video converters, developer utilities, and much more, all designed to enhance your productivity and creativity."
    },
    {
        question: "Do I need an account to use the tools?",
        answer: "Many of our basic tools are available for free without an account. However, creating a free account gives you access to more features and higher usage limits. A Pro subscription unlocks all tools and provides the best experience."
    },
    {
        question: "Is ToolifyAI free to use?",
        answer: "Yes, we offer a generous free plan that includes access to many of our tools. For users who need more power, higher limits, and access to our premium AI tools, we offer an affordable Pro plan."
    },
    {
        question: "How do I create an account?",
        answer: "You can create an account by clicking the 'Sign Up' button in the header. Simply provide your name, email, and a secure password to get started."
    },
    {
        question: "I forgot my password. What should I do?",
        answer: "If you've forgotten your password, click on the 'Login' button and then select the 'Forgot Password?' link. Enter your email address, and we'll send you instructions to reset it."
    },
    {
        question: "What are the benefits of a Pro subscription?",
        answer: "A Pro subscription gives you unlimited access to all tools, including our most advanced AI-powered features. You'll also enjoy higher usage limits, faster processing, an ad-free experience, and priority customer support."
    },
    {
        question: "How do I upgrade my plan?",
        answer: "You can upgrade to a Pro plan at any time from your user dashboard. Simply navigate to the 'Subscription' section and choose the plan that best fits your needs."
    },
    {
        question: "What payment methods are accepted?",
        answer: "We accept all major credit cards, including Visa, Mastercard, and American Express. We also support payments through PayPal for your convenience."
    },
    {
        question: "How do I cancel my subscription?",
        answer: "You can cancel your subscription at any time from the 'Manage Subscription' section in your user dashboard. Your plan will remain active until the end of the current billing cycle."
    },
    {
        question: "Is my data secure with ToolifyAI?",
        answer: "Absolutely. We take your privacy and security very seriously. We use industry-standard encryption for all data and never share your personal information with third parties. For tools that process files, your files are automatically deleted from our servers after a short period."
    },
    {
        question: "Do you store the content I use in the tools?",
        answer: "No, we do not store the content you input into our tools (like text for the case converter or files for conversion). Your data is processed securely and is only held temporarily to perform the requested function."
    },
    {
        question: "Why is a tool not working correctly?",
        answer: "If you encounter an issue with a tool, please try clearing your browser's cache and refreshing the page. If the problem persists, please create a support ticket with a detailed description of the issue, and our technical team will investigate it promptly."
    },
    {
        question: "How often are new tools added?",
        answer: "We are constantly working to expand our toolkit. We aim to add new and innovative tools every month based on user feedback and technological advancements."
    },
    {
        question: "Can I request a new tool or feature?",
        answer: "Yes! We love hearing ideas from our community. You can submit your suggestions through the feedback form in your dashboard or by contacting our support team."
    },
    {
        question: "Is there a mobile app for ToolifyAI?",
        answer: "Currently, ToolifyAI is a web-based platform fully optimized for both desktop and mobile browsers. A dedicated mobile app is on our roadmap for future development."
    },
    {
        question: "What is the community chat?",
        answer: "The community chat is a place for our users to connect, share ideas, ask for help, and discuss our tools. It's a great way to learn from others and get quick tips from fellow users and our team."
    },
    {
        question: "How do I create a support ticket?",
        answer: "To create a support ticket, you must be logged into your account. Once logged in, you can either click the button on this page or navigate to the 'My Tickets' section in your user dashboard."
    },
    {
        question: "What is your refund policy?",
        answer: "We offer a 7-day money-back guarantee on all new Pro subscriptions. If you are not satisfied with your purchase, please contact our support team within 7 days of your transaction to request a full refund."
    },
    {
        question: "How does the referral program work?",
        answer: "Our referral program allows you to earn a commission for every new user who signs up for a Pro plan using your unique referral link. You can find more details and join the program from the 'Refer a Friend' page in your dashboard."
    },
    {
        question: "A tool is marked 'Pro'. What does that mean?",
        answer: "Tools marked as 'Pro' are premium features available only to users with an active Pro subscription. These are typically our most advanced and powerful utilities, such as the AI Writer and other AI-powered tools."
    }
];


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

           <div className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <HelpCircle className="h-6 w-6" />
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
