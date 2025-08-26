'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Here you would typically check for admin authentication
    // For now, we'll just redirect to the dashboard.
    // In a real app, if the user is not an admin, you'd redirect to /admin/login
    router.replace('/admin/dashboard');
  }, [router]);

  // You can show a loading spinner here while the redirect happens
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading admin panel...</p>
    </div>
  );
}
