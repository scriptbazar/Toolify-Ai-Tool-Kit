

import { getAffiliateRequests, getAffiliates } from '@/ai/flows/user-management';
import { AffiliateManagementClient } from './_components/AffiliateManagementClient';

export const revalidate = 0; // Disable caching

export default async function AffiliateManagementPage() {
    const [pendingRequests, approvedAffiliates] = await Promise.all([
        getAffiliateRequests(),
        getAffiliates()
    ]);

    return (
        <AffiliateManagementClient
            initialRequests={pendingRequests}
            initialAffiliates={approvedAffiliates}
        />
    );
}
