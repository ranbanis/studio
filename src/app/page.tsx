
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/input');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p>Redirecting to the app...</p>
    </div>
  );
}
