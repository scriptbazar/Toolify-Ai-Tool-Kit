
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getSettings } from '@/ai/flows/settings-management';
import type { Plan, FaqItem } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import * as Icons from 'lucide-react';


export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchPlans() {
            setLoading(true);
            try {
                const settings = await getSettings();
                const activePlans = settings.plan?.plans.filter(p => p.status === 'active') || [];
                setPlans(activePlans);
                setFaqs(settings.faqs?.pricingFaqs || []);
            } catch (error) {
                console.error("Failed to load plans:", error);
                toast({
                    title: "Error",
                    description: "Could not load pricing plans. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }
        fetchPlans();
    }, [toast]);

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
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <Card key={i} className="h-[450px]">
                                    <CardHeader><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-3/4 mt-2" /></CardHeader>
                                    <CardContent className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-24 w-full" /></CardContent>
                                    <CardFooter><Skeleton className="h-12 w-full" /></CardFooter>
                                </Card>
                            ))
                        ) : (
                           plans.map((plan) => (
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
                                                ${isYearly ? (plan.price * 10).toFixed(0) : plan.price}
                                            </span>
                                            <span className="text-muted-foreground">
                                                /{isYearly ? 'year' : 'month'}
                                            </span>
                                            {isYearly && plan.price > 0 && (
                                                <p className="text-sm text-muted-foreground">Billed as ${plan.price * 10} per year</p>
                                            )}
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
                                        <Button asChild className="w-full" variant={plan.isPopular ? 'default' : 'outline'} size="lg">
                                            <a href="/login">
                                                {plan.price === 0 ? 'Get Started' : 'Upgrade Now'} <ArrowRight className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </section>

             <section className="bg-card py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-12">
                         <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                            <HelpCircle className="h-6 w-6" />
                            Frequently Asked Questions
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
                        </p>
                    </div>
                    {faqs.length > 0 && (
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
                    )}
                </div>
             </section>
        </div>
    );
}
