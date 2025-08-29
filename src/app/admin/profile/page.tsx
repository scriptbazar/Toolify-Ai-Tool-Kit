
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated in favor of the new user details page.
// It now redirects to the main user management list.
export default function DeprecatedProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p>Redirecting to user management...</p>
    </div>
  );
}
