
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect component to resolve Next.js parallel route conflict.
 * The main settings page is at /src/app/settings/page.tsx.
 */
export default function SettingsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/settings');
    }, [router]);

    return null;
}
