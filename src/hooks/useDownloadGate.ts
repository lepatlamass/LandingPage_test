'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  savePendingDownload,
  getAndClearPendingDownloads,
  triggerBlobDownload
} from '@/lib/fileCache';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DownloadGateModalState = 'none' | 'login' | 'subscribe';

export interface UseDownloadGateReturn {
  /** Wrap any download function with this to apply the gate. */
  guardedDownload: (downloadFn: () => void) => void;
  /** Alternative for redirect-safe downloads: pass the actual blob + filename. */
  guardedBlobDownload: (
    blobOrGetter: Blob | (() => Blob | Promise<Blob>),
    filename: string
  ) => void;
  /** Current modal state — 'login' when user needs to sign in first */
  modalState: DownloadGateModalState;
  /** Close the gate modal and discard the pending download */
  closeModal: () => void;
  /** Called after successful login — triggers the pending download */
  onLoginSuccess: () => void;
}

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function checkAndIncrementLimit(toolId: string): boolean {
  if (typeof window === 'undefined') return true;

  const today = getLocalDateString();
  const storageKey = 'refinedocs_free_downloads';

  let records: Record<string, { date: string; count: number }> = {};
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      records = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse download records', e);
  }

  const record = records[toolId];
  if (record && record.date === today) {
    if (record.count >= 2) {
      return false;
    }
    records[toolId] = { date: today, count: record.count + 1 };
  } else {
    records[toolId] = { date: today, count: 1 };
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save download records', e);
  }

  return true;
}

/**
 * Download gate: requires the user to be signed in before downloading.
 * Prevents bot abuse and spam by ensuring every download is tied to
 * an authenticated account. Free plan users have a limit of 2 downloads
 * per day per tool, while Pro users have unlimited downloads.
 */
export function useDownloadGate(toolId: string): UseDownloadGateReturn {
  const { user, loading, hasActiveLicense } = useAuth();
  const [modalState, setModalState] = useState<DownloadGateModalState>('none');
  const pendingDownloadRef = useRef<(() => void) | null>(null);
  const pendingBlobDownloadRef = useRef<{
    blobOrGetter: Blob | (() => Blob | Promise<Blob>);
    filename: string;
  } | null>(null);

  // Restore pending downloads from IndexedDB after a redirect sign-in reloads the page
  useEffect(() => {
    if (loading) return;

    const checkAndRestoreDownloads = async () => {
      if (typeof window === 'undefined') return;
      
      const hasPending = sessionStorage.getItem('refinedocs_pending_download') === 'true';
      if (hasPending) {
        if (user) {
          try {
            const pending = await getAndClearPendingDownloads();
            for (const item of pending) {
              if (!hasActiveLicense) {
                const canDownload = checkAndIncrementLimit(toolId);
                if (!canDownload) {
                  setModalState('subscribe');
                  break;
                }
              }
              triggerBlobDownload(item.blob, item.filename);
            }
          } catch (err) {
            console.error('Failed to restore pending downloads:', err);
          } finally {
            sessionStorage.removeItem('refinedocs_pending_download');
          }
        } else {
          // If auth resolved but no user exists (e.g. login failed/cancelled), clear cache
          await getAndClearPendingDownloads().catch(() => {});
          sessionStorage.removeItem('refinedocs_pending_download');
        }
      }
    };

    checkAndRestoreDownloads();
  }, [user, loading, hasActiveLicense, toolId]);

  const guardedDownload = useCallback(
    (downloadFn: () => void) => {
      // While auth is still resolving, allow through (avoids flash-blocking)
      if (loading) {
        downloadFn();
        return;
      }

      // Not logged in → store the download and show login modal
      if (!user) {
        pendingDownloadRef.current = downloadFn;
        setModalState('login');
        return;
      }

      // If user is on the Free plan, check the daily limit
      if (!hasActiveLicense) {
        const canDownload = checkAndIncrementLimit(toolId);
        if (!canDownload) {
          setModalState('subscribe');
          return;
        }
      }

      // Authenticated and within limits → proceed immediately
      downloadFn();
    },
    [user, loading, hasActiveLicense, toolId],
  );

  const guardedBlobDownload = useCallback(
    async (
      blobOrGetter: Blob | (() => Blob | Promise<Blob>),
      filename: string
    ) => {
      // While auth is still resolving, allow through
      if (loading) {
        try {
          const blob = typeof blobOrGetter === 'function' ? await blobOrGetter() : blobOrGetter;
          triggerBlobDownload(blob, filename);
        } catch (err) {
          console.error('Failed to resolve blob during auth loading:', err);
        }
        return;
      }

      // Not logged in → save to IndexedDB (as backup for redirect reload) and open modal
      if (!user) {
        pendingBlobDownloadRef.current = { blobOrGetter, filename };
        try {
          const blob = typeof blobOrGetter === 'function' ? await blobOrGetter() : blobOrGetter;
          await savePendingDownload(blob, filename);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('refinedocs_pending_download', 'true');
          }
        } catch (err) {
          console.error('Failed to cache pending download blob:', err);
        }
        setModalState('login');
        return;
      }

      // If user is on the Free plan, check the daily limit
      if (!hasActiveLicense) {
        const canDownload = checkAndIncrementLimit(toolId);
        if (!canDownload) {
          setModalState('subscribe');
          return;
        }
      }

      // Authenticated and within limits → proceed immediately
      try {
        const blob = typeof blobOrGetter === 'function' ? await blobOrGetter() : blobOrGetter;
        triggerBlobDownload(blob, filename);
      } catch (err) {
        console.error('Failed to resolve or trigger download:', err);
      }
    },
    [user, loading, hasActiveLicense, toolId]
  );

  const closeModal = useCallback(() => {
    setModalState('none');
    pendingDownloadRef.current = null;
    pendingBlobDownloadRef.current = null;
    // Clear IndexedDB backup when discarding download
    getAndClearPendingDownloads().catch(() => {});
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('refinedocs_pending_download');
    }
  }, []);

  const onLoginSuccess = useCallback(() => {
    setModalState('none');
    
    // 1. Execute normal guardedDownload callback (popup flow)
    if (pendingDownloadRef.current) {
      const fn = pendingDownloadRef.current;
      pendingDownloadRef.current = null;
      setTimeout(() => {
        if (!hasActiveLicense) {
          const canDownload = checkAndIncrementLimit(toolId);
          if (!canDownload) {
            setModalState('subscribe');
            return;
          }
        }
        fn();
      }, 600);
    }

    // 2. Execute new guardedBlobDownload callback (popup flow)
    if (pendingBlobDownloadRef.current) {
      const { blobOrGetter, filename } = pendingBlobDownloadRef.current;
      pendingBlobDownloadRef.current = null;
      setTimeout(async () => {
        if (!hasActiveLicense) {
          const canDownload = checkAndIncrementLimit(toolId);
          if (!canDownload) {
            setModalState('subscribe');
            return;
          }
        }
        try {
          const blob = typeof blobOrGetter === 'function' ? await blobOrGetter() : blobOrGetter;
          triggerBlobDownload(blob, filename);
          // Since we didn't redirect, clean up IndexedDB/sessionStorage backup
          await getAndClearPendingDownloads().catch(() => {});
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('refinedocs_pending_download');
          }
        } catch (err) {
          console.error('Failed to trigger download on login success:', err);
        }
      }, 600);
    }
  }, [hasActiveLicense, toolId]);

  return {
    guardedDownload,
    guardedBlobDownload,
    modalState,
    closeModal,
    onLoginSuccess,
  };
}

