
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * REDUNDANT ROUTE HANDLER
 * To resolve the "Parallel Route Conflict" which causes White Screens and build errors,
 * this component redirects all traffic from /dashboard/settings to the main /settings page.
 */
export default function RedundantSettingsRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Force redirect to the correct top-level settings page
        router.replace('/settings');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
            <p>Redirecting to profile settings...</p>
        </div>
    );
}
