
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page has been removed and now just redirects to the main dashboard.
export default function TopToolsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
