
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ObsoleteFavoritesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/my-media');
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p>Redirecting to My Media...</p>
    </div>
  );
}
