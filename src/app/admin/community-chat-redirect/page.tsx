
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommunityChatRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard/community-chat');
  }, [router]);

  return null;
}
