
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redundant settings page within route group.
 * Redirecting to the main settings page to avoid parallel route conflicts.
 */
export default function SettingsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/settings');
    }, [router]);
    return null;
}
