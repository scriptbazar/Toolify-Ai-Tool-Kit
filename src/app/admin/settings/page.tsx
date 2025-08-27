'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just redirects to the first settings page.
export default function SettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/settings/site');
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p>Loading settings...</p>
    </div>
  );
}
