
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component is a temporary fix to resolve a conflicting route issue.
// It redirects to the correct dashboard page.
export default function AnalyticsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard/analytics');
  }, [router]);

  return null;
}
