
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardSettingsRedirect() {
    const router = useRouter();
    
    useEffect(() => {
        // Redirect to the primary unified settings page to resolve route conflict
        router.replace('/settings');
    }, [router]);

    return (
        <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Redirecting to profile settings...</p>
        </div>
    );
}
