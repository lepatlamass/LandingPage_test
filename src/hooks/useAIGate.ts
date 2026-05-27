'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';

export type AIGateModalState = 'none' | 'login' | 'subscribe' | 'noCredits' | 'buyCredits';

export interface UseAIGateReturn {
  /** Wrap any AI process function with this to apply the gate. */
  guardedAction: (actionFn: () => void | Promise<void>) => void;
  /** Wrap download functions to require login. */
  guardedDownload: (downloadFn: () => void) => void;
  /** Current modal state — pass directly to <AIGateModal> */
  modalState: AIGateModalState;
  /** Call to close the modal (e.g. user dismissed it) */
  closeModal: () => void;
  /** Called internally after successful sign-in to auto-trigger the pending action */
  onLoginSuccess: () => void;
}

/**
 * AI Gate logic:
 *   - First-time usage: Allow processing for free (no login or license check).
 *     Requires login to download generated materials.
 *   - Second-time usage: Requires active license/credits.
 *     If not logged in, prompt to log in.
 *     If logged in, prompt to subscribe/buy credits.
 */
export function useAIGate(toolId: string): UseAIGateReturn {
  const { user, hasActiveLicense, aiCreditsRemaining, perToolCredits } = useAuth();
  const [modalState, setModalState] = useState<AIGateModalState>('none');
  // Store the pending action function so we can auto-run it after login or just hold it
  const pendingAction = useRef<(() => void | Promise<void>) | null>(null);

  const guardedAction = useCallback(
    (actionFn: () => void | Promise<void>) => {
      const storageKey = `refinedocs_ai_usage_count_${toolId}`;

      // 1. Check if user is subscribed/has active license and has credits.
      if (hasActiveLicense) {
        const hasPerToolCredits = perToolCredits && Object.values(perToolCredits).some(c => c.remaining > 0);
        const hasAggregateCredits = (aiCreditsRemaining ?? 0) > 0;

        if (hasPerToolCredits || hasAggregateCredits) {
          actionFn();
          return;
        }

        // Check if they are eligible for the first-time free usage even if credits are depleted
        const usageCount = typeof window !== 'undefined' ? parseInt(localStorage.getItem(storageKey) || '0', 10) : 0;
        if (usageCount < 2) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, String(usageCount + 1));
          }
          actionFn();
          return;
        }

        // No credits left and not first usage — show buy credits modal
        pendingAction.current = actionFn;
        setModalState('buyCredits');
        return;
      }

      // 2. User has no active license/credits (or is not logged in).
      // Check if it's the first usage.
      const usageCount = typeof window !== 'undefined' ? parseInt(localStorage.getItem(storageKey) || '0', 10) : 0;
      if (usageCount < 2) {
        // Increment usage count and allow the action to run directly!
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, String(usageCount + 1));
        }
        actionFn();
        return;
      }

      // 3. Second or later usage - block and require payment/subscription.
      pendingAction.current = actionFn;

      if (!user) {
        // Not logged in — show login gate.
        setModalState('login');
      } else {
        // Logged in but no license — show subscribe gate.
        setModalState('subscribe');
      }
    },
    [user, hasActiveLicense, aiCreditsRemaining, perToolCredits, toolId]
  );

  const guardedDownload = useCallback(
    (downloadFn: () => void) => {
      if (!user) {
        pendingAction.current = downloadFn;
        setModalState('login');
        return;
      }
      downloadFn();
    },
    [user]
  );

  const closeModal = useCallback(() => {
    setModalState('none');
    pendingAction.current = null;
  }, []);

  const onLoginSuccess = useCallback(() => {
    setModalState('none');
    if (pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      setTimeout(() => {
        action();
      }, 500);
    }
  }, []);

  return { guardedAction, guardedDownload, modalState, closeModal, onLoginSuccess };
}
