

import { getSettings } from '@/ai/flows/settings-management';
import * as Icons from 'lucide-react';
import { ContactUsClient } from './_components/ContactUsClient';
import { type FaqItem } from '@/ai/flows/settings-management.types';
import { HelpCircle } from 'lucide-react';

export default async function ContactUsPage() {
    const settings = await getSettings();
    const faqs = settings.faqs?.contactFaqs || [];

    return <ContactUsClient faqs={faqs} />;
}
