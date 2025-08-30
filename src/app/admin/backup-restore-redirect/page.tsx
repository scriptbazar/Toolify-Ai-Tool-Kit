
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BackupRestoreRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard/backup-restore');
  }, [router]);

  return null;
}
