
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddNewPostRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/blog/add-new');
  }, [router]);

  return null;
}
