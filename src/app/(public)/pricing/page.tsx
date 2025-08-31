
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
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
        question: "What is your refund policy?",
        answer: "We offer a 7-day money-back guarantee on all new Pro subscriptions. If you are not satisfied with your purchase, please contact our support team within 7 days of your transaction to request a full refund."
    }
];

const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started with our basic tools.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Access to 20+ basic tools',
      'Limited daily usage',
      'Standard processing speed',
      'Community support',
    ],
    buttonText: 'Get Started',
    href: '/signup',
    isPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Unlock the full power of ToolifyAI with premium features.',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      'Access to all 100+ tools',
      'Unlimited usage',
      'Includes all AI-powered tools',
      'Faster processing speed',
      'Ad-free experience',
      'Priority email support',
    ],
    buttonText: 'Upgrade to Pro',
    href: '/login',
    isPopular: true,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Collaborate with your team with advanced features.',
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      'All features from Pro plan',
      '5 team member seats',
      'Centralized billing',
      'Team management dashboard',
      'Shared asset library',
      'Dedicated account manager',
    ],
    buttonText: 'Contact Sales',
    href: '/contact-us',
    isPopular: false,
  },
];

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="bg-background">
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                        Flexible Pricing for Every Need
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that's right for you. From casual users to large teams, we have a solution that fits.
                    </p>
                    <div className="mt-8 flex items-center justify-center space-x-4">
                        <Label htmlFor="billing-cycle" className="text-muted-foreground">Monthly</Label>
                        <Switch
                            id="billing-cycle"
                            checked={isYearly}
                            onCheckedChange={setIsYearly}
                        />
                        <Label htmlFor="billing-cycle" className="text-muted-foreground">
                            Yearly <span className="text-primary font-semibold">(Save 2 months)</span>
                        </Label>
                    </div>
                </div>
            </section>
            
            <section className="pb-16 md:pb-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {pricingPlans.map((plan) => (
                            <Card key={plan.id} className={cn(
                                'flex flex-col h-full',
                                plan.isPopular ? 'border-2 border-primary shadow-2xl relative' : 'border-border'
                            )}>
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="text-center mb-8">
                                        <span className="text-4xl font-bold">
                                            ${isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice}
                                        </span>
                                        <span className="text-muted-foreground">
                                            /month
                                        </span>
                                        {isYearly && plan.id !== 'free' && (
                                            <p className="text-sm text-muted-foreground">Billed as ${plan.yearlyPrice} per year</p>
                                        )}
                                    </div>
                                    <ul className="space-y-4">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full" variant={plan.isPopular ? 'default' : 'outline'} size="lg">
                                        <a href={plan.href}>
                                            {plan.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

             <section className="bg-card py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
                        <p className="mt-3 text-muted-foreground">
                            Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
                        </p>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
             </section>
        </div>
    );
}
