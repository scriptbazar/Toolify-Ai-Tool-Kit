
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { type Review } from '@/ai/flows/review-management.types';

const TestimonialCard = ({ name, role, avatar, comment, rating }: { name: string, role: string, avatar: string, comment: string, rating: number }) => (
    <Card className="w-[350px] shrink-0 bg-card text-card-foreground">
        <CardContent className="p-6 flex flex-col items-start text-left">
            <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-lg">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </div>
             <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                ))}
            </div>
            <p className="text-muted-foreground text-base">"{comment}"</p>
        </CardContent>
    </Card>
);

interface TestimonialsProps {
  testimonials: Review[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
    const displayTestimonials = testimonials.slice(0, 12);
    const useMarquee = displayTestimonials.length >= 10;

    if (useMarquee) {
    const midPoint = Math.ceil(displayTestimonials.length / 2);
    const topRowItems = displayTestimonials.slice(0, midPoint);
    const bottomRowItems = displayTestimonials.slice(midPoint);
    
    return (
        <div className="relative flex flex-col gap-8 overflow-hidden">
        <div className="flex -translate-x-1/4 animate-marquee-right-to-left gap-8">
            {[...topRowItems, ...topRowItems].map((testimonial, index) => (
            <TestimonialCard key={`top-${testimonial.id}-${index}`} name={testimonial.authorName} role={testimonial.toolName} avatar={testimonial.authorAvatar} comment={testimonial.comment} rating={testimonial.rating} />
            ))}
        </div>
        <div className="flex -translate-x-1/4 animate-marquee-left-to-right gap-8">
            {[...bottomRowItems, ...bottomRowItems].map((testimonial, index) => (
            <TestimonialCard key={`bottom-${testimonial.id}-${index}`} name={testimonial.authorName} role={testimonial.toolName} avatar={testimonial.authorAvatar} comment={testimonial.comment} rating={testimonial.rating} />
            ))}
        </div>
        </div>
    );
    }

    return (
    <div className="flex justify-center flex-wrap gap-8">
        {displayTestimonials.map((testimonial) => (
        <TestimonialCard key={`static-${testimonial.id}`} name={testimonial.authorName} role={testimonial.toolName} avatar={testimonial.authorAvatar} comment={testimonial.comment} rating={testimonial.rating} />
        ))}
    </div>
    );
};

export default Testimonials;
