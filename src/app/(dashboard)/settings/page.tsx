
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirection Component to resolve path conflict.
 * The primary settings page is now at /settings/page.tsx
 */
export default function DashboardSettingsRedirect() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/settings');
    }, [router]);

    return (
        <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Redirecting to profile settings...</p>
        </div>
    );
}
