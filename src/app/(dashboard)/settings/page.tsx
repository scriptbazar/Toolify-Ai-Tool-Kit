
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect component to resolve Next.js parallel route conflict.
 * Ensures that the main /settings page is the single source of truth.
 */
export default function SettingsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/settings');
    }, [router]);

    return null;
}
