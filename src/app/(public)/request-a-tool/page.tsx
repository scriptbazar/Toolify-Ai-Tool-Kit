

import { getSettings } from '@/ai/flows/settings-management';
import { RequestToolClient } from './_components/RequestToolClient';

export default async function RequestToolPage() {
    const settings = await getSettings();
    const faqs = settings.faqs?.requestToolFaqs || [];

    return <RequestToolClient faqs={faqs} />;
}
