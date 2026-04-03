'use client';

import { useEffect } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { useRouter } from '../../../navigation';

export default function AuthRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/tools'); // Or previous page / dashboard
    }
  }, [user, loading, router]);

  return null;
}
