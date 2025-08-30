
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AllPostsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard/blog/all-posts');
  }, [router]);

  return null;
}
