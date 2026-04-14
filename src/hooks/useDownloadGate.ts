'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';

export type DownloadGateModalState = 'none' | 'login' | 'subscribe';

export interface UseDownloadGateReturn {
  /** Wrap any download function with this to apply the gate. */
  guardedDownload: (downloadFn: () => void) => void;
  /** Current modal state — pass directly to <DownloadGateModal> */
  modalState: DownloadGateModalState;
  /** Call to close the modal (e.g. user dismissed it) */
  closeModal: () => void;
  /** Called internally after successful sign-in to auto-trigger the pending download */
  onLoginSuccess: () => void;
}

/**
 * Gate logic:
 *   - Subscribed user     → download immediately
 *   - Guest, first time   → show login modal (localStorage key absent)
 *   - Returning non-sub   → show subscribe modal (localStorage key present, not subscribed)
 */
export function useDownloadGate(): UseDownloadGateReturn {
  const { user, hasActiveLicense } = useAuth();
  const [modalState, setModalState] = useState<DownloadGateModalState>('none');
  // Store the pending download function so we can auto-run it after login
  const pendingDownload = useRef<(() => void) | null>(null);

  const guardedDownload = useCallback(
    (downloadFn: () => void) => {
      // Has active license → download immediately.
      if (hasActiveLicense) {
        downloadFn();
        return;
      }

      // Save the download function to auto-trigger after login
      pendingDownload.current = downloadFn;

      // Check localStorage for previous login
      const hasLoggedInBefore =
        typeof window !== 'undefined'
          ? localStorage.getItem('refinedocs_has_logged_in') === 'true'
          : false;

      if (!hasLoggedInBefore) {
        // First time ever — show login gate
        setModalState('login');
      } else {
        // Has logged in before but no license — show subscribe gate
        setModalState('subscribe');
      }
    },
    [hasActiveLicense]
  );

  const closeModal = useCallback(() => {
    setModalState('none');
    pendingDownload.current = null;
  }, []);

  /**
   * Called by DownloadGateModal after successful Google sign-in.
   * Auto-fires the pending download and closes the modal.
   */
  const onLoginSuccess = useCallback(() => {
    setModalState('none');
    if (pendingDownload.current) {
      // Small tick to allow auth state to propagate
      setTimeout(() => {
        pendingDownload.current?.();
        pendingDownload.current = null;
      }, 300);
    }
  }, []);

  return { guardedDownload, modalState, closeModal, onLoginSuccess };
}
