

import { getSettings } from '@/ai/flows/settings-management';
import { PricingClient } from './_components/PricingClient';

export default async function PricingPage() {
    const settings = await getSettings();
    const activePlans = settings.plan?.plans.filter(p => p.status === 'active') || [];
    const faqs = settings.faqs?.pricingFaqs || [];

    return (
        <PricingClient
            plans={activePlans}
            faqs={faqs}
        />
    );
}
