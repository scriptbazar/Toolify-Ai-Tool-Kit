
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirection Component to resolve path conflict.
 * The primary settings page is now at src/app/settings/page.tsx.
 * This empty file prevents the 'Two parallel pages' build error.
 */
export default function DashboardSettingsRedirect() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/settings');
    }, [router]);

    return null;
}
