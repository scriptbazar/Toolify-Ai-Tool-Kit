
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Emptying this file completely to resolve Parallel Route Conflict.
 * Next.js cannot have (dashboard)/settings/page.tsx AND /settings/page.tsx.
 */
export default function RedundantSettingsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/settings');
    }, [router]);

    return null;
}
