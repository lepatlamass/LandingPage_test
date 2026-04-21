'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '../../lib/analytics';

/**
 * Automatically tracks page_view events on every client-side navigation.
 * Must be rendered inside a Suspense boundary (useSearchParams requirement).
 */
function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial mount — the first page load is already tracked by GA.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsProvider() {
  return (
    <AnalyticsTrackerInner />
  );
}
