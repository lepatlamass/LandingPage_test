'use client';

import { useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from '../../navigation';

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return null;
}
