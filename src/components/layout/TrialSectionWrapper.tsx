'use client';

import { useAuth } from '@/providers/AuthProvider';

export default function TrialSectionWrapper({ children }: { children: React.ReactNode }) {
  const { hasActiveLicense, loading } = useAuth();

  if (loading) return null;
  if (hasActiveLicense) return null;

  return <>{children}</>;
}
