
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Resolved Parallel Route Conflict.
 * Next.js cannot have (dashboard)/settings/page.tsx AND /settings/page.tsx.
 * This file is now a permanent redirect to avoid build errors.
 */
export default function RedundantSettingsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/settings');
    }, [router]);

    return null;
}
